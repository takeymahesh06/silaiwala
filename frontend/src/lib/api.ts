// API utility functions
export const getApiUrl = () => {
  // Use NEXT_PUBLIC_DJANGO_API_URL if available, otherwise fall back to NEXT_PUBLIC_API_URL
  const apiUrl = process.env.NEXT_PUBLIC_DJANGO_API_URL || process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window !== 'undefined') {
    // Client-side: use the environment variable
    return apiUrl;
  }
  // Server-side: use the environment variable
  return apiUrl;
};

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const baseUrl = getApiUrl();
  const url = `${baseUrl}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  return fetch(url, defaultOptions);
};
