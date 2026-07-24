import type { IGPost } from "../../types/instagram";
import { TRANSPORT_LABELS } from "../../lib/travelKeywords";
import { C } from "../../lib/palette";

interface Props {
  post: IGPost;
}

export function InstagramPost({ post }: Props) {
  const imgSrc = post.media_type === "VIDEO" ? post.thumbnail_url : post.media_url;
  const transport = post.transport ? TRANSPORT_LABELS[post.transport] : null;

  return (
    <a
      href={post.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className="tap relative flex-shrink-0 overflow-hidden rounded-2xl"
      style={{ width: 140, height: 176, background: C.frame, display: "block" }}
    >
      {imgSrc && (
        <img
          src={imgSrc}
          alt={post.caption?.slice(0, 60) ?? "Instagram post"}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      )}

      {/* gradient scrim */}
      <div
        style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(27,21,38,.7) 0%, transparent 55%)",
        }}
      />

      {/* transport badge */}
      {transport && (
        <div
          className="absolute flex items-center gap-1 rounded-full px-2 py-1"
          style={{ top: 8, left: 8, background: "rgba(255,255,255,.92)", fontSize: 10.5, fontWeight: 700, color: C.ink2 }}
        >
          <span>{transport.emoji}</span>
          <span>{transport.label}</span>
        </div>
      )}

      {/* caption snippet */}
      {post.caption && (
        <p
          className="absolute"
          style={{ bottom: 8, left: 8, right: 8, color: "#fff", fontSize: 11, lineHeight: 1.35, fontWeight: 500 }}
        >
          {post.caption.slice(0, 55)}{post.caption.length > 55 ? "…" : ""}
        </p>
      )}
    </a>
  );
}
