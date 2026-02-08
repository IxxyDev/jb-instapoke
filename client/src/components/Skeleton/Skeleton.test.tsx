import { test, expect } from "@playwright/experimental-ct-react";
import { Skeleton } from "./Skeleton";

test("skeleton is hidden from assistive technologies", async ({ mount }) => {
  const component = await mount(<Skeleton />);
  await expect(component).toHaveAttribute("aria-hidden", "true");
});

test("skeleton renders shimmer elements", async ({ mount }) => {
  const component = await mount(<Skeleton />);
  await expect(component.locator("[class*=image]")).toBeVisible();
  await expect(component.locator("[class*=title]")).toBeVisible();
  await expect(component.locator("[class*=tags] > [class*=tag]")).toHaveCount(
    2,
  );
  await expect(component.locator("[class*=stats] > [class*=stat]")).toHaveCount(
    3,
  );
});
