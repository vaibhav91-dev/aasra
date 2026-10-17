// @vitest-environment jsdom
import { useState } from "react";
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useCloudAccount } from "../lib/use-cloud-account";
import type { SavedData } from "../lib/cloud-data";
import { initialGrievance } from "../components/grievance";
const empty: SavedData = {
  version: 1,
  entries: [],
  messages: [],
  grievance: { facts: initialGrievance.facts, draft: "", outputLanguage: null },
};
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
function useHarness() {
  const [data, setData] = useState(empty);
  const cloud = useCloudAccount(data, (value) => setData(value ?? empty), true);
  return { data, setData, cloud };
}
describe("cloud sync lifecycle", () => {
  it("loads, autosaves, and restores drafts on a new mount without storing sensitive text locally", async () => {
    let saved = structuredClone(empty),
      revision = 1,
      writes = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string, init?: RequestInit) => {
        if (path === "/api/account")
          return Response.json({
            configured: true,
            user: { id: "one", name: "worker" },
          });
        if (init?.method === "PUT") {
          const body = JSON.parse(String(init.body));
          saved = body.data;
          revision++;
          writes++;
          return Response.json({ revision });
        }
        return Response.json({ data: saved, revision });
      }),
    );
    const first = renderHook(useHarness);
    await waitFor(() =>
      expect(first.result.current.cloud.status).toBe("cloudSaved"),
    );
    expect(writes).toBe(0);
    act(() =>
      first.result.current.setData({
        ...empty,
        grievance: {
          ...empty.grievance,
          draft: "My saved draft, not submitted.",
        },
      }),
    );
    await waitFor(
      () =>
        expect(saved.grievance.draft).toBe("My saved draft, not submitted."),
      { timeout: 2500 },
    );
    await waitFor(() => expect(first.result.current.cloud.dirty).toBe(false));
    first.unmount();
    const second = renderHook(useHarness);
    await waitFor(() =>
      expect(second.result.current.data.grievance.draft).toBe(
        "My saved draft, not submitted.",
      ),
    );
    expect(localStorage.length).toBe(0);
  });
  it("keeps unsaved screen data and stops automatic writes after a conflict", async () => {
    let writes = 0;
    vi.stubGlobal(
      "fetch",
      vi.fn(async (path: string, init?: RequestInit) => {
        if (path === "/api/account")
          return Response.json({
            configured: true,
            user: { id: "one", name: "worker" },
          });
        if (init?.method === "PUT") {
          writes++;
          return Response.json(
            { error: { code: "CONFLICT" } },
            { status: 409 },
          );
        }
        return Response.json({ data: empty, revision: 1 });
      }),
    );
    const hook = renderHook(useHarness);
    await waitFor(() =>
      expect(hook.result.current.cloud.status).toBe("cloudSaved"),
    );
    act(() =>
      hook.result.current.setData({
        ...empty,
        grievance: { ...empty.grievance, draft: "Unsaved draft" },
      }),
    );
    await waitFor(
      () => expect(hook.result.current.cloud.status).toBe("cloudConflict"),
      { timeout: 2500 },
    );
    expect(hook.result.current.data.grievance.draft).toBe("Unsaved draft");
    expect(writes).toBe(1);
  });
});
