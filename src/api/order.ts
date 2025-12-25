import request from '@/utils/request'
import type { ApiResponse, GetOrders, Order, PayInfo, SendOrder } from './types'

export const getOrder = (data:SendOrder): Promise<ApiResponse<GetOrders>> => {
  const params = new URLSearchParams()
  params.append('page', data.page.toString())
  params.append('pageSize', data.pageSize.toString())
  if (data.status) {
    params.append('status' , data.status)
  }
  return request.get(`/user/order/historyOrders?${params.toString()}`)

}


export const CompleteOrderApi = (order_id: string): Promise<ApiResponse<object>> => {
  return request.put(``)
}

export const payOrderApi = (pay: PayInfo): Promise<ApiResponse<object>> => {
  return request.put(`/user/order/payment` , pay)
}
export const DeleteOrderApi = (order_id: string): Promise<ApiResponse> => {
  return request.put(`/user/order/cancel/${order_id}`)
}
