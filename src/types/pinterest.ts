export interface PinMedia {
  images: { "150x150"?: { url: string }; "400x300"?: { url: string }; original?: { url: string; width: number; height: number } };
}

export interface Pin {
  id: string;
  title?: string;
  description?: string;
  link?: string;
  media: PinMedia;
  board_id: string;
  created_at: string;
}

export interface Board {
  id: string;
  name: string;
  description?: string;
  pin_count: number;
  media?: { image_cover_url?: string };
}
