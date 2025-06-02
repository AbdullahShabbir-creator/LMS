// Get token from localStorage
export const getToken = () => {
  return localStorage.getItem('lms_token');
};

// Set token in localStorage
export const setToken = (token) => {
  if (!token) return false;
  localStorage.setItem('lms_token', token);
  return true;
};

// Check if user is authenticated
export const isAuthenticated = () => {
  const token = getToken();
  if (!token || token.split('.').length !== 3) return false;

  try {
    const payload = getUserInfo();
    if (!payload) return false;

    if (payload.exp && Date.now() >= payload.exp * 1000) {
      logout();
      return false;
    }

    return true;
  } catch {
    return false;
  }
};

// Decode token payload
export const getUserInfo = () => {
  const token = getToken();
  if (!token) return null;

  const parts = token.split('.');
  if (parts.length !== 3) return null;

  try {
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = atob(base64);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

// Get user object (from token or cache)
export const getUser = () => {
  try {
    const cached = localStorage.getItem('user');
    if (cached) return JSON.parse(cached);

    const payload = getUserInfo();
    if (!payload) return null;

    const user = {
      id: payload.id || payload._id,
      name: payload.name,
      email: payload.email,
      role: payload.role
    };

    localStorage.setItem('user', JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
};

// Get user ID
export const getUserId = () => {
  const user = getUser();
  return user?.id || null;
};

// Add token to Authorization header
export const authHeader = () => {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Save user to localStorage
export const setUser = (user) => {
  if (!user) return false;
  localStorage.setItem('user', JSON.stringify(user));
  return true;
};

// Clear auth data and redirect
export const logout = () => {
  localStorage.removeItem('lms_token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

// Handle auth error (e.g., token expired)
export const handleAuthError = (error) => {
  const code = error?.response?.status;
  const message = error?.message?.toLowerCase();
  if (code === 401 || code === 403 || message?.includes('token')) {
    logout();
    return true;
  }
  return false;
};

// Generate fake token for dev mode
export const generateTestToken = (role = 'student') => {
  if (process.env.NODE_ENV !== 'development') return null;

  const now = Math.floor(Date.now() / 1000);
  const payload = {
    id: `test-${role}-${Math.random().toString(36).slice(2, 10)}`,
    email: `${role}@example.com`,
    name: `Test ${role.charAt(0).toUpperCase() + role.slice(1)}`,
    role,
    iat: now,
    exp: now + 86400
  };

  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const content = btoa(JSON.stringify(payload));
  const signature = btoa('fake-signature');

  const token = `${header}.${content}.${signature}`;
  localStorage.setItem('lms_token', token);
  setUser(payload);

  return token;
};
