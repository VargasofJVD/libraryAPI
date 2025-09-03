/**
 * JWT Authentication Guard
 * 
 * Purpose:
 * - Protects routes requiring authentication
 * - Validates JWT tokens in requests
 * - Attaches user data to request
 * 
 * Usage:
 * ```typescript
 * @UseGuards(JwtAuthGuard)
 * @Get('protected-route')
 * getProtectedData() {
 *   // Only accessible with valid JWT
 * }
 * ```
 * 
 * Functionality:
 * 1. Token Extraction:
 *    - From Authorization header
 *    - Bearer token format
 * 
 * 2. Token Validation:
 *    - Signature verification
 *    - Expiration check
 *    - Payload validation
 * 
 * 3. Request Enhancement:
 *    - Adds user object to request
 *    - Provides user context
 * 
 * Error Handling:
 * - 401: Invalid/missing token
 * - 403: Token expired
 * 
 * @extends AuthGuard('jwt')
 * @see JwtStrategy
 */

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
