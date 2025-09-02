import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { eq, and, or, like, desc, sql } from 'drizzle-orm';
import { approvalRequests } from '../database/schema';
import { CreateApprovalRequestDto } from './dto/create-approval-request.dto';
import { UpdateApprovalRequestDto } from './dto/update-approval-request.dto';
import { DATABASE_CONNECTION } from '../database/database.module';

@Injectable()
export class ApprovalRequestsService {
  constructor(
    @Inject(DATABASE_CONNECTION) private readonly dbConnection: { db: any; client: any },
  ) {}

  private get db() {
    return this.dbConnection.db;
  }

  async create(createApprovalRequestDto: CreateApprovalRequestDto) {
    const [request] = await this.db
      .insert(approvalRequests)
      .values(createApprovalRequestDto)
      .returning();

    return request;
  }

  async findAll(page: number = 1, limit: number = 10, status?: string, requestType?: string) {
    const offset = (page - 1) * limit;
    
    let whereConditions: any[] = [];
    
    if (status) {
      whereConditions.push(eq(approvalRequests.status, status));
    }

    if (requestType) {
      whereConditions.push(eq(approvalRequests.requestType, requestType));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const requestsList = await this.db
      .select()
      .from(approvalRequests)
      .where(whereClause)
      .limit(limit)
      .offset(offset)
      .orderBy(desc(approvalRequests.requestedAt));

    const totalCountResult = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(approvalRequests)
      .where(whereClause);
    
    const totalCount = totalCountResult[0]?.count || 0;

    return {
      data: requestsList,
      pagination: {
        page,
        limit,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    };
  }

  async findOne(id: number) {
    const [request] = await this.db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.id, id))
      .limit(1);

    if (!request) {
      throw new NotFoundException(`Approval request with ID ${id} not found`);
    }

    return request;
  }

  async findByUser(userId: number) {
    return this.db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.userId, userId))
      .orderBy(desc(approvalRequests.requestedAt));
  }

  async findByStatus(status: string) {
    return this.db
      .select()
      .from(approvalRequests)
      .where(eq(approvalRequests.status, status))
      .orderBy(desc(approvalRequests.requestedAt));
  }

  async approve(id: number, adminId: number, adminNotes?: string) {
    const request = await this.findOne(id);

    if (request.status !== 'pending') {
      throw new BadRequestException('Request is not pending');
    }

    const [updatedRequest] = await this.db
      .update(approvalRequests)
      .set({
        status: 'approved',
        adminId,
        adminNotes,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, id))
      .returning();

    return updatedRequest;
  }

  async reject(id: number, adminId: number, adminNotes?: string) {
    const request = await this.findOne(id);

    if (request.status !== 'pending') {
      throw new BadRequestException('Request is not pending');
    }

    const [updatedRequest] = await this.db
      .update(approvalRequests)
      .set({
        status: 'rejected',
        adminId,
        adminNotes,
        processedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(approvalRequests.id, id))
      .returning();

    return updatedRequest;
  }

  async update(id: number, updateApprovalRequestDto: UpdateApprovalRequestDto) {
    const request = await this.findOne(id);

    if (request.status !== 'pending') {
      throw new BadRequestException('Cannot update processed request');
    }

    const [updatedRequest] = await this.db
      .update(approvalRequests)
      .set({ ...updateApprovalRequestDto, updatedAt: new Date() })
      .where(eq(approvalRequests.id, id))
      .returning();

    return updatedRequest;
  }

  async remove(id: number) {
    const request = await this.findOne(id);

    if (request.status !== 'pending') {
      throw new BadRequestException('Cannot delete processed request');
    }

    const [deletedRequest] = await this.db
      .delete(approvalRequests)
      .where(eq(approvalRequests.id, id))
      .returning();

    return { message: 'Approval request deleted successfully', request: deletedRequest };
  }
}
