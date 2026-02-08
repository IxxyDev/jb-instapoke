import { test, expect } from "@playwright/experimental-ct-react";
import { TagChip } from "./TagChip";

test("renders label text", async ({ mount }) => {
  const component = await mount(<TagChip label="#fire" name="fire" />);
  await expect(component).toBeVisible();
  await expect(component).toHaveText("#fire");
});

test("aria-pressed is false when inactive", async ({ mount }) => {
  const component = await mount(<TagChip label="#fire" name="fire" />);
  await expect(component).toHaveAttribute("aria-pressed", "false");
});

test("aria-pressed is true when active", async ({ mount }) => {
  const component = await mount(<TagChip label="#fire" name="fire" active />);
  await expect(component).toHaveAttribute("aria-pressed", "true");
});

test("click calls onClick", async ({ mount }) => {
  let clicked = false;
  const component = await mount(
    <TagChip
      label="#water"
      name="water"
      onClick={() => {
        clicked = true;
      }}
    />,
  );
  await component.click();
  expect(clicked).toBe(true);
});

test("uses type color for known types", async ({ mount }) => {
  const component = await mount(<TagChip label="#fire" name="fire" />);
  const color = await component.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--chip-color"),
  );
  expect(color.trim()).toBe("#EE8130");
});

test("falls back to secondary color for unknown names", async ({ mount }) => {
  const component = await mount(<TagChip label="Gen 1" name="1" />);
  const color = await component.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--chip-color"),
  );
  expect(color.trim()).toBe("#8e8e8e");
});
