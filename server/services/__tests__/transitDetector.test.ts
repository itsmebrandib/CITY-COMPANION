/**
 * Run with: npx ts-node services/__tests__/transitDetector.test.ts
 *
 * Zero-dependency assertions — the server has no test runner wired up yet and
 * this pipeline is pure enough not to need one.
 */

import assert from "assert";
import { detectTransitMode, extractHashtags } from "../transitDetector";
import { buildTripNodes } from "../travelNodes";
import type { RawInstagramPost } from "../travelNodes";

let passed = 0;
let failed = 0;

function test(name: string, fn: () => void | Promise<void>): Promise<void> {
  return Promise.resolve()
    .then(fn)
    .then(() => { passed++; console.log(`  ✓ ${name}`); })
    .catch((err) => { failed++; console.log(`  ✗ ${name}\n      ${err.message}`); });
}

function mode(caption: string) {
  return detectTransitMode(caption).mode;
}

async function main() {
  console.log("\ntransitDetector — positive detection");
  await test("plain flight keyword", () => assert.equal(mode("Long flight to Tokyo"), "flight"));
  await test("airplane emoji", () => assert.equal(mode("Off we go ✈️"), "flight"));
  await test("#flight hashtag", () => assert.equal(mode("Wheels up #flight"), "flight"));
  await test("ferry", () => assert.equal(mode("Ferry across the fjord"), "boat"));
  await test("sailing emoji", () => assert.equal(mode("Day three ⛵"), "boat"));
  await test("cruise ship emoji", () => assert.equal(mode("Boarding 🚢"), "boat"));
  await test("amtrak", () => assert.equal(mode("Amtrak up the coast"), "train"));
  await test("train emoji", () => assert.equal(mode("Scenic route 🚆"), "train"));
  await test("#traintravel", () => assert.equal(mode("Alps by rail #traintravel"), "train"));
  await test("road trip", () => assert.equal(mode("Epic road trip through Utah"), "drive"));
  await test("#vanlife", () => assert.equal(mode("Morning coffee #vanlife"), "drive"));

  console.log("\ntransitDetector — false-positive guards");
  await test('"training" is not a train', () => assert.equal(mode("Marathon training today"), "stay"));
  await test('"planet" is not a plane', () => assert.equal(mode("Best planet ever"), "stay"));
  await test('"straining" is not a train', () => assert.equal(mode("Straining to see the top"), "stay"));
  await test('"#travel" alone is not a flight', () => assert.equal(mode("Wandering #travel"), "stay"));
  await test('"boats" plural still matches', () => assert.equal(mode("So many boats here"), "boat"));

  console.log("\ntransitDetector — fallback behaviour");
  await test("empty caption -> stay", () => assert.equal(mode(""), "stay"));
  await test("null caption -> stay", () => assert.equal(detectTransitMode(null).mode, "stay"));
  await test("no signal -> isFallback true", () => {
    const r = detectTransitMode("Great coffee this morning");
    assert.equal(r.isFallback, true);
    assert.equal(r.mode, "stay");
  });
  await test("configurable fallback", () => {
    assert.equal(detectTransitMode("Nice view", { fallback: "drive" }).mode, "drive");
  });
  await test("detected mode is not marked fallback", () => {
    assert.equal(detectTransitMode("Our flight was delayed").isFallback, false);
  });

  console.log("\ntransitDetector — scoring & precedence");
  await test("hashtag outweighs weak prose word", () => {
    // "station" is a weak train word; #flight is a strong explicit tag.
    assert.equal(mode("Waiting at the station #flight"), "flight");
  });
  await test("multiple signals raise score", () => {
    const one = detectTransitMode("Our flight");
    const many = detectTransitMode("Our flight ✈️ #flight boarding now");
    assert.ok(many.score > one.score, `${many.score} should exceed ${one.score}`);
  });
  await test("candidates are ranked", () => {
    const r = detectTransitMode("Took the train to the airport for our flight ✈️");
    assert.equal(r.mode, "flight");
    assert.ok(r.candidates.length >= 2);
    assert.ok(r.candidates[0].score >= r.candidates[1].score);
  });
  await test("matched tokens are reported", () => {
    const r = detectTransitMode("Sailing all week ⛵");
    assert.ok(r.matched.includes("⛵"));
    assert.ok(r.matched.includes("sailing"));
  });

  console.log("\nextractHashtags");
  await test("pulls and lowercases tags", () => {
    assert.deepEqual(extractHashtags("Hi #RoadTrip #VanLife"), ["roadtrip", "vanlife"]);
  });
  await test("ignores bare hash", () => assert.deepEqual(extractHashtags("cost # 5"), []));

  console.log("\ntravelNodes — batch assembly");
  const posts: RawInstagramPost[] = [
    {
      id: "1",
      caption: "Wheels up ✈️ #flight",
      permalink: "https://instagram.com/p/1",
      media_url: "https://cdn/1.jpg",
      media_type: "IMAGE",
      timestamp: "2026-03-02T10:00:00+0000",
      location: { name: "Austin", latitude: 30.2672, longitude: -97.7431 },
    },
    {
      id: "2",
      caption: "Ferry morning ⛵",
      permalink: "https://instagram.com/p/2",
      media_url: "https://cdn/2.jpg",
      media_type: "VIDEO",
      thumbnail_url: "https://cdn/2-thumb.jpg",
      timestamp: "2026-03-01T09:00:00+0000",
      location: { name: "Split", latitude: 43.5081, longitude: 16.4402 },
    },
    {
      id: "3",
      caption: "Quiet morning, no travel here",
      permalink: "https://instagram.com/p/3",
      timestamp: "2026-03-03T08:00:00+0000",
      // no location at all -> unmapped, exercises the failure path
    },
  ];

  const result = await buildTripNodes(posts);

  await test("returns one node per post", () => assert.equal(result.nodes.length, 3));
  await test("uses supplied coords without geocoding", () => {
    const n = result.mapped.find((x) => x.id === "1")!;
    assert.equal(n.lat, 30.2672);
    assert.equal(n.lng, -97.7431);
  });
  await test("detects mode per node", () => {
    assert.equal(result.nodes.find((n) => n.id === "1")!.transitMode, "flight");
    assert.equal(result.nodes.find((n) => n.id === "2")!.transitMode, "boat");
    assert.equal(result.nodes.find((n) => n.id === "3")!.transitMode, "stay");
  });
  await test("video node uses thumbnail as mediaUrl", () => {
    assert.equal(result.nodes.find((n) => n.id === "2")!.mediaUrl, "https://cdn/2-thumb.jpg");
  });
  await test("locationless post lands in unmapped, not dropped", () => {
    assert.equal(result.unmapped.length, 1);
    assert.equal(result.unmapped[0].id, "3");
    assert.equal(result.unmapped[0].meta.geocodeStatus, "no_location");
  });
  await test("mapped nodes sort oldest first", () => {
    assert.deepEqual(result.mapped.map((n) => n.id), ["2", "1"]);
  });
  await test("stats tally correctly", () => {
    assert.equal(result.stats.total, 3);
    assert.equal(result.stats.mapped, 2);
    assert.equal(result.stats.unmapped, 1);
    assert.equal(result.stats.byMode.flight, 1);
    assert.equal(result.stats.byMode.boat, 1);
    assert.equal(result.stats.byMode.stay, 1);
    assert.equal(result.stats.legs, 2);
  });
  await test("dropUnmapped removes failures", async () => {
    const dropped = await buildTripNodes(posts, { dropUnmapped: true });
    assert.equal(dropped.nodes.length, 2);
  });
  await test("node matches documented contract", () => {
    const n = result.nodes.find((x) => x.id === "1")!;
    const { meta, ...bare } = n;
    assert.deepEqual(Object.keys(bare).sort(), [
      "caption", "id", "instagramPostUrl", "lat", "lng",
      "locationName", "mediaUrl", "timestamp", "transitMode",
    ].sort());
  });
  await test("caption is carried through for the InfoWindow", () => {
    assert.equal(result.nodes.find((n) => n.id === "1")!.caption, "Wheels up ✈️ #flight");
  });
  await test("missing caption becomes null, not undefined", async () => {
    const [node] = (
      await buildTripNodes([
        {
          id: "4",
          permalink: "https://instagram.com/p/4",
          timestamp: "2026-03-04T08:00:00+0000",
          location: { name: "Kyoto", latitude: 35.0116, longitude: 135.7681 },
        },
      ])
    ).nodes;
    assert.strictEqual(node.caption, null);
    assert.equal(node.transitMode, "stay");
  });

  console.log(`\n${passed} passed, ${failed} failed\n`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
