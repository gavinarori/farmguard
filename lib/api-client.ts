const API_BASE = 'https://api.weatherai.io/api/v1/free';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Weather endpoints
export async function getWeather(latitude: number, longitude: number) {
  try {
    const response = await fetch(
      `${API_BASE}/weather?latitude=${latitude}&longitude=${longitude}`
    );
    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch weather');
    }
    return data.data;
  } catch (error) {
    console.error('[v0] Weather API error:', error);
    throw error;
  }
}

export async function getWeatherByCity(cityName: string) {
  try {
    const response = await fetch(
      `${API_BASE}/weather?city=${encodeURIComponent(cityName)}`
    );
    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch weather');
    }
    return data.data;
  } catch (error) {
    console.error('[v0] Weather API error:', error);
    throw error;
  }
}


export async function analyzeTree(imageUrl: string) {
  try {
    const response = await fetch(`${API_BASE}/trees/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image_url: imageUrl }),
    });
    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to analyze tree');
    }
    return data.data;
  } catch (error) {
    console.error('[v0] Tree analysis error:', error);
    throw error;
  }
}

export async function getAnalysisHistory(page: number = 1, pageSize: number = 10) {
  try {
    const response = await fetch(
      `${API_BASE}/trees/history?page=${page}&page_size=${pageSize}`
    );
    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch history');
    }
    return data.data;
  } catch (error) {
    console.error('[v0] History API error:', error);
    throw error;
  }
}

export async function getQuotaUsage() {
  try {
    const response = await fetch(`${API_BASE}/trees/quota`);
    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch quota');
    }
    return data.data;
  } catch (error) {
    console.error('[v0] Quota API error:', error);
    throw error;
  }
}

export async function getUsageStats() {
  try {
    const response = await fetch(`${API_BASE}/usage`);
    const data: ApiResponse<any> = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch usage');
    }
    return data.data;
  } catch (error) {
    console.error('[v0] Usage API error:', error);
    throw error;
  }
}
