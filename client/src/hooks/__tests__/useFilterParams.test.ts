// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useFilterParams } from "../useFilterParams";

function setURL(search: string) {
  window.history.replaceState(null, "", search || "/");
  window.dispatchEvent(new PopStateEvent("popstate"));
}

beforeEach(() => {
  setURL("/");
});

describe("useFilterParams", () => {
  describe("URL parsing", () => {
    it("should return empty defaults when no params", () => {
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.q).toBe("");
      expect(result.current.tags).toEqual([]);
      expect(result.current.generation).toEqual([]);
      expect(result.current.cursor).toBe("");
    });

    it("should parse q from URL", () => {
      setURL("/?q=pikachu");
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.q).toBe("pikachu");
    });

    it("should parse tags from URL", () => {
      setURL("/?tags=fire,water");
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.tags).toEqual(["fire", "water"]);
    });

    it("should parse generation from URL", () => {
      setURL("/?generation=1,3");
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.generation).toEqual([1, 3]);
    });

    it("should parse cursor from URL", () => {
      setURL("/?cursor=25");
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.cursor).toBe("25");
    });

    it("should filter out invalid generation values", () => {
      setURL("/?generation=1,abc,-2,3");
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.generation).toEqual([1, 3]);
    });

    it("should filter out empty tag values", () => {
      setURL("/?tags=fire,,water,");
      const { result } = renderHook(() => useFilterParams());

      expect(result.current.tags).toEqual(["fire", "water"]);
    });
  });

  describe("setQuery", () => {
    it("should update q in URL", () => {
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.setQuery("char");
      });

      expect(result.current.q).toBe("char");
      expect(window.location.search).toContain("q=char");
    });

    it("should clear cursor when setting query", () => {
      setURL("/?cursor=25");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.setQuery("pika");
      });

      expect(result.current.cursor).toBe("");
      expect(window.location.search).not.toContain("cursor");
    });

    it("should remove q param when setting empty string", () => {
      setURL("/?q=pikachu");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.setQuery("");
      });

      expect(result.current.q).toBe("");
      expect(window.location.search).not.toContain("q=");
    });
  });

  describe("toggleTag", () => {
    it("should add a tag", () => {
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.toggleTag("fire");
      });

      expect(result.current.tags).toEqual(["fire"]);
    });

    it("should remove an existing tag", () => {
      setURL("/?tags=fire,water");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.toggleTag("fire");
      });

      expect(result.current.tags).toEqual(["water"]);
    });

    it("should clear cursor when toggling tag", () => {
      setURL("/?cursor=25&tags=fire");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.toggleTag("water");
      });

      expect(result.current.cursor).toBe("");
    });
  });

  describe("toggleGeneration", () => {
    it("should add a generation", () => {
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.toggleGeneration(1);
      });

      expect(result.current.generation).toEqual([1]);
    });

    it("should remove an existing generation", () => {
      setURL("/?generation=1,2");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.toggleGeneration(1);
      });

      expect(result.current.generation).toEqual([2]);
    });

    it("should clear cursor when toggling generation", () => {
      setURL("/?cursor=25&generation=1");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.toggleGeneration(2);
      });

      expect(result.current.cursor).toBe("");
    });
  });

  describe("clearFilters", () => {
    it("should reset all filters", () => {
      setURL("/?q=pika&tags=fire&generation=1&cursor=25");
      const { result } = renderHook(() => useFilterParams());

      act(() => {
        result.current.clearFilters();
      });

      expect(result.current.q).toBe("");
      expect(result.current.tags).toEqual([]);
      expect(result.current.generation).toEqual([]);
      expect(result.current.cursor).toBe("");
    });
  });

  describe("snapshot stability", () => {
    it("should return the same reference when URL has not changed", () => {
      const { result, rerender } = renderHook(() => useFilterParams());

      const first = result.current;
      rerender();
      const second = result.current;

      expect(first.q).toBe(second.q);
      expect(first.tags).toBe(second.tags);
      expect(first.generation).toBe(second.generation);
    });
  });
});
