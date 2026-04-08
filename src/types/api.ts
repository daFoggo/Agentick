/**
 * @description Card được dùng chung cho toàn bộ phản hồi từ Backend.
 */
export interface TBaseResponse<T> {
  success: boolean
  message: string
  data: T
}
