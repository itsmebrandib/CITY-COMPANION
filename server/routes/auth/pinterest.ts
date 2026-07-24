import { Router } from "express";
import axios from "axios";

const router = Router();

const {
  PINTEREST_APP_ID,
  PINTEREST_APP_SECRET,
  PINTEREST_REDIRECT_URI,
  CLIENT_URL,
} = process.env;

router.get("/", (_req, res) => {
  const params = new URLSearchParams({
    client_id: PINTEREST_APP_ID!,
    redirect_uri: PINTEREST_REDIRECT_URI!,
    response_type: "code",
    scope: "boards:read,pins:read",
  });
  res.redirect(`https://www.pinterest.com/oauth/?${params}`);
});

router.get("/callback", async (req, res) => {
  const { code } = req.query as { code: string };
  if (!code) return res.redirect(`${CLIENT_URL}?pt_error=no_code`);

  try {
    const credentials = Buffer.from(`${PINTEREST_APP_ID}:${PINTEREST_APP_SECRET}`).toString("base64");

    const tokenRes = await axios.post(
      "https://api.pinterest.com/v5/oauth/token",
      new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: PINTEREST_REDIRECT_URI!,
      }),
      {
        headers: {
          Authorization: `Basic ${credentials}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const accessToken: string = tokenRes.data.access_token;
    const refreshToken: string = tokenRes.data.refresh_token;

    res.cookie("pt_token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });
    res.cookie("pt_refresh", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 365 * 24 * 60 * 60 * 1000,
    });

    res.redirect(`${CLIENT_URL}?pt_connected=1`);
  } catch (err) {
    console.error("Pinterest OAuth error:", err);
    res.redirect(`${CLIENT_URL}?pt_error=oauth_failed`);
  }
});

export default router;
