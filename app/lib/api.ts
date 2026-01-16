// API service layer for Commission Calculator
import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// สร้าง axios instance พร้อม config พื้นฐาน
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface CalculateRequest {
  name: string;
  locks: number;
  stocks: number;
  barrels: number;
}

export interface CalculateResponse {
  success: boolean;
  data?: {
    name: string;
    locks: number;
    stocks: number;
    barrels: number;
    sales: number;
    commission: number;
  };
  errors?: string[];
}

/**
 * Calculate commission via API
 */
export const calculateCommission = async (
  request: CalculateRequest
): Promise<CalculateResponse> => {
  try {
    const response = await apiClient.post<CalculateResponse>(
      "/api/commission/calculate",
      request
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {
        success: false,
        errors: [
          `API Error: ${error.response?.status || "Unknown"} ${
            error.response?.statusText || error.message
          }`,
        ],
      };
    }
    return {
      success: false,
      errors: [
        `Network Error: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
    };
  }
};
