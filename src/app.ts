import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { StudentRoutes } from './app/modules/student/student.route';
import { UserRoutes } from './app/modules/user/user.route';
import { success } from 'zod';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
const app: Application = express();
// const port = 3000;

// Parser
app.use(express.json());
app.use(cors());

//api/v1/products/create-product

// Application Routes
app.use('/api/v1/students', StudentRoutes);
app.use('/api/v1/users', UserRoutes);

const getAController = (req: Request, res: Response) => {
  res.send('Hello World!');
};

app.get('/', getAController);

//Global err handler 
app.use(globalErrorHandler);

export default app;
