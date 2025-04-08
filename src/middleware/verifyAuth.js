import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const verifyToken = async (req, res, next) => {
  const token = res.cookie("authToken");
  // req.header("Authorization") || req.headers.cookie?.replace("authToken=", "");
  console.log("hey token", token);

  if (!token) {
    return res
      .status(401)
      .json({ message: "Access denied, No token provided." });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_KEY);
    console.log("decode", decoded);
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [decoded.id]);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    else if (!user.token) {
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
