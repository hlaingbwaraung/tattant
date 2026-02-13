/**
 * Coupon Service
 *
 * API calls for coupon operations.
 * Public users can view coupons; shop owners can create / edit / delete.
 */

import api from './api'

/* ---------- Public ---------- */

/** Get all active coupons for a specific business */
export const getBusinessCoupons = (businessId) => api.get(`/coupons/business/${businessId}`)

/* ---------- Shop Owner ---------- */

/** Get my coupons (shop owner) */
export const getMyCoupons = ()              => api.get('/shop-owner/coupons')

/** Create a new coupon */
export const createCoupon = (couponData)     => api.post('/shop-owner/coupons', couponData)

/** Update an existing coupon */
export const updateCoupon = (id, couponData) => api.put(`/shop-owner/coupons/${id}`, couponData)

/** Delete a coupon */
export const deleteCoupon = (id)             => api.delete(`/shop-owner/coupons/${id}`)
