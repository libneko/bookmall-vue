///user/shoppingCart/add
//book_id

import request from '@/utils/request'
import type { Addshopping, ApiResponse } from './types'

export const shop = (book_id: Addshopping): Promise<ApiResponse<Addshopping>> => {
  return request.post('/user/shoppingCart/add', book_id)
}
