# 🏠 Hostel Management System API

A comprehensive and type-safe RESTful API for managing hostel operations, built with **TypeScript**, **Express.js**, **Zod** validation, and **MongoDB**.  
Features user management, student enrollment, academic faculty management, semester tracking, room allocation, admin management, faculty management, and scalable architecture.

---

## 🚀 Features

- **User Management**: Create, view, update, and manage all Users
- **Student Management**: Create, view, update, and manage students
- **Academic Semester Management**: Handle semester operations with complete CRUD functionality
- **Academic Faculty Management**: Create, view, update, and manage academic faculties
- **Academic Department Management**: Manage academic departments within faculties
- **Room Management**: Complete room allocation and management system
- **Admin Management**: Administrative user management and operations
- **Faculty Management**: Faculty member management and operations
- **Type-safe Validation**: Request validation using Zod schemas
- **Error Handling**: Comprehensive error handling with meaningful responses
- **Modular Architecture**: Clean, scalable folder structure following best practices
- **Database Integration**: MongoDB with Mongoose ODM
- **Environment Configuration**: Flexible configuration management
- **Timestamp Tracking**: Automatic createdAt and updatedAt fields
- **Duplicate Prevention**: Unique constraints to prevent data duplication

---

## 🧱 Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **Database**: MongoDB (via Mongoose)
- **HTTP Status**: http-status package
- **Development**: ts-node-dev for hot reloading
- **Error Handling**: Custom catchAsync middleware

---

## 🛠️ Installation

```bash
git clone https://github.com/iamafridi/hostel-management.git
cd hostel-management
npm install
```

### ⚙️ Environment Variables

Create a `.env` file in the root directory:

```env
PORT=5000
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/<projectName>
NODE_ENV=development
```

## 💡 Scripts

| Command             | Description                    |
| ------------------- | ------------------------------ |
| `npm run start:dev` | Run development server         |
| `npm run build`     | Build TypeScript to JavaScript |
| `npm run start`     | Start production server        |
| `npm run lint`      | Run ESLint                     |

## 📦 API Endpoints

### User Management Endpoints

| Method | Endpoint                       | Description        |
| ------ | ------------------------------ | ------------------ |
| POST   | `/api/v1/users/create-student` | Create new student |
| POST   | `/api/v1/users/create-faculty` | Create new faculty |
| POST   | `/api/v1/users/create-admin`   | Create new admin   |
| GET    | `/api/v1/users`                | Get all users      |
| GET    | `/api/v1/users/:userId`        | Get user by ID     |
| PATCH  | `/api/v1/users/:userId`        | Update user by ID  |

### Student Management Endpoints

| Method | Endpoint                      | Description          |
| ------ | ----------------------------- | -------------------- |
| GET    | `/api/v1/students`            | Get all students     |
| GET    | `/api/v1/students/:studentId` | Get student by ID    |
| PATCH  | `/api/v1/students/:studentId` | Update student by ID |
| DELETE | `/api/v1/students/:studentId` | Delete student by ID |

### Faculty Management Endpoints

| Method | Endpoint                       | Description          |
| ------ | ------------------------------ | -------------------- |
| GET    | `/api/v1/faculties`            | Get all faculties    |
| GET    | `/api/v1/faculties/:facultyId` | Get faculty by ID    |
| PATCH  | `/api/v1/faculties/:facultyId` | Update faculty by ID |
| DELETE | `/api/v1/faculties/:facultyId` | Delete faculty by ID |

### Admin Management Endpoints

| Method | Endpoint                  | Description        |
| ------ | ------------------------- | ------------------ |
| GET    | `/api/v1/admins`          | Get all admins     |
| GET    | `/api/v1/admins/:adminId` | Get admin by ID    |
| PATCH  | `/api/v1/admins/:adminId` | Update admin by ID |
| DELETE | `/api/v1/admins/:adminId` | Delete admin by ID |

### Room Management Endpoints

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| POST   | `/api/v1/rooms/create-room` | Create new room   |
| GET    | `/api/v1/rooms`             | Get all rooms     |
| GET    | `/api/v1/rooms/:roomId`     | Get room by ID    |
| PATCH  | `/api/v1/rooms/:roomId`     | Update room by ID |
| DELETE | `/api/v1/rooms/:roomId`     | Delete room by ID |

### Academic Faculty Endpoints

| Method | Endpoint                                             | Description          |
| ------ | ---------------------------------------------------- | -------------------- |
| POST   | `/api/v1/academic-faculties/create-academic-faculty` | Create new faculty   |
| GET    | `/api/v1/academic-faculties`                         | Get all faculties    |
| GET    | `/api/v1/academic-faculties/:facultyId`              | Get faculty by ID    |
| PATCH  | `/api/v1/academic-faculties/:facultyId`              | Update faculty by ID |

### Academic Department Endpoints

| Method | Endpoint                                                  | Description             |
| ------ | --------------------------------------------------------- | ----------------------- |
| POST   | `/api/v1/academic-departments/create-academic-department` | Create new department   |
| GET    | `/api/v1/academic-departments`                            | Get all departments     |
| GET    | `/api/v1/academic-departments/:departmentId`              | Get department by ID    |
| PATCH  | `/api/v1/academic-departments/:departmentId`              | Update department by ID |

### Academic Semester Endpoints

| Method | Endpoint                                              | Description           |
| ------ | ----------------------------------------------------- | --------------------- |
| POST   | `/api/v1/academic-semesters/create-academic-semester` | Create new semester   |
| GET    | `/api/v1/academic-semesters`                          | Get all semesters     |
| GET    | `/api/v1/academic-semesters/:semesterId`              | Get semester by ID    |
| PATCH  | `/api/v1/academic-semesters/:semesterId`              | Update semester by ID |

## 📝 Request Examples

### Create Student User

**POST** `/api/v1/users/create-student`

```json
{
  "password": "student123",
  "student": {
    "name": {
      "firstName": "elara",
      "middleName": "binte",
      "lastName": "sara"
    },
    "gender": "Female",
    "dateOfBirth": "1995-06-15",
    "email": "elara.sara@email.com",
    "contactNo": "+8801712345678",
    "emergencyContactNo": "+8801798765432",
    "bloodGroup": "A+",
    "presentAddress": "123 Main St, Dhaka",
    "permanentAddress": "456 Home St, Chittagong",
    "guardian": {
      "fatherName": "Afridi Chowdhury",
      "fatherOccupation": "Engineer",
      "fatherContactNo": "+8801798765432",
      "motherName": "Elara",
      "motherOccupation": "Doctor",
      "motherContactNo": "+8801798765433"
    },
    "localGuardian": {
      "name": "Uncle Rafi",
      "occupation": "Businessman",
      "contactNo": "+8801798765434",
      "address": "789 Local St, Dhaka"
    },
    "admissionSemester": "64f8a1b2c3d4e5f6789012ab",
    "academicDepartment": "64f8a1b2c3d4e5f6789012ac"
  }
}
```

### Create Academic Faculty

**POST** `/api/v1/academic-faculties/create-academic-faculty`

```json
{
  "name": "Faculty of Engineering"
}
```

**Response:**

```json
{
  "success": true,
  "statusCode": 201,
  "message": "Academic Faculty has been created successfully",
  "data": {
    "_id": "64f8a1b2c3d4e5f6789012ab",
    "name": "Faculty of Engineering",
    "createdAt": "2024-08-13T10:30:00.000Z",
    "updatedAt": "2024-08-13T10:30:00.000Z"
  }
}
```

## 🧪 Validation with Zod

Input validation is implemented using Zod schemas. Invalid requests return structured error responses:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Validation failed",
  "data": {
    "name": {
      "message": "Faculty name needs to be a string",
      "path": ["body", "name"]
    }
  }
}
```

## 🏗️ Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── academicDepartment/
│   │   │   ├── academicDepartment.controller.ts
│   │   │   ├── academicDepartment.service.ts
│   │   │   ├── academicDepartment.routes.ts
│   │   │   ├── academicDepartment.model.ts
│   │   │   ├── academicDepartment.interface.ts
│   │   │   └── academicDepartment.validation.ts
│   │   ├── academicFaculty/
│   │   │   ├── academicFaculty.controller.ts
│   │   │   ├── academicFaculty.service.ts
│   │   │   ├── academicFaculty.route.ts
│   │   │   ├── academicFaculty.model.ts
│   │   │   ├── academicFaculty.interface.ts
│   │   │   └── academicFaculty.validation.ts
│   │   ├── academicSemester/
│   │   │   ├── academicSemester.controller.ts
│   │   │   ├── academicSemester.service.ts
│   │   │   ├── academicSemester.route.ts
│   │   │   ├── academicSemester.model.ts
│   │   │   ├── academicSemester.interface.ts
│   │   │   └── academicSemester.validation.ts
│   │   ├── admin/
│   │   │   ├── admin.constant.ts
│   │   │   ├── admin.controller.ts
│   │   │   ├── admin.service.ts
│   │   │   ├── admin.route.ts
│   │   │   ├── admin.model.ts
│   │   │   ├── admin.interface.ts
│   │   │   └── admin.validation.ts
│   │   ├── faculty/
│   │   │   ├── faculty.constant.ts
│   │   │   ├── faculty.controller.ts
│   │   │   ├── faculty.service.ts
│   │   │   ├── faculty.route.ts
│   │   │   ├── faculty.model.ts
│   │   │   ├── faculty.interface.ts
│   │   │   └── faculty.validation.ts
│   │   ├── room/
│   │   │   ├── room.constant.ts
│   │   │   ├── room.controller.ts
│   │   │   ├── room.service.ts
│   │   │   ├── room.route.ts
│   │   │   ├── room.model.ts
│   │   │   ├── room.interface.ts
│   │   │   └── room.validation.ts
│   │   ├── student/
│   │   │   ├── student.controller.ts
│   │   │   ├── student.service.ts
│   │   │   ├── student.route.ts
│   │   │   ├── student.model.ts
│   │   │   ├── student.interface.ts
│   │   │   └── student.validation.ts
│   │   └── user/
│   │       ├── user.controller.ts
│   │       ├── user.service.ts
│   │       ├── user.route.ts
│   │       ├── user.model.ts
│   │       ├── user.interface.ts
│   │       ├── user.utils.ts
│   │       └── user.validation.ts
│   ├── config/
│   │   └── index.ts
│   ├── middlewares/
│   │   ├── globalErrorHandler.ts
│   │   ├── notFound.ts
│   │   └── validateRequest.ts
│   └── utils/
│       ├── sendResponse.ts
│       └── catchAsync.ts
├── config/
│   └── index.ts
├── server.ts
└── app.ts
```

## 🔧 Architecture Patterns

- **MVC Pattern**: Controllers handle HTTP requests, Services contain business logic
- **Middleware Pattern**: Request validation, error handling, and response formatting
- **Repository Pattern**: Data access layer with Mongoose models
- **Factory Pattern**: Consistent response structure across all endpoints
- **Modular Design**: Each feature is organized into separate modules with clear boundaries

## 🛡️ Error Handling

The system includes comprehensive error handling:

- **Validation Errors**: Zod schema validation with detailed error messages
- **Database Errors**: Mongoose validation and duplicate key handling
- **HTTP Errors**: Proper status codes and meaningful error responses
- **Async Error Handling**: catchAsync wrapper for clean error propagation

## 🧪 Testing

You can test the API using tools like:

- **Postman**: Import the collection for easy testing
- **Thunder Client**: VS Code extension for API testing
- **curl**: Command-line testing

### Deployment Platforms

- **Vercel**: Serverless deployment

## 🔄 Future Enhancements

- [ ] Authentication and authorization (JWT)
- [ ] Room booking and allocation system
- [ ] Payment and fee management
- [ ] Meal management system
- [ ] Visitor management
- [ ] Maintenance request system
- [ ] File upload functionality (profile pictures, documents)
- [ ] Advanced search and filtering
- [ ] Email notifications
- [ ] API rate limiting
- [ ] Unit and integration tests
- [ ] API documentation with Swagger
- [ ] Real-time notifications with WebSocket
- [ ] Dashboard analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull request

## 🙋‍♂️ Author

**Afridi Akbar Ifty**

- 🔗 [Portfolio](https://iamafrididev.netlify.app)
- 🐙 [GitHub](https://github.com/iamafridi)
- 💼 [LinkedIn](https://www.linkedin.com/in/iamafridi/)

## 📜 License

This project is licensed under the MIT License.
