import "@tanstack/react-start/server-only"
import { api } from "@/lib/ky"
import type { TBaseResponse } from "@/types/api"
import type { 
  TSignInInput, 
  TSignInResponse, 
  TSignUpInput, 
  TSignUpResponse 
} from "./schemas"

/**
 * @description Đăng nhập vào hệ thống
 */
export async function signIn(params: TSignInInput): Promise<TSignInResponse> {
  const response = await api
    .post("auth/sign-in", { json: params })
    .json<TBaseResponse<TSignInResponse>>()
  return response.data
}

/**
 * @description Đăng ký tài khoản mới
 */
export async function signUp(params: TSignUpInput): Promise<TSignUpResponse> {
  const response = await api
    .post("auth/sign-up", { json: params })
    .json<TBaseResponse<TSignUpResponse>>()
  return response.data
}
