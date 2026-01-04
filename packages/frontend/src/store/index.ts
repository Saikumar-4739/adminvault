import { configureStore } from '@reduxjs/toolkit';
import iamReducer from './slices/iamSlice';
import employeesReducer from './slices/employeesSlice';
import authReducer from './slices/authSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        iam: iamReducer,
        employees: employeesReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Ignore these action types
                ignoredActions: ['auth/loginUser/fulfilled', 'iam/setUsers', 'employees/setEmployees'],
            },
        }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
