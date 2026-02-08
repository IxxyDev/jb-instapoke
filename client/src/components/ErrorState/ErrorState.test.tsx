import { test, expect } from "@playwright/experimental-ct-react";
import { ErrorState } from "./ErrorState";

test("shows error message and retry button", async ({ mount }) => {
  let retried = false;
  const component = await mount(
    <ErrorState
      message="Network error"
      onRetry={() => {
        retried = true;
      }}
    />,
  );
  await expect(component.getByText("Something went wrong")).toBeVisible();
  await expect(component.getByText("Network error")).toBeVisible();
  await component.getByRole("button", { name: "Retry" }).click();
  expect(retried).toBe(true);
});

test("has role=alert", async ({ mount }) => {
  const component = await mount(<ErrorState message="fail" />);
  await expect(component).toHaveAttribute("role", "alert");
});
