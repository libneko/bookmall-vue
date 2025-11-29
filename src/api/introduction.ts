import request from '@/utils/request'
import type { ApiResponse, Book } from './types'

// 登录
export const bookApi = (id: number): Promise<ApiResponse<Book>> => {
  return request.get(`/admin/book/${id}`)
}
