

import dotenv from "dotenv";
import { TwitterApi } from "twitter-api-v2";

dotenv.config();

// Create Twitter Client
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

// OAuth2 authentication URL
app.get("/auth/twitter", async (req, res) => {
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
});

// Twitter callback route
app.get("/auth/twitter/callback", async (req, res) => {
  const { state, code } = req.query;
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

    res.send(`Welcome, ${user.name} (@${user.username})`);
  } catch (error) {
    console.error("Error during Twitter authentication:", error);
    res.status(500).send("Authentication failed.");
  }
});

// Logout
app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.redirect("/");
  });
});

app.get("/", (req, res) => {
  res.send('<a href="/auth/twitter">Login with Twitter</a>');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
