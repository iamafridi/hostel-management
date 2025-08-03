import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';
const app: Application = express();
// const port = 3000;

// Parser
app.use(express.json());
app.use(cors());

//api/v1/products/create-product

// Application Routes
app.use('/api/v1', router);
// app.use('/api/v1/users', UserRoutes);

const test = (req: Request, res: Response) => {
  res.send('Hello World!');
};

app.get('/', test);

//Global err handler 
app.use(globalErrorHandler);
// Not Found
app.use(notFound);

export default app;
