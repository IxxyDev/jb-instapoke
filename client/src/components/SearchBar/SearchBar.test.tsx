import { test, expect } from "@playwright/experimental-ct-react";
import { SearchBar } from "./SearchBar";

test("renders input with placeholder", async ({ mount }) => {
  const component = await mount(
    <SearchBar
      value=""
      activeTags={[]}
      onChange={() => {}}
      onRemoveTag={() => {}}
    />,
  );
  await expect(component.getByPlaceholder("Search Pokémon...")).toBeVisible();
});

test("debounces onChange by ~300ms", async ({ mount }) => {
  const calls: string[] = [];
  const component = await mount(
    <SearchBar
      value=""
      activeTags={[]}
      onChange={(v) => calls.push(v)}
      onRemoveTag={() => {}}
    />,
  );
  const input = component.getByRole("searchbox");
  await input.fill("pika");

  expect(calls).toHaveLength(0);

  await new Promise((r) => setTimeout(r, 400));
  expect(calls).toEqual(["pika"]);
});

test("shows active tags as removable chips", async ({ mount }) => {
  const removed: string[] = [];
  const component = await mount(
    <SearchBar
      value=""
      activeTags={["fire", "water"]}
      onChange={() => {}}
      onRemoveTag={(tag) => removed.push(tag)}
    />,
  );
  await expect(component.getByText("#fire")).toBeVisible();
  await expect(component.getByText("#water")).toBeVisible();

  await component.getByText("#fire").click();
  expect(removed).toEqual(["fire"]);
});

test("external value change clears pending debounce timer", async ({
  mount,
}) => {
  const calls: string[] = [];
  const component = await mount(
    <SearchBar
      value="old"
      activeTags={[]}
      onChange={(v) => calls.push(v)}
      onRemoveTag={() => {}}
    />,
  );

  await component.getByRole("searchbox").fill("new-query");
  expect(calls).toHaveLength(0);

  await component.update(
    <SearchBar
      value=""
      activeTags={[]}
      onChange={(v) => calls.push(v)}
      onRemoveTag={() => {}}
    />,
  );

  await new Promise((r) => setTimeout(r, 400));
  expect(calls).toHaveLength(0);
});

test("input has accessible label", async ({ mount }) => {
  const component = await mount(
    <SearchBar
      value=""
      activeTags={[]}
      onChange={() => {}}
      onRemoveTag={() => {}}
    />,
  );
  await expect(component.getByLabel("Search Pokémon")).toBeVisible();
});
