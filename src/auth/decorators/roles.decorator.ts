/**
 * Roles Decorator - Route-level role requirements
 * 
 * Purpose:
 * - Defines required roles for routes
 * - Works with RolesGuard
 * - Enables declarative RBAC
 * 
 * Usage:
 * ```typescript
 * // Single role
 * @Roles(UserRole.ADMIN)
 * 
 * // Multiple roles
 * @Roles(UserRole.ADMIN, UserRole.LIBRARIAN)
 * 
 * // Combined with guards
 * @Roles(UserRole.ADMIN)
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * ```
 * 
 * Features:
 * 1. Metadata:
 *    - Sets route metadata
 *    - Stores role requirements
 *    - Accessed by guard
 * 
 * 2. Flexibility:
 *    - Multiple roles support
 *    - Class or method level
 *    - Composable with other decorators
 * 
 * @see RolesGuard
 * @see UserRole enum
 */

import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/enums/user-role.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
