import jsonwebtoken from "jsonwebtoken";
import EctDct from '../../../config/managePassword.js';
import { pool } from "../../../config/database.js";

class userAuth {
  // User Login
  async login(req, res) {
    try {
      const { email, password } = req.body;
      const query = `SELECT * FROM users WHERE email = $1`;
      const result = await pool.query(query, [email]);
      const user = result.rows[0]; // Get the first user object from the result

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isPasswordValid = await EctDct.decrypt(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate new token
      const authToken = jsonwebtoken.sign(
        { id: user.id, role: user.userRole },
        process.env.JWT_KEY,
        {
          expiresIn: `1h`,
        }
      );
      const id = user.id;
      const body = { token: authToken };

      const fields = Object.keys(body);
      const set = fields.map((field, i) => `${field} = $${i + 1}`).join(', ');
      const updateUser = `UPDATE users SET ${set} WHERE id = ${id} RETURNING *`;

      const updatedUser = await pool.query(updateUser, Object.values(body));
      req.user = updatedUser.rows[0];
      // Set token in cookies
      // res.cookie("authToken", authToken, {
      //   httpOnly: true,
      //   secure: process.env.NODE_ENV === "production",
      //   maxAge: 60 * 60 * 1000, // 1 hour
      //   sameSite: "Strict",
      // });

      return res.status(200).json({ authToken });
    }
    catch (error) {
      return res
        .status(500)
        .json({ message: "Server error", error: error.message });
    }
  }

  // User Logou
  logout = async (req, res) => {
    try {
      const token =
        req.header("Authorization") || req.headers.cookie?.replace("authToken=", "");
      console.log("t", token);
      const body = { token: null };
      const fields = Object.keys(body);
      const values = Object.values(body);
  
      if (!fields.length) {
          throw new Error("No fields to update");
      }
  
      const set = fields.map((field, i) => `${field} = $${i + 1}`).join(", ");
      const query = `UPDATE users SET ${set} WHERE token = $${fields.length + 1} RETURNING *`;
      const result = await pool.query(query, [...values, token]);
      user = result.rows[0];
      res.clearCookie("authToken", {
        httpOnly: true,
        secure: true,
        sameSite: "Strict",
      });
      return res.status(200).json({ message: "Logout successful" });
    } catch (err) {
      return res.status(400).json(err);
    }
  };
}

export default new userAuth();
