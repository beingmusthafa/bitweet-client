import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { AudioRoom, AudioRoomState, AudioRoomMessage } from '../../types/audioroom';

const initialState: AudioRoomState = {
  currentRoom: null,
  activeRooms: [],
  isConnected: false,
  isLoading: false,
  messages: [],
  error: null,
};

const audioroomSlice = createSlice({
  name: 'audioroom',
  initialState,
  reducers: {
    setActiveRooms: (state, action: PayloadAction<AudioRoom[]>) => {
      state.activeRooms = action.payload;
      state.isLoading = false;
    },
    setCurrentRoom: (state, action: PayloadAction<AudioRoom | null>) => {
      state.currentRoom = action.payload;
      if (!action.payload) {
        state.isConnected = false;
        state.messages = [];
      }
    },
    setConnectionStatus: (state, action: PayloadAction<boolean>) => {
      state.isConnected = action.payload;
    },
    addMessage: (state, action: PayloadAction<AudioRoomMessage>) => {
      state.messages.push(action.payload);
    },
    updateMessageStatus: (state, action: PayloadAction<{ tempId: string; status: 'sent' | 'failed'; serverTimestamp?: string }>) => {
      const messageIndex = state.messages.findIndex(msg => msg.tempId === action.payload.tempId);
      if (messageIndex !== -1) {
        // Just update the status and optionally the timestamp, keep everything else the same
        state.messages[messageIndex].status = action.payload.status;
        if (action.payload.serverTimestamp) {
          state.messages[messageIndex].timestamp = action.payload.serverTimestamp;
        }
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    leaveRoom: (state) => {
      state.currentRoom = null;
      state.isConnected = false;
      state.messages = [];
    },
    clearMessages: (state) => {
      state.messages = [];
    },
  },
});

export const {
  setActiveRooms,
  setCurrentRoom,
  setConnectionStatus,
  addMessage,
  updateMessageStatus,
  setLoading,
  setError,
  leaveRoom,
  clearMessages,
} = audioroomSlice.actions;

export default audioroomSlice.reducer;