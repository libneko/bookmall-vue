import request from '@/utils/request'
import type { ApiResponse, Order } from './types'

export const OrderApi = (id: number): Promise<ApiResponse<Order[]>> => {
    return request.get(`/order/${id}`)
}

export const DeleteOrderApi = (order_id: string): Promise<ApiResponse> => {
    return request.post(`/order/${order_id}`)
}