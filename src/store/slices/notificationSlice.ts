import {
  createSlice,
  createAsyncThunk,
  type PayloadAction,
} from "@reduxjs/toolkit";
import { api } from "../../lib/api";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}

interface NotificationState {
  unreadNotifications: Notification[];
  allNotifications: Notification[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  currentPage: number;
}

const initialState: NotificationState = {
  unreadNotifications: [],
  allNotifications: [],
  isLoading: false,
  error: null,
  hasMore: true,
  currentPage: 1,
};

export const fetchNotifications = createAsyncThunk(
  "notifications/fetchNotifications",
  async (page: number = 1, { rejectWithValue }) => {
    try {
      const response = await api.get(`/notifications?page=${page}`);
      return { data: response.data, page };
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.detail || "Failed to fetch notifications"
      );
    }
  }
);

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setUnreadNotifications: (state, action: PayloadAction<Notification[]>) => {
      state.unreadNotifications = action.payload;
    },
    addNewNotification: (state, action: PayloadAction<Notification>) => {
      state.unreadNotifications.unshift(action.payload);
    },
    clearNotifications: (state) => {
      state.unreadNotifications = [];
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.isLoading = false;
        const { data, page } = action.payload;
        
        if (page === 1) {
          state.allNotifications = data.notifications || [];
        } else {
          state.allNotifications.push(...(data.notifications || []));
        }
        
        state.hasMore = data.hasMore || false;
        state.currentPage = page;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setUnreadNotifications,
  addNewNotification,
  clearNotifications,
  clearError,
} = notificationSlice.actions;

export default notificationSlice.reducer;