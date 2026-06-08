const Course = require('../models/Course');

// Get all courses with filters
const getCourses = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 50 } = req.query;
    const query = { userId: req.userId, isDraft: false };
    
    let courses = await Course.find(query).sort({ startDate: 1 });
    
    // Filter by status (virtual field)
    if (status && status !== 'All') {
      courses = courses.filter(c => c.status === status);
    }
    
    // Search by name or code
    if (search) {
      const regex = new RegExp(search, 'i');
      courses = courses.filter(c => regex.test(c.name) || regex.test(c.courseCode));
    }
    
    // Pagination
    const start = (page - 1) * limit;
    const paginated = courses.slice(start, start + limit);
    
    res.json({
      success: true,
      count: courses.length,
      totalPages: Math.ceil(courses.length / limit),
      currentPage: page,
      courses: paginated.map(c => ({
        ...c.toJSON(),
        status: c.status,
        endDate: c.endDate,
        progress: c.progress
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get single course
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({
      success: true,
      course: {
        ...course.toJSON(),
        status: course.status,
        endDate: course.endDate,
        progress: course.progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create course
const createCourse = async (req, res) => {
  try {
    const { name, courseCode, startDate, durationDays, participants, description, isDraft } = req.body;
    
    // Check for duplicate course code
    const existing = await Course.findOne({ userId: req.userId, courseCode: courseCode.toUpperCase() });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Course code already exists' });
    }
    
    const course = await Course.create({
      userId: req.userId,
      name,
      courseCode: courseCode.toUpperCase(),
      startDate,
      durationDays,
      participants,
      description: description || '',
      isDraft: isDraft || false
    });
    
    res.status(201).json({
      success: true,
      message: isDraft ? 'Draft saved' : 'Course created',
      course: {
        ...course.toJSON(),
        status: course.status,
        endDate: course.endDate,
        progress: course.progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update course
const updateCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ _id: req.params.id, userId: req.userId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    
    const updates = {
      name: req.body.name || course.name,
      courseCode: req.body.courseCode ? req.body.courseCode.toUpperCase() : course.courseCode,
      startDate: req.body.startDate || course.startDate,
      durationDays: req.body.durationDays || course.durationDays,
      participants: req.body.participants || course.participants,
      description: req.body.description !== undefined ? req.body.description : course.description,
      isDraft: req.body.isDraft !== undefined ? req.body.isDraft : course.isDraft
    };
    
    const updated = await Course.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    
    res.json({
      success: true,
      message: 'Course updated',
      course: {
        ...updated.toJSON(),
        status: updated.status,
        endDate: updated.endDate,
        progress: updated.progress
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete course
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId, isDraft: false });
    
    res.json({
      success: true,
      stats: {
        total: courses.length,
        upcoming: courses.filter(c => c.status === 'Upcoming').length,
        ongoing: courses.filter(c => c.status === 'Ongoing').length,
        completed: courses.filter(c => c.status === 'Completed').length,
        totalParticipants: courses.reduce((sum, c) => sum + c.participants, 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  getDashboardStats
};