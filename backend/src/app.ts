import express, { Request, Response } from 'express'
import authRoutes from './routes/authRoutes'
import moduleRoutes from './routes/moduleRoutes'
import sectionRoutes from './routes/sectionRoutes'
import videoRoutes from './routes/videoRoutes'
import contentRoutes from './routes/contentRoutes'
import searchRoutes from './routes/searchRoutes'
import progressRoutes from './routes/progressRoutes'

const app = express()

app.use(express.json())

app.get('/', (req: Request, res: Response) => {
  res.send('Dance Education Platform API')
})

app.use('/auth', authRoutes)
app.use('/modules', moduleRoutes)
app.use('/', sectionRoutes)
app.use('/', videoRoutes)
app.use('/', contentRoutes)
app.use('/', searchRoutes)
app.use('/', progressRoutes)

export default app