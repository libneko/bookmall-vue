import request from '@/utils/request'
import type { ApiResponse, CodeLogin, LoginForm, LoginToken, ReceiveCodeflag } from './types'

// 登录
export const loginApi = (data: LoginForm): Promise<ApiResponse<LoginToken>> => {
  return request.post('/user/login/password', data)
}

export const sendcodeApi = (code: string): Promise<ApiResponse<ReceiveCodeflag>> => {
  return request.post('/user/login/verify', { code })
}

export const codeloginApi = (data: CodeLogin): Promise<ApiResponse<LoginToken>> => {
  return request.post('/user/login/code', data)
}

export const sendemailApi = (email: string): Promise<ApiResponse<object>> => {
  return request.post(`/user/login/send?email=${email}`)
}
