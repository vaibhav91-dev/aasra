// Explicit live-provider check using synthetic test facts only, with no mocks.
import assert from "node:assert/strict";
const base = process.env.TEST_BASE_URL ?? "https://aasra-one.vercel.app";
const today = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(new Date());
const dates = Array.from({ length: 7 }, (_, i) =>
  new Date(new Date(today + "T00:00:00Z").getTime() - (6 - i) * 86400000)
    .toISOString()
    .slice(0, 10),
);
// Recorded disposable test entries: income 85050 paise, expense 10025 paise.
const days = dates.map((date) => ({
  date,
  incomePaise: date === today ? 85050 : 0,
  expensePaise: date === today ? 10025 : 0,
  netPaise: date === today ? 75025 : 0,
  count: date === today ? 2 : 0,
}));
const cases = [
  {
    task: "chat",
    language: "hi",
    messages: [
      {
        role: "user",
        text: "How can I record small work expenses each day? Keep the answer to three short points.",
      },
    ],
  },
  {
    task: "earnings-explanation",
    language: "en",
    summary: {
      from: dates[0],
      to: today,
      incomePaise: 85050,
      expensePaise: 10025,
      netPaise: 75025,
      count: 2,
      days,
    },
  },
  {
    task: "document-explanation",
    language: "pa",
    text: `Payment notice dated ${today}: INR 1200 was deducted. Contact platform support to request an explanation. No deadline is stated.`,
  },
  {
    task: "grievance-draft",
    language: "hi",
    facts: {
      name: "",
      employer: "QA delivery service",
      issue: "unpaid",
      incident: today,
      disputed: "1200",
      description:
        "The agreed payment of INR 1200 for completed deliveries has not arrived. These are synthetic integration-test facts.",
      resolution:
        "Please review the payment and explain when it will be released.",
    },
  },
];
for (const request of cases) {
  const response = await fetch(base + "/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json", Origin: base },
    body: JSON.stringify(request),
    signal: AbortSignal.timeout(35000),
  });
  const data = await response.json();
  assert.equal(
    response.status,
    200,
    `${request.task}: ${data.error?.code ?? "unexpected error"}`,
  );
  assert.ok(typeof data.text === "string" && data.text.trim());
  if (request.language === "hi") assert.match(data.text, /[\u0900-\u097f]/);
  if (request.language === "pa") assert.match(data.text, /[\u0a00-\u0a7f]/);
  assert.match(response.headers.get("cache-control"), /no-store/);
  console.log(
    JSON.stringify({
      task: request.task,
      language: request.language,
      status: response.status,
      characters: data.text.length,
      preview: data.text.slice(0, 160),
    }),
  );
}
