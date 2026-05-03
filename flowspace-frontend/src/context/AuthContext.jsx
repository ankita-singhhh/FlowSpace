import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};


export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('fs_access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('fs_refresh_token'));
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh access token
  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('fs_refresh_token');
    if (!storedRefreshToken) {
      logout();
      return false;
    }

    try {
      const response = await api.post('/auth/refresh', { refreshToken: storedRefreshToken });
      if (response.data.success) {
        const newAccessToken = response.data.data.accessToken;
        localStorage.setItem('fs_access_token', newAccessToken);
        setAccessToken(newAccessToken);
        return true;
      }
    } catch (error) {
      console.error('Failed to refresh token:', error);
      logout();
      return false;
    }
    return false;
  };

  useEffect(() => {
    const storedAccessToken = localStorage.getItem('fs_access_token');
    const storedRefreshToken = localStorage.getItem('fs_refresh_token');
    
    console.log('AuthContext: Tokens found:', !!storedAccessToken, !!storedRefreshToken);
    
    if (storedAccessToken && storedRefreshToken) {
      // Get current user from API
      const getCurrentUser = async () => {
        try {
          const response = await api.get('/auth/me');
          console.log('AuthContext: Current user response:', response.data);
          if (response.data.success) {
            setUser(response.data.data);
            console.log('AuthContext: User set:', response.data.data);
          }
        } catch (error) {
          console.error('AuthContext: Failed to get current user:', error);
          console.error('AuthContext: Error details:', error.response?.data || error.message);
          
          // Try to refresh token if access token is expired
          if (error.response?.status === 401) {
            const refreshed = await refreshAccessToken();
            if (refreshed) {
              // Retry getting current user with new token
              try {
                const retryResponse = await api.get('/auth/me');
                if (retryResponse.data.success) {
                  setUser(retryResponse.data.data);
                }
              } catch (retryError) {
                logout();
              }
            } else {
              logout();
            }
          } else {
            logout();
          }
        } finally {
          setIsLoading(false);
        }
      };

      getCurrentUser();
    } else {
      console.log('AuthContext: No tokens found');
      setIsLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { accessToken, refreshToken, ...userData } = response.data.data;
        
        // Save tokens to localStorage
        localStorage.setItem('fs_access_token', accessToken);
        localStorage.setItem('fs_refresh_token', refreshToken);
        
        // Update state
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Login failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      return { success: false, error: errorMessage };
    }
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      
      if (response.data.success) {
        const { accessToken, refreshToken, ...userData } = response.data.data;
        
        // Save tokens to localStorage
        localStorage.setItem('fs_access_token', accessToken);
        localStorage.setItem('fs_refresh_token', refreshToken);
        
        // Update state
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(userData);
        
        return { success: true };
      } else {
        return { success: false, error: response.data.message || 'Registration failed' };
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Registration failed';
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call logout API endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      // Clear local storage and state
      localStorage.removeItem('fs_access_token');
      localStorage.removeItem('fs_refresh_token');
      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  const value = {
    user,
    accessToken,
    refreshToken,
    isLoading,
    login,
    register,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
