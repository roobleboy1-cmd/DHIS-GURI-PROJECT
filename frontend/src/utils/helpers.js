/**
 * Format a number as currency (USD default or custom symbol)
 * @param {number|string} amount
 * @param {string} currency
 * @returns {string}
 */
export const formatCurrency = (amount, currency = 'USD') => {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return '$0.00';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(amount));
};

/**
 * Format an ISO date string or timestamp into a readable date
 * @param {string|Date} dateInput
 * @param {boolean} includeTime
 * @returns {string}
 */
export const formatDate = (dateInput, includeTime = false) => {
  if (!dateInput) return 'N/A';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(includeTime && { hour: '2-digit', minute: '2-digit' }),
  };

  return new Intl.DateTimeFormat('en-US', options).format(date);
};

/**
 * Return Tailwind CSS color classes for statuses
 * @param {string} status
 * @returns {{ bg: string, text: string, border: string, dot: string }}
 */
export const getStatusColor = (status) => {
  const normalized = (status || '').toLowerCase().trim();

  switch (normalized) {
    case 'approved':
    case 'completed':
    case 'active':
    case 'paid':
    case 'verified':
      return {
        bg: 'bg-emerald-50 dark:bg-emerald-950/40',
        text: 'text-emerald-700 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dot: 'bg-emerald-500',
      };

    case 'pending':
    case 'in_review':
    case 'awaiting_payment':
      return {
        bg: 'bg-amber-50 dark:bg-amber-950/40',
        text: 'text-amber-700 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dot: 'bg-amber-500',
      };

    case 'in_progress':
    case 'started':
    case 'processing':
      return {
        bg: 'bg-blue-50 dark:bg-blue-950/40',
        text: 'text-blue-700 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dot: 'bg-blue-500',
      };

    case 'rejected':
    case 'cancelled':
    case 'failed':
    case 'suspended':
    case 'inactive':
      return {
        bg: 'bg-rose-50 dark:bg-rose-950/40',
        text: 'text-rose-700 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dot: 'bg-rose-500',
      };

    case 'on_hold':
    case 'paused':
      return {
        bg: 'bg-orange-50 dark:bg-orange-950/40',
        text: 'text-orange-700 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        dot: 'bg-orange-500',
      };

    default:
      return {
        bg: 'bg-slate-100 dark:bg-slate-800/60',
        text: 'text-slate-700 dark:text-slate-300',
        border: 'border-slate-200 dark:border-slate-700',
        dot: 'bg-slate-400',
      };
  }
};

/**
 * Truncate long text strings
 * @param {string} text
 * @param {number} length
 * @returns {string}
 */
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

/**
 * Capitalize first letter of string or replace underscores
 * @param {string} str
 * @returns {string}
 */
export const capitalizeFirst = (str) => {
  if (!str) return '';
  const clean = str.replace(/_/g, ' ');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
};

/**
 * Extract error message from API response error object
 * @param {Error} error
 * @returns {string}
 */
export const getErrorMessage = (error) => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.response?.data?.error) {
    return typeof error.response.data.error === 'string'
      ? error.response.data.error
      : JSON.stringify(error.response.data.error);
  }
  if (error?.message) {
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
};
