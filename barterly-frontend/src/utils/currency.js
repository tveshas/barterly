/** Format an amount as Indian rupees, e.g. 1234.5 -> "₹1,234.50". */
export const inr = (n, { decimals = false } = {}) =>
  `₹${Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: decimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
