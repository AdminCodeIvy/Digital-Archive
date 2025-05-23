
// Helper functions for working with invoice dates and filtering

/**
 * Get the start of the current month
 */
export const getCurrentMonthStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

/**
 * Get the start of the last month
 */
export const getLastMonthStart = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - 1, 1);
};

/**
 * Get the end of the last month
 */
export const getLastMonthEnd = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 0);
};

/**
 * Check if a date falls within the current month
 */
export const isCurrentMonth = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const now = new Date();
  
  return date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear();
};

/**
 * Check if a date falls within the last month
 */
export const isLastMonth = (dateStr?: string): boolean => {
  if (!dateStr) return false;
  
  const date = new Date(dateStr);
  const now = new Date();
  let lastMonth = now.getMonth() - 1;
  let year = now.getFullYear();
  
  if (lastMonth < 0) {
    lastMonth = 11;
    year--;
  }
  
  return date.getMonth() === lastMonth && 
         date.getFullYear() === year;
};
