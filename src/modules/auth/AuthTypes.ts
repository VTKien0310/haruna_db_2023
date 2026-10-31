export interface AuthCredential {
  email: string;
  password: string;
}

export interface ProfileDetail {
  name: string;
  password: string;
  birthDate: string;
  workStartDate: string;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetDetail {
  password: string;
  confirmPassword: string;
}

export type PasswordResetAvailability = "ready" | "invalid" | "authenticated";
