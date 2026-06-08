const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    index: true
  },
  name: {
    type: String,
    required: [true, 'Course name is required'],
    trim: true
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    uppercase: true,
    trim: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  durationDays: {
    type: Number,
    required: [true, 'Duration is required'],
    min: 1,
    max: 365
  },
  participants: {
    type: Number,
    required: [true, 'Participants count is required'],
    min: 1
  },
  description: {
    type: String,
    default: ''
  },
  isDraft: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: calculate end date
courseSchema.virtual('endDate').get(function() {
  if (!this.startDate) return null;
  const end = new Date(this.startDate);
  end.setDate(end.getDate() + this.durationDays);
  return end;
});

// Virtual: calculate status based on current date
courseSchema.virtual('status').get(function() {
  if (!this.startDate || !this.durationDays) return 'Unknown';
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(this.startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = this.endDate;
  end.setHours(0, 0, 0, 0);
  
  if (today < start) return 'Upcoming';
  if (today >= start && today <= end) return 'Ongoing';
  return 'Completed';
});

// Virtual: calculate progress percentage for ongoing courses
courseSchema.virtual('progress').get(function() {
  if (this.status !== 'Ongoing') return null;
  
  const today = new Date();
  const start = new Date(this.startDate);
  const end = this.endDate;
  const total = end - start;
  const elapsed = today - start;
  const percent = (elapsed / total) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
});

module.exports = mongoose.model('Course', courseSchema);

