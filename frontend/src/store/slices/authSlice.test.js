import { configureStore } from '@reduxjs/toolkit';
import authReducer, {
  logout,
  clearError,
  registerUser,
  loginUser,
  loadUser,
} from './authSlice';
import API from '../../services/api';

const mockUser = { _id: 'user123', name: 'Test User', email: 'test@example.com' };
const mockToken = 'fake-jwt-token';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}));

describe('authSlice', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initial state', () => {
    test('should return initial state when no token in localStorage', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state).toEqual({
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      });
    });

    test('should derive isAuthenticated from token via initial state', () => {
      // The initial state reads localStorage at module import time.
      // This test verifies the reducer starts with expected defaults
      // when localStorage is empty (as in test environment).
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });
  });

  describe('logout reducer', () => {
    test('should clear entire auth state and remove token from localStorage', () => {
      localStorage.setItem('token', mockToken);
      const initialState = {
        token: mockToken,
        isAuthenticated: true,
        user: mockUser,
        loading: false,
        error: null,
      };

      const state = authReducer(initialState, logout());

      expect(state.token).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.error).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('clearError reducer', () => {
    test('should set error to null when there is an error', () => {
      const initialState = {
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: 'Some error message',
      };

      const state = authReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });

    test('should remain null when error is already null', () => {
      const initialState = {
        token: null,
        isAuthenticated: false,
        user: null,
        loading: false,
        error: null,
      };

      const state = authReducer(initialState, clearError());
      expect(state.error).toBeNull();
    });
  });

  describe('registerUser async thunk', () => {
    let store;

    beforeEach(() => {
      store = configureStore({ reducer: { auth: authReducer } });
    });

    test('pending should set loading to true and clear error', () => {
      const state = authReducer(
        { token: null, isAuthenticated: false, user: null, loading: false, error: 'old error' },
        { type: registerUser.pending.type }
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fulfilled should set user, token, and authenticated state', async () => {
      API.post.mockResolvedValue({ data: { token: mockToken, user: mockUser } });

      await store.dispatch(registerUser({ name: 'Test', email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    test('rejected should set error and keep unauthenticated', async () => {
      const errorMessage = 'Registration failed';
      API.post.mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      await store.dispatch(registerUser({ name: 'Test', email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    test('rejected should use fallback error when no response error', async () => {
      API.post.mockRejectedValue(new Error('Network error'));

      await store.dispatch(registerUser({ name: 'Test', email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Registration failed');
    });
  });

  describe('loginUser async thunk', () => {
    let store;

    beforeEach(() => {
      store = configureStore({ reducer: { auth: authReducer } });
    });

    test('pending should set loading to true and clear error', () => {
      const state = authReducer(
        { token: null, isAuthenticated: false, user: null, loading: false, error: 'old error' },
        { type: loginUser.pending.type }
      );
      expect(state.loading).toBe(true);
      expect(state.error).toBeNull();
    });

    test('fulfilled should set user, token, and authenticated state', async () => {
      API.post.mockResolvedValue({ data: { token: mockToken, user: mockUser } });

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.token).toBe(mockToken);
      expect(state.user).toEqual(mockUser);
      expect(localStorage.getItem('token')).toBe(mockToken);
    });

    test('rejected should set error and keep unauthenticated', async () => {
      const errorMessage = 'Invalid credentials';
      API.post.mockRejectedValue({
        response: { data: { error: errorMessage } },
      });

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'wrong' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe(errorMessage);
    });

    test('rejected should use fallback error when no response error', async () => {
      API.post.mockRejectedValue(new Error('Network error'));

      await store.dispatch(loginUser({ email: 'test@example.com', password: 'password123' }));

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Login failed');
    });
  });

  describe('loadUser async thunk', () => {
    let store;

    beforeEach(() => {
      store = configureStore({ reducer: { auth: authReducer } });
    });

    test('pending should set loading to true', () => {
      const state = authReducer(
        { token: null, isAuthenticated: false, user: null, loading: false, error: null },
        { type: loadUser.pending.type }
      );
      expect(state.loading).toBe(true);
    });

    test('fulfilled should set user and authenticated state', async () => {
      API.get.mockResolvedValue({ data: { user: mockUser } });

      await store.dispatch(loadUser());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    test('rejected should clear everything and remove token', async () => {
      localStorage.setItem('token', mockToken);
      API.get.mockRejectedValue({
        response: { data: { error: 'Token expired' } },
      });

      await store.dispatch(loadUser());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.user).toBeNull();
      expect(state.token).toBeNull();
      expect(state.error).toBe('Token expired');
      expect(localStorage.getItem('token')).toBeNull();
    });

    test('rejected should use fallback error message', async () => {
      API.get.mockRejectedValue(new Error('Network error'));

      await store.dispatch(loadUser());

      const state = store.getState().auth;
      expect(state.loading).toBe(false);
      expect(state.error).toBe('Session expired');
    });
  });
});
