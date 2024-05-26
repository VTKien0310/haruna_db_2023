import {Responder} from "./responder.ts";

class Provider {
    responder(): Responder {
        return new Responder()
    }
}

const provider: Provider = new Provider()

export default provider