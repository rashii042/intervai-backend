// Helper functions
const formatDate = (date) => {
  return date.toISOString().split('T')[0];
};

const calculateScore = (responses) => {
  // Simple scoring logic
  return responses.length * 2;
};

module.exports = { formatDate, calculateScore };