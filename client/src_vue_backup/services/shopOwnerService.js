/**
 * Shop Owner Service
 *
 * API calls for shop-owner-specific operations:
 * dashboard stats, listing owned businesses, updating business details.
 */

import api from './api'

/** Get aggregated dashboard statistics for the logged-in shop owner */
export const getOwnerStats = () => api.get('/shop-owner/stats')

/** Get all businesses owned by the logged-in shop owner */
export const getMyBusinesses = () => api.get('/shop-owner/businesses')

/** Update a specific owned business */
export const updateMyBusiness = (id, data) => api.put(`/shop-owner/businesses/${id}`, data)
