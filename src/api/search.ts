import request from '@/utils/request'
import type { ApiResponse, SendSearch , ReceiveSearch } from './types'

// 登录
export const searchApi = (data: SendSearch): Promise<ApiResponse<ReceiveSearch>> => {
  return request.post('/user/book/page', data)
}
