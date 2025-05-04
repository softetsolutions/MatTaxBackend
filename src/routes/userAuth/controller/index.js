import jsonwebtoken from "jsonwebtoken";
import EctDct from "../../../config/managePassword.js";
import { pool } from "../../../config/database.js";
import { TwitterApi } from "twitter-api-v2";
import { allowedRoutes } from "../../../config/constant.js";
import { verifyMail } from "../../../middleware/sendMail.js";
import atob from "atob";
import btoa from "btoa";
import { OAuth2Client } from "google-auth-library";

export const createUser = async (req, res) => {
  try {
    req.body.password = EctDct.encrypt(req.body.password, process.env.KEY);
    req.body.verified = false;
    const query = `INSERT INTO users (${Object.keys(req.body).join(
      ", "
    )}) VALUES (${Object.keys(req.body)
      .map((_, i) => `$${i + 1}`)
      .join(", ")}) RETURNING *;`;
    const result = await pool.query(query, Object.values(req.body));
    const token = btoa(`${result.rows[0].id}`);
    console.log("token", token);
    const verifyLink = `${"http://localhost:5173"}/verifyEmail/${token}`;
    verifyMail(req.body.email, verifyLink);
    res.status(200).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const verifyUser = async (req, res) => {
  try {
    const { token } = req.params;
    const id = atob(token);
    const query = `UPDATE users SET verified = true WHERE id = $1 RETURNING *;`;
    const result = await pool.query(query, [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({
      message: "User verified successfully",
      user: result.rows[0].email,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_CLIENT_ID,
  appSecret: process.env.TWITTER_CLIENT_SECRET,
});

export const twitterAuth = async (req, res) => {
  try {
    const { url, oauth_token, oauth_token_secret } =
      await twitterClient.generateAuthLink(process.env.TWITTER_CALLBACK_URL);

    // Store tokens in session
    req.session.oauth_token = oauth_token;
    req.session.oauth_token_secret = oauth_token_secret;

    res.redirect(url);
  } catch (error) {
    console.error("Error generating Twitter OAuth link:", error);
    res.status(500).send("Authentication error.");
  }
};

export const twitterCallBackAuth = async (req, res) => {
  const { oauth_token, oauth_verifier } = req.query;
  if (oauth_token !== req.session.oauth_token) {
    return res.status(400).send("OAuth token mismatch or expired.");
  }
  if (!oauth_token || !oauth_verifier || !req.session.oauth_token_secret) {
    return res.status(400).send("Invalid or expired OAuth callback.");
  }
  try {
    const {
      client: loggedClient,
      accessToken,
      accessSecret,
    } = await twitterClient.login(
      oauth_token,
      req.session.oauth_token_secret,
      oauth_verifier
    );

    const { data: twitterUser } = await loggedClient.v1.verifyCredentials({
      include_email: true,
    });
    const email = twitterUser.email;
    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    const user = result.rows[0];
    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exists please signup" });
    }
    if (!user.verified) {
      return res.status(403).json({ message: "User account is not verified" });
    }
    if (user.islocked === "locked") {
      return res.status(403).json({ message: "User account is locked" });
    }
    const tokenData = {
      id: user.id,
      role: user.role,
      allowedRoutes: allowedRoutes[user.role],
    };
    // Generate new token
    const authToken = jsonwebtoken.sign(tokenData, process.env.JWT_KEY, {
      expiresIn: `6h`,
    });
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6000, // 1 hour
      sameSite: "Strict",
    });
    return res.status(200).json({ data: authToken });
  } catch (error) {
    console.error("Error during Twitter callback:", error);
    res.status(500).send("Twitter login failed.");
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const query = `SELECT * FROM users WHERE email = $1`;
    // const query = `SELECT * FROM users WHERE email = $1 AND verified IS true AND islocked = 'unlocked'`;
    const result = await pool.query(query, [email]);
    const user = result.rows[0];
    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exists please signup" });
    }
    if (!user.verified) {
      return res.status(403).json({ message: "User account is not verified" });
    }
    if (user.islocked === "locked") {
      return res.status(403).json({ message: "User account is locked" });
    }
    const isPasswordValid = await EctDct.decrypt(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const tokenData = {
      id: user.id,
      role: user.role,
      allowedRoutes: allowedRoutes[user.role],
    };
    const authToken = jsonwebtoken.sign(tokenData, process.env.JWT_KEY, {
      expiresIn: `6h`,
    });
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6000, // 1 hour
      sameSite: "Strict",
    });
    return res.status(200).json({ data: authToken });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server error", error: error.message });
  }
};

export const logout = async (req, res) => {
  try {
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
const oauth2Client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_CALLBACK_URL
);
export const googleAuth = async (req, res) => {
  const authUrl = oauth2Client.generateAuthUrl({
    access_type: "offline",
    scope: ["profile", "email"],
  });
  res.redirect(authUrl);
};

export const loginWithGoogle = async (req, res) => {
  try {
    const code = req.query.code;

    if (!code) {
      return res.status(400).json({ message: "Missing authorization code" });
    }

    const { tokens } = await oauth2Client.getToken(code);
    req.session.tokens = tokens;
    oauth2Client.setCredentials(tokens);
    const ticket = await oauth2Client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload.email;

    const query = `SELECT * FROM users WHERE email = $1`;
    const result = await pool.query(query, [email]);
    const user = result.rows[0];
    if (!user) {
      return res
        .status(404)
        .json({ message: "User does not exists please signup" });
    }
    if (!user.verified) {
      return res.status(403).json({ message: "User account is not verified" });
    }
    if (user.islocked === "locked") {
      return res.status(403).json({ message: "User account is locked" });
    }
    const tokenData = {
      id: user.id,
      role: user.role,
      allowedRoutes: allowedRoutes[user.role],
    };
    // Generate new token
    const authToken = jsonwebtoken.sign(tokenData, process.env.JWT_KEY, {
      expiresIn: `6h`,
    });
    res.cookie("authToken", authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 6000, // 1 hour
      sameSite: "Strict",
    });
    return res.status(200).json({ data: authToken });
  } catch (err) {
    console.error(
      "❌ Error during Google auth:",
      err.response?.data || err.message
    );
    res
      .status(500)
      .json({ message: "Authentication failed", error: err.message });
  }
};
