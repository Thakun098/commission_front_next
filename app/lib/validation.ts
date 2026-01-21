// Validation functions for Commission Calculator

/**
 * Check if a string is a valid integer
 */
export const isInteger = (value: string): boolean => {
  return /^-?\d+$/.test(value.trim());
};

/**
 * Validate name field - must be non-empty and Thai or English letters only (FR-04)
 */
export const validateName = (name: string): string => {
  // Thai: \u0E00-\u0E7F, English: a-zA-Z, and spaces
  const thaiOrEnglishRegex = /^[a-zA-Z\u0E00-\u0E7F\s]+$/;

  if (name.trim() === "") {
    return "Please enter Employee Name";
  }
  if (!thaiOrEnglishRegex.test(name)) {
    return "Name must be Thai or English letters only";
  }
  return "";
};

/**
 * Validate a numeric field - checks for empty and integer format
 */
export const validateNumericField = (
  value: string,
  fieldName: string,
): string => {
  if (value.trim() === "") {
    return `Please enter ${fieldName}`;
  }
  if (!isInteger(value)) {
    return "Please enter with integer or whole number";
  }
  return "";
};

/**
 * Validate input ranges for locks, stocks, and barrels
 * - Locks: 1-70
 * - Stocks: 1-80
 * - Barrels: 1-90
 */
export const validateInputRanges = (
  locks: number,
  stocks: number,
  barrels: number,
): string[] => {
  const errors: string[] = [];

  if (isNaN(locks) || locks < 1 || locks > 70) {
    errors.push("Locks must be between 1 and 70");
  }
  if (isNaN(stocks) || stocks < 1 || stocks > 80) {
    errors.push("Stocks must be between 1 and 80");
  }
  if (isNaN(barrels) || barrels < 1 || barrels > 90) {
    errors.push("Barrels must be between 1 and 90");
  }

  return errors;
};
