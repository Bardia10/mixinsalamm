import axios from 'axios'

export const BASE_URL = 'https://mixinsalam.onrender.com'

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', {
      url: response.config.url,
      method: response.config.method,
      status: response.status,
      data: response.data,
      headers: response.headers
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export interface ApiError {
  message: string
}

export const handleApiError = (error: unknown): never => {
  const message = error instanceof Error ? error.message : 'An unknown error occurred'
  throw new Error(message)
}