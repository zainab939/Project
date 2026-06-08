const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { validateCourse } = require('../middleware/validation');
const {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getDashboardStats
} = require('../controllers/courseController');

// All routes require authentication
router.use(protect);

// Stats route
router.get('/stats', getDashboardStats);

// CRUD routes
router.route('/')
  .get(getCourses)
  .post(validateCourse, createCourse);

router.route('/:id')
  .get(getCourseById)
  .put(validateCourse, updateCourse)
  .delete(deleteCourse);

module.exports = router;
