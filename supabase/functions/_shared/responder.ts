interface ResponseCommonStructure {
  status: number;
  success: boolean;
}

interface ErrorResponseCommonStructure {
  error: {
    code: string;
    message: string;
  };
}

export class Responder {
  private readonly corsHeaders: Record<string, string> = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
  };

  private readonly defaultResponseHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    ...this.corsHeaders,
  };

  private responseCommonStructure(
    status: number,
    success: boolean,
  ): ResponseCommonStructure {
    return {
      status: status,
      success: success,
    };
  }

  private errorResponseCommonStructure(
    code: string,
    message: string,
  ): ErrorResponseCommonStructure {
    return {
      error: {
        code: code,
        message: message,
      },
    };
  }

  responseSuccess(data: Record<string, any> | Record<string, any>[]): Response {
    const okStatus: number = 200;

    return new Response(
      JSON.stringify({
        ...this.responseCommonStructure(okStatus, true),
        data: data,
      }),
      {
        headers: this.defaultResponseHeaders,
        status: okStatus,
      },
    );
  }

  responseBadRequest(code: string, message: string): Response {
    const badRequestStatus: number = 400;

    return new Response(
      JSON.stringify({
        ...this.responseCommonStructure(badRequestStatus, false),
        ...this.errorResponseCommonStructure(code, message),
      }),
      {
        headers: this.defaultResponseHeaders,
        status: badRequestStatus,
      },
    );
  }

  responseMissingParameters(message?: string): Response {
    message = message || "Missing at least one of the required parameters.";

    return this.responseBadRequest("missing_parameters", message);
  }

  responseValidationFailed(message?: string): Response {
    message = message || "Validation for your input failed.";

    const code = "validation_failed";
    const validationFailedStatus: number = 422;

    return new Response(
      JSON.stringify({
        ...this.responseCommonStructure(validationFailedStatus, false),
        ...this.errorResponseCommonStructure(code, message),
      }),
      {
        headers: this.defaultResponseHeaders,
        status: validationFailedStatus,
      },
    );
  }

  responseInternalError(message?: string): Response {
    message = message || "An unexpected error occurred.";
    const code = "internal_error";
    const internalErrorStatus: number = 500;

    return new Response(
      JSON.stringify({
        ...this.responseCommonStructure(internalErrorStatus, false),
        ...this.errorResponseCommonStructure(code, message),
      }),
      {
        headers: this.defaultResponseHeaders,
        status: internalErrorStatus,
      },
    );
  }

  responseCors(): Response {
    return new Response("ok", {
      headers: this.corsHeaders,
    });
  }
}
