import jsonwebtoken from "jsonwebtoken";
import EctDct from '../../../config/managePassword.js';
import { pool } from "../../../config/database.js";
import { TwitterApi } from "twitter-api-v2";
import { allowedRoutes } from "../../../config/constant.js";
// User Login
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

export const createUser = async (req, res)=> {
  try {
    req.body.password = EctDct.encrypt(req.body.password, process.env.KEY);
    const query = `INSERT INTO users (${Object.keys(req.body).join(', ')}) VALUES (${Object.keys(req.body).map((_, i) => `$${i + 1}`).join(', ')}) RETURNING *;`;
    const result = await pool.query(query, Object.values(req.body));
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export const twitterAuth = async (req, res) => {
  try {
    const { url, codeVerifier, state } = twitterClient.generateOAuth2AuthLink(
      process.env.TWITTER_CALLBACK_URL,
      { scope: ["tweet.read", "users.read", "offline.access"] }
    );

    req.session.codeVerifier = codeVerifier;
    req.session.oauthState = state;

    res.redirect(url);
  } catch (error) {
    console.error("Error generating Twitter OAuth link:", error);
    res.status(500).send("Authentication error.");
  }
};

export const twitterCallBackAuth = async (req, res) => {
  const { state, code } = req.query;
  console.log("state", state);
  if (!code || state !== req.session.oauthState) {
    return res.status(400).send("Invalid OAuth request.");
  }

  try {
    const { client: authClient, accessToken, refreshToken } =
      await twitterClient.loginWithOAuth2({
        code,
        codeVerifier: req.session.codeVerifier,
        redirectUri: process.env.TWITTER_CALLBACK_URL,
      });

    req.session.accessToken = accessToken;
    req.session.refreshToken = refreshToken;

    const { data: user } = await authClient.v2.me(); // Fetch user profile
    console.log("User profile:", user);
    res.send(`Welcome, ${user.name} (@${user.username})`);
  } catch (error) {
    console.error("Error during Twitter authentication:", error);
    res.status(500).send("Authentication failed.");
  }
};

export const login = async (req, res) => {
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
    const tokenData = { id: user.id, role: user.role, allowedRoutes: allowedRoutes[user.role] };
    // Generate new token
    const authToken = jsonwebtoken.sign(
      tokenData,
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
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 1000, // 1 hour
      sameSite: "Strict",
    });
    return res.status(200).json({ data: authToken });
  }
  catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
}

// User Logou
export const logout = async (req, res) => {
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