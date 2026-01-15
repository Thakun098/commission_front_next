// API service layer for Commission Calculator

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

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
export const calculateCommission = async (request: CalculateRequest): Promise<CalculateResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/commission/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      return {
        success: false,
        errors: [`API Error: ${response.status} ${response.statusText}`]
      };
    }

    const data = await response.json();
    return data;
  } catch (error) {
    return {
      success: false,
      errors: [`Network Error: ${error instanceof Error ? error.message : 'Unknown error'}`]
    };
  }
};
