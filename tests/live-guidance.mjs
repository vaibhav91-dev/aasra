// Real deployed Gemini calls with synthetic work context; no mocks or credentials.
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL ?? "https://aasra-one.vercel.app";
for (const [text, checks] of [
  [
    "Help me find welfare schemes. I have not shared my location or work yet.",
    [/state|territory/i, /work|job|occupation/i],
  ],
  [
    "I work as a delivery partner in Punjab. Help me find welfare schemes using your official source catalog. Give official URLs and explain how I should verify eligibility. Do not invent specific scheme benefits.",
    [
      /Punjab/i,
      /https:\/\/www\.myscheme\.gov\.in\//,
      /eligib/i,
      /check|confirm|verify/i,
    ],
  ],
]) {
  const response = await fetch(base + "/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify({
      task: "chat",
      language: "en",
      messages: [{ role: "user", text }],
    }),
    signal: AbortSignal.timeout(35000),
  });
  const result = await response.json();
  assert.equal(response.status, 200, result.error?.code);
  for (const check of checks) assert.match(result.text, check);
  console.log(
    JSON.stringify({
      status: response.status,
      question: text,
      answer: result.text,
    }),
  );
}
