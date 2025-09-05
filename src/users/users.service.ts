/**
 * Users Service - Core user management business logic
 * 
 * Primary Responsibilities:
 * 1. User Account Management
 *    - Creation and updates
 *    - Password handling
 *    - Status management
 *    - Role assignments
 * 
 * 2. Security Operations
 *    - Password hashing (bcrypt)
 *    - Session management
 *    - Access control
 * 
 * 3. Query Operations
 *    - User lookups
 *    - Filtering and pagination
 *    - Profile management
 * 
 * Key Features:
 * - Secure password handling with bcrypt
 * - Email uniqueness validation
 * - Role-based access control
 * - Session token management
 * - User status transitions
 * 
 * Error Handling:
 * - NotFoundException: User not found
 * - BadRequestException: Invalid data
 * - ConflictException: Email conflicts
 * 
 * Database Operations:
 * - Uses Drizzle ORM
 * - Transactional operations
 * - Optimized queries
 * 
 * @see CreateUserDto - New user validation
 * @see UpdateUserDto - User updates validation
 * @see UserRole - Available roles
 * @see UserStatus - Possible states
 */

import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { users, userSessions } from '../database/schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { DATABASE_CONNECTION } from '../database/database.module';
import { MockQueueService } from '../queue/mock-queue.service';
import { UserRole } from './enums/user-role.enum';
import { UserStatus } from './enums/user-status.enum';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any },
    private readonly queueService: MockQueueService,
  ) {}

  private get db() {
    return this.dbConnection.db;
  }

  async create(createUserDto: CreateUserDto) {
    // Check if user with email already exists
    const existingUser = await this.db
      .select()
      .from(users)
      .where(eq(users.email, createUserDto.email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create user
    const [user] = await this.db
      .insert(users)
      .values({
        ...createUserDto,
        password: hashedPassword,
        role: createUserDto.role || UserRole.USER,
        status: createUserDto.status || UserStatus.PENDING,
      })
      .returning();

    // Generate auth token for non-admin users
    if (user.role === UserRole.USER) {
      const authToken = this.generateAuthToken();
      await this.db
        .update(users)
        .set({
          authToken,
          tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        })
        .where(eq(users.id, user.id));
      
      user.authToken = authToken;
    }

    // Queue welcome email notification
    try {
      await this.queueService.sendWelcomeEmail({
        userId: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        authToken: user.authToken || '',
      });
    } catch (error) {
      // Log error but don't fail user creation
      console.error('Failed to queue welcome email:', error);
    }

    return user;
  }

  async findAll(page: number = 1, limit: number = 10, search?: string, role?: UserRole, status?: UserStatus) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    if (search) {
      whereConditions.push(
        or(
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (role) {
      whereConditions.push(eq(users.role, role));
    }

    if (status) {
      whereConditions.push(eq(users.status, status));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const usersList = await this.db
      .select({
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        status: users.status,
        isActive: users.isActive,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt,
      })
      .from(users)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(users.createdAt));

    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(users)
      .where(whereClause);
    
    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: usersList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  async findByEmail(email: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    // If updating email, check if new email already exists
    if (updateUserDto.email && updateUserDto.email !== user.email) {
      const existingUser = await this.db
        .select()
        .from(users)
        .where(
          and(
            eq(users.email, updateUserDto.email),
            sql`${users.id} != ${id}`
          )
        )
        .limit(1);

      if (existingUser.length > 0) {
        throw new ConflictException('User with this email already exists');
      }
    }

    // Hash password if updating
    let updateData = { ...updateUserDto };
    if (updateUserDto.password) {
      updateData.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return updatedUser;
  }

  async remove(id: number) {
    const user = await this.findOne(id);

    // Soft delete
    const [deletedUser] = await this.db
      .update(users)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return { message: 'User deleted successfully', user: deletedUser };
  }

  async activateUser(id: number) {
    const user = await this.findOne(id);

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException('User is already active');
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        status: UserStatus.ACTIVE, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    // Queue account status notification
    try {
      await this.queueService.sendAccountStatusNotification({
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        status: 'activated',
        reason: 'Account has been activated by admin',
      });
    } catch (error) {
      console.error('Failed to queue account status notification:', error);
    }

    return updatedUser;
  }

  async suspendUser(id: number) {
    const user = await this.findOne(id);

    if (user.status === UserStatus.SUSPENDED) {
      throw new BadRequestException('User is already suspended');
    }

    const [updatedUser] = await this.db
      .update(users)
      .set({ 
        status: UserStatus.SUSPENDED, 
        updatedAt: new Date() 
      })
      .where(eq(users.id, id))
      .returning();

    // Queue account status notification
    try {
      await this.queueService.sendAccountStatusNotification({
        userId: updatedUser.id,
        userEmail: updatedUser.email,
        userName: `${updatedUser.firstName} ${updatedUser.lastName}`,
        status: 'suspended',
        reason: 'Account has been suspended by admin',
      });
    } catch (error) {
      console.error('Failed to queue account status notification:', error);
    }

    return updatedUser;
  }

  async regenerateAuthToken(id: number) {
    const user = await this.findOne(id);

    if (user.role === UserRole.ADMIN) {
      throw new BadRequestException('Admin users do not need auth tokens');
    }

    const authToken = this.generateAuthToken();
    const [updatedUser] = await this.db
      .update(users)
      .set({
        authToken,
        tokenExpiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();

    return { authToken: updatedUser.authToken };
  }

  async validateAuthToken(token: string) {
    const [user] = await this.db
      .select()
      .from(users)
      .where(
        and(
          eq(users.authToken, token),
          eq(users.isActive, true),
          eq(users.status, UserStatus.ACTIVE),
          sql`${users.tokenExpiresAt} > NOW()`
        )
      )
      .limit(1);

    return user;
  }

  private generateAuthToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  async validatePassword(userId: number, password: string): Promise<boolean> {
    const user = await this.findOne(userId);
    return bcrypt.compare(password, user.password);
  }
}
