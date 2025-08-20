import type { User } from './user';

export interface AudioRoom {
  id: string;
  title: string;
  is_live: boolean;
  host_id: string;
  created_at: string;
  host?: User;
  active_participants?: number;
  existing_participants?: User[];
}

export interface AudioRoomMessage {
  type: 'chat';
  room_id: string;
  user_id: string;
  username: string;
  message: string;
  timestamp: string;
  isOwn?: boolean;
  status?: 'sending' | 'sent' | 'failed';
  tempId?: string;
}

export interface AudioRoomWebSocketMessage {
  type: 'connected' | 'user_joined' | 'user_left' | 'webrtc_signal' | 'chat' | 'room_deleted' | 'error';
  room_id?: string;
  user_id?: string;
  username?: string;
  message?: string;
  timestamp?: string;
  temp_id?: string;
  from_user_id?: string;
  signal_type?: 'offer' | 'answer' | 'ice-candidate';
  target_user_id?: string;
  data?: any;
  code?: string;
  user?: User;
  existing_participants?: User[];
}

export interface AudioRoomState {
  currentRoom: AudioRoom | null;
  activeRooms: AudioRoom[];
  isConnected: boolean;
  isLoading: boolean;
  messages: AudioRoomMessage[];
  error: string | null;
}