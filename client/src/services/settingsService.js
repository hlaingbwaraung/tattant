/**
 * Settings Service
 *
 * API calls for site-wide settings (feature flags).
 */

import api from './api'

/** Get all settings (public) */
export const getAllSettings = () => api.get('/settings')

/** Get a single setting by key (public) */
export const getSetting = (key) => api.get(`/settings/${key}`)

/** Update a setting (admin only) */
export const updateSetting = (key, value) => api.put(`/settings/${key}`, { value })
