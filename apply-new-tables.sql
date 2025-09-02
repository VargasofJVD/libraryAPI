-- Apply only the new user-related tables
-- This avoids conflicts with existing tables

-- Create user role enum
CREATE TYPE "public"."user_role" AS ENUM('admin', 'user');

-- Create user status enum  
CREATE TYPE "public"."user_status" AS ENUM('pending', 'active', 'suspended');

-- Create approval_requests table
CREATE TABLE "approval_requests" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"request_type" varchar(50) NOT NULL,
	"resource_id" serial,
	"request_data" text,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"admin_id" serial,
	"admin_notes" text,
	"requested_at" timestamp DEFAULT now() NOT NULL,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Create user_sessions table
CREATE TABLE "user_sessions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" serial NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires_at" timestamp NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add unique constraint for user_sessions token
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_token_unique" UNIQUE("token");

-- Create users table
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"role" "user_role" DEFAULT 'user' NOT NULL,
	"status" "user_status" DEFAULT 'pending' NOT NULL,
	"auth_token" varchar(255),
	"token_expires_at" timestamp,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);

-- Add unique constraints for users table
ALTER TABLE "users" ADD CONSTRAINT "users_email_unique" UNIQUE("email");
ALTER TABLE "users" ADD CONSTRAINT "users_auth_token_unique" UNIQUE("auth_token");
