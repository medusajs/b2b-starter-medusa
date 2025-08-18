import {
  DespatchLabAuthCredentials,
  DespatchLabAuthResponse,
  DespatchLabImpersonationResponse,
} from "./common";

export interface AuthenticateRequest extends DespatchLabAuthCredentials {}

export interface AuthenticateResponse extends DespatchLabAuthResponse {}

export interface RefreshTokenRequest {
  token: string;
}

export interface RefreshTokenResponse extends DespatchLabAuthResponse {}

export interface ImpersonateRequest {
  depotId?: string | null;
  customerId: string;
  refreshToken: string;
}

export interface ImpersonateResponse extends DespatchLabImpersonationResponse {}