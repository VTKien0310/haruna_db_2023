import { vi } from "vitest";
import type { BackendPort } from "@/ports/backend/BackendPort";
import { BackendApiResult } from "@/ports/backend/BackendPortTypes";
import { unexpectedInteraction } from "../support/Isolation";

export interface QueryResult {
  data: unknown;
  error: { message: string } | null;
  count?: number | null;
}

export function queryResult(
  data: unknown = null,
  count: number | null = null,
): QueryResult {
  return { data, error: null, count };
}
export const queryError = (): QueryResult => ({
  data: null,
  error: { message: "Dummy failure" },
  count: null,
});

export function makeQuery(result: QueryResult) {
  const chain = {
    select: vi.fn((..._args: unknown[]) => chain),
    insert: vi.fn((..._args: unknown[]) => chain),
    update: vi.fn((..._args: unknown[]) => chain),
    delete: vi.fn((..._args: unknown[]) => chain),
    eq: vi.fn((..._args: unknown[]) => chain),
    filter: vi.fn((..._args: unknown[]) => chain),
    limit: vi.fn((..._args: unknown[]) => chain),
    range: vi.fn((..._args: unknown[]) => chain),
    order: vi.fn((..._args: unknown[]) => chain),
    then: Promise.resolve(result).then.bind(Promise.resolve(result)),
  };
  return chain;
}

const strictMock = <T>(name: string) =>
  vi.fn<(...args: unknown[]) => T>(() => unexpectedInteraction(name));

export function makeBackendFake() {
  const storage = {
    upload: strictMock<Promise<QueryResult>>("storage.upload"),
    download: strictMock<Promise<QueryResult>>("storage.download"),
    remove: strictMock<Promise<QueryResult>>("storage.remove"),
    list: strictMock<Promise<QueryResult>>("storage.list"),
    createSignedUrl: strictMock<Promise<QueryResult>>(
      "storage.createSignedUrl",
    ),
  };
  const auth = {
    getSession:
      strictMock<Promise<{ data: { session: unknown }; error: unknown }>>(
        "auth.getSession",
      ),
    getUser:
      strictMock<Promise<{ data: { user: unknown }; error: unknown }>>(
        "auth.getUser",
      ),
    signInWithPassword: strictMock<Promise<{ error: unknown }>>(
      "auth.signInWithPassword",
    ),
    resetPasswordForEmail: strictMock<Promise<{ error: unknown }>>(
      "auth.resetPasswordForEmail",
    ),
    signOut: strictMock<Promise<{ error: unknown }>>("auth.signOut"),
    updateUser: strictMock<Promise<{ error: unknown }>>("auth.updateUser"),
    onAuthStateChange: strictMock<unknown>("auth.onAuthStateChange"),
  };
  const fake = {
    rootEndpoint: "https://backend.invalid/",
    get: strictMock<Promise<BackendApiResult<unknown, Error>>>("backend.get"),
    post: strictMock<Promise<BackendApiResult<unknown, Error>>>("backend.post"),
    spbClient: {
      from: strictMock<ReturnType<typeof makeQuery>>("database.from"),
      auth,
      storage: { from: vi.fn((_bucket: string) => storage) },
      functions: {
        invoke: strictMock<Promise<QueryResult>>("functions.invoke"),
      },
    },
  };
  return {
    ...fake,
    storage,
    auth,
    // The production class has private methods and Supabase has a large fluent
    // interface. Keep the structural test-double cast at this single boundary.
    port: fake as unknown as BackendPort,
    query(result: QueryResult) {
      const query = makeQuery(result);
      fake.spbClient.from.mockReturnValueOnce(query);
      return query;
    },
  };
}

export const backendFake = makeBackendFake();
