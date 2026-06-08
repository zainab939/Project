const { body, validationResult } = require('express-validator');

const validateCourse = [
  body('name')
    .notEmpty().withMessage('Course name is required')
    .trim()
    .isLength({ max: 100 }),
  
  body('courseCode')
    .notEmpty().withMessage('Course code is required')
    .trim()
    .isLength({ max: 20 })
    .matches(/^[A-Z0-9-]+$/).withMessage('Use uppercase letters, numbers, and hyphens'),
  
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Invalid date format'),
  
  body('durationDays')
    .notEmpty().withMessage('Duration is required')
    .isInt({ min: 1, max: 365 }),
  
  body('participants')
    .notEmpty().withMessage('Participants count is required')
    .isInt({ min: 1, max: 1000 }),
  
  body('description')
    .optional()
    .isLength({ max: 500 }),
  
  body('isDraft')
    .optional()
    .isBoolean(),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateCourse };
