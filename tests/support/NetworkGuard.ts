import http from "node:http";
import https from "node:https";
import net from "node:net";
import tls from "node:tls";
import dgram from "node:dgram";
import { syncBuiltinESMExports } from "node:module";
import { vi } from "vitest";
import { unexpectedInteraction } from "./Isolation";

export function installNetworkGuard(): void {
  const block = (name: string) => () => unexpectedInteraction(name);
  vi.stubGlobal("fetch", vi.fn(block("fetch")));
  Object.defineProperty(window, "fetch", {
    configurable: true,
    writable: true,
    value: globalThis.fetch,
  });
  vi.spyOn(XMLHttpRequest.prototype, "send").mockImplementation(
    block("XMLHttpRequest"),
  );
  for (const name of ["WebSocket", "EventSource", "Worker", "SharedWorker"]) {
    vi.stubGlobal(
      name,
      class {
        constructor() {
          unexpectedInteraction(name);
        }
      },
    );
    Object.defineProperty(window, name, {
      configurable: true,
      writable: true,
      value: Reflect.get(globalThis, name),
    });
  }
  Object.defineProperty(navigator, "sendBeacon", {
    configurable: true,
    value: block("sendBeacon"),
  });
  Object.defineProperty(window.navigator, "sendBeacon", {
    configurable: true,
    value: block("sendBeacon"),
  });
  vi.spyOn(http, "request").mockImplementation(block("http.request"));
  vi.spyOn(http, "get").mockImplementation(block("http.get"));
  vi.spyOn(https, "request").mockImplementation(block("https.request"));
  vi.spyOn(https, "get").mockImplementation(block("https.get"));
  vi.spyOn(net.Socket.prototype, "connect").mockImplementation(
    block("net.Socket.connect"),
  );
  vi.spyOn(tls, "connect").mockImplementation(block("tls.connect"));
  vi.spyOn(dgram.Socket.prototype, "send").mockImplementation(
    block("dgram.send"),
  );
  syncBuiltinESMExports();
}
