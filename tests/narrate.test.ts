import test from "node:test";
import assert from "node:assert/strict";
import { POST } from "../app/api/narrate/route";

const request = (body: unknown) => new Request("http://localhost/api/narrate", {
  method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body),
});

test("음성 API는 빈 글·잘못된 타입·4000자 초과와 깨진 JSON을 거부한다", async () => {
  for (const body of [null, {}, { text: " " }, { text: 7 }, { text: "a".repeat(4001) }]) {
    assert.equal((await POST(request(body))).status, 400);
  }
  assert.equal((await POST(new Request("http://localhost/api/narrate", { method: "POST", body: "{" }))).status, 400);
});

test("음성 설정 누락은 서비스 오류를 안내하고 외부 호출을 하지 않는다", async () => {
  const key = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "";
  let called = false;
  globalThis.fetch = async () => { called = true; throw new Error("unexpected"); };
  try {
    const response = await POST(request({ text: "Try one small step.", language: "en" }));
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /not configured/);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = key;
  }
});

test("음성 API는 외부 오류와 잘못된 오디오를 실패로 반환한다", async () => {
  const key = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-only";
  try {
    const payloads = [
      new Response("unavailable", { status: 503 }),
      Response.json({ candidates: [] }),
      ...[
        { mimeType: "audio/mp3", data: "AAAA" },
        { mimeType: "audio/L16;codec=pcm;rate=24000", data: "AQ==" },
        { mimeType: "audio/L16;codec=pcm;rate=24000", data: "" },
      ].map((inlineData) => Response.json({ candidates: [{ content: { parts: [{ inlineData }] } }] })),
    ];
    for (const response of payloads) {
      globalThis.fetch = async () => response;
      const result = await POST(request({ text: "작은 도전을 시작해요." }));
      assert.equal(result.status, 502);
      assert.ok((await result.json()).error);
    }
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = key;
  }
});

test("PCM 음성을 브라우저 재생 가능한 24kHz 모노 WAV로 감싸고 응답을 캐시하지 않는다", async () => {
  const key = process.env.GEMINI_API_KEY;
  const originalFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = "test-only";
  const pcm = Buffer.from([0, 0, 255, 127, 0, 128]);
  let sentText = "";
  globalThis.fetch = async (_url, init) => {
    sentText = JSON.parse(String(init?.body)).contents[0].parts[0].text;
    return Response.json({ candidates: [{ content: { parts: [{ inlineData: { mimeType: "audio/L16;codec=pcm;rate=24000", data: pcm.toString("base64") } }] } }] });
  };
  try {
    const response = await POST(request({ text: "  Your next step matters.  ", language: "en" }));
    assert.equal(response.status, 200);
    assert.equal(response.headers.get("content-type"), "audio/wav");
    assert.equal(response.headers.get("cache-control"), "no-store");
    const wav = Buffer.from(await response.arrayBuffer());
    assert.equal(wav.toString("ascii", 0, 4), "RIFF");
    assert.equal(wav.toString("ascii", 8, 12), "WAVE");
    assert.equal(wav.readUInt32LE(4), wav.length - 8);
    assert.equal(wav.readUInt16LE(20), 1);
    assert.equal(wav.readUInt16LE(22), 1);
    assert.equal(wav.readUInt32LE(24), 24000);
    assert.equal(wav.readUInt32LE(28), 48000);
    assert.equal(wav.readUInt16LE(32), 2);
    assert.equal(wav.readUInt16LE(34), 16);
    assert.equal(wav.readUInt32LE(40), pcm.length);
    assert.deepEqual(wav.subarray(44), pcm);
    assert.ok(sentText.endsWith(JSON.stringify("Your next step matters.")));
  } finally {
    globalThis.fetch = originalFetch;
    if (key === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = key;
  }
});
