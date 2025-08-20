import { useEffect, useRef, useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { api } from "../lib/api";
import {
  setActiveRooms,
  setCurrentRoom,
  setConnectionStatus,
  addMessage,
  updateMessageStatus,
  setLoading,
  setError,
  leaveRoom,
} from "../store/slices/audioroomSlice";
import type { AudioRoomWebSocketMessage } from "../types/audioroom";

const WS_BASE_URL = import.meta.env.VITE_WS_URL;

export const useAudioRoom = () => {
  const dispatch = useDispatch();
  const audioRoomState = useSelector((state: RootState) => state.audioroom);
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const wsRef = useRef<WebSocket | null>(null);
  const isConnectingRef = useRef<boolean>(false);
  const [connectionState, setConnectionState] = useState<
    "disconnected" | "connecting" | "connected" | "error"
  >("disconnected");

  // Fetch active rooms
  const fetchActiveRooms = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const response = await api.get("/api/rooms/active");
      dispatch(setActiveRooms(response.data.rooms));
    } catch (error: any) {
      dispatch(
        setError(error.response?.data?.detail || "Failed to fetch rooms")
      );
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  // Fetch room details
  const fetchRoomDetails = useCallback(
    async (id: string) => {
      try {
        dispatch(setLoading(true));
        const response = await api.get(`/api/rooms/${id}`);
        return response.data;
      } catch (error: any) {
        dispatch(
          setError(
            error.response?.data?.detail || "Failed to fetch room details"
          )
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch]
  );

  // Create room
  const createRoom = useCallback(
    async (title: string) => {
      try {
        dispatch(setLoading(true));
        const response = await api.post("/api/rooms/", { title });
        await fetchActiveRooms();
        return response.data;
      } catch (error: any) {
        dispatch(
          setError(error.response?.data?.detail || "Failed to create room")
        );
        throw error;
      } finally {
        dispatch(setLoading(false));
      }
    },
    [dispatch, fetchActiveRooms]
  );

  // Delete room (host only)
  const deleteRoom = useCallback(
    async (id: string) => {
      try {
        await api.delete(`/api/rooms/${id}`);
        dispatch(leaveRoom());
        await fetchActiveRooms();
      } catch (error: any) {
        dispatch(
          setError(error.response?.data?.detail || "Failed to delete room")
        );
        throw error;
      }
    },
    [dispatch, fetchActiveRooms]
  );

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback(
    (event: MessageEvent) => {
      const message: AudioRoomWebSocketMessage = JSON.parse(event.data);

      switch (message.type) {
        case "connected":
          console.log("Connected to room:", message.room_id);
          dispatch(setConnectionStatus(true));
          setConnectionState("connected");

          // If existing participants are provided, dispatch event to initialize them
          if (
            message.existing_participants &&
            message.existing_participants.length > 0
          ) {
            window.dispatchEvent(
              new CustomEvent("existing_participants", {
                detail: {
                  participants: message.existing_participants,
                  room_id: message.room_id,
                },
              })
            );
          }
          break;

        case "user_joined":
          console.log("User joined:", message.user?.username);
          window.dispatchEvent(
            new CustomEvent("user_joined", { detail: message })
          );
          break;

        case "user_left":
          console.log("User left:", message.user?.username);
          window.dispatchEvent(
            new CustomEvent("user_left", { detail: message })
          );
          break;

        case "chat":
          if (
            message.room_id &&
            message.user_id &&
            message.username &&
            message.message &&
            message.timestamp
          ) {
            console.log("[CHAT] Received chat message from:", message.username);
            console.log("[CHAT] Message temp_id from server:", message.temp_id);

            const isOwnMessage = message.user_id === currentUser?.id;

            // If server included temp_id and it's our own message, try to update existing optimistic message
            if (message.temp_id && isOwnMessage) {
              console.log(
                "[CHAT] Server confirming our own message with temp_id:",
                message.temp_id
              );
              // Try to update the existing optimistic message status to 'sent'
              dispatch(
                updateMessageStatus({
                  tempId: message.temp_id,
                  status: "sent",
                  serverTimestamp: message.timestamp,
                })
              );
            } else {
              // Either no temp_id or it's from another user - add as new message
              console.log("[CHAT] Adding new message from:", message.username);
              dispatch(
                addMessage({
                  type: "chat",
                  room_id: message.room_id,
                  user_id: message.user_id,
                  username: message.username,
                  message: message.message,
                  timestamp: message.timestamp,
                  isOwn: isOwnMessage,
                  status: "sent",
                })
              );
            }
          }
          break;

        case "room_deleted":
          console.log("Room was deleted by host");
          dispatch(setError("Room was deleted by the host"));
          dispatch(leaveRoom());
          break;

        case "webrtc_signal":
          // This will be handled by the WebRTC hook
          window.dispatchEvent(
            new CustomEvent("webrtc_signal", { detail: message })
          );
          break;

        case "error":
          console.error(
            "WebSocket error:",
            message.message,
            "Code:",
            message.code
          );

          // Handle specific error codes
          switch (message.code) {
            case "AUTH_FAILED":
              dispatch(setError("Authentication failed. Please log in again."));
              // Could redirect to login here
              break;
            case "ROOM_NOT_FOUND":
              dispatch(setError("Room not found or has been deleted."));
              break;
            case "ROOM_NOT_LIVE":
              dispatch(setError("Room is not currently active."));
              break;
            default:
              dispatch(
                setError(message.message || "Connection error occurred")
              );
          }

          setConnectionState("error");
          break;
      }
    },
    [dispatch]
  );

  // Connect to room WebSocket
  const connectToRoom = useCallback(
    async (id: string) => {
      try {
        // Prevent multiple simultaneous connections
        if (
          isConnectingRef.current ||
          (wsRef.current && wsRef.current.readyState === WebSocket.CONNECTING)
        ) {
          console.log(
            "[CLIENT] Connection already in progress, skipping duplicate attempt"
          );
          return;
        }

        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          console.log("[CLIENT] Already connected, skipping duplicate attempt");
          return;
        }

        isConnectingRef.current = true;
        console.log("[CLIENT] Starting connection process for room:", id);

        // Fetch room details first
        const roomData = await fetchRoomDetails(id);
        dispatch(setCurrentRoom(roomData));

        // Close existing connection if any
        if (wsRef.current) {
          console.log(
            "[CLIENT] Closing existing WebSocket before new connection"
          );
          wsRef.current.close();
          wsRef.current = null;
        }

        // Connect to WebSocket
        setConnectionState("connecting");
        const wsUrl = `${WS_BASE_URL}/api/rooms/ws/${id}`;
        console.log("[CLIENT] Initiating WebSocket connection to:", wsUrl);
        console.log("[CLIENT] Connection attempt initiated by client");
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
          console.log("[OPEN] WebSocket connection established successfully");
          console.log("[OPEN] Connected to room:", id);
          console.log(
            "[OPEN] WebSocket ready state:",
            wsRef.current?.readyState
          );
          isConnectingRef.current = false;
          dispatch(setConnectionStatus(true));
          setConnectionState("connected");
        };

        wsRef.current.onmessage = handleWebSocketMessage;

        wsRef.current.onclose = (event) => {
          console.log("[CLOSE] WebSocket connection closed");
          console.log("[CLOSE] Close code:", event.code);
          console.log(
            "[CLOSE] Close reason:",
            event.reason || "No reason provided"
          );
          console.log("[CLOSE] Was clean closure:", event.wasClean);
          console.log("[CLOSE] Event details:", {
            code: event.code,
            reason: event.reason,
            wasClean: event.wasClean,
            type: event.type,
            timeStamp: event.timeStamp,
          });

          isConnectingRef.current = false;
          dispatch(setConnectionStatus(false));
          setConnectionState("disconnected");
        };

        wsRef.current.onerror = (error) => {
          console.error("[ERROR] WebSocket error event:", error);
          isConnectingRef.current = false;
          dispatch(setError("Failed to connect to room"));
          setConnectionState("error");
        };
      } catch (error: any) {
        console.error("[ERROR] Failed to connect to room:", error);
        isConnectingRef.current = false;
        dispatch(setError(error.message || "Failed to connect to room"));
        setConnectionState("error");
        throw error;
      }
    },
    [dispatch, fetchRoomDetails, handleWebSocketMessage]
  );

  // Send WebSocket message
  const sendWebSocketMessage = useCallback((message: any) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    }
  }, []);

  // Send chat message
  const sendChatMessage = useCallback(
    (message: string) => {
      if (!currentUser) {
        console.error("[CHAT] Cannot send message - no current user");
        return;
      }

      const tempId = `temp_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;
      const timestamp = new Date().toISOString();

      console.log("[CHAT] Sending message with tempId:", tempId);

      // Add message optimistically
      dispatch(
        addMessage({
          type: "chat",
          room_id: audioRoomState.currentRoom?.id || "",
          user_id: currentUser.id,
          username: currentUser.username,
          message,
          timestamp,
          isOwn: true,
          status: "sending",
          tempId,
        })
      );

      // Send via WebSocket with temp_id
      try {
        sendWebSocketMessage({
          type: "chat",
          message,
          timestamp,
          temp_id: tempId, // Include temp_id in the WebSocket message
        });
        console.log("[CHAT] Message sent via WebSocket with temp_id:", tempId);
      } catch (error) {
        console.error("[CHAT] Failed to send message:", error);
        // Update message status to failed
        dispatch(
          updateMessageStatus({
            tempId,
            status: "failed",
          })
        );
      }
    },
    [sendWebSocketMessage, currentUser, audioRoomState.currentRoom, dispatch]
  );

  // Disconnect from WebSocket
  const disconnectWebSocket = useCallback(() => {
    console.log(
      "[CLIENT] disconnectWebSocket() called - CLIENT INITIATED DISCONNECTION"
    );
    console.trace("[CLIENT] Call stack for disconnection:");

    if (wsRef.current) {
      console.log("[CLIENT] Closing WebSocket with code 1000 (normal closure)");
      console.log('[CLIENT] Close reason: "User disconnecting"');
      wsRef.current.close(1000, "User disconnecting");
      wsRef.current = null;
      console.log("[CLIENT] WebSocket reference set to null");
    } else {
      console.log("[CLIENT] No WebSocket to close (already null)");
    }

    dispatch(setConnectionStatus(false));
    setConnectionState("disconnected");
    console.log("[CLIENT] Connection state updated to disconnected");
  }, [dispatch]);

  // Leave room
  const handleLeaveRoom = useCallback(async () => {
    try {
      console.log("[CLIENT] handleLeaveRoom() called - USER LEAVING ROOM");
      disconnectWebSocket();
      dispatch(leaveRoom());
      console.log("[CLIENT] Room leave completed successfully");
    } catch (error) {
      console.error("[CLIENT] Error leaving room:", error);
    }
  }, [dispatch, disconnectWebSocket]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log(
        "[CLIENT] useAudioRoom cleanup function called - COMPONENT UNMOUNTING"
      );
      console.trace("[CLIENT] Component cleanup call stack:");

      if (wsRef.current) {
        console.log("[CLIENT] Closing WebSocket during component cleanup");
        console.log("[CLIENT] Close code: 1000 (normal closure)");
        console.log('[CLIENT] Close reason: "Component cleanup"');
        wsRef.current.close(1000, "Component cleanup");
        wsRef.current = null;
        console.log(
          "[CLIENT] WebSocket closed and reference cleared during cleanup"
        );
      } else {
        console.log("[CLIENT] No WebSocket to clean up (already null)");
      }

      // Reset connection flag
      isConnectingRef.current = false;
      console.log("[CLIENT] Connection flag reset during cleanup");
    };
  }, []);

  return {
    ...audioRoomState,
    connectionState,
    fetchActiveRooms,
    fetchRoomDetails,
    createRoom,
    deleteRoom,
    connectToRoom,
    sendChatMessage,
    leaveRoom: handleLeaveRoom,
    sendWebSocketMessage,
    isHost: audioRoomState.currentRoom?.host_id === currentUser?.id,
  };
};
