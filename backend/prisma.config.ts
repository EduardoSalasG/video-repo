import { defineConfig } from 'prisma/config'

export default defineConfig({
  datasource: {
    url: "postgresql://postgres:admin@localhost:5433/video_repo"
  }
})
