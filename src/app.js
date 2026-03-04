import express from 'express';
import cors from "cors";
import cookieParser from 'cookie-parser'

const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({ limit: "16kb" }))
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())


import userTypeRouter from './routes/userType.routes.js'
import healthCheckRouter from './routes/healthCheck.routes.js'
import userRouter from './routes/user.routes.js'
import categoryRouter from './routes/category.routes.js'
import serviceRouter from './routes/service.routes.js'


app.use("/api/v1/health-check", healthCheckRouter)
app.use("/api/v1/user-type", userTypeRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/service", serviceRouter)






export default app