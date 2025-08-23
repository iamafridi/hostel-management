# 🏠 Hostel Management System API

A comprehensive and type-safe RESTful API for managing hostel operations, built with **TypeScript**, **Express.js**, **Zod** validation, and **MongoDB**.  
Features user management, student enrollment, academic faculty management, semester tracking, and scalable architecture.

---

## 🚀 Features

- **User Management**: Create, view, update, and manage all Users
- **Student Management**: Create, view, update, and manage students
- **Academic Semester Management**: Handle semester operations with complete CRUD functionality
- **Academic Faculty Management**: Create, view, update, and manage academic faculties
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

### Academic Faculty Endpoints

| Method | Endpoint                                             | Description          |
| ------ | ---------------------------------------------------- | -------------------- |
| POST   | `/api/v1/academic-faculties/create-academic-faculty` | Create new faculty   |
| GET    | `/api/v1/academic-faculties`                         | Get all faculties    |
| GET    | `/api/v1/academic-faculties/:facultyId`              | Get faculty by ID    |
| PATCH  | `/api/v1/academic-faculties/:facultyId`              | Update faculty by ID |

### Academic Semester Endpoints

| Method | Endpoint                                              | Description           |
| ------ | ----------------------------------------------------- | --------------------- |
| POST   | `/api/v1/academic-semesters/create-academic-semester` | Create new semester   |
| GET    | `/api/v1/academic-semesters`                          | Get all semesters     |
| GET    | `/api/v1/academic-semesters/:semesterId`              | Get semester by ID    |
| PATCH  | `/api/v1/academic-semesters/:semesterId`              | Update semester by ID |

## 📝 Request Examples

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

### Get All Academic Faculties

**GET** `/api/v1/academic-faculties`

**Response:**

```json
{
  "success": true,
  "statusCode": 200,
  "message": "All Academic Faculties retrieved successfully",
  "data": [
    {
      "_id": "64f8a1b2c3d4e5f6789012ab",
      "name": "Faculty of Engineering",
      "createdAt": "2024-08-13T10:30:00.000Z",
      "updatedAt": "2024-08-13T10:30:00.000Z"
    }
  ]
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
│   │   └── globalErrorHandler.ts
│   │   └── notFound.ts
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

- [ ] Student management module
- [ ] Room allocation system
- [ ] Fee management
- [ ] Authentication and authorization
- [ ] File upload functionality
- [ ] Advanced search and filtering
- [ ] API rate limiting
- [ ] Unit and integration tests
- [ ] API documentation with Swagger

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
