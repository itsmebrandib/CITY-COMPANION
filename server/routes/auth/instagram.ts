import { Router } from "express";
import axios from "axios";

const router = Router();

const {
  INSTAGRAM_APP_ID,
  INSTAGRAM_APP_SECRET,
  INSTAGRAM_REDIRECT_URI,
  CLIENT_URL,
} = process.env;

// Step 1: redirect user to Meta OAuth
router.get("/", (_req, res) => {
  const params = new URLSearchParams({
    client_id: INSTAGRAM_APP_ID!,
    redirect_uri: INSTAGRAM_REDIRECT_URI!,
    scope: "instagram_basic,pages_show_list",
    response_type: "code",
  });
  res.redirect(`https://api.instagram.com/oauth/authorize?${params}`);
});

// Step 2: Meta redirects back here with ?code=
router.get("/callback", async (req, res) => {
  const { code } = req.query as { code: string };
  if (!code) return res.redirect(`${CLIENT_URL}?ig_error=no_code`);

  try {
    // Exchange code for short-lived token
    const tokenRes = await axios.post("https://api.instagram.com/oauth/access_token", null, {
      params: {
        client_id: INSTAGRAM_APP_ID,
        client_secret: INSTAGRAM_APP_SECRET,
        grant_type: "authorization_code",
        redirect_uri: INSTAGRAM_REDIRECT_URI,
        code,
      },
    });

    const shortToken: string = tokenRes.data.access_token;

    // Exchange for long-lived token (60-day expiry)
    const longRes = await axios.get("https://graph.instagram.com/access_token", {
      params: {
        grant_type: "ig_exchange_token",
        client_secret: INSTAGRAM_APP_SECRET,
        access_token: shortToken,
      },
    });

    const longToken: string = longRes.data.access_token;

    // Store in http-only cookie (90 days)
    res.cookie("ig_token", longToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 90 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${CLIENT_URL}?ig_connected=1`);
  } catch (err) {
    console.error("Instagram OAuth error:", err);
    res.redirect(`${CLIENT_URL}?ig_error=oauth_failed`);
  }
});

export default router;
