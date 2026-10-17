// @vitest-environment jsdom
// AI is mocked only in this development test file. No application fallback exists.
import { useState } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { Documents, initialDocument } from "../components/documents";
import { Grievance, initialGrievance } from "../components/grievance";
import { Assistant, initialAssistant } from "../components/assistant";
import { Aasra } from "../components/aasra";
import { en } from "../lib/i18n";
import { AiError } from "../lib/api-validation";
import { askAi } from "../lib/ai-client";
vi.mock("../lib/ai-client", () => ({ askAi: vi.fn() }));
beforeEach(() => {
  localStorage.clear();
  vi.mocked(askAi).mockReset();
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  Element.prototype.scrollIntoView = vi.fn();
  window.scrollTo = vi.fn();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn().mockResolvedValue(undefined) },
  });
});
afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});
function Connected() {
  const [doc, setDoc] = useState(initialDocument),
    [grievance, setGrievance] = useState(initialGrievance),
    [transferred, setTransferred] = useState(false);
  return transferred ? (
    <Grievance state={grievance} setState={setGrievance} language="en" t={en} />
  ) : (
    <Documents
      state={doc}
      setState={setDoc}
      language="en"
      t={en}
      onTransfer={(description) => {
        setGrievance((s) => ({ ...s, facts: { ...s.facts, description } }));
        setTransferred(true);
      }}
    />
  );
}
function Chat() {
  const [state, setState] = useState(initialAssistant);
  return (
    <Assistant state={state} setState={setState} language="hi" t={en} active />
  );
}
describe("connected UI workflows", () => {
  it("reviews document facts, generates an editable grievance, copies and regenerates", async () => {
    vi.mocked(askAi)
      .mockResolvedValueOnce(
        "Test explanation: payment notice mentions a deduction.",
      )
      .mockResolvedValueOnce(
        "Draft — not submitted. Please review this deduction.",
      )
      .mockResolvedValueOnce("Regenerated draft — not submitted.");
    render(<Connected />);
    fireEvent.change(screen.getByLabelText(en.docLabel), {
      target: { value: "Payment notice: INR 1200 deduction on 16 October." },
    });
    expect(
      (screen.getByRole("button", { name: en.docSubmit }) as HTMLButtonElement)
        .disabled,
    ).toBe(true);
    fireEvent.click(screen.getByRole("checkbox", { name: en.docConsent }));
    fireEvent.click(screen.getByRole("button", { name: en.docSubmit }));
    await screen.findByText(
      "Test explanation: payment notice mentions a deduction.",
    );
    fireEvent.click(screen.getByRole("button", { name: en.docTransfer }));
    fireEvent.change(screen.getByLabelText(en.confirmedFacts), {
      target: {
        value: "The notice states an INR 1200 deduction on 16 October.",
      },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: en.review }));
    fireEvent.click(screen.getByRole("button", { name: en.transfer }));
    expect(
      (
        screen.getByLabelText(en.description, {
          exact: false,
        }) as HTMLTextAreaElement
      ).value,
    ).toContain("INR 1200");
    fireEvent.change(screen.getByLabelText(en.employer), {
      target: { value: "Local employer" },
    });
    fireEvent.change(screen.getByLabelText(en.incident), {
      target: { value: "2026-10-16" },
    });
    fireEvent.change(screen.getByLabelText(en.resolution, { exact: false }), {
      target: { value: "Please explain and review the deduction." },
    });
    fireEvent.click(screen.getByRole("checkbox", { name: en.review }));
    fireEvent.click(screen.getByRole("button", { name: en.generate }));
    const draft = await screen.findByLabelText(en.draftLabel);
    expect((draft as HTMLTextAreaElement).value).toBe(
      "Draft — not submitted. Please review this deduction.",
    );
    fireEvent.change(draft, {
      target: { value: "My edited draft — not submitted." },
    });
    fireEvent.click(screen.getByRole("button", { name: en.copy }));
    await screen.findByText(en.copied);
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
      "My edited draft — not submitted.",
    );
    fireEvent.click(screen.getByRole("button", { name: en.regenerate }));
    await screen.findByDisplayValue("Regenerated draft — not submitted.");
    expect((screen.getByLabelText(en.employer) as HTMLInputElement).value).toBe(
      "Local employer",
    );
    expect(vi.mocked(askAi).mock.calls[1][0]).toMatchObject({
      task: "grievance-draft",
      facts: {
        name: "",
        disputed: "",
        description: "The notice states an INR 1200 deduction on 16 October.",
      },
    });
    vi.mocked(navigator.clipboard.writeText).mockRejectedValueOnce(
      new Error("denied"),
    );
    fireEvent.click(screen.getByRole("button", { name: en.copy }));
    await screen.findByText(en.copyError);
    expect(localStorage.length).toBe(0);
  });
  it("preserves failed chat input, retries in the selected language, clears, and hides unsupported voice", async () => {
    vi.mocked(askAi)
      .mockRejectedValueOnce(new AiError("QUOTA", 429))
      .mockResolvedValueOnce("अपना खर्च रोज़ दर्ज करें।");
    render(<Chat />);
    expect(screen.queryByRole("button", { name: en.mic })).toBeNull();
    fireEvent.change(screen.getByLabelText(en.input), {
      target: { value: "How do I track expenses?" },
    });
    fireEvent.click(screen.getByRole("button", { name: en.send }));
    await screen.findByText(en.QUOTA);
    expect((screen.getByLabelText(en.input) as HTMLTextAreaElement).value).toBe(
      "How do I track expenses?",
    );
    fireEvent.click(screen.getByRole("button", { name: en.retry }));
    await screen.findByText("अपना खर्च रोज़ दर्ज करें।");
    expect(vi.mocked(askAi).mock.calls[1][0].language).toBe("hi");
    fireEvent.click(screen.getByRole("button", { name: en.clear }));
    expect(screen.queryByText("अपना खर्च रोज़ दर्ज करें।")).toBeNull();
  });
  it("keeps an unsaved earnings form when localStorage writes fail", async () => {
    render(<Aasra />);
    await screen.findByRole("heading", { name: en.week });
    fireEvent.click(screen.getAllByRole("button", { name: en.earnings })[0]);
    fireEvent.change(screen.getByLabelText(en.amount), {
      target: { value: "123.45" },
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    fireEvent.click(screen.getByRole("button", { name: en.save }));
    await screen.findByText(en.storageError);
    expect((screen.getByLabelText(en.amount) as HTMLInputElement).value).toBe(
      "123.45",
    );
    expect(screen.queryByText(en.saved)).toBeNull();
  });
  it("rejects malformed stored data without overwriting it", async () => {
    localStorage.setItem("aasra-earnings-v1", "{bad json");
    render(<Aasra />);
    await screen.findByText(en.storageInvalid);
    await waitFor(() =>
      expect(localStorage.getItem("aasra-earnings-v1")).toBe("{bad json"),
    );
  });
});
