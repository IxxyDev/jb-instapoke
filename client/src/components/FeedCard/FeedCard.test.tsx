import type { Pokemon } from "@instapoke/shared";
import { expect, test } from "@playwright/experimental-ct-react";
import { FeedCard } from "./FeedCard";

const pokemon: Pokemon = {
  id: 25,
  name: "pikachu",
  displayName: "Pikachu",
  spriteUrl:
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png",
  types: ["electric"],
  abilities: ["static", "lightning-rod"],
  generation: 1,
  genus: "Mouse Pokémon",
  description:
    "When several of these Pokémon gather, their electricity can build and cause lightning storms.",
  stats: {
    hp: 35,
    attack: 55,
    defense: 40,
    specialAttack: 50,
    specialDefense: 50,
    speed: 90,
  },
  color: "yellow",
  height: 4,
  weight: 60,
};

const multiType: Pokemon = {
  ...pokemon,
  id: 6,
  name: "charizard",
  displayName: "Charizard",
  types: ["fire", "flying"],
  stats: {
    hp: 78,
    attack: 84,
    defense: 78,
    specialAttack: 109,
    specialDefense: 85,
    speed: 100,
  },
};

test("renders pokemon name and description", async ({ mount }) => {
  const component = await mount(
    <FeedCard pokemon={pokemon} onTagClick={() => {}} />,
  );
  await expect(
    component.getByRole("heading", { name: "Pikachu" }),
  ).toBeVisible();
  await expect(component.getByText(/lightning storms/)).toBeVisible();
});

test("renders type tags with # prefix", async ({ mount }) => {
  const component = await mount(
    <FeedCard pokemon={multiType} onTagClick={() => {}} />,
  );
  await expect(component.getByText("#fire")).toBeVisible();
  await expect(component.getByText("#flying")).toBeVisible();
});

test("renders all 6 stat bars", async ({ mount }) => {
  const component = await mount(
    <FeedCard pokemon={pokemon} onTagClick={() => {}} />,
  );
  for (const label of ["HP", "ATK", "DEF", "SPA", "SPD", "SPE"]) {
    await expect(component.getByText(label, { exact: true })).toBeVisible();
  }
  await expect(component.getByText("90", { exact: true })).toBeVisible();
});

test("clicking a type tag calls onTagClick with the type name", async ({
  mount,
}) => {
  const clicked: string[] = [];
  const component = await mount(
    <FeedCard pokemon={multiType} onTagClick={(tag) => clicked.push(tag)} />,
  );
  await component.getByText("#fire").click();
  expect(clicked).toEqual(["fire"]);
});

test("article has aria-label with pokemon display name", async ({ mount }) => {
  const component = await mount(
    <FeedCard pokemon={pokemon} onTagClick={() => {}} />,
  );
  await expect(component).toHaveAttribute("aria-label", "Pikachu");
});

test("stat bar width is clamped to 100%", async ({ mount }) => {
  const maxedPokemon: Pokemon = {
    ...pokemon,
    stats: {
      hp: 255,
      attack: 300,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    },
  };
  const component = await mount(
    <FeedCard pokemon={maxedPokemon} onTagClick={() => {}} />,
  );
  const bars = component.locator("[class*=statFill]");
  const attackBar = bars.nth(1);
  const width = await attackBar.evaluate((el) => el.style.width);
  expect(width).toBe("100%");
});
