/**
 * Blog controller  –  CRUD for blog articles.
 *
 * Public: getAllBlogs, getBlogBySlug
 * Admin:  getBlogStats, createBlog, updateBlog, deleteBlog
 *
 * Supports bilingual fields: title_my, excerpt_my, content_my.
 */
const { Blog, User } = require('../models')
const { Op } = require('sequelize')

// Get all blogs (public)
exports.getAllBlogs = async (req, res) => {
  try {
    const { category, tag, published, search } = req.query
    const where = {}

    if (category) where.category = category
    if (tag) where.tag = tag
    if (published !== undefined) where.published = published === 'true'
    if (search) {
      where[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { excerpt: { [Op.iLike]: `%${search}%` } }
      ]
    }

    const blogs = await Blog.findAll({
      where,
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }],
      order: [['created_at', 'DESC']]
    })

    res.json({
      success: true,
      total: blogs.length,
      data: blogs
    })
  } catch (error) {
    console.error('Get all blogs error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching blogs',
      data: null
    })
  }
}

// Get single blog by slug (public)
exports.getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params

    const blog = await Blog.findOne({
      where: { slug },
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }]
    })

    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found',
        data: null
      })
    }

    // Increment views
    blog.views += 1
    await blog.save()

    res.json({
      success: true,
      data: blog
    })
  } catch (error) {
    console.error('Get blog by slug error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching blog',
      data: null
    })
  }
}

// Create blog (admin only)
exports.createBlog = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.',
        data: null
      })
    }

    const { title, title_my, emoji, photo, category, tag, excerpt, excerpt_my, content, content_my, read_time, published } = req.body

    // Validate required fields
    if (!title || !category || !tag || !excerpt || !content) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields: title, category, tag, excerpt, content',
        data: null
      })
    }

    // Generate slug from title
    let slug = Blog.generateSlug(title)
    
    // Check if slug already exists and make it unique
    const existingBlog = await Blog.findOne({ where: { slug } })
    if (existingBlog) {
      slug = `${slug}-${Date.now()}`
    }

    const blog = await Blog.create({
      title,
      title_my:   title_my || null,
      slug,
      emoji: emoji || '📝',
      photo: photo || null,
      category,
      tag,
      excerpt,
      excerpt_my: excerpt_my || null,
      content,
      content_my: content_my || null,
      read_time: read_time || '5 min read',
      author_id: req.user.id,
      published: published !== undefined ? published : true
    })

    const createdBlog = await Blog.findByPk(blog.id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }]
    })

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: createdBlog
    })
  } catch (error) {
    console.error('Create blog error:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false,
        error: error.errors.map(e => e.message).join(', '),
        data: null
      })
    }
    res.status(500).json({ 
      success: false,
      error: 'Server error while creating blog',
      data: null
    })
  }
}

// Update blog (admin only)
exports.updateBlog = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.',
        data: null
      })
    }

    const { id } = req.params
    const { title, title_my, emoji, photo, category, tag, excerpt, excerpt_my, content, content_my, read_time, published } = req.body

    const blog = await Blog.findByPk(id)
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found',
        data: null
      })
    }

    // Update slug if title changed
    if (title && title !== blog.title) {
      let newSlug = Blog.generateSlug(title)
      const existingBlog = await Blog.findOne({ 
        where: { 
          slug: newSlug,
          id: { [Op.ne]: id }
        } 
      })
      if (existingBlog) {
        newSlug = `${newSlug}-${Date.now()}`
      }
      blog.slug = newSlug
    }

    // Update fields (EN)
    if (title) blog.title = title
    if (emoji !== undefined) blog.emoji = emoji
    if (photo !== undefined) blog.photo = photo
    if (category) blog.category = category
    if (tag) blog.tag = tag
    if (excerpt) blog.excerpt = excerpt
    if (content) blog.content = content
    if (read_time) blog.read_time = read_time
    if (published !== undefined) blog.published = published

    // Update fields (MY / Burmese)
    if (title_my !== undefined)   blog.title_my   = title_my
    if (excerpt_my !== undefined) blog.excerpt_my = excerpt_my
    if (content_my !== undefined) blog.content_my = content_my

    await blog.save()

    const updatedBlog = await Blog.findByPk(id, {
      include: [{
        model: User,
        as: 'author',
        attributes: ['id', 'name', 'email']
      }]
    })

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    })
  } catch (error) {
    console.error('Update blog error:', error)
    if (error.name === 'SequelizeValidationError') {
      return res.status(400).json({ 
        success: false,
        error: error.errors.map(e => e.message).join(', '),
        data: null
      })
    }
    res.status(500).json({ 
      success: false,
      error: 'Server error while updating blog',
      data: null
    })
  }
}

// Delete blog (admin only)
exports.deleteBlog = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.',
        data: null
      })
    }

    const { id } = req.params

    const blog = await Blog.findByPk(id)
    if (!blog) {
      return res.status(404).json({ 
        success: false,
        error: 'Blog not found',
        data: null
      })
    }

    await blog.destroy()

    res.json({ 
      success: true,
      message: 'Blog deleted successfully',
      data: null
    })
  } catch (error) {
    console.error('Delete blog error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Server error while deleting blog',
      data: null
    })
  }
}

// Get blog statistics (admin only)
exports.getBlogStats = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ 
        success: false,
        error: 'Access denied. Admin only.',
        data: null
      })
    }

    const totalBlogs = await Blog.count()
    const publishedBlogs = await Blog.count({ where: { published: true } })
    const draftBlogs = await Blog.count({ where: { published: false } })
    const totalViews = await Blog.sum('views') || 0

    // Get blogs by category
    const blogsByCategory = await Blog.findAll({
      attributes: [
        'category',
        [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
      ],
      group: ['category']
    })

    res.json({
      success: true,
      data: {
        totalBlogs,
        publishedBlogs,
        draftBlogs,
        totalViews,
        blogsByCategory
      }
    })
  } catch (error) {
    console.error('Get blog stats error:', error)
    res.status(500).json({ 
      success: false,
      error: 'Server error while fetching blog statistics',
      data: null
    })
  }
}
