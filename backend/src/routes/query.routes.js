const express = require('express');
const {
  getQueries,
  createQuery,
  addQueryReply,
  updateQueryStatus,
  markQueryReadByAdmin,
  markQueriesReadByUser
} = require('../controllers/query.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, getQueries);
router.post('/', protect, createQuery);
router.post('/:id/replies', protect, requireAdmin, addQueryReply);
router.patch('/:id/status', protect, requireAdmin, updateQueryStatus);
router.patch('/:id/read/admin', protect, requireAdmin, markQueryReadByAdmin);
router.patch('/read/user', protect, markQueriesReadByUser);

module.exports = router;
