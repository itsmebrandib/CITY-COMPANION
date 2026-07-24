import type { Pin } from "../../types/pinterest";
import { C } from "../../lib/palette";

export function PinCard({ pin }: { pin: Pin }) {
  const img =
    pin.media.images?.["400x300"]?.url ??
    pin.media.images?.original?.url ??
    pin.media.images?.["150x150"]?.url;

  const originalImg = pin.media.images?.original;
  const aspectRatio = originalImg ? originalImg.width / originalImg.height : 1;
  const isPortrait = aspectRatio < 0.85;

  return (
    <a
      href={pin.link ?? `https://www.pinterest.com/pin/${pin.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="tap block overflow-hidden rounded-2xl mb-3"
      style={{ background: C.frame, breakInside: "avoid" }}
    >
      {img && (
        <img
          src={img}
          alt={pin.title ?? pin.description?.slice(0, 60) ?? "Pinterest pin"}
          style={{
            width: "100%",
            aspectRatio: isPortrait ? "2/3" : "4/3",
            objectFit: "cover",
            display: "block",
          }}
          loading="lazy"
        />
      )}
      {(pin.title || pin.description) && (
        <div className="px-3 py-2.5">
          {pin.title && (
            <p style={{ color: C.ink, fontWeight: 700, fontSize: 12.5, lineHeight: 1.3 }}>
              {pin.title.slice(0, 60)}{pin.title.length > 60 ? "…" : ""}
            </p>
          )}
          {pin.description && (
            <p className="mt-0.5" style={{ color: C.muted, fontSize: 11.5, lineHeight: 1.35 }}>
              {pin.description.slice(0, 80)}{pin.description.length > 80 ? "…" : ""}
            </p>
          )}
        </div>
      )}
    </a>
  );
}
