import api from './api'

export const getCategories = () => {
  return api.get('/categories')
}

export const getCategoryBySlug = (slug) => {
  return api.get(`/categories/${slug}`)
}
