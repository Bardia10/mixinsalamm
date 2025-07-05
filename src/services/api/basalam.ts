import { api, handleApiError } from './config'
import type { BasalamCredentials, BasalamProduct, BasalamUserData, BasalamProductsResponse } from '../../types'
import { AxiosError } from 'axios'

export const basalamApi = {
  getUserData: async (credentials: BasalamCredentials): Promise<BasalamUserData | null> => {
    try {
      const response = await api.get('/basalam/client/me', {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      })
      return response.data
    } catch (error) {
      console.error('Error fetching user data:', error)
      return null
    }
  },

  getProducts: async (credentials: BasalamCredentials, vendorId: number): Promise<BasalamProduct[]> => {
    try {
      console.log('=== Basalam Products Request Debug ===');
      console.log('Vendor ID:', vendorId);
      console.log('Access Token:', credentials.access_token);
      console.log('Full Request URL:', `https://mixinsalam.onrender.com/products/my-basalam-products/${vendorId}`);
      console.log('Request Headers:', {
        Authorization: `Bearer ${credentials.access_token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      });
      console.log('Request Params:', { basalam_page: 1 });
      
      const response = await api.get<BasalamProductsResponse>(`/products/my-basalam-products/${vendorId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        params: {
          basalam_page: 1,
        },
      });

      console.log('=== Basalam Products Response Debug ===');
      console.log('Response Status:', response.status);
      console.log('Response Headers:', response.headers);
      console.log('Raw Response Data:', response.data);

      if (!response.data) {
        console.error('No data received in response');
        return [];
      }

      // Return the data array from the response
      if (response.data.data && Array.isArray(response.data.data)) {
        console.log('Returning data array from response.data.data');
        // Validate each product has required fields
        const validProducts = response.data.data.filter(product => {
          if (!product || typeof product !== 'object') {
            console.error('Invalid product:', product);
            return false;
          }
          if (!product.id || !product.title || typeof product.price !== 'number') {
            console.error('Product missing required fields:', product);
            return false;
          }
          return true;
        });
        return validProducts;
      }

      console.error('Unexpected response format:', response.data);
      return [];
    } catch (error) {
      console.error('=== Basalam Products Error Debug ===');
      console.error('Error:', error);
      if (error instanceof AxiosError && error.response) {
        console.error('Error Response Data:', error.response.data);
        console.error('Error Status:', error.response.status);
        console.error('Error Headers:', error.response.headers);
        console.error('Request Config:', {
          url: error.config?.url,
          method: error.config?.method,
          headers: error.config?.headers,
          params: error.config?.params
        });

        // Handle specific error cases
        if (error.response.status === 404) {
          console.error('Product endpoint not found. Please check the API endpoint.');
        } else if (error.response.status === 401) {
          console.error('Unauthorized. Please check your access token.');
        } else if (error.response.status === 403) {
          console.error('Forbidden. You may not have permission to access these products.');
        }
      }
      return [];
    }
  },

  getProductById: async (credentials: BasalamCredentials, productId: number): Promise<BasalamProduct | null> => {
    try {
      const response = await api.get(`/products/basalam/${productId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      })
      return response.data || null
    } catch (error) {
      console.error('Error fetching Basalam product:', error)
      return null
    }
  },

  updateProduct: async (credentials: BasalamCredentials, productId: number, productData: { name: string; price: number }) => {
    try {
    const formData = new FormData()
    formData.append('name', productData.name)
    formData.append('price', productData.price.toString())

      const response = await api.patch(
        `/products/update/basalam/${productId}`,
        formData,
      {
        headers: {
            'Authorization': `Bearer ${credentials.access_token}`,
            'Content-Type': 'multipart/form-data'
          }
      }
    )

      if (!response.data) {
        throw new Error('No data received in response')
      }

      return response.data
    } catch (error) {
      console.error('Error updating Basalam product:', error)
      if (error instanceof AxiosError && error.response) {
        console.error('Error response:', error.response.data)
        console.error('Error status:', error.response.status)
        throw new Error(error.response.data?.message || 'Failed to update Basalam product')
      }
      throw new Error('Failed to update Basalam product')
    }
  }
}