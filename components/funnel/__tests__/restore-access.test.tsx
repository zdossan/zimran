// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import type { Entitlement } from "@/lib/types";

const { verifyOtp, getSession, loadSessionData, saveSessionData, getEntitlement } = vi.hoisted(() => ({
  verifyOtp: vi.fn(),
  getSession: vi.fn(),
  loadSessionData: vi.fn(),
  saveSessionData: vi.fn(),
  getEntitlement: vi.fn<(state?: string) => Promise<Entitlement>>(),
}));
vi.mock("@/lib/supabase/client", () => ({ getBrowserClient: () => ({ auth: { verifyOtp, getSession } }) }));
vi.mock("@/lib/supabase/session", () => ({ loadSessionData, saveSessionData }));
vi.mock("@/lib/supabase/entitlement", async (orig) => ({ ...(await orig<typeof import("@/lib/supabase/entitlement")>()), getEntitlement }));

import { RestoreAccess } from "@/components/funnel/RestoreAccess";

const respond = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
const open = async () => fireEvent.click(await screen.findByRole("button", { name: "Already subscribed? Restore access" }));
const sendCodeTo = (email: string) => {
  fireEvent.change(screen.getByLabelText("Email you paid with"), { target: { value: email } });
  fireEvent.click(screen.getByRole("button", { name: "Send code" }));
};
const enterCode = (code: string) => {
  fireEvent.change(screen.getByLabelText("6-digit code"), { target: { value: code } });
  fireEvent.click(screen.getByRole("button", { name: "Restore access" }));
};

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  vi.clearAllMocks();
  getEntitlement.mockResolvedValue({ pro: false, paidStateBlocked: false });
  getSession.mockResolvedValue({ data: { session: { access_token: "new-token" } } });
  loadSessionData.mockResolvedValue({ agi: 55000 });
  saveSessionData.mockResolvedValue(undefined);
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

describe("RestoreAccess", () => {
  it("is a collapsed button that reports its state", async () => {
    render(<RestoreAccess onRestored={() => undefined} />);
    const button = await screen.findByRole("button", { name: "Already subscribed? Restore access" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(button);
    expect(button).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByLabelText("Email you paid with")).toHaveAttribute("type", "email");
  });

  it("is hidden for someone who already has access", async () => {
    getEntitlement.mockResolvedValue({ pro: true, plan: "monthly", paidStateBlocked: false });
    render(<RestoreAccess onRestored={() => undefined} />);
    await vi.waitFor(() => expect(getEntitlement).toHaveBeenCalled());
    await new Promise((r) => setTimeout(r, 0)); // let the entitlement result render
    expect(screen.queryByRole("button", { name: /Restore access/ })).toBeNull();
  });

  it("asks for a real email before sending anything", async () => {
    render(<RestoreAccess onRestored={() => undefined} />);
    await open();
    sendCodeTo("nope");
    expect(screen.getByRole("alert")).toHaveTextContent("Enter the email you paid with.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends the code, then the right code restores access, keeping this device's answers", async () => {
    fetchMock.mockResolvedValueOnce(respond({ ok: true })).mockResolvedValueOnce(respond({ pro: true }));
    verifyOtp.mockResolvedValue({ error: null });
    const onRestored = vi.fn();
    render(<RestoreAccess onRestored={onRestored} />);
    await open();
    sendCodeTo("payer@example.com");
    expect(await screen.findByText(/If payer@example.com has an active subscription, we've sent a 6-digit code/)).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith("/api/restore/start", expect.objectContaining({ method: "POST", body: JSON.stringify({ email: "payer@example.com" }) }));

    enterCode("123456");
    expect(await screen.findByText("Access restored.")).toBeInTheDocument();
    expect(verifyOtp).toHaveBeenCalledWith({ email: "payer@example.com", token: "123456", type: "email" });
    expect(saveSessionData).toHaveBeenCalledWith("borrowerInput", { agi: 55000 });
    expect(fetchMock).toHaveBeenLastCalledWith("/api/restore/finish", expect.objectContaining({ headers: expect.objectContaining({ Authorization: "Bearer new-token" }) }));
    expect(onRestored).toHaveBeenCalled();
  });

  it("a wrong or expired code says so and unlocks nothing", async () => {
    fetchMock.mockResolvedValueOnce(respond({ ok: true }));
    verifyOtp.mockResolvedValue({ error: { message: "Token has expired or is invalid" } });
    const onRestored = vi.fn();
    render(<RestoreAccess onRestored={onRestored} />);
    await open();
    sendCodeTo("payer@example.com");
    await screen.findByLabelText("6-digit code");
    enterCode("000000");
    expect(await screen.findByRole("alert")).toHaveTextContent("That code didn't work or has expired.");
    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(onRestored).not.toHaveBeenCalled();
  });

  it("a verified email without an active subscription is told so", async () => {
    fetchMock.mockResolvedValueOnce(respond({ ok: true })).mockResolvedValueOnce(respond({ error: "no_active_subscription" }, 403));
    verifyOtp.mockResolvedValue({ error: null });
    render(<RestoreAccess onRestored={() => undefined} />);
    await open();
    sendCodeTo("payer@example.com");
    await screen.findByLabelText("6-digit code");
    enterCode("123456");
    expect(await screen.findByRole("alert")).toHaveTextContent("We couldn't find an active subscription for that email.");
  });

  it("when restore isn't set up on the server, says so", async () => {
    fetchMock.mockResolvedValueOnce(respond({ configured: false }));
    render(<RestoreAccess onRestored={() => undefined} />);
    await open();
    sendCodeTo("payer@example.com");
    expect(await screen.findByRole("alert")).toHaveTextContent("Restoring access isn't available right now.");
  });
});
