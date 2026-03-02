/**
 * Booking Service
 *
 * API calls for booking management:
 * CRUD operations, stats, and monthly stats.
 */
import api from './api'

/** Get bookings with optional filters */
export const getBookings = (params) => api.get('/bookings', { params })

/** Get current user's bookings (customer perspective) */
export const getMyBookings = (params) => api.get('/bookings/my-bookings', { params })

/** Get single booking */
export const getBooking = (id) => api.get(`/bookings/${id}`)

/** Create a new booking */
export const createBooking = (data) => api.post('/bookings', data)

/** Update a booking */
export const updateBooking = (id, data) => api.put(`/bookings/${id}`, data)

/** Delete a booking */
export const deleteBooking = (id) => api.delete(`/bookings/${id}`)

/** Get overview stats */
export const getBookingStats = () => api.get('/bookings/stats/overview')

/** Get monthly stats for a year */
export const getMonthlyStats = (year) => api.get('/bookings/stats/monthly', { params: { year } })

/** Create a public booking (customer booking at a shop) */
export const createPublicBooking = (businessId, data) => api.post(`/businesses/${businessId}/book`, data)
