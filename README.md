<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

# Library Management API

A comprehensive API for managing library resources built with **NestJS**, **Drizzle ORM**, and **BullMQ**.

## 🚀 Tech Stack

- **Framework**: NestJS 11
- **Database**: PostgreSQL with Drizzle ORM
- **Queue System**: BullMQ with Redis
- **Validation**: class-validator & class-transformer
- **Documentation**: Swagger/OpenAPI
- **Language**: TypeScript

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd library-api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   # Copy the environment file
   cp env.example .env
   
   # Update the .env file with your database and Redis credentials
   DATABASE_URL=postgresql://user:password@localhost:5432/library_db
   REDIS_HOST=localhost
   REDIS_PORT=6379
   ```

## 🗄️ Database Setup

1. **Create PostgreSQL database**
   ```sql
   CREATE DATABASE library_db;
   ```

2. **Generate migrations**
   ```bash
   npm run db:generate
   ```

3. **Run migrations**
   ```bash
   npm run db:migrate
   ```

4. **Seed the database (optional)**
   ```bash
   npm run db:seed
   ```

## 🚀 Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

## 📚 API Documentation

Once the application is running, you can access the Swagger documentation at:
```
http://localhost:3000/api
```

## 🏗️ Project Structure

```
src/
├── database/
│   ├── schema/           # Database schemas
│   │   ├── categories.schema.ts
│   │   ├── authors.schema.ts
│   │   ├── books.schema.ts
│   │   └── loans.schema.ts
│   └── database.module.ts
├── categories/           # Categories module
│   ├── dto/
│   ├── categories.service.ts
│   ├── categories.controller.ts
│   └── categories.module.ts
├── app.module.ts
└── main.ts
```

## 🔧 Available Scripts

- `npm run build` - Build the application
- `npm run start` - Start the application
- `npm run start:dev` - Start in development mode with hot reload
- `npm run db:generate` - Generate database migrations
- `npm run db:migrate` - Run database migrations
- `npm run db:studio` - Open Drizzle Studio
- `npm run db:seed` - Seed the database with sample data

## 📋 Features

### ✅ Implemented
- [x] Database schema design with Drizzle ORM
- [x] Categories CRUD operations
- [x] Input validation with class-validator
- [x] Swagger API documentation
- [x] Proper error handling
- [x] Soft delete functionality
- [x] Pagination and search

### 🚧 In Progress
- [ ] Authors module
- [ ] Books module
- [ ] Loans module
- [ ] BullMQ queue system
- [ ] Authentication & authorization

### 📝 Planned
- [ ] User management
- [ ] Advanced search and filtering
- [ ] Reporting and analytics
- [ ] Email notifications
- [ ] File uploads for book covers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.
