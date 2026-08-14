import express, { Request, Response } from 'express';
import authRoutes from './routes/authRoutes';
import moduleRoutes from './routes/moduleRoutes';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get('/', (req: Request, res: Response) => {
  res.send('Dance Education Platform API');
});

app.use('/auth', authRoutes);
app.use('/modules', moduleRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

export default app;
