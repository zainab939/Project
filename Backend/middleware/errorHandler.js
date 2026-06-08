const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);
  
  // MongoDB duplicate key error
  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered',
      field: Object.keys(err.keyPattern)[0]
    });
  }
  
  // MongoDB validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }
  
  // Default error
  res.status(500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
};

module.exports = errorHandler;
