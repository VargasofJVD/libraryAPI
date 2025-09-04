/**
 * This is the entry point for the NestJS application.
 * Key responsibilities:
 * 1. Sets up the NestJS application instance
 * 2. Configures global middleware (CORS, validation)
 * 3. Sets up Swagger/OpenAPI documentation
 * 4. Configures global validation pipes
 * 5. Starts the HTTP server
 * 
 * Dependencies:
 * - @nestjs/core: Core NestJS framework
 * - @nestjs/swagger: For API documentation
 * - class-validator & class-transformer: For DTO validation
 * 
 * Configuration:
 * - Uses environment variables for port configuration
 * - Sets up Swagger with tags for different modules
 */

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger API documentation
  const config = new DocumentBuilder()
    .setTitle('Library Management API')
    .setDescription('A comprehensive API for managing library resources using NestJS, Drizzle ORM, and BullMQ')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth', // This name here is important for references
    )
    .addTag('books', 'Book management operations')
    .addTag('authors', 'Author management operations')
    .addTag('categories', 'Category management operations')
    .addTag('loans', 'Book loan management operations')
    .addTag('queues', 'Background job queue operations')
    .addTag('auth', 'Authentication operations')
    .addTag('users', 'User management operations')
    .addTag('approval-requests', 'Approval request operations')
    .addTag('queue', 'Queue management and monitoring operations')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Library API is running on: http://localhost:${port}`);
  console.log(`📚 API Documentation available at: http://localhost:${port}/api`);
}

bootstrap();
