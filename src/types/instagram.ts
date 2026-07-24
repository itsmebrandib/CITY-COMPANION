import type { TransportMode } from "../lib/travelKeywords";

export interface IGMediaNode {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string;
  thumbnail_url?: string;
  caption?: string;
  timestamp: string;
  permalink: string;
  location?: { name: string; lat?: number; lng?: number };
}

export interface IGPost extends IGMediaNode {
  transport: TransportMode;
  hashtags: string[];
}
