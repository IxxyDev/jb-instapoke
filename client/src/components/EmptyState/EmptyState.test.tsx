import { test, expect } from "@playwright/experimental-ct-react";
import { EmptyState } from "./EmptyState";

test("shows message and clear button", async ({ mount }) => {
  let cleared = false;
  const component = await mount(
    <EmptyState
      onClear={() => {
        cleared = true;
      }}
    />,
  );
  await expect(component.getByText("No Pokémon found")).toBeVisible();
  await expect(component.getByText("Try adjusting")).toBeVisible();
  await component.getByRole("button", { name: "Clear filters" }).click();
  expect(cleared).toBe(true);
});

test("hides clear button when no onClear", async ({ mount }) => {
  const component = await mount(<EmptyState />);
  await expect(component.getByText("No Pokémon found")).toBeVisible();
  await expect(component.getByRole("button")).toHaveCount(0);
});
