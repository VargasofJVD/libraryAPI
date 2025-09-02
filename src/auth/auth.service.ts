import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { UserRole } from '../users/enums/user-role.enum';
import { UserStatus } from '../users/enums/user-status.enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.usersService.findByEmail(loginDto.email);
    
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const isPasswordValid = await this.usersService.validatePassword(user.id, loginDto.password || '');
    
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // For admin users, generate JWT token
    if (user.role === UserRole.ADMIN) {
      const payload = { 
        email: user.email, 
        sub: user.id, 
        role: user.role 
      };
      
      return {
        access_token: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          status: user.status,
        },
      };
    }

    // For regular users, validate auth token
    if (!loginDto.authToken) {
      throw new BadRequestException('Auth token is required for regular users');
    }

    const tokenUser = await this.usersService.validateAuthToken(loginDto.authToken);
    
    if (!tokenUser || tokenUser.id !== user.id) {
      throw new UnauthorizedException('Invalid auth token');
    }

    // Generate JWT token for authenticated user
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role 
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async validateToken(token: string) {
    try {
      const payload = this.jwtService.verify(token);
      return payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }
}
