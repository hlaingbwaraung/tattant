/**
 * Business Service
 *
 * API calls for listing and viewing businesses (shops).
 */

import api from './api'

/** Fetch businesses with optional query params (category, search, limit, all) */
export const getBusinesses  = (params) => api.get('/businesses', { params })

/** Fetch a single business by its UUID */
export const getBusinessById = (id)    => api.get(`/businesses/${id}`)
