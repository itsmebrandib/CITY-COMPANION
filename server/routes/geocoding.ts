import { Router, Request, Response } from "express";
import axios from "axios";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  const { address, latlng } = req.query as { address?: string; latlng?: string };

  if (!address && !latlng) {
    return res.status(400).json({ error: "Provide address or latlng" });
  }

  try {
    const params: Record<string, string> = { key: process.env.GOOGLE_MAPS_SERVER_KEY! };
    if (address) params.address = address;
    if (latlng) params.latlng = latlng;

    const { data } = await axios.get("https://maps.googleapis.com/maps/api/geocode/json", { params });
    res.json(data);
  } catch (err) {
    console.error("Geocoding error:", err);
    res.status(500).json({ error: "Geocoding failed" });
  }
});

export default router;
