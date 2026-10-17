// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { GuidanceStarters } from "../components/guidance-starters";
import { buildPrompt } from "../lib/prompts";
import { indianStates, unionTerritories } from "../lib/india-regions";
afterEach(cleanup);

it("carries only entered location and work context into an editable starter", () => {
  const choose = vi.fn();
  render(<GuidanceStarters language="en" onChoose={choose} />);
  expect(screen.queryByLabelText("State or Union Territory")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Find welfare schemes" }));
  expect(indianStates).toHaveLength(28);
  expect(unionTerritories).toHaveLength(8);
  expect(new Set([...indianStates, ...unionTerritories]).size).toBe(36);
  expect(screen.getAllByRole("option")).toHaveLength(37);
  fireEvent.change(screen.getByLabelText("State or Union Territory"), {
    target: { value: "Punjab" },
  });
  fireEvent.change(screen.getByLabelText("Type of work"), {
    target: { value: "Delivery partner" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Ask Aasra" }));
  expect(choose.mock.calls[0][0]).toContain("State or Union Territory: Punjab");
  expect(choose.mock.calls[0][0]).toContain("Type of work: Delivery partner");
  expect(
    screen.getByRole("link", { name: /myScheme/ }).getAttribute("href"),
  ).toBe("https://www.myscheme.gov.in/");
});

it("does not assume location and disables starters while AI is running", () => {
  const choose = vi.fn();
  render(<GuidanceStarters language="hi" onChoose={choose} disabled />);
  fireEvent.click(screen.getByRole("button", { name: "कल्याण योजनाएँ खोजें" }));
  expect(choose).not.toHaveBeenCalled();
});

it("grounds chat in the server catalog with location, scope and eligibility safeguards", () => {
  const prompt = buildPrompt({
    task: "chat",
    language: "pa",
    messages: [{ role: "user", text: "Find welfare schemes" }],
  });
  expect(prompt.system).toContain("https://www.myscheme.gov.in/");
  expect(prompt.system).toContain("If either is missing, ask for it");
  expect(prompt.system).toContain("not live retrieval");
  expect(prompt.system).toContain("not automatic eligibility");
  expect(prompt.system).toContain("Punjabi in Gurmukhi script");
});
