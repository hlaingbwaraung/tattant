/**
 * Blog Model
 * 
 * Represents a blog article / guide about Japan.
 * Supports bilingual content (English + Burmese).
 * 
 * Associations:
 *   - belongsTo User (author)
 * 
 * Categories: Culture | Travel Tips | Food & Drink | Etiquette | Seasons | Practical
 */

const { DataTypes } = require('sequelize')
const { sequelize } = require('../config/database')

/* ---------- valid options for category & tag columns ---------- */
const VALID_CATEGORIES = ['Culture', 'Travel Tips', 'Food & Drink', 'Etiquette', 'Seasons', 'Practical']
const VALID_TAGS       = ['culture', 'travel', 'food', 'etiquette', 'seasons', 'practical']

const Blog = sequelize.define('Blog', {
  /* --- Primary key --- */
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  /* --- Title (English, required) --- */
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Title is required' },
      len: { args: [3, 255], msg: 'Title must be between 3 and 255 characters' }
    }
  },

  /* --- Title (Burmese, optional) --- */
  title_my: {
    type: DataTypes.STRING(255),
    allowNull: true
  },

  /* --- URL-safe slug (auto-generated from title) --- */
  slug: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      notEmpty: { msg: 'Slug is required' }
    }
  },

  /* --- Decorative emoji shown alongside the blog card --- */
  emoji: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: '📝'
  },

  /* --- Hero / thumbnail photo URL --- */
  photo: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  /* --- Display category (title-cased) --- */
  category: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Category is required' },
      isIn: { args: [VALID_CATEGORIES], msg: 'Invalid category' }
    }
  },

  /* --- Filter tag (lower-cased version of category) --- */
  tag: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Tag is required' },
      isIn: { args: [VALID_TAGS], msg: 'Invalid tag' }
    }
  },

  /* --- Short excerpt / summary (English, required) --- */
  excerpt: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Excerpt is required' },
      len: { args: [10, 500], msg: 'Excerpt must be between 10 and 500 characters' }
    }
  },

  /* --- Short excerpt / summary (Burmese, optional) --- */
  excerpt_my: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  /* --- Full article body – HTML allowed (English, required) --- */
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      notEmpty: { msg: 'Content is required' }
    }
  },

  /* --- Full article body (Burmese, optional) --- */
  content_my: {
    type: DataTypes.TEXT,
    allowNull: true
  },

  /* --- Estimated reading time, e.g. "5 min read" --- */
  read_time: {
    type: DataTypes.STRING(20),
    allowNull: false,
    defaultValue: '5 min read'
  },

  /* --- Author (FK → users.id) --- */
  author_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: { model: 'users', key: 'id' }
  },

  /* --- Visibility flag --- */
  published: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },

  /* --- Page-view counter --- */
  views: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: 'blogs',
  underscored: true,
  timestamps: true
})

/* ---------- Static helpers ---------- */

/**
 * Generate a URL-safe slug from a blog title.
 * @param {string} title - The blog title
 * @returns {string} Slugified string
 */
Blog.generateSlug = function (title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')   // strip non-word chars (except spaces & hyphens)
    .replace(/[\s_-]+/g, '-')   // collapse whitespace / underscores to single hyphen
    .replace(/^-+|-+$/g, '')    // trim leading/trailing hyphens
}

module.exports = Blog
