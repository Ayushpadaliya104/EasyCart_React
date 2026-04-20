const Query = require('../models/Query');

const mapQueryResponse = (queryDoc) => ({
  id: queryDoc._id,
  userName: queryDoc.userName,
  userEmail: queryDoc.userEmail,
  subject: queryDoc.subject,
  category: queryDoc.category,
  message: queryDoc.message,
  status: queryDoc.status,
  unreadByAdmin: Boolean(queryDoc.unreadByAdmin),
  unreadByUser: Boolean(queryDoc.unreadByUser),
  createdAt: queryDoc.createdAt,
  replies: (queryDoc.replies || []).map((reply) => ({
    id: reply._id,
    text: reply.text,
    author: reply.author,
    createdAt: reply.createdAt
  }))
});

const getQueries = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}
      : { user: req.user._id };

    const queries = await Query.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: queries.length,
      queries: queries.map(mapQueryResponse)
    });
  } catch (error) {
    return next(error);
  }
};

const createQuery = async (req, res, next) => {
  try {
    const { subject, category, message } = req.body;

    if (!subject || !category || !message) {
      return res.status(400).json({
        success: false,
        message: 'subject, category and message are required'
      });
    }

    const query = await Query.create({
      user: req.user._id,
      userName: req.user.name,
      userEmail: req.user.email,
      subject: String(subject).trim(),
      category: String(category).trim(),
      message: String(message).trim(),
      status: 'Open',
      unreadByAdmin: true,
      unreadByUser: false
    });

    return res.status(201).json({
      success: true,
      message: 'Query submitted successfully',
      query: mapQueryResponse(query)
    });
  } catch (error) {
    return next(error);
  }
};

const addQueryReply = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { replyText, author } = req.body;

    const text = String(replyText || '').trim();
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'replyText is required'
      });
    }

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    if (req.user.role !== 'admin' && String(query.user) !== String(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    query.replies.push({
      text,
      author: author || (req.user.role === 'admin' ? 'Admin' : req.user.name || 'User')
    });
    query.status = 'Answered';
    query.unreadByAdmin = false;
    query.unreadByUser = req.user.role === 'admin';

    await query.save();

    return res.status(200).json({
      success: true,
      message: 'Reply sent successfully',
      query: mapQueryResponse(query)
    });
  } catch (error) {
    return next(error);
  }
};

const updateQueryStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Open', 'Answered', 'Closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status value'
      });
    }

    const query = await Query.findById(id);
    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    query.status = status;
    await query.save();

    return res.status(200).json({
      success: true,
      message: 'Status updated successfully',
      query: mapQueryResponse(query)
    });
  } catch (error) {
    return next(error);
  }
};

const markQueryReadByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const query = await Query.findById(id);

    if (!query) {
      return res.status(404).json({
        success: false,
        message: 'Query not found'
      });
    }

    query.unreadByAdmin = false;
    await query.save();

    return res.status(200).json({
      success: true,
      query: mapQueryResponse(query)
    });
  } catch (error) {
    return next(error);
  }
};

const markQueriesReadByUser = async (req, res, next) => {
  try {
    await Query.updateMany(
      { user: req.user._id, unreadByUser: true },
      { $set: { unreadByUser: false } }
    );

    return res.status(200).json({
      success: true,
      message: 'Queries marked as read'
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = {
  getQueries,
  createQuery,
  addQueryReply,
  updateQueryStatus,
  markQueryReadByAdmin,
  markQueriesReadByUser
};
