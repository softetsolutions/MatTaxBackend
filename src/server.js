import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import APIrouter from "./routes/API-gatway.js";
import entityManager from "./modal/entityManager.js";
import { connectDB } from "./config/database.js";
import session from "express-session";
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'your_secret_key',
    resave: false,
    saveUninitialized: true,
  })
);

// Routes
app.use("/", APIrouter);

const PORT =  process.env.port || 5005;

const startServer = async () => {
   await connectDB(); // Connect to database and show message
   new entityManager(); // Create tables
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
