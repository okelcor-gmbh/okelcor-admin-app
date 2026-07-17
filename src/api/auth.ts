import { apiFetch } from "./client";
import type {
  LoginResponse,
  TwoFactorLoginResponse,
  TwoFactorSetupEnableResponse,
  TwoFactorSetupConfirmResponse,
  AdminUser,
} from "./types";

export function login(email: string, password: string) {
  return apiFetch<LoginResponse>("/admin/login", { method: "POST", body: { email, password } });
}

export function loginTwoFactor(session_token: string, code: string) {
  return apiFetch<TwoFactorLoginResponse>("/admin/login/2fa", {
    method: "POST",
    body: { session_token, code },
  });
}

export function setupTwoFactorEnable(temp_token: string) {
  return apiFetch<TwoFactorSetupEnableResponse>("/admin/2fa/setup/enable", {
    method: "POST",
    body: { temp_token },
  });
}

export function setupTwoFactorConfirm(temp_token: string, code: string) {
  return apiFetch<TwoFactorSetupConfirmResponse>("/admin/2fa/setup/confirm", {
    method: "POST",
    body: { temp_token, code },
  });
}

export function fetchMe() {
  return apiFetch<{ data: AdminUser; message: string }>("/admin/me");
}
