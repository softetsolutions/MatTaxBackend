import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import APIrouter from "./routes/API-gatway.js";
import entityManager from "./modal/entityManager.js";
import { connectDB } from "./config/database.js";
import google from './Auth/google-auth.js'
dotenv.config();


const app = express();
app.use(cors());
app.use(express.json());

// Routes
app.use("/", APIrouter);

const PORT =  5005;

const startServer = async () => {
   await connectDB(); // Connect to database and show message
   new entityManager(); // Create tables
   app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
