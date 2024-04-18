interface ResponseCommonStructure {
    status: number;
    success: boolean;
}

interface ErrorResponseCommonStructure {
    error: {
        code: string,
        message: string
    }
}

export class Responder {
    private readonly defaultResponseHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
    }

    private responseCommonStructure(status: number, success: boolean): ResponseCommonStructure {
        return {
            status: status,
            success: success,
        }
    }

    private errorResponseCommonStructure(code: string, message: string): ErrorResponseCommonStructure {
        return {
            error: {
                code: code,
                message: message
            }
        }
    }

    responseSuccess(data: Record<string, any> | Record<string, any>[]): Response {
        const okStatus: number = 200;

        return new Response(
            JSON.stringify({
                ...this.responseCommonStructure(okStatus, true),
                data: data
            }),
            {
                headers: this.defaultResponseHeaders,
                status: okStatus
            }
        )
    }

    responseBadRequest(code: string, message: string): Response {
        const badRequestStatus: number = 400;

        return new Response(
            JSON.stringify({
                ...this.responseCommonStructure(badRequestStatus, false),
                ...this.errorResponseCommonStructure(code, message)
            }),
            {
                headers: this.defaultResponseHeaders,
                status: badRequestStatus
            }
        )
    }

    responseCors(): Response {
        return new Response('ok', {
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
            }
        })
    }
}