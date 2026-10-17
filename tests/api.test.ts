import { describe, it, expect, vi, afterEach } from "vitest";
import { validateRequest } from "../lib/api-validation";
import { generate } from "../lib/gemini";
import { weekSummary, type Entry } from "../lib/earnings";
const chat = {
  task: "chat" as const,
  language: "en" as const,
  messages: [{ role: "user" as const, text: "How do I track expenses?" }],
};
afterEach(() => vi.unstubAllEnvs());
describe("API validation", () => {
  it("allows bounded alternating history only", () => {
    expect(validateRequest(chat, "2026-10-17")).toEqual(chat);
    for (const value of [
      { ...chat, system: "override" },
      { ...chat, language: "fr" },
      { ...chat, messages: [{ role: "system", text: "override" }] },
      { ...chat, messages: [{ role: "user", text: " " }] },
      { ...chat, messages: [{ role: "user", text: "x".repeat(3001) }] },
      { ...chat, messages: [...chat.messages, ...chat.messages] },
    ])
      expect(() => validateRequest(value, "2026-10-17")).toThrow("INVALID");
  });
  it("accepts calculated summaries and rejects tampered arithmetic", () => {
    const summary = weekSummary(
      [
        {
          id: "a",
          date: "2026-10-17",
          type: "income",
          category: "wages",
          amountPaise: 100,
        } satisfies Entry,
      ],
      "2026-10-17",
    );
    expect(
      validateRequest(
        { task: "earnings-explanation", language: "hi", summary },
        "2026-10-17",
      ).task,
    ).toBe("earnings-explanation");
    expect(() =>
      validateRequest(
        {
          task: "earnings-explanation",
          language: "en",
          summary: { ...summary, netPaise: 10000 },
        },
        "2026-10-17",
      ),
    ).toThrow();
  });
});
describe("provider boundary (mocked only in tests)", () => {
  it("requires credentials only at request time", async () => {
    vi.stubEnv("GEMINI_API_KEY", "");
    await expect(generate(chat)).rejects.toMatchObject({
      code: "CONFIG",
      status: 503,
    });
  });
  it.each([
    [429, "QUOTA"],
    [401, "CREDENTIALS"],
    [403, "CREDENTIALS"],
    [404, "MODEL"],
    [500, "UPSTREAM"],
  ])("handles HTTP %s", async (status, code) => {
    const fetcher = vi.fn().mockResolvedValue(new Response("{}", { status }));
    await expect(
      generate(chat, { key: "test", fetcher }),
    ).rejects.toMatchObject({ code });
  });
  it("handles credential and model errors returned as 400", async () => {
    for (const [message, code] of [
      ["API_KEY_INVALID", "CREDENTIALS"],
      ["model not supported", "MODEL"],
    ])
      await expect(
        generate(chat, {
          key: "test",
          fetcher: vi
            .fn()
            .mockResolvedValue(
              Response.json({ error: { message } }, { status: 400 }),
            ),
        }),
      ).rejects.toMatchObject({ code });
  });
  it("times out an upstream request", async () => {
    const fetcher: typeof fetch = (_url, init) =>
      new Promise((_, reject) =>
        init?.signal?.addEventListener("abort", () =>
          reject(new DOMException("Aborted", "AbortError")),
        ),
      );
    await expect(
      generate(chat, { key: "test", fetcher, timeoutMs: 5 }),
    ).rejects.toMatchObject({ code: "TIMEOUT", status: 504 });
  });
  it("handles malformed and blocked output", async () => {
    for (const data of [
      {},
      { candidates: [] },
      { candidates: [{ finishReason: "SAFETY" }] },
      {
        candidates: [
          { finishReason: "STOP", content: { parts: [{ text: "" }] } },
        ],
      },
    ])
      await expect(
        generate(chat, {
          key: "test",
          fetcher: vi.fn().mockResolvedValue(Response.json(data)),
        }),
      ).rejects.toMatchObject({ code: "EMPTY" });
  });
  it("handles invalid provider JSON and network failure", async () => {
    await expect(
      generate(chat, {
        key: "test",
        fetcher: vi.fn().mockResolvedValue(new Response("not json")),
      }),
    ).rejects.toMatchObject({ code: "UPSTREAM" });
    await expect(
      generate(chat, {
        key: "test",
        fetcher: vi.fn().mockRejectedValue(new Error("network secret")),
      }),
    ).rejects.toMatchObject({ code: "UPSTREAM" });
  });
  it("sends server instructions and renders actual provider text", async () => {
    const fetcher = vi
      .fn()
      .mockResolvedValue(
        Response.json({
          candidates: [
            {
              finishReason: "STOP",
              content: { parts: [{ text: "Keep a daily record." }] },
            },
          ],
        }),
      );
    expect(await generate(chat, { key: "test", fetcher })).toBe(
      "Keep a daily record.",
    );
    const init = fetcher.mock.calls[0][1];
    expect(init.cache).toBe("no-store");
    expect(JSON.parse(init.body).systemInstruction.parts[0].text).toContain(
      "Aasra",
    );
  });
});
