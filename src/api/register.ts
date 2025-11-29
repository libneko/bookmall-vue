import request from '@/utils/request'
import type { ApiResponse, RegisterForm } from './types'

// 登录
export const registerApi = (data: RegisterForm): Promise<ApiResponse<RegisterForm>> => {
  return request.post('/user/register', data)
}
