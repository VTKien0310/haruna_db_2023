import { describe, expect, it } from "vitest";
import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import { assertNoUnexpectedInteractions } from "./Isolation";
import { backendPort } from "@/ports/backend/BackendPort";
import { makeBackendFake, queryResult } from "../fakes/BackendFake";
import { useTranslationStore } from "@/modules/translation/stores/TranslationStore";
import { createClient } from "@supabase/supabase-js";

describe("External interaction isolation", () => {
  it.each([
    ["fetch", () => fetch("http://localhost:54321")],
    [
      "XHR",
      () => {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", "https://example.invalid");
        xhr.send();
      },
    ],
    ["WebSocket", () => new WebSocket("ws://localhost:54321")],
    ["EventSource", () => new EventSource("https://example.invalid")],
    ["beacon", () => navigator.sendBeacon("https://example.invalid")],
    ["HTTP", () => http.get("http://localhost:54321")],
    ["HTTPS", () => https.request("https://example.invalid")],
    ["socket", () => net.connect(54321)],
    ["TLS", () => tls.connect(54321)],
    ["worker", () => new Worker("https://example.invalid/worker.js")],
  ] as const)(
    "blocks %s before I/O and records caught failures",
    (_name, action) => {
      expect(action).toThrow("Unexpected external interaction");
      // This is the same verification called by global teardown. Only isolation
      // self-tests consume expected violations explicitly.
      expect(assertNoUnexpectedInteractions).toThrow(
        "Unexpected external interaction",
      );
      expect(assertNoUnexpectedInteractions).not.toThrow();
    },
  );
  it("replaces the singleton and rejects unconfigured calls", () => {
    expect(backendPort.rootEndpoint).toBe("https://backend.invalid/");
    expect(() => backendPort.spbClient.from("medias")).toThrow("database.from");
    expect(assertNoUnexpectedInteractions).toThrow("database.from");
  });
  it("blocks direct client construction", () => {
    expect(() => createClient("https://supabase.invalid", "dummy")).toThrow(
      "Supabase client construction",
    );
    expect(assertNoUnexpectedInteractions).toThrow(
      "Supabase client construction",
    );
  });
  it("rejects unconfigured function and storage calls", () => {
    const fake = makeBackendFake();
    expect(() => fake.port.spbClient.functions.invoke("dummy")).toThrow(
      "functions.invoke",
    );
    expect(() =>
      fake.port.spbClient.storage.from("dummy").upload("dummy", new Blob()),
    ).toThrow("storage.upload");
    expect(assertNoUnexpectedInteractions).toThrow("functions.invoke");
  });
  it("uses configured fake responses only", async () => {
    const fake = makeBackendFake();
    fake.query(queryResult([{ id: "dummy" }]));
    expect(await fake.port.spbClient.from("medias").select()).toMatchObject({
      data: [{ id: "dummy" }],
    });
  });
  it("starts with fresh state and can mutate it", () => {
    expect(useTranslationStore().histories).toEqual([]);
    expect(localStorage.length).toBe(0);
    useTranslationStore().lastTranslationKey = "dirty";
    localStorage.setItem("dummy", "dirty");
  });
  it("does not retain state or storage from another test", () => {
    expect(useTranslationStore().lastTranslationKey).toBeNull();
    expect(localStorage.length).toBe(0);
  });
});
