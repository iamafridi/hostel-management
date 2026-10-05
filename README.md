# Hostel Pro ERP

Backend API for **Hostel Pro ERP** — a modular monolith that runs academia, clinical rotations, hostel operations and finance for a university campus on a single Express + TypeScript codebase.

[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D18-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Express](https://img.shields.io/badge/Express-5.x-000000?logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white)](https://mongoosejs.com)
[![License](https://img.shields.io/badge/License-ISC-blue.svg)](#license)

---

## Overview

Hostel Pro ERP is the server-side of a multi-tier campus ERP. It exposes a versioned REST API (`/api/v1`) that powers student admissions, faculty directories, course and curriculum management, hostel allocation, clinical ward logbooks, tuition billing and institutional analytics.

The application is deliberately built as a **modular monolith**: every business capability lives in its own self-contained module with a consistent `interface → model → validation → service → controller → route` shape, so the codebase stays navigable as it grows and individual modules can be extracted later if needed.

It is production-minded from the start — typed configuration, a uniform response contract, centralized error handling, role-based access control, an interactive read-only demo sandbox, an audit trail, and a serverless-ready entry point.

---

## Features

### Identity & access
- Email **or** institutional-ID login with access + refresh JWTs.
- Password change flow with server-side hashing (`bcrypt`).
- Role-based access control across the platform.
- Built-in **interactive demo accounts** for every role.
- **Read-only demo guard** — demo users may read everything but cannot mutate sandbox data.

### Academic operations
- Student admissions with auto-generated institutional IDs.
- Faculty and admin directories with designations and departments.
- Academic semesters, faculties and departments.
- Courses, credits, prerequisites and faculty assignment.

### Clinical
- Clinical rotations per student, hospital and ward.
- Procedure logbook with procedure codes, categories and competency levels.
- Supervisor sign-off recorded from the authenticated caller.
- Per-student logbook and institution-wide clinical summary.

### Hostel & finance
- Room and room-allocation management.
- Student fee ledger with per-head invoices and bulk generation.
- Payments, refunds, receipts with QR verification and a gateway webhook.

### Platform
- Consistent success/error response envelopes.
- Audit trail for every mutating request, retained with a TTL index.
- Notification module with retry-aware delivery.
- Optional Kafka + RabbitMQ event layer and Redis cache — each degrades gracefully when unavailable.
- Serverless entry point with cached MongoDB connections.

---

## Tech stack

| Layer            | Technology                                   |
| ---------------- | -------------------------------------------- |
| Runtime          | Node.js                                      |
| Language         | TypeScript                                   |
| Web framework    | Express 5                                    |
| Database         | MongoDB with Mongoose                        |
| Validation       | Zod                                          |
| Auth             | JSON Web Tokens (`jsonwebtoken`) + `bcrypt`  |
| Cache            | Redis (`ioredis`)                            |
| Event streaming  | Apache Kafka (`kafkajs`)                     |
| Task queuing     | RabbitMQ (`amqplib`)                         |
| Deployment       | Vercel serverless (or any Node host)         |

---

## Architecture

```
 Client
   │  HTTPS  /api/v1/*
   ▼
┌─────────────────────────────────────────────────────────────┐
│  Express app                                                 │
│                                                              │
│  json parser → CORS → attachUser → audit → demoGuard         │
│                       │             │          │             │
│                       │             │          └─ blocks demo │
│                       │             └─ writes the audit trail │
│                       └─ decodes the bearer token (optional)  │
│                                                              │
│  Router → <module>.route → controller → service → model      │
│                                                              │
│  globalErrorHandler → notFound                               │
└─────────────────────────────────────────────────────────────┘
        │                    │                     │
        ▼                    ▼                     ▼
     MongoDB             Redis cache          Kafka / RabbitMQ
  (data + audit)      (summary caching)   (events + tasks, optional)
```

Every module follows the same request path:

```
route → validateRequest(zod) → controller → service → mongoose model
                                     ▲
                              sendResponse envelope
```

---

## Project structure

```
src/
├── app/
│   ├── builder/                 # Reusable Mongoose query builder
│   ├── config/                  # Typed, centralized environment config
│   ├── consumers/               # Kafka & RabbitMQ event consumers
│   ├── errors/                  # AppError + error normalizers
│   ├── interface/               # Shared error / event / auth contracts
│   ├── middlewares/             # auth, demo guard, audit, validation, errors
│   ├── modules/                 # Feature modules (one folder per domain)
│   │   ├── auth/                # Login, refresh, profile, password change
│   │   ├── user/                # Accounts, roles, ID generation
│   │   ├── student/             # Student profiles & admissions
│   │   ├── faculty/             # Faculty directory
│   │   ├── admin/               # Admin directory
│   │   ├── academicSemester/    # Semester definitions
│   │   ├── academicFaculty/     # Faculties
│   │   ├── academicDepartment/  # Departments
│   │   ├── course/              # Courses & curriculum
│   │   ├── room/                # Hostel rooms & allocation
│   │   ├── clinical/            # Rotations & procedure logbook
│   │   ├── fee/                 # Student fee ledger
│   │   ├── payment/             # Payments, receipts, refunds
│   │   ├── notification/        # In-app notifications
│   │   ├── auditLog/            # Audit trail
│   │   ├── dashboard/           # Institutional analytics
│   │   └── semesterRegistration/# Semester registration
│   ├── routes/                  # Central router aggregating module routes
│   └── utils/                   # catchAsync, sendResponse, jwt, redis, kafka, mq
├── api/                         # Vercel serverless entry (cached DB connection)
├── scripts/                     # Operational scripts (demo seeder)
└── server.ts                    # Local / long-running entry (graceful shutdown)
```

---

## Getting started

### Prerequisites

- Node.js 18+
- A MongoDB connection string (local or Atlas)
- Optional: Redis, Kafka, RabbitMQ (the API runs without them)

### Installation

```bash
git clone https://github.com/iamafridi/hostel-management.git
cd hostel-management
npm install
```

### Environment

Copy the template and fill in your values:

```bash
cp .env.example .env
```

### Run

```bash
# development (hot reload)
npm run start:dev

# production build + run
npm run build
npm run start:prod
```

### Seed the demo sandbox

Creates the demo accounts and a small amount of showcase academic/clinical data (idempotent — safe to re-run):

```bash
npm run seed:demo
```

### Local infrastructure

`docker-compose.yml` brings up the optional backing services:

```bash
docker compose up -d
```

---

## Environment variables

| Variable                  | Required | Default        | Purpose                                              |
| ------------------------- | -------- | -------------- | ---------------------------------------------------- |
| `NODE_ENV`                | no       | —              | `development` enables stack traces in error bodies   |
| `PORT`                    | no       | —              | HTTP port for the long-running server                |
| `DATABASE_URL`            | **yes**  | —              | MongoDB connection string                            |
| `JWT_ACCESS_SECRET`       | **yes**  | —              | Signing secret for access tokens                     |
| `JWT_REFRESH_SECRET`      | **yes**  | —              | Signing secret for refresh tokens                    |
| `JWT_ACCESS_EXPIRES_IN`   | no       | `1d`           | Access token lifetime                                |
| `JWT_REFRESH_EXPIRES_IN`  | no       | `7d`           | Refresh token lifetime                               |
| `BYCRYPT_SALT_ROUNDS`     | no       | —              | bcrypt cost factor                                   |
| `DEFAULT_PASS`            | no       | —              | Fallback password for admin-created accounts         |
| `DEMO_PASSWORD`           | no       | `Demo@123`     | Password for seeded demo accounts                    |
| `CORS_ORIGINS`            | no       | (all allowed)  | Comma-separated allow-list, supports `https://*.x`   |
| `KAFKA_BROKERS`           | no       | —              | Enables the Kafka event bus when set                 |
| `KAFKA_CLIENT_ID`         | no       | `hostel-management` | Kafka client identifier                        |
| `RABBITMQ_URL`            | no       | —              | Enables the RabbitMQ task queue when set             |
| `REDIS_URL`               | no       | —              | Enables summary caching when set                     |
| `AUDIT_LOG_TTL_DAYS`      | no       | `30`           | Retention window for audit entries                   |
| `RAZORPAY_WEBHOOK_SECRET` | no       | —              | Verifies payment gateway webhooks                    |

> **Security:** always supply strong, unique JWT secrets in production. Never commit `.env`.

---

## API reference

- **Base URL:** `/api/v1`
- **Content type:** `application/json`
- **Auth:** `Authorization: Bearer <accessToken>`

### Response envelopes

Success:

```json
{
  "success": true,
  "statusCode": 200,
  "message": "Resource retrieved successfully",
  "meta": { "page": 1, "limit": 10, "total": 45, "totalPages": 5 },
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "message": "Validation Error",
  "errorSources": [{ "path": "body.email", "message": "Email is required" }],
  "stack": "…only in development…"
}
```

### Authentication

| Method | Endpoint                      | Access       | Description                          |
| ------ | ----------------------------- | ------------ | ------------------------------------ |
| POST   | `/auth/login`                 | Public       | Login with email or institutional ID |
| POST   | `/auth/refresh-token`         | Public       | Exchange a refresh token             |
| GET    | `/auth/demo-accounts`         | Public       | List demo sandbox accounts           |
| GET    | `/auth/me`                    | Bearer       | Current profile                      |
| POST   | `/auth/change-password`       | Bearer       | Change the current password          |

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"identifier":"super.admin@college.edu","password":"Demo@123"}'
```

### Demo accounts

Password for every account: **`Demo@123`**. Demo accounts are **read-only** — mutating requests are rejected with `403 Demo accounts are view-only. You cannot modify sandbox data.`

| Role           | Email                        | ID         |
| -------------- | ---------------------------- | ---------- |
| `super-admin`  | `super.admin@college.edu`    | `SA-0001`  |
| `domain-admin` | `domain.admin@college.edu`   | `DA-0001`  |
| `faculty`      | `demo.faculty@erp.demo`      | `F-0001`   |
| `student`      | `demo.student@erp.demo`      | `2030010001` |
| `doctor`       | `demo.doctor@erp.demo`       | `DOC-0001` |
| `accountant`   | `demo.accountant@erp.demo`   | `AC-0001`  |

### Users

| Method | Endpoint                                | Description            |
| ------ | --------------------------------------- | ---------------------- |
| POST   | `/users/create-student`                 | Create a student account |
| POST   | `/users/create-faculty`                 | Create a faculty account |
| POST   | `/users/create-admin`                   | Create an admin account  |

### Students

| Method | Endpoint            | Description            |
| ------ | ------------------- | ---------------------- |
| GET    | `/students`         | List students          |
| GET    | `/students/:id`     | Get a single student   |
| PATCH  | `/students/:id`     | Update a student       |
| DELETE | `/students/:id`     | Soft delete a student  |

### Faculty & admins

| Method | Endpoint           | Description           |
| ------ | ------------------ | --------------------- |
| GET    | `/faculties`       | List faculty          |
| GET    | `/faculties/:id`   | Get a single faculty  |
| PATCH  | `/faculties/:id`   | Update a faculty      |
| DELETE | `/faculties/:id`   | Soft delete a faculty |
| GET    | `/admins`          | List admins           |
| GET    | `/admins/:id`      | Get a single admin    |
| PATCH  | `/admins/:id`      | Update an admin       |
| DELETE | `/admins/:adminId` | Soft delete an admin  |

### Academics

| Method | Endpoint                                              | Description             |
| ------ | ----------------------------------------------------- | ----------------------- |
| GET    | `/academic-semesters`                                 | List semesters          |
| GET    | `/academic-semesters/:code`                           | Get a semester          |
| POST   | `/academic-semesters/create-academic-semester`        | Create a semester       |
| PATCH  | `/academic-semesters/:semesterId`                     | Update a semester       |
| GET    | `/academic-faculties`                                 | List academic faculties |
| POST   | `/academic-faculties/create-academic-faculty`         | Create a faculty        |
| GET    | `/academic-faculties/:facultyId`                      | Get a faculty           |
| PATCH  | `/academic-faculties/:facultyId`                      | Update a faculty        |
| GET    | `/academic-departments`                               | List departments        |
| POST   | `/academic-departments/create-academic-department`    | Create a department     |
| GET    | `/academic-departments/:departmentId`                 | Get a department        |
| PATCH  | `/academic-departments/:departmentId`                 | Update a department     |

### Courses

| Method | Endpoint                                | Description                  |
| ------ | --------------------------------------- | ---------------------------- |
| GET    | `/courses`                              | List courses                 |
| GET    | `/courses/:id`                          | Get a course                 |
| POST   | `/courses/create-course`                | Create a course              |
| PATCH  | `/courses/:id`                          | Update a course              |
| PUT    | `/courses/:courseId/assign-faculties`   | Assign faculty to a course   |
| DELETE | `/courses/:courseId/remove-faculties`   | Remove faculty from a course |
| DELETE | `/courses/:id`                          | Soft delete a course         |

### Clinical *(requires authentication)*

| Method | Endpoint                                  | Access            | Description                       |
| ------ | ----------------------------------------- | ----------------- | --------------------------------- |
| GET    | `/clinical/summary`                       | Bearer            | Institution clinical summary      |
| GET    | `/clinical/students/:studentId/logbook`   | Bearer            | A student's rotations & procedures |
| POST   | `/clinical/rotations`                     | Clinical staff    | Create a rotation                 |
| GET    | `/clinical/rotations`                     | Bearer            | List rotations                    |
| GET    | `/clinical/rotations/:id`                 | Bearer            | Get a rotation                    |
| PATCH  | `/clinical/rotations/:id`                 | Clinical staff    | Update a rotation                 |
| DELETE | `/clinical/rotations/:id`                 | Clinical staff    | Soft delete a rotation            |
| POST   | `/clinical/procedures`                    | Clinical staff    | Log a procedure                   |
| GET    | `/clinical/procedures`                    | Bearer            | List procedures                   |
| GET    | `/clinical/procedures/:id`                | Bearer            | Get a procedure                   |
| PATCH  | `/clinical/procedures/:id`                | Clinical staff    | Update a procedure                |
| PATCH  | `/clinical/procedures/:id/sign-off`       | Supervisor        | Record supervisor sign-off        |
| DELETE | `/clinical/procedures/:id`                | Clinical staff    | Soft delete a procedure           |

Procedure categories: `CORE_MANDATORY`, `LIFE_SUPPORT_EMERGENCY`, `ELECTIVE`.
Competency levels: `OBSERVED`, `ASSISTED`, `PERFORMED_SUPERVISED`, `PERFORMED_INDEPENDENT`.

### Fees

| Method | Endpoint                    | Description                       |
| ------ | --------------------------- | --------------------------------- |
| GET    | `/fees`                     | List invoices                     |
| GET    | `/fees/summary`             | Cached fee summary                |
| GET    | `/fees/:id`                 | Get an invoice                    |
| POST   | `/fees/create-fee`          | Create an invoice                 |
| POST   | `/fees/generate-bulk-fees`  | Generate invoices for a batch     |
| PATCH  | `/fees/:id`                 | Update an invoice                 |
| DELETE | `/fees/:id`                 | Soft delete an unpaid invoice     |

### Payments

| Method | Endpoint                                    | Description                     |
| ------ | ------------------------------------------- | ------------------------------- |
| GET    | `/payments`                                 | List payments                   |
| GET    | `/payments/summary`                         | Cached payment summary          |
| GET    | `/payments/:id`                             | Get a payment                   |
| POST   | `/payments/create-payment`                  | Record a payment                |
| POST   | `/payments/razorpay/webhook`                | Payment gateway webhook         |
| GET    | `/payments/receipt/:receiptNumber/verify`   | Verify a receipt token          |
| PATCH  | `/payments/:id/refund`                      | Refund a payment                |
| DELETE | `/payments/:id`                             | Soft delete a payment           |

### Dashboard *(requires authentication + management role)*

| Method | Endpoint                        | Description                    |
| ------ | ------------------------------- | ------------------------------ |
| GET    | `/dashboard/overview`           | KPIs across academics/finance/clinical |
| GET    | `/dashboard/recent-activity`    | Recent audit/payment/clinical feeds |

### Notifications

| Method | Endpoint                                    | Description                |
| ------ | ------------------------------------------- | -------------------------- |
| GET    | `/notifications`                            | List notifications         |
| GET    | `/notifications/unread-count/:recipientId`  | Unread count               |
| GET    | `/notifications/:id`                        | Get a notification         |
| POST   | `/notifications/create-notification`        | Create a notification      |
| PATCH  | `/notifications/read-all/:recipientId`      | Mark all as read           |
| PATCH  | `/notifications/:id/read`                   | Mark one as read           |
| DELETE | `/notifications/:id`                        | Soft delete a notification |

### Audit logs

| Method | Endpoint                              | Description                    |
| ------ | ------------------------------------- | ------------------------------ |
| GET    | `/audit-logs`                         | List audit entries             |
| GET    | `/audit-logs/stats`                   | Cached audit statistics        |
| GET    | `/audit-logs/trail/:correlationId`    | Full trail for a request       |
| GET    | `/audit-logs/:id`                     | Get an audit entry             |
| POST   | `/audit-logs/create-audit-log`        | Create an entry (internal)     |
| DELETE | `/audit-logs/:id`                     | Soft delete an entry           |

### Health

| Method | Endpoint   | Description         |
| ------ | ---------- | ------------------- |
| GET    | `/health`  | Liveness probe      |

---

## Roles & permissions

| Role           | Scope                                                        |
| -------------- | ------------------------------------------------------------ |
| `super-admin`  | Full access across every domain                              |
| `domain-admin` | Administrative access within a domain                        |
| `admin`        | Institutional administration                                 |
| `faculty`      | Teaching, clinical supervision and sign-off                  |
| `doctor`       | Clinical supervision and procedure sign-off                  |
| `accountant`   | Fee ledger, payments and finance analytics                   |
| `student`      | Read access to their own academic and clinical records       |

RBAC is enforced with `requireAuth` + `requireRole(...)`. The **demo guard** runs globally, so any request authenticated as a demo account may read but never write.

---

## Event-driven layer

Optional and fully decoupled — each piece is a no-op when its infrastructure is not configured.

| Component | Name                        | Purpose                               |
| --------- | --------------------------- | ------------------------------------- |
| Kafka     | `erp.audit.cud`             | Audit events for create/update/delete |
| Kafka     | `erp.fee.paid`              | Fee paid events                       |
| Kafka     | `erp.dlq.all`               | Dead-letter events                    |
| RabbitMQ  | `erp.notification.push`     | Notification delivery                 |
| RabbitMQ  | `erp.notification.push.retry.{1..3}` | Retry queues with backoff   |
| RabbitMQ  | `erp.dlq`                   | Dead-letter queue                     |
| Redis     | `fee:summary`, `payment:summary`, `audit:stats`, `dashboard:overview`, `clinical:summary` | Cached aggregates |

---

## Deployment

### Vercel (serverless)

`src/api/index.ts` is the serverless entry. It caches the MongoDB connection across warm invocations and fails fast on database errors.

```json
{
  "version": 2,
  "builds": [{ "src": "dist/api/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "dist/api/index.js" }]
}
```

Build the project (`npm run build`) before deploying so `dist/api/index.js` exists, and configure every required environment variable in the Vercel dashboard.

### Traditional Node host

```bash
npm ci
npm run build
npm run start:prod
```

`src/server.ts` handles graceful shutdown and traps `unhandledRejection` / `uncaughtException`.

---

## Scripts

| Script              | Description                                  |
| ------------------- | -------------------------------------------- |
| `npm run start:dev` | Start in watch mode                          |
| `npm run build`     | Compile TypeScript to `dist/`                |
| `npm run start:prod`| Run the compiled server                      |
| `npm run seed:demo` | Seed demo users and showcase data            |
| `npm run lint`      | Lint the source tree                         |
| `npm run lint:fix`  | Lint and auto-fix                            |
| `npm run prettier:fix` | Format the source tree                    |
| `npm test`          | Test runner placeholder                      |

---

## Conventions

- **One module, one responsibility.** Each domain owns its `interface`, `model`, `validation`, `service`, `controller` and `route`.
- **Validate at the edge.** Every mutating route runs a Zod schema through `validateRequest`.
- **Never trust derived values.** Amounts, statuses and IDs are computed in the service layer.
- **Soft deletes.** Documents carry `isDeleted` and are filtered out by query middleware.
- **Serverless-safe models.** Models are registered as `models.X || model(...)` to avoid `OverwriteModelError` on hot reloads.
- **Indexes on hot paths** (`id`, `email`, `role`, `status`, `student`, `procedureCode`).
- **Uniform envelopes.** All responses go through `sendResponse`; all errors go through `globalErrorHandler`.

---

## Contributing

1. Create a feature branch from `main`.
2. Follow the existing module structure and naming.
3. Ensure `npm run lint` and `npm run build` pass before opening a pull request.
4. Keep commit messages focused and descriptive.

---

## License

Released under the [ISC License](./LICENSE).
