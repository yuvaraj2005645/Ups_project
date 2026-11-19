// @vitest-environment jsdom
import React, { act } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRoot } from "react-dom/client";
import { MemoryRouter } from "react-router-dom";
import { LoginPage } from "./LoginPage";

const authMocks = vi.hoisted(() => ({
  login: vi.fn(),
  success: vi.fn(),
}));

vi.mock("../../contexts/AuthContext", () => ({
  useAuth: () => ({ login: authMocks.login }),
}));

vi.mock("../../components/Toast", () => ({
  useToast: () => ({ success: authMocks.success }),
}));

globalThis.IS_REACT_ACT_ENVIRONMENT = true;

const mountedRoots = new Set();

const renderLoginPage = () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  mountedRoots.add(root);
  act(() => {
    root.render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );
  });
  return container;
};

describe("LoginPage", () => {
  beforeEach(() => {
    authMocks.login.mockReset().mockResolvedValue({ name: "Ravi Kumar", role: "DRIVER" });
    authMocks.success.mockReset();
  });

  afterEach(() => {
    for (const root of mountedRoots) {
      act(() => root.unmount());
    }
    mountedRoots.clear();
    document.body.innerHTML = "";
    vi.useRealTimers();
  });

  it("renders all role choices, demo credentials, and login controls", () => {
    const container = renderLoginPage();

    expect(container.querySelectorAll(".login-role-card")).toHaveLength(3);
    expect(container.querySelectorAll(".login-demo-card")).toHaveLength(3);
    expect(container.querySelector("#login-email")).not.toBeNull();
    expect(container.querySelector("#login-password")).not.toBeNull();
    expect(container.querySelector("#remember-me")).not.toBeNull();
    expect(container.querySelector(".login-submit")).not.toBeNull();
  });

  it("fills the selected demo account and submits through the existing auth flow", async () => {
    vi.useFakeTimers();
    const container = renderLoginPage();
    const driverDemo = container.querySelectorAll(".login-demo-card")[2];

    act(() => driverDemo.click());
    act(() => vi.advanceTimersByTime(250));

    expect(container.querySelector("#login-email").value).toBe("driver@fleetops.com");
    expect(container.querySelector("#login-password").value).toBe("Driver@123");
    expect(container.querySelectorAll(".login-role-card")[2].getAttribute("aria-pressed")).toBe("true");

    await act(async () => {
      container.querySelector("form").dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true })
      );
      await Promise.resolve();
    });

    expect(authMocks.login).toHaveBeenCalledWith("driver@fleetops.com", "Driver@123");
    expect(authMocks.success).toHaveBeenCalled();
  });
});
