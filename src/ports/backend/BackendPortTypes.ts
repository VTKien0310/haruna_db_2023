type BackendApiErrorContent = {
  error: {
    code: string;
    message: string;
    path: string;
  };
};

type BackendApiResponse<T> = {
  ok: boolean;
  content: T | BackendApiErrorContent;
};

/**
 * Checks if the content is a BackendApiErrorContent.
 * This method is mainly used for type hinting when processing a success response.
 * Since API response can be either success or error, this method helps to mark the response as not an error when processing success response.
 *
 * @param content
 */
function isBackendApiErrorContent(
  content: unknown,
): content is BackendApiErrorContent {
  if (typeof content !== "object" || content === null) return false;

  const errorContent = content as BackendApiErrorContent;

  return (
    errorContent.error !== undefined &&
    errorContent.error.code !== undefined &&
    errorContent.error.message !== undefined &&
    errorContent.error.path !== undefined
  );
}

class Result<T, E> {
  private constructor(
    private readonly _ok: boolean,
    private readonly _value?: T,
    private readonly _error?: E,
  ) {}

  static ok<T, E = never>(value: T): Result<T, E> {
    return new Result<T, E>(true, value);
  }

  static err<E, T = never>(error: E): Result<T, E> {
    return new Result<T, E>(false, undefined, error);
  }

  isOk(): boolean {
    return this._ok;
  }

  isErr(): boolean {
    return !this._ok;
  }

  map<U>(fn: (value: T) => U): Result<U, E> {
    if (this._ok) {
      return Result.ok(fn(this._value as T));
    }
    return Result.err(this._error as E);
  }

  flatMap<U>(fn: (value: T) => Result<U, E>): Result<U, E> {
    if (this._ok) {
      return fn(this._value as T);
    }
    return Result.err(this._error as E);
  }

  unwrap(): T {
    if (!this._ok) {
      throw new Error("Called unwrap on an Err value");
    }
    return this._value as T;
  }

  unwrapOr(defaultValue: T): T {
    if (this._ok) {
      return this._value as T;
    }
    return defaultValue;
  }

  unwrapErr(): E {
    if (this._ok) {
      throw new Error("Called unwrapErr on an Ok value");
    }
    return this._error as E;
  }
}

export type { BackendApiResponse, BackendApiErrorContent };

export { isBackendApiErrorContent, Result };
