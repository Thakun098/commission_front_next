import { describe, it, expect } from "vitest";
import {
  isInteger,
  validateName,
  validateNumericField,
  validateInputRanges,
} from "./validation";

/**
 * FR-01: ผู้ใช้งานสามารถระบุจำนวน Stocks, Locks, และ Barrels เป็นตัวเลขจำนวนเต็ม (Integer) ได้
 */
describe("FR-01: Integer Input for Stocks, Locks, Barrels", () => {
  describe("isInteger", () => {
    it("should accept valid positive integers", () => {
      expect(isInteger("1")).toBe(true);
      expect(isInteger("70")).toBe(true);
      expect(isInteger("80")).toBe(true);
      expect(isInteger("90")).toBe(true);
    });

    it("should accept zero", () => {
      expect(isInteger("0")).toBe(true);
    });

    it("should handle whitespace around numbers", () => {
      expect(isInteger(" 50 ")).toBe(true);
    });
  });

  describe("validateNumericField", () => {
    it("should return empty string for valid integer inputs", () => {
      expect(validateNumericField("10", "Locks")).toBe("");
      expect(validateNumericField("50", "Stocks")).toBe("");
      expect(validateNumericField("80", "Barrels")).toBe("");
    });
  });
});

/**
 * FR-03 & FR-04: กรอกข้อมูลพนักงานได้ และอนุญาตให้กรอกชื่อเป็นภาษาไทยหรือภาษาอังกฤษเท่านั้น
 */
describe("FR-03 & FR-04: Employee Name Input (Thai or English only)", () => {
  describe("validateName", () => {
    it("should accept English names", () => {
      expect(validateName("Ekarin")).toBe("");
      expect(validateName("Elentia")).toBe("");
      expect(validateName("John Doe")).toBe("");
    });

    it("should accept Thai names", () => {
      expect(validateName("เอกรินทร์")).toBe("");
      expect(validateName("สมชาย")).toBe("");
      expect(validateName("ฐากูร")).toBe("");
    });

    it("should accept mixed Thai and English (same name)", () => {
      expect(validateName("Ken เคน")).toBe("");
    });

    it("should reject names with numbers", () => {
      expect(validateName("John123")).toBe(
        "Name must be Thai or English letters only",
      );
    });

    it("should reject names with special characters", () => {
      expect(validateName("John@Doe")).toBe(
        "Name must be Thai or English letters only",
      );
      expect(validateName("Test!")).toBe(
        "Name must be Thai or English letters only",
      );
    });

    it("should reject empty name", () => {
      expect(validateName("")).toBe("Please enter Employee Name");
      expect(validateName("   ")).toBe("Please enter Employee Name");
    });
  });
});

/**
 * FR-05: ระบบต้องแสดงข้อความแจ้งเตือนกรณีผู้ใช้งานกรอกค่านอกขอบเขต
 * - Locks: 1-70, Stocks: 1-80, Barrels: 1-90
 */
describe("FR-05: Out of Range Validation", () => {
  describe("validateInputRanges", () => {
    it("should return error for Locks > 70 (e.g., 75)", () => {
      const errors = validateInputRanges(75, 50, 50);
      expect(errors).toContain("Locks must be between 1 and 70");
    });

    it("should return error for Stocks > 80 (e.g., 81)", () => {
      const errors = validateInputRanges(50, 81, 50);
      expect(errors).toContain("Stocks must be between 1 and 80");
    });

    it("should return error for Barrels > 90 (e.g., 99)", () => {
      const errors = validateInputRanges(50, 50, 99);
      expect(errors).toContain("Barrels must be between 1 and 90");
    });

    it("should return error for values below minimum (< 1)", () => {
      const errors = validateInputRanges(0, 0, 0);
      expect(errors.length).toBe(3);
      expect(errors).toContain("Locks must be between 1 and 70");
      expect(errors).toContain("Stocks must be between 1 and 80");
      expect(errors).toContain("Barrels must be between 1 and 90");
    });

    it("should accept valid boundary values (1, 70, 80, 90)", () => {
      expect(validateInputRanges(1, 1, 1)).toEqual([]);
      expect(validateInputRanges(70, 80, 90)).toEqual([]);
    });

    it("should accept middle range values", () => {
      expect(validateInputRanges(35, 40, 45)).toEqual([]);
    });
  });
});

/**
 * FR-06: ระบบต้องแสดงข้อความแจ้งเตือนกรณีรูปแบบข้อมูลไม่ถูกต้อง (ทศนิยม, ตัวอักษร, ค่าว่าง)
 */
describe("FR-06: Invalid Format Validation", () => {
  describe("isInteger - decimal rejection", () => {
    it("should reject decimal numbers", () => {
      expect(isInteger("1.5")).toBe(false);
      expect(isInteger("10.99")).toBe(false);
      expect(isInteger("0.1")).toBe(false);
    });
  });

  describe("isInteger - text rejection", () => {
    it("should reject text/letters", () => {
      expect(isInteger("abc")).toBe(false);
      expect(isInteger("ten")).toBe(false);
      expect(isInteger("12abc")).toBe(false);
    });
  });

  describe("validateNumericField - empty value", () => {
    it("should return error for empty values", () => {
      expect(validateNumericField("", "Locks")).toBe("Please enter Locks");
      expect(validateNumericField("", "Stocks")).toBe("Please enter Stocks");
      expect(validateNumericField("", "Barrels")).toBe("Please enter Barrels");
    });

    it("should return error for whitespace-only values", () => {
      expect(validateNumericField("   ", "Locks")).toBe("Please enter Locks");
    });
  });

  describe("validateNumericField - invalid format", () => {
    it("should return error for decimal numbers", () => {
      expect(validateNumericField("1.5", "Locks")).toBe(
        "Please enter with integer or whole number",
      );
    });

    it("should return error for text input", () => {
      expect(validateNumericField("abc", "Stocks")).toBe(
        "Please enter with integer or whole number",
      );
    });

    it("should return error for mixed text and numbers", () => {
      expect(validateNumericField("12abc", "Barrels")).toBe(
        "Please enter with integer or whole number",
      );
    });
  });

  describe("validateInputRanges - NaN handling", () => {
    it("should return error for NaN values", () => {
      const errors = validateInputRanges(NaN, 50, 50);
      expect(errors).toContain("Locks must be between 1 and 70");
    });
  });
});
