import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface Auth {
  email: string;
  accessToken: string;
}

interface AuthState {
  auth: Auth; 
}

const initialState: AuthState = {
  auth: {
    email: "",
    accessToken: ""
  }
};

const authSlice = createSlice({
  name: 'doc2product',
  initialState,
  reducers: {
    registerUser: (state, action: PayloadAction<Auth>) => { 
      const { email, accessToken } = action.payload; 
      state.auth = { email, accessToken }; 
    },
    reset: () => initialState,
  },
});

export const { registerUser, reset } = authSlice.actions;

export const selectAuth = (state: { auth: AuthState }) => state.doc2product.auth;

export default authSlice.reducer;