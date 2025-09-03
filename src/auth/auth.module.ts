/**
 * Auth Module - Handles authentication and authorization
 * Key responsibilities:
 * 1. User authentication (login/logout)
 * 2. JWT token management
 * 3. Role-based authorization
 * 4. Security strategy implementation
 * 
 * Features:
 * - JWT-based authentication
 * - Role-based guards
 * - Custom decorators for role checks
 * - Passport.js integration
 * 
 * Security measures:
 * - Token expiration (24h)
 * - Role validation
 * - Protected routes
 * - JWT secret management
 * 
 * Components:
 * - AuthService: Authentication business logic
 * - AuthController: Auth endpoints
 * - JwtStrategy: JWT implementation
 * - Guards: Role and JWT validation
 * 
 * Dependencies:
 * - UsersModule: For user verification
 * - @nestjs/jwt: JWT functionality
 * - @nestjs/passport: Authentication strategies
 */

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
