// Validation functions for Commission Calculator

/**
 * Check if a string is a valid integer
 */
export const isInteger = (value: string): boolean => {
  return /^-?\d+$/.test(value.trim());
};

// Validate employee ID
export const validateEmployeeId = (employeeId: string): string => {
  if (employeeId.trim() === "") {
    return "โปรดระบุรหัสพนักงาน";
  }
  if (!isInteger(employeeId)) {
    return "โปรดระบุรหัสพนักงานเป็นตัวเลข";
  }
  return "";
};

/**
 * Validate name field - must be non-empty and Thai or English letters only (FR-04)
 */
export const validateName = (name: string): string => {
  // Thai: \u0E00-\u0E7F, English: a-zA-Z, and spaces
  const thaiOrEnglishRegex = /^[a-zA-Z\u0E00-\u0E7F\s]+$/;

  if (name.trim() === "") {
    return "โปรดระบุชื่อพนักงาน";
  }
  if (!thaiOrEnglishRegex.test(name)) {
    return "ชื่อพนักงานต้องเป็นภาษาไทยหรืออังกฤษเท่านั้น";
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
    return `โปรดระบุ ${fieldName}`;
  }
  if (!isInteger(value)) {
    return "โปรดระบุตัวเลขจำนวนเต็ม";
  }
  if (Number(value) < 0) {
    return "กรุณาระบุเป็นตัวเลขจำนวนเต็ม";
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

  if (Number.isNaN(locks) || locks < 1 || locks > 70) {
    errors.push("โปรดระบุจำนวน Locks");
  }
  if (Number.isNaN(stocks) || stocks < 1 || stocks > 80) {
    errors.push("โปรดระบุจำนวน Stocks");
  }
  if (Number.isNaN(barrels) || barrels < 1 || barrels > 90) {
    errors.push("โปรดระบุจำนวน Barrels");
  }

  return errors;
};
