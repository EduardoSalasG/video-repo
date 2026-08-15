import express, { Request, Response } from 'express'
import authRoutes from './routes/authRoutes'
import moduleRoutes from './routes/moduleRoutes'
import sectionRoutes from './routes/sectionRoutes'
import videoRoutes from './routes/videoRoutes'

const app = express()

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Dance Education Platform API')
})

app.use('/auth', authRoutes)
app.use('/modules', moduleRoutes)
app.use('/', sectionRoutes);
app.use('/', videoRoutes);

export default app