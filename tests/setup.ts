import { afterEach, beforeEach, vi } from "vitest";
import { enableAutoUnmount } from "@vue/test-utils";
import { createPinia, disposePinia, setActivePinia } from "pinia";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { installNetworkGuard } from "./support/NetworkGuard";
import {
  assertNoUnexpectedInteractions,
  unexpectedInteraction,
} from "./support/Isolation";
import { needRefresh, offlineReady } from "./fakes/PwaRegistration";

vi.mock("@/ports/backend/BackendPort", async () => {
  const { backendFake } = await import("./fakes/BackendFake");
  return {
    backendPort: backendFake.port,
    defaultStorageFileOptions: { cacheControl: "3600", upsert: false },
  };
});
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => unexpectedInteraction("Supabase client construction"),
}));
vi.mock("@ffmpeg/ffmpeg", () => ({
  FFmpeg: class {
    constructor() {
      unexpectedInteraction("FFmpeg: supply a test fake");
    }
  },
}));
vi.mock("@ffmpeg/util", () => ({
  fetchFile: () => unexpectedInteraction("FFmpeg fetchFile"),
  toBlobURL: () => unexpectedInteraction("FFmpeg toBlobURL"),
}));

dayjs.extend(utc);
// Vitest normally maps window to globalThis. Use its actual jsdom window so
// Node's own Web Storage globals and jsdom event constructors cannot conflict.
const browserWindow = (
  globalThis as unknown as { jsdom: { window: Window & typeof globalThis } }
).jsdom.window;
vi.stubGlobal("window", browserWindow);
installNetworkGuard();
let pinia = createPinia();

beforeEach(() => {
  vi.resetAllMocks();
  setActivePinia((pinia = createPinia()));
  needRefresh.value = false;
  offlineReady.value = false;
  vi.stubGlobal("window", browserWindow);
  installNetworkGuard();
  vi.stubGlobal("localStorage", browserWindow.localStorage);
  vi.stubGlobal("sessionStorage", browserWindow.sessionStorage);
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  try {
    assertNoUnexpectedInteractions();
  } finally {
    disposePinia(pinia);
    browserWindow.localStorage.clear();
    browserWindow.sessionStorage.clear();
    document.body.innerHTML = "";
    document.head.innerHTML = "";
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
    // Keep module imports and between-test work protected too.
    vi.stubGlobal("window", browserWindow);
    installNetworkGuard();
  }
});

// Vitest runs afterEach hooks in reverse registration order: unmount while
// dependencies and Pinia still exist, then verify and dispose the test context.
enableAutoUnmount(afterEach);
