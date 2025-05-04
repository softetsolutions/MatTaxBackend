import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import APIrouter from "./routes/API-gatway.js";
import entityManager from "./modal/entityManager.js";
import { connectDB } from "./config/database.js";
import session from "express-session";
import cookieParser from "cookie-parser";
dotenv.config();

const app = express();
app.use(cors({
  origin: ['http://localhost:5173','http://mattaxpro.com'], 
  credentials: true                
}))
app.use(express.json());
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }, // Set to true only if using HTTPS
}));
// Routes
app.use("/", APIrouter);

const PORT =  process.env.port || 5005;

const startServer = async () => {
   await connectDB(); // Connect to database and show message
   new entityManager(); // Create tables
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
