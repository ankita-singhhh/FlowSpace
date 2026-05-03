import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export { AuthContext };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(localStorage.getItem('fs_access_token'));
  const [refreshToken, setRefreshToken] = useState(localStorage.getItem('fs_refresh_token'));
  const [isLoading, setIsLoading] = useState(true);

  // 🔁 Refresh Access Token
  const refreshAccessToken = async () => {
    const storedRefreshToken = localStorage.getItem('fs_refresh_token');

    if (!storedRefreshToken) {
      logout();
      return false;
    }

    try {
      const response = await api.post('/auth/refresh', {
        refreshToken: storedRefreshToken
      });

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

  // 🔍 Check user on load
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem('fs_access_token');
      const storedRefreshToken = localStorage.getItem('fs_refresh_token');

      if (!storedAccessToken || !storedRefreshToken) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/me');

        if (response.data.success) {
          setUser(response.data.data);
        }
      } catch (error) {
        if (error.response?.status === 401) {
          const refreshed = await refreshAccessToken();

          if (refreshed) {
            try {
              const retry = await api.get('/auth/me');
              if (retry.data.success) {
                setUser(retry.data.data);
              }
            } catch {
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

    initAuth();
  }, []);

  // 🔐 Login
  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });

      if (response.data.success) {
        const { accessToken, refreshToken, ...userData } = response.data.data;

        localStorage.setItem('fs_access_token', accessToken);
        localStorage.setItem('fs_refresh_token', refreshToken);

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(userData);

        return { success: true };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed'
      };
    }
  };

  // 📝 Register
  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });

      if (response.data.success) {
        const { accessToken, refreshToken, ...userData } = response.data.data;

        localStorage.setItem('fs_access_token', accessToken);
        localStorage.setItem('fs_refresh_token', refreshToken);

        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
        setUser(userData);

        return { success: true };
      }

      return { success: false, error: response.data.message };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed'
      };
    }
  };

  // 🚪 Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('fs_access_token');
      localStorage.removeItem('fs_refresh_token');

      setAccessToken(null);
      setRefreshToken(null);
      setUser(null);
    }
  };

  // 🔄 Update user
  const updateUser = (userData) => {
    setUser(prev => ({ ...prev, ...userData }));
  };

  // ✅ IMPORTANT: token ALWAYS defined
  const token = accessToken || null;

  const value = {
    user,
    accessToken,
    refreshToken,
    token, // ✅ safe now
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