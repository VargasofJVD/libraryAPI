/**
 * Users Schema - Defines the database structure for user management
 * 
 * Schema components:
 * 1. User Role Enum:
 *    - admin: Full system access
 *    - user: Standard library member access
 * 
 * 2. User Status Enum:
 *    - pending: Awaiting approval
 *    - active: Approved and active user
 *    - suspended: Temporarily blocked user
 * 
 * 3. Users Table:
 *    Core fields:
 *    - id: Unique identifier
 *    - email: Login credential & communications
 *    - password: Hashed authentication credential
 *    - firstName/lastName: Personal identification
 *    - role: Access control level
 *    - status: Account state
 * 
 * Relationships:
 * - One-to-Many with Loans
 * - One-to-Many with ApprovalRequests
 * 
 * Constraints:
 * - Unique email
 * - Required password (hashed)
 * - Required name fields
 * - Valid role and status values
 */

import { pgTable, serial, varchar, text, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core';

// User role enum - Controls access levels
export const userRoleEnum = pgEnum('user_role', ['admin', 'user']);

// User status enum - Manages account states
export const userStatusEnum = pgEnum('user_status', ['pending', 'active', 'suspended']);

// Users table - Core user data structure
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }).notNull(),
  role: userRoleEnum('role').notNull().default('user'),
  status: userStatusEnum('status').notNull().default('pending'),
  authToken: varchar('auth_token', { length: 255 }).unique(),
  tokenExpiresAt: timestamp('token_expires_at'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User approval requests table
export const approvalRequests = pgTable('approval_requests', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull(),
  requestType: varchar('request_type', { length: 50 }).notNull(), // 'book_add', 'book_update', 'book_delete'
  resourceId: serial('resource_id'), // ID of the book being requested
  requestData: text('request_data'), // JSON string of the request details
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'approved', 'rejected'
  adminId: serial('admin_id'), // Admin who processed the request
  adminNotes: text('admin_notes'),
  requestedAt: timestamp('requested_at').notNull().defaultNow(),
  processedAt: timestamp('processed_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// User sessions table for token management
export const userSessions = pgTable('user_sessions', {
  id: serial('id').primaryKey(),
  userId: serial('user_id').notNull(),
  token: varchar('token', { length: 255 }).notNull().unique(),
  expiresAt: timestamp('expires_at').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
