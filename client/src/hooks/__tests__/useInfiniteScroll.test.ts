// @vitest-environment jsdom
import { renderHook, act } from "@testing-library/react";
import { useInfiniteScroll } from "../useInfiniteScroll";

type ObserverCallback = (entries: Partial<IntersectionObserverEntry>[]) => void;

let observerCallback: ObserverCallback;
let disconnectSpy: ReturnType<typeof vi.fn>;
let observeSpy: ReturnType<typeof vi.fn>;
let unobserveSpy: ReturnType<typeof vi.fn>;
let constructorSpy: (...args: unknown[]) => void;

beforeEach(() => {
  disconnectSpy = vi.fn();
  observeSpy = vi.fn();
  unobserveSpy = vi.fn();
  constructorSpy = vi.fn() as unknown as (...args: unknown[]) => void;

  class MockIntersectionObserver {
    constructor(cb: ObserverCallback, options?: IntersectionObserverInit) {
      observerCallback = cb;
      constructorSpy(cb, options);
    }
    observe = observeSpy;
    unobserve = unobserveSpy;
    disconnect = disconnectSpy;
    root = null;
    rootMargin = "";
    thresholds: number[] = [];
    takeRecords = () => [] as IntersectionObserverEntry[];
  }

  vi.stubGlobal("IntersectionObserver", MockIntersectionObserver);
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useInfiniteScroll", () => {
  it("should create an observer when a node is attached and enabled", () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onIntersect, true));

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });

    expect(constructorSpy).toHaveBeenCalledTimes(1);
    expect(observeSpy).toHaveBeenCalledWith(node);
  });

  it("should not create an observer when disabled", () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onIntersect, false));

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });

    expect(constructorSpy).not.toHaveBeenCalled();
  });

  it("should call onIntersect when element intersects", () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onIntersect, true));

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });

    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(onIntersect).toHaveBeenCalledTimes(1);
  });

  it("should not call onIntersect when element is not intersecting", () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onIntersect, true));

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });

    act(() => {
      observerCallback([{ isIntersecting: false }]);
    });

    expect(onIntersect).not.toHaveBeenCalled();
  });

  it("should disconnect observer when node is removed", () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onIntersect, true));

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });
    act(() => {
      result.current(null);
    });

    expect(disconnectSpy).toHaveBeenCalled();
  });

  it("should disconnect and recreate observer when enabled changes", () => {
    const onIntersect = vi.fn();
    let enabled = true;
    const { result, rerender } = renderHook(() =>
      useInfiniteScroll(onIntersect, enabled),
    );

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });
    expect(constructorSpy).toHaveBeenCalledTimes(1);

    enabled = false;
    rerender();

    // New ref callback is created, React calls old with null, new with node
    act(() => {
      result.current(null);
    });
    expect(disconnectSpy).toHaveBeenCalled();

    act(() => {
      result.current(node);
    });
    // Should not create a new observer since disabled
    expect(constructorSpy).toHaveBeenCalledTimes(1);
  });

  it("should use 400px rootMargin for prefetching", () => {
    const onIntersect = vi.fn();
    const { result } = renderHook(() => useInfiniteScroll(onIntersect, true));

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });

    expect(constructorSpy).toHaveBeenCalledWith(expect.any(Function), {
      rootMargin: "400px",
    });
  });

  it("should use latest callback via ref (no stale closure)", () => {
    let callCount = 0;
    const firstCallback = vi.fn(() => callCount++);
    const secondCallback = vi.fn(() => callCount++);

    let onIntersect = firstCallback;
    const { result, rerender } = renderHook(() =>
      useInfiniteScroll(onIntersect, true),
    );

    const node = document.createElement("div");
    act(() => {
      result.current(node);
    });

    // Update the callback
    onIntersect = secondCallback;
    rerender();

    // Trigger intersection — should call the latest callback
    act(() => {
      observerCallback([{ isIntersecting: true }]);
    });

    expect(secondCallback).toHaveBeenCalledTimes(1);
    expect(firstCallback).not.toHaveBeenCalled();
  });
});
