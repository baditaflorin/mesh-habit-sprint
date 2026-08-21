import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMockRoom } from "@baditaflorin/mesh-common/testing";
import { Feature, fmt, isValidCheckin } from "../../src/Feature";
import { config } from "../../src/config";
describe("sprint", () => {
  it("formats remaining time", () => expect(fmt(61000)).toBe("1:01"));
  it("accepts timestamp checkins", () => expect(isValidCheckin(1)).toBe(true));
  it("renders", () => {
    render(<Feature room={createMockRoom()} config={config} />);
    expect(
      screen.getByRole("heading", { name: "One small promise. Twenty focused minutes." }),
    ).toBeInTheDocument();
  });
});
