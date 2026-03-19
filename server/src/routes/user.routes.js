const express = require('express');
const { getUsers, deleteUser } = require('../controllers/user.controller');
const { protect, requireAdmin } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', protect, requireAdmin, getUsers);
router.delete('/:id', protect, requireAdmin, deleteUser);

module.exports = router;
