import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { FileOptions } from "@supabase/storage-js/src/lib/types";
import type { Database } from "@/ports/backend/database.types";
import type { BackendApiResponse } from "@/ports/backend/BackendPortTypes";
import {
  isBackendApiErrorContent,
  BackendApiResult,
} from "@/ports/backend/BackendPortTypes";

const supabaseApiUrl: string = import.meta.env.VITE_SUPABASE_API_URL;
const supabaseAnonKey: string = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabaseClient: SupabaseClient<Database> = createClient<Database>(
  supabaseApiUrl,
  supabaseAnonKey,
);

export const defaultStorageFileOptions: FileOptions = {
  cacheControl: "3600",
  upsert: false,
};

const backendApiUrl: string = import.meta.env.VITE_BACKEND_API_URL;

class BackendPort {
  public readonly rootEndpoint: string;

  public readonly spbClient: SupabaseClient<Database>;

  constructor(rootEndpoint: string, spbClient: SupabaseClient<Database>) {
    this.rootEndpoint = rootEndpoint;
    this.spbClient = spbClient;
  }

  async get<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<BackendApiResult<T, Error>> {
    return this.request<T>("GET", path, undefined, params);
  }

  async post<T>(
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<BackendApiResult<T, Error>> {
    return this.request<T>("POST", path, body, params);
  }

  private async buildHeaders(): Promise<Record<string, string>> {
    let headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    const {
      data: { session },
    } = await this.spbClient.auth.getSession();
    if (session?.access_token) {
      headers["Authorization"] = `Bearer ${session.access_token}`;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<BackendApiResult<T, Error>> {
    let url = `${this.rootEndpoint}${path}`;

    if (params) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(params)) {
        searchParams.append(key, value);
      }
      url = `${url}?${searchParams.toString()}`;
    }

    try {
      const headers = await this.buildHeaders();
      const response = await fetch(url, {
        method,
        headers,
        body: body !== undefined ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        return BackendApiResult.err(
          new Error(`HTTP error ${response.status}: ${response.statusText}`),
        );
      }

      const apiResponse = (await response.json()) as BackendApiResponse<T>;

      if (!apiResponse.ok) {
        if (isBackendApiErrorContent(apiResponse.content)) {
          const { code, message, path: errorPath } = apiResponse.content.error;
          return BackendApiResult.err(
            new Error(`[${code}] ${message} (path: ${errorPath})`),
          );
        }
        return BackendApiResult.err(new Error("Unknown API error occurred"));
      }

      return BackendApiResult.ok(apiResponse.content as T);
    } catch (error: unknown) {
      if (error instanceof Error) {
        return BackendApiResult.err(error);
      }
      return BackendApiResult.err(new Error(String(error)));
    }
  }
}

export const backendPort = new BackendPort(backendApiUrl, supabaseClient);

export type { BackendPort };
