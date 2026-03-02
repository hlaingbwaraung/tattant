/**
 * Contact Message Service
 *
 * API calls for contact form / messages feature.
 */
import api from './api'

// Submit a contact message
export const submitContactMessage = (data) => api.post('/contact', data)

// Get current user's messages
export const getMyContactMessages = () => api.get('/contact/my')

// Admin: Get all messages (with optional filters)
export const getAllContactMessages = (status) =>
  api.get('/contact/all', { params: status ? { status } : {} })

// Admin: Mark message as read
export const markMessageAsRead = (messageId) =>
  api.patch(`/contact/${messageId}/read`)

// Admin: Reply to a message
export const replyToMessage = (messageId, admin_reply) =>
  api.patch(`/contact/${messageId}/reply`, { admin_reply })

// Admin: Delete a message
export const deleteContactMessage = (messageId) =>
  api.delete(`/contact/${messageId}`)
