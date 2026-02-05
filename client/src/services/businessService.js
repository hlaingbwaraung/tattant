import api from './api'

export const getBusinesses = (params) => {
  return api.get('/businesses', { params })
}

export const getBusinessById = (id) => {
  return api.get(`/businesses/${id}`)
}
