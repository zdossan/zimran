// Shared Vitest setup (lead-owned): jest-dom matchers + DOM cleanup after every test.
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => {
  cleanup();
});
