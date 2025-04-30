import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import {pool} from "../config/database.js";
dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = req.cookies.authToken;
  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    const res = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    const user = res.rows[0];
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    req.user = user
    next();
  }
  catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server Error" });
  }
};

export default verifyToken;
