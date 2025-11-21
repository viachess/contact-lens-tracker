import { createSlice } from '@reduxjs/toolkit';
import { AuthUser } from './types';
import { initSession, loginWithEmail, logout, signupWithEmail } from './thunks';

interface AuthState {
  user: AuthUser | null;
  status: 'idle' | 'authenticating' | 'authenticated' | 'error';
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  status: 'authenticating',
  error: null
};

const handleAuthPending = (state: AuthState) => {
  state.status = 'authenticating';
  state.error = null;
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(initSession.pending, handleAuthPending)
      .addCase(initSession.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? 'authenticated' : 'idle';
      })
      .addCase(initSession.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          (action.payload as string) ||
          action.error.message ||
          'Failed to init session';
      })
      .addCase(loginWithEmail.pending, handleAuthPending)
      .addCase(loginWithEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? 'authenticated' : 'idle';
      })
      .addCase(loginWithEmail.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          (action.payload as string) || action.error.message || 'Login failed';
      })
      .addCase(signupWithEmail.pending, handleAuthPending)
      .addCase(signupWithEmail.fulfilled, (state, action) => {
        state.user = action.payload;
        state.status = action.payload ? 'authenticated' : 'idle';
      })
      .addCase(signupWithEmail.rejected, (state, action) => {
        state.status = 'error';
        state.error =
          (action.payload as string) || action.error.message || 'Signup failed';
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.status = 'idle';
      })
      .addCase(logout.rejected, (state, action) => {
        state.error =
          (action.payload as string) || action.error.message || 'Logout failed';
      });
  }
});

export const authSliceReducer = authSlice.reducer;
