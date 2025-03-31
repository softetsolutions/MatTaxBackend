import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import userRepositery from "../repositery/userRepositery.js";
dotenv.config();

const verifyToken = async (req, res, next) => {
  const token =
    req.header("Authorization") || req.headers.cookie?.replace("authToken=", "");

    console.log("hey token",token);
    
  
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("decode",decoded);
    
    const user = await userRepositery.getUserById(decoded.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    else if(!user.token){
        
      return res.status(400).json({ message: "Creat New Session" });
    }
    next();
  } 
  catch (err) {
    console.error(err);
    res.status(400).json({ message: "Invalid token" });
  }
};

export default verifyToken;
