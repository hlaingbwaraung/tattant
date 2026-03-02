/**
 * Contact Message Controller
 *
 * Handles CRUD operations for contact form messages:
 *  - submitMessage   – Any authenticated user submits a contact message
 *  - getMyMessages   – User views their own sent messages
 *  - getAllMessages   – Admin lists all contact messages (with filters)
 *  - markAsRead      – Admin marks a message as read
 *  - replyToMessage  – Admin replies to a message
 *  - deleteMessage   – Admin deletes a message
 */
const { ContactMessage, User } = require('../models')

// Submit a contact message (any authenticated user)
exports.submitMessage = async (req, res) => {
  try {
    const { subject, message, category, photos } = req.body

    if (!subject || !message) {
      return res.status(400).json({ message: 'Subject and message are required.' })
    }

    // Validate photos (max 5, each under 5MB base64)
    let validPhotos = []
    if (photos && Array.isArray(photos)) {
      validPhotos = photos.slice(0, 5).filter(p => typeof p === 'string' && p.startsWith('data:image/'))
    }

    const contactMessage = await ContactMessage.create({
      user_id: req.user.id,
      subject: subject.trim(),
      message: message.trim(),
      category: category || 'general',
      photos: validPhotos
    })

    res.status(201).json({ message: 'Message sent successfully.', contactMessage })
  } catch (error) {
    console.error('Submit contact message error:', error)
    res.status(500).json({ message: 'Server error submitting message.' })
  }
}

// Get current user's messages
exports.getMyMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    })

    res.json({ messages })
  } catch (error) {
    console.error('Get my messages error:', error)
    res.status(500).json({ message: 'Server error fetching messages.' })
  }
}

// Get all messages (admin only)
exports.getAllMessages = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { status, category } = req.query
    const where = {}
    if (status) where.status = status
    if (category) where.category = category

    const messages = await ContactMessage.findAll({
      where,
      include: [
        { model: User, as: 'sender', attributes: ['id', 'name', 'email', 'is_shop_owner', 'premium_type'] }
      ],
      order: [['created_at', 'DESC']]
    })

    const counts = {
      total: await ContactMessage.count(),
      unread: await ContactMessage.count({ where: { status: 'unread' } }),
      read: await ContactMessage.count({ where: { status: 'read' } }),
      replied: await ContactMessage.count({ where: { status: 'replied' } }),
      archived: await ContactMessage.count({ where: { status: 'archived' } })
    }

    res.json({ messages, counts })
  } catch (error) {
    console.error('Get all messages error:', error)
    res.status(500).json({ message: 'Server error fetching messages.' })
  }
}

// Mark message as read (admin only)
exports.markAsRead = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { messageId } = req.params
    const msg = await ContactMessage.findByPk(messageId)

    if (!msg) return res.status(404).json({ message: 'Message not found.' })

    msg.status = 'read'
    await msg.save()

    res.json({ message: 'Message marked as read.', contactMessage: msg })
  } catch (error) {
    console.error('Mark as read error:', error)
    res.status(500).json({ message: 'Server error updating message.' })
  }
}

// Reply to a message (admin only)
exports.replyToMessage = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { messageId } = req.params
    const { admin_reply } = req.body

    if (!admin_reply) {
      return res.status(400).json({ message: 'Reply text is required.' })
    }

    const msg = await ContactMessage.findByPk(messageId)
    if (!msg) return res.status(404).json({ message: 'Message not found.' })

    msg.admin_reply = admin_reply.trim()
    msg.status = 'replied'
    msg.replied_by = req.user.id
    msg.replied_at = new Date()
    await msg.save()

    res.json({ message: 'Reply sent successfully.', contactMessage: msg })
  } catch (error) {
    console.error('Reply to message error:', error)
    res.status(500).json({ message: 'Server error replying to message.' })
  }
}

// Delete a message (admin only)
exports.deleteMessage = async (req, res) => {
  try {
    if (!req.user.is_admin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' })
    }

    const { messageId } = req.params
    const msg = await ContactMessage.findByPk(messageId)

    if (!msg) return res.status(404).json({ message: 'Message not found.' })

    await msg.destroy()
    res.json({ message: 'Message deleted successfully.' })
  } catch (error) {
    console.error('Delete message error:', error)
    res.status(500).json({ message: 'Server error deleting message.' })
  }
}
