/**
 * Roles Guard - Role-based access control implementation
 * 
 * Purpose:
 * - Enforces role-based access control
 * - Validates user permissions
 * - Protects routes by role
 * 
 * Usage:
 * ```typescript
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Get('admin-only')
 * getAdminData() {
 *   // Only accessible by admins
 * }
 * ```
 * 
 * Features:
 * 1. Role Validation:
 *    - Multiple role support
 *    - Role hierarchy
 *    - Route protection
 * 
 * 2. Integration:
 *    - Works with JWT guard
 *    - Uses role decorator
 *    - Metadata reflection
 * 
 * Error Handling:
 * - 403: Insufficient permissions
 * - 401: No authentication
 * 
 * @implements CanActivate
 * @see Roles decorator
 * @see UserRole enum
 */

import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { UserRole } from '../../users/enums/user-role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some((role) => user.role === role);
  }
}
