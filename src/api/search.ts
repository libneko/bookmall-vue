import request from '@/utils/request'
import type { ApiResponse, SendSearch, ReceiveSearch } from './types'

// 登录
export const searchApi = (data: SendSearch): Promise<ApiResponse<ReceiveSearch>> => {
  return request.get(
    `/user/book/page?page=${data.page}&pageSize=${data.page_size}&name=${data.name}&categoryId=${data.category_id}&status=${data.status}`,
  )
}
