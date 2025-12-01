/**
 * Formats a number as Indian Rupees (INR)
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string (e.g., "₹1,234.56")
 */
export const formatINR = (amount) => {
  // Handle free/zero case
  if (amount === 0 || amount === '0') return 'Free';
  
  // Format as Indian Rupees with 2 decimal places
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('₹', '₹');
};

/**
 * Formats a price with the INR symbol
 * @param {number} amount - The amount to format
 * @returns {string} Formatted price string with INR symbol
 */
export const formatPrice = (amount) => {
  return amount === 0 || amount === '0' ? 'Free' : `₹${amount}`;
};
