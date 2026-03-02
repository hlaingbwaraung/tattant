/**
 * Menu Item Service
 *
 * API calls for managing business menu items (shop owner).
 */
import api from './api'

/** Get menu items for a business (shop owner) */
export const getMenuItems = (businessId) =>
  api.get(`/shop-owner/businesses/${businessId}/menu`)

/** Create a menu item */
export const createMenuItem = (businessId, data) =>
  api.post(`/shop-owner/businesses/${businessId}/menu`, data)

/** Update a menu item */
export const updateMenuItem = (businessId, itemId, data) =>
  api.put(`/shop-owner/businesses/${businessId}/menu/${itemId}`, data)

/** Delete a menu item */
export const deleteMenuItem = (businessId, itemId) =>
  api.delete(`/shop-owner/businesses/${businessId}/menu/${itemId}`)

/** Get public menu for a business (no auth) */
export const getPublicMenu = (businessId) =>
  api.get(`/businesses/${businessId}/menu`)
