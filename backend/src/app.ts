import express, { Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes';
import moduleRoutes from './routes/moduleRoutes';
import sectionRoutes from './routes/sectionRoutes';
import videoRoutes from './routes/videoRoutes';
import contentRoutes from './routes/contentRoutes';
import searchRoutes from './routes/searchRoutes';
import progressRoutes from './routes/progressRoutes';
import courseRoutes from './routes/courseRoutes';

const app = express();

// CORS configuration – allow requests from the frontend dev server
app.use(
  cors({
    origin: 'http://localhost:3001', // frontend URL
    credentials: true, // allow cookies to be sent/received
  })
);

app.use(express.json());
app.use(cookieParser()); // parse cookies

app.get('/', (req: Request, res: Response) => {
  res.send('Dance Education Platform API');
});

app.use('/auth', authRoutes);
app.use('/modules', moduleRoutes);
app.use('/courses', courseRoutes);
app.use('/', sectionRoutes);
app.use('/', videoRoutes);
app.use('/', contentRoutes);
app.use('/', searchRoutes);
app.use('/', progressRoutes);

export default app;