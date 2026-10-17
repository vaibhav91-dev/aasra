import { beforeEach, describe, expect, it, vi } from "vitest";
import { validSavedData, type SavedData } from "../lib/cloud-data";
import { initialGrievance } from "../components/grievance";
const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  read: vi.fn(),
  write: vi.fn(),
}));
vi.mock("../lib/auth", () => ({
  getAuth: () => ({ api: { getSession: mocks.getSession } }),
}));
vi.mock("../lib/cloud-repository", () => ({
  readWorkerData: mocks.read,
  writeWorkerData: mocks.write,
}));
import { GET, PUT } from "../app/api/data/route";
const snapshot: SavedData = {
  version: 1,
  entries: [],
  messages: [],
  grievance: { facts: initialGrievance.facts, draft: "", outputLanguage: null },
};
beforeEach(() => {
  vi.resetAllMocks();
  mocks.getSession.mockResolvedValue({ user: { id: "owner-one" } });
  mocks.read.mockResolvedValue({ data: snapshot, revision: 1 });
  mocks.write.mockResolvedValue(2);
});
describe("account data isolation and validation", () => {
  it("accepts incomplete bounded drafts, rejects sensitive extras and invalid entries", () => {
    expect(validSavedData(snapshot)).toBe(true);
    expect(validSavedData({ ...snapshot, owner: "someone" })).toBe(false);
    expect(validSavedData({ ...snapshot, documentText: "private" })).toBe(
      false,
    );
    expect(
      validSavedData({ ...snapshot, entries: [{ id: "x", amountPaise: -1 }] }),
    ).toBe(false);
    expect(
      validSavedData({
        ...snapshot,
        messages: [{ role: "user", text: "unanswered private input" }],
      }),
    ).toBe(false);
  });
  it("rejects oversized stored messages and drafts", () => {
    expect(
      validSavedData({
        ...snapshot,
        grievance: { ...snapshot.grievance, draft: "x".repeat(20001) },
      }),
    ).toBe(false);
    expect(
      validSavedData({
        ...snapshot,
        messages: [
          { role: "user", text: "hello" },
          { role: "assistant", text: "x".repeat(12001) },
        ],
      }),
    ).toBe(false);
  });
  it("never reads data without a validated session", async () => {
    mocks.getSession.mockResolvedValue(null);
    const r = await GET(new Request("http://localhost/api/data"));
    expect(r.status).toBe(401);
    expect(mocks.read).not.toHaveBeenCalled();
  });
  it("uses only the session identity, ignoring query parameters", async () => {
    const r = await GET(new Request("http://localhost/api/data?userId=other"));
    expect(r.status).toBe(200);
    expect(mocks.read).toHaveBeenCalledWith("owner-one");
    expect(r.headers.get("cache-control")).toContain("no-store");
  });
  it("writes validated data under the session identity only", async () => {
    const r = await PUT(
      new Request("http://localhost/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data: snapshot, revision: 1 }),
      }),
    );
    expect(r.status).toBe(200);
    expect(mocks.write).toHaveBeenCalledWith("owner-one", snapshot, 1);
  });
  it("rejects supplied user identities and stale revisions", async () => {
    const make = (body: unknown) =>
      new Request("http://localhost/api/data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    expect(
      (await PUT(make({ userId: "other", data: snapshot, revision: 1 })))
        .status,
    ).toBe(400);
    mocks.write.mockResolvedValue(null);
    expect((await PUT(make({ data: snapshot, revision: 1 }))).status).toBe(409);
  });
  it("rejects cross-origin writes and masks database errors", async () => {
    const r = await PUT(
      new Request("http://localhost/api/data", {
        method: "PUT",
        headers: { Origin: "https://other.example" },
      }),
    );
    expect(r.status).toBe(403);
    mocks.read.mockRejectedValue(new Error("database password secret"));
    const error = await GET(new Request("http://localhost/api/data"));
    expect(await error.json()).toEqual({
      error: { code: "CLOUD_UNAVAILABLE" },
    });
  });
});
