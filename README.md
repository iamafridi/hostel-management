# 🛍️ Product Management API

A scalable and type-safe RESTful API for managing products, built with **TypeScript**, **Express.js**, **Zod** validation, and **MongoDB**.  
Deployed on **Vercel Serverless Functions**.

---

## 🚀 Features

- Add, view, delete products
- Type-safe request validation using Zod, (also Joi implemented and can use joi by simply uncomment it)
- Error handling with meaningful responses
- Modular folder structure
- Environment-based configuration
- Vercel serverless compatible deployment

---

## 🧱 Tech Stack

- **Backend**: Node.js, Express.js
- **Language**: TypeScript
- **Validation**: Zod, Joi
- **Database**: MongoDB (via Mongoose)
- **Deployment**: Vercel
- **API Testing**: Postman
- **Hashing**: Bcrypt

---

## 🛠️ Installation

```bash
git clone https://github.com/iamafridi/e-com-prod.git
cd e-com-prod
npm install
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```
PORT=5000
DATABASE_URL=mongodb+srv://<username>:<password>@cluster.mongodb.net/product-db
BYCRYPT_SALT_ROUNDS= "Put the numbers"
```

---

## 💡 Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `npm run start:dev` | Run dev server (ts-node-dev) |
| `npm run build`     | Build TypeScript             |
| `npm run start`     | Start compiled app           |

---

## 📦 API Endpoints

| Method | Endpoint           | Description       |
| ------ | ------------------ | ----------------- |
| POST   | `/api/product`     | Add new product   |
| GET    | `/api/product`     | Get all products  |
| GET    | `/api/product/:id` | Get product by ID |
| DELETE | `/api/product/:id` | Delete product    |

### Example Payload for Adding a Product:

```json
{
  "product": {
    "id": "1", //this is mendatory and has to be unique
    "password": "abc123",
    "name": "Wireless Mouse", // Has to be unique for t
    "price": 25.99,
    "brand": "Logitech",
    "category": "Electronics",
    "stock": 100
  }
} //isDeleted is also implemented and if you delete something i will not show with all the products
```

---

## 🧪 Validation with Zod

Input validation is done using Zod. (also joi implemented , but commented out)
If input is missing or malformed, you'll receive responses like:

```json
{
  "success": false,
  "message": "[ { "expected": "object", "code": "invalid_type", ... } ]"
}
```

---

## 🌍 Deployment (Vercel)

Deployed on vercel live API at: [Check it Here](https://e-commerce-product-with-express-and.vercel.app/)

```
https://your-project-name.vercel.app/api/product
```

---

## 📂 Folder Structure

```
src/
├── app/
│   └── modules/
│       └── product/
│           ├── product.controller.ts
│           ├── product.route.ts
│           ├── product.service.ts
│           ├── product.validation.ts
│           └── product.interface.ts
├── config/
│   └── index.ts
├── server.ts
└── index.ts
```

---

## 🙋‍♂️ Author

**Afridi**  
🔗 [Portfolio](https://iamafrididev.netlify.app/)  
🐙 [GitHub](https://github.com/iamafridi)

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
