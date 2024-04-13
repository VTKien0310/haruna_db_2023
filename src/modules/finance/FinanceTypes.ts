export enum TransactionType {
    CASH_OUT = 0,
    CASH_IN = 1
}

export interface TransactionCreationData {
    name: string,
    amount: number,
    type: TransactionType
}