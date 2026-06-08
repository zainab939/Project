// Helper functions for date calculations
const calculateStatus = (startDate, durationDays) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const end = new Date(startDate);
  end.setDate(end.getDate() + durationDays);
  end.setHours(0, 0, 0, 0);
  
  if (today < start) return 'Upcoming';
  if (today >= start && today <= end) return 'Ongoing';
  return 'Completed';
};

const daysUntilStart = (startDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(startDate);
  start.setHours(0, 0, 0, 0);
  
  const diff = start - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const daysRemaining = (startDate, durationDays) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const end = new Date(startDate);
  end.setDate(end.getDate() + durationDays);
  end.setHours(0, 0, 0, 0);
  
  const diff = end - today;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

module.exports = { calculateStatus, daysUntilStart, daysRemaining };
