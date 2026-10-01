import {
  encodePing, encodePublish, encodeRequest,
  encodeResponse, encodeSubscribe,
} from "@coderbuzz/velox-ws-wire";

const topic = "chat:room1";
const payload = JSON.stringify({ user: "alice", text: "Hello!" });
const corrId = 42;

/** Each frame type as [id, label, wire encoder, equivalent JSON encoder]. */
export const frames: [string, string, () => Uint8Array, () => string][] = [
  ["ping", "PING", () => encodePing(), () => JSON.stringify({ type: "ping" })],
  ["publish", "PUBLISH", () => encodePublish(topic, payload), () => JSON.stringify({ type: "publish", topic, payload })],
  ["request", "REQUEST", () => encodeRequest(corrId, payload), () => JSON.stringify({ type: "request", corrId, payload })],
  ["response", "RESPONSE", () => encodeResponse(corrId, payload), () => JSON.stringify({ type: "response", corrId, payload })],
  ["subscribe", "SUBSCRIBE", () => encodeSubscribe(topic), () => JSON.stringify({ type: "subscribe", topic })],
];
