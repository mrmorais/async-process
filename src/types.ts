export enum PaymentStatus {
  CREATED = "CREATED",
  INITIADED = "INITIADED",
  FAILED = "FAILED",
  SUCCEEDED = "SUCCEEDED",
}

export interface PaymentProcess {
  id: string;
  status: PaymentStatus;
}