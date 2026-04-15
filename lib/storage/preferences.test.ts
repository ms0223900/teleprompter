import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  loadPreferences,
  PREFERENCES_STORAGE_KEY,
  savePreferences,
  type TeleprompterPreferences,
} from "./preferences";

function installBrowserLikeGlobals() {
  const map = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return map.size;
    },
    clear: () => {
      map.clear();
    },
    getItem: (key) => map.get(key) ?? null,
    key: (index) => Array.from(map.keys())[index] ?? null,
    removeItem: (key) => {
      map.delete(key);
    },
    setItem: (key, value) => {
      map.set(key, value);
    },
  };
  Object.defineProperty(globalThis, "localStorage", {
    value: storage,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(globalThis, "window", {
    value: globalThis,
    configurable: true,
    writable: true,
  });
}

function removeBrowserLikeGlobals() {
  Reflect.deleteProperty(globalThis, "window");
  Reflect.deleteProperty(globalThis, "localStorage");
}

describe("storage/preferences", () => {
  const sample: TeleprompterPreferences = {
    wpm: 120,
    fontSize: 42,
    isMirrored: true,
    autoWrap: false,
  };

  beforeEach(() => {
    installBrowserLikeGlobals();
  });

  afterEach(() => {
    removeBrowserLikeGlobals();
    vi.restoreAllMocks();
  });

  it("returns null when window is undefined (SSR)", () => {
    removeBrowserLikeGlobals();
    expect(loadPreferences()).toBeNull();
  });

  it("save then load round-trips the same semantic object", () => {
    savePreferences(sample);
    expect(loadPreferences()).toEqual(sample);
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    expect(raw).not.toBeNull();
    expect(JSON.parse(raw!)).toMatchObject({ version: 1, ...sample });
  });

  it("returns null for missing key", () => {
    expect(loadPreferences()).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, "not-json");
    expect(loadPreferences()).toBeNull();
  });

  it("returns null when version mismatches", () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ version: 999, ...sample }),
    );
    expect(loadPreferences()).toBeNull();
  });

  it("returns null when fields are out of UI range or wrong types", () => {
    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        wpm: 49,
        fontSize: 42,
        isMirrored: false,
        autoWrap: true,
      }),
    );
    expect(loadPreferences()).toBeNull();

    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        wpm: 120,
        fontSize: 19,
        isMirrored: false,
        autoWrap: true,
      }),
    );
    expect(loadPreferences()).toBeNull();

    localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        wpm: "120",
        fontSize: 42,
        isMirrored: false,
        autoWrap: true,
      }),
    );
    expect(loadPreferences()).toBeNull();
  });

  it("does not throw when save fails (quota)", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(globalThis.localStorage, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => savePreferences(sample)).not.toThrow();
    expect(warn).toHaveBeenCalled();
  });
});
