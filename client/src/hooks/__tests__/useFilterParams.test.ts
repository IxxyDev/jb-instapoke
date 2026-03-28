// @vitest-environment jsdom

import { act, renderHook } from "@testing-library/react";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { createElement, type ReactNode } from "react";
import { useFilterParams } from "../useFilterParams";

function wrapper({ children }: { children: ReactNode }) {
  return createElement(NuqsTestingAdapter, null, children);
}

describe("useFilterParams", () => {
  it("should return empty defaults when no params", () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper });

    expect(result.current.q).toBe("");
    expect(result.current.tags).toEqual([]);
    expect(result.current.generation).toEqual([]);
  });

  it("should update q via setQuery", () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper });

    act(() => {
      result.current.setQuery("pikachu");
    });

    expect(result.current.q).toBe("pikachu");
  });

  it("should toggle tags on and off", () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper });

    act(() => {
      result.current.toggleTag("fire");
    });
    expect(result.current.tags).toEqual(["fire"]);

    act(() => {
      result.current.toggleTag("water");
    });
    expect(result.current.tags).toEqual(["fire", "water"]);

    act(() => {
      result.current.toggleTag("fire");
    });
    expect(result.current.tags).toEqual(["water"]);
  });

  it("should toggle generations on and off", () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper });

    act(() => {
      result.current.toggleGeneration(1);
    });
    expect(result.current.generation).toEqual([1]);

    act(() => {
      result.current.toggleGeneration(1);
    });
    expect(result.current.generation).toEqual([]);
  });

  it("should clear all filters", () => {
    const { result } = renderHook(() => useFilterParams(), { wrapper });

    act(() => {
      result.current.setQuery("pika");
    });
    act(() => {
      result.current.toggleTag("fire");
    });
    act(() => {
      result.current.toggleGeneration(1);
    });

    act(() => {
      result.current.clearFilters();
    });

    expect(result.current.q).toBe("");
    expect(result.current.tags).toEqual([]);
    expect(result.current.generation).toEqual([]);
  });
});
