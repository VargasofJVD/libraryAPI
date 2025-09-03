/**
 * JWT Strategy - Passport strategy for JWT authentication
 * 
 * Purpose:
 * - Implements JWT validation logic
 * - Configures JWT extraction
 * - Validates user existence
 * 
 * Configuration:
 * 1. Token Extraction:
 *    - Bearer token from Authorization header
 *    - Configurable JWT secret
 *    - Token expiration check
 * 
 * 2. User Validation:
 *    - Verifies user exists
 *    - Checks user status
 *    - Returns user for request
 * 
 * Security Features:
 * - Environment-based secret
 * - Token extraction options
 * - User status validation
 * - Error handling
 * 
 * Dependencies:
 * - ConfigService: JWT configuration
 * - UsersService: User validation
 * 
 * Error Handling:
 * - UnauthorizedException: Invalid token/user
 * - Error: Missing JWT_SECRET
 * 
 * @extends PassportStrategy
 * @see JwtAuthGuard
 */

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    const jwtSecret = configService.get<string>('JWT_SECRET');
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }
    
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user || !user.isActive || user.status !== 'active') {
      throw new UnauthorizedException('Invalid or inactive user');
    }

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      status: user.status,
    };
  }
}
