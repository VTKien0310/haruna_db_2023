export class Responder {
    private readonly defaultResponseHeaders: Record<string, string> = {
        'Content-Type': 'application/json'
    }

    private responseCommonStructure(status: number, success: boolean) {
        return {
            status: status,
            success: success ? 1 : 0,
        }
    }

    responseSuccess(data: Record<string, any>): Response {
        return new Response(
            JSON.stringify({
                ...this.responseCommonStructure(200, true),
                data: data
            }),
            {
                headers: this.defaultResponseHeaders,
                status: 200
            }
        )
    }

    responseBadRequest(code: string, message: string): Response {
        return new Response(
            JSON.stringify({
                ...this.responseCommonStructure(400, false),
                error: {
                    code: code,
                    message: message
                }
            }),
            {
                headers: this.defaultResponseHeaders,
                status: 400
            }
        )
    }
}