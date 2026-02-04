import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistReducer, persistStore } from "redux-persist";
import storage from "redux-persist/lib/storage";
import authReducer from "./slices/authSlice";

const rootReducer = combineReducers({
    auth: authReducer,
    // Thêm các reducer khác ở đây nếu cần
});

const persistConfig = {
    key: "root",
    storage,
    whitelist: ["auth"], // Chỉ lưu trữ slice 'auth'
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
    reducer: persistedReducer,
});

// Tạo persistor để sử dụng trong ứng dụng
export const persistor = persistStore(store);

// Kiểu RootState và AppDispatch để sử dụng trong toàn bộ ứng dụng
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;