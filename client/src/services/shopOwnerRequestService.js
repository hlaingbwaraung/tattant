/**
 * Shop Owner Request Service
 *
 * API calls for shop owner registration requests.
 */
import api from './api'

/** Submit a shop owner request */
export const submitShopOwnerRequest = (data) => api.post('/shop-owner-requests', data)

/** Get current user's requests */
export const getMyRequests = () => api.get('/shop-owner-requests/my')

/** Get all requests (admin) */
export const getAllRequests = (status) =>
  api.get('/shop-owner-requests/all', { params: status ? { status } : {} })

/** Approve a request (admin) */
export const approveRequest = (requestId, data) =>
  api.patch(`/shop-owner-requests/${requestId}/approve`, data)

/** Reject a request (admin) */
export const rejectRequest = (requestId, data) =>
  api.patch(`/shop-owner-requests/${requestId}/reject`, data)
