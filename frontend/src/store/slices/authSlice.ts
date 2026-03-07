import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface OwnerSubscription {
    id: string;
    ownerId: string;
    planName: 'FREE_TRIAL' | 'PROFESSIONAL';
    trialStartDate: string;
    trialEndDate: string;
    status: 'TRIAL' | 'ACTIVE' | 'EXPIRED';
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED';
    nextBillingDate?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    role: 'STUDENT' | 'OWNER' | 'ADMIN';
    avatar?: string;
    profile_image?: string;
    created_at?: string;
    ownerSubscription?: OwnerSubscription;
}

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

const initialState: AuthState = {
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: false,
    isLoading: false,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; token: string }>) => {
            state.user = action.payload.user;
            state.token = action.payload.token;
            state.isAuthenticated = true;
            localStorage.setItem('token', action.payload.token);
        },
        logout: (state) => {
            state.user = null;
            state.token = null;
            state.isAuthenticated = false;
            localStorage.removeItem('token');
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
        updateAuthUser: (state, action: PayloadAction<Partial<User>>) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const { setCredentials, logout, setLoading, updateAuthUser } = authSlice.actions;
export default authSlice.reducer;
