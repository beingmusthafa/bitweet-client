import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../store";
import { useAudioRoom } from "../hooks/useAudioRoom";
import { useWebRTCAudio } from "../hooks/useWebRTCAudio";
import AudioParticipants from "../components/audioroom/AudioParticipants";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Mic,
  MicOff,
  MessageCircle,
  Phone,
  ArrowLeft,
  Send,
  Trash2,
  Check,
} from "lucide-react";

export default function AudioRoomDetailPage() {
  const { roomId } = useParams<{ roomId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const {
    currentRoom,
    isConnected,
    connectionState,
    messages,
    isLoading,
    error,
    connectToRoom,
    sendChatMessage,
    leaveRoom,
    deleteRoom,
    sendWebSocketMessage,
    isHost,
  } = useAudioRoom();

  const {
    startAudioStream,
    stopAudioStream,
    toggleMute,
    closeAllPeerConnections,
    isMuted,
    isAudioEnabled,
    participants,
    audioLevels,
    initializeCurrentUser,
    initializeExistingParticipants,
  } = useWebRTCAudio({
    sendWebSocketMessage,
  });

  const [chatMessage, setChatMessage] = useState("");
  const connectionAttemptedRef = useRef(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    connectionAttemptedRef.current = false;
  }, [roomId]);

  useEffect(() => {
    if (roomId && !connectionAttemptedRef.current) {
      console.log(
        "[UI] useEffect triggered - attempting to connect to room:",
        roomId
      );
      connectionAttemptedRef.current = true;
      connectToRoom(roomId).catch(console.error);
    }
  }, [roomId, connectToRoom]);

  useEffect(() => {
    return () => {
      console.log("[UI] AudioRoomDetailPage cleanup - COMPONENT UNMOUNTING");
      console.log(
        "[UI] This could be due to: navigation, browser refresh, or window close"
      );
      closeAllPeerConnections();
      stopAudioStream();
      console.log("[UI] WebRTC and audio cleanup completed");
    };
  }, [closeAllPeerConnections, stopAudioStream]);

  // Initialize current user in participants when connected
  useEffect(() => {
    if (
      isConnected &&
      currentUser &&
      currentRoom &&
      !participants.has(currentUser.id)
    ) {
      const isCreator = currentRoom.host_id === currentUser.id;
      initializeCurrentUser(currentUser, isCreator);
    }
  }, [
    isConnected,
    currentUser,
    currentRoom,
    participants,
    initializeCurrentUser,
  ]);

  // Initialize existing participants when room data is received
  useEffect(() => {
    if (
      currentRoom &&
      currentRoom.existing_participants &&
      currentRoom.existing_participants.length > 0
    ) {
      initializeExistingParticipants(
        currentRoom.existing_participants,
        currentRoom.host_id
      );
    }
  }, [currentRoom, initializeExistingParticipants]);

  // Auto-scroll to latest message
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (chatMessage.trim()) {
      sendChatMessage(chatMessage.trim());
      setChatMessage("");
    }
  };

  const handleLeaveRoom = async () => {
    try {
      console.log("[UI] User clicked Leave Room button - USER INITIATED LEAVE");
      console.log("[UI] Cleaning up WebRTC connections...");
      closeAllPeerConnections();
      console.log("[UI] Stopping audio stream...");
      stopAudioStream();
      console.log("[UI] Calling leaveRoom() function...");
      await leaveRoom();
      console.log("[UI] Navigating back to room list...");
      navigate("/audioroom");
    } catch (error) {
      console.error("[UI] Failed to leave room:", error);
      console.log("[UI] Navigating back anyway due to error...");
      navigate("/audioroom");
    }
  };

  const handleDeleteRoom = async () => {
    if (!currentRoom || !isHost) return;

    if (
      confirm(
        "Are you sure you want to delete this room? This action cannot be undone."
      )
    ) {
      try {
        console.log("[UI] User confirmed room deletion - HOST DELETING ROOM");
        console.log("[UI] Room ID:", currentRoom.id);
        await deleteRoom(currentRoom.id);
        console.log("[UI] Room deleted successfully, navigating back...");
        navigate("/audioroom");
      } catch (error) {
        console.error("[UI] Failed to delete room:", error);
      }
    } else {
      console.log("[UI] User cancelled room deletion");
    }
  };

  const handleToggleMute = async () => {
    try {
      if (!isAudioEnabled) {
        await startAudioStream();
      }
      toggleMute(currentUser?.id);
    } catch (error) {
      console.error("Failed to toggle mute:", error);
    }
  };

  // Auto-enable audio when connected
  useEffect(() => {
    if (isConnected && !isAudioEnabled && currentUser) {
      startAudioStream().catch(console.error);
    }
  }, [isConnected, isAudioEnabled, currentUser, startAudioStream]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error || !currentRoom) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => navigate("/audioroom")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Rooms
        </Button>
        <div className="text-center py-12">
          <p className="text-destructive mb-4">{error || "Room not found"}</p>
          <Button onClick={() => navigate("/audioroom")}>
            Go Back to Rooms
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate("/audioroom")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{currentRoom.title}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant={currentRoom.is_live ? "default" : "secondary"}>
                {currentRoom.is_live ? "Live" : "Not Started"}
              </Badge>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                {connectionState === "connected" ? (
                  <>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    Connected
                  </>
                ) : connectionState === "connecting" ? (
                  <>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    Connecting...
                  </>
                ) : connectionState === "error" ? (
                  <>
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    Connection failed
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                    Disconnected
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Host Controls */}
        {isHost && (
          <div className="flex gap-2">
            <Button
              onClick={handleDeleteRoom}
              variant="destructive"
              size="sm"
              className="flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Delete Room
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Participants */}
        <div className="lg:col-span-2 px-8">
          <AudioParticipants
            participants={participants}
            audioLevels={audioLevels}
            creatorId={currentRoom.host_id}
            currentUserId={currentUser?.id}
          />
        </div>

        {/* Chat Section */}
        <div className="space-y-6">
          <Card className="h-96">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col h-80">
              <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-3 mb-4 px-2"
              >
                {messages.map((message, index) => (
                  <div
                    key={
                      message.tempId ||
                      `${message.user_id}-${message.timestamp}-${index}`
                    }
                    className={`flex ${
                      message.isOwn ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[80%] ${
                        message.isOwn ? "text-right" : "text-left"
                      }`}
                    >
                      <div
                        className={`inline-block px-3 py-2 text-sm ${
                          message.isOwn
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {!message.isOwn && (
                          <div className="font-medium text-xs mb-1 opacity-70">
                            {message.username}
                          </div>
                        )}
                        <div className="break-words">{message.message}</div>
                        <div
                          className={`text-xs mt-1 opacity-60 flex items-center gap-1 ${
                            message.isOwn ? "justify-end" : "justify-start"
                          }`}
                        >
                          <span>
                            {new Date(message.timestamp).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                          {message.isOwn && (
                            <span className="flex items-center">
                              {message.status === "sending" && (
                                <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin ml-1"></div>
                              )}
                              {message.status === "sent" && (
                                <Check className="size-3" />
                              )}
                              {message.status === "failed" && (
                                <span className="ml-1 text-destructive">✗</span>
                              )}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground text-sm py-8">
                    No messages yet. Start the conversation!
                  </div>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <Input
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  disabled={!isConnected}
                />
                <Button
                  size="sm"
                  onClick={handleSendMessage}
                  disabled={!chatMessage.trim() || !isConnected}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Audio Controls */}
      <div className="flex items-center justify-center gap-4">
        <Button
          size="lg"
          variant={isMuted ? "destructive" : "default"}
          onClick={handleToggleMute}
          className="flex items-center gap-2"
          disabled={!isConnected}
        >
          {isMuted ? (
            <>
              <MicOff className="h-5 w-5" />
              Unmute
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              Mute
            </>
          )}
        </Button>

        <Button
          size="lg"
          variant="destructive"
          onClick={handleLeaveRoom}
          className="flex items-center gap-2"
        >
          <Phone className="h-5 w-5" />
          Leave Room
        </Button>
      </div>
    </div>
  );
}
