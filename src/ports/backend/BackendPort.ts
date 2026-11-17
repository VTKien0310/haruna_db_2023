import { createClient, SupabaseClient } from "@supabase/supabase-js";
import type { FileOptions } from "@supabase/storage-js";
import type { Database } from "@/ports/backend/database.types";
import {
  BackendApiError,
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
    if (!rootEndpoint.endsWith("/")) {
      rootEndpoint += "/";
    }

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

  async patch<T>(
    path: string,
    body?: Record<string, unknown>,
  ): Promise<BackendApiResult<T, Error>> {
    return this.request<T>("PATCH", path, body);
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

  private decodeBackendApiResponse<T>(
    response: unknown,
    status: number,
    statusText: string = "",
  ): BackendApiResult<T, Error> {
    const envelope =
      response && typeof response === "object"
        ? (response as Record<string, unknown>)
        : null;
    const successful = status >= 200 && status < 300;
    if (
      envelope &&
      isBackendApiErrorContent(envelope.content) &&
      (!successful || envelope.ok !== true)
    ) {
      const { code, message } = envelope.content.error;
      return BackendApiResult.err(new BackendApiError(code, message, status));
    }
    if (!successful)
      return BackendApiResult.err(
        new Error(`HTTP error ${status}: ${statusText}`),
      );
    if (envelope?.ok !== true || !("content" in envelope)) {
      return BackendApiResult.err(new Error("Invalid API response"));
    }
    return BackendApiResult.ok(envelope.content as T);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: Record<string, unknown>,
    params?: Record<string, string>,
  ): Promise<BackendApiResult<T, Error>> {
    if (path.startsWith("/")) {
      path = path.slice(1);
    }

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

      const apiResponse: unknown = await response.json().catch(() => null);
      return this.decodeBackendApiResponse<T>(
        apiResponse,
        response.status,
        response.statusText,
      );
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
