/**
 * Auth Controller - API endpoints for authentication
 * 
 * Endpoints:
 * 1. Authentication
 *    - POST /auth/login - User login
 *    - POST /auth/refresh - Refresh token
 *    - POST /auth/logout - User logout
 * 
 * 2. Session Management
 *    - GET /auth/profile - Get session info
 *    - GET /auth/validate - Validate token
 * 
 * Security Features:
 * - JWT token authentication
 * - Token refresh mechanism
 * - Session management
 * - Role-based access
 * 
 * Request Validation:
 * - Email format
 * - Password requirements
 * - Token validation
 * 
 * Response Formats:
 * - JWT access token
 * - User profile data
 * - Error messages
 * 
 * Swagger Documentation:
 * @ApiTags('Authentication')
 * @ApiBearerAuth()
 * 
 * Error Responses:
 * - 401: Invalid credentials
 * - 403: Account inactive
 * - 400: Invalid input
 */

import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({
    summary: 'User login (Admin: password, User: auth token)',
    description: `
      Examples for testing:
      
      1. Admin Login:
      {
        "email": "admin@library.com",
        "password": "adminPass123!"
      }
      
      2. Regular User Login:
      {
        "email": "user@example.com",
        "authToken": "eyJhbGciOiJIUzI1NiIs..."
      }
      
      Successful response will include:
      - access_token: JWT token for future requests
      - user: User profile information
      - role: User's role (admin/user)
      
      Use the received access_token in the Authorize button (🔓) at the top of Swagger UI
      Format: Bearer <access_token>
    `
  })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        access_token: 'eyJhbGciOiJIUzI1NiIs...',
        user: {
          id: 1,
          email: 'admin@library.com',
          role: 'admin',
          status: 'active'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized - Invalid credentials' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('validate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Validate JWT token' })
  @ApiResponse({ status: 200, description: 'Token is valid' })
  @ApiResponse({ status: 401, description: 'Token is invalid' })
  async validateToken(@Request() req) {
    return {
      valid: true,
      user: req.user,
    };
  }
}
