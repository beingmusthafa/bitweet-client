import { useCallback, useRef, useEffect, useState } from "react";
import type { User } from "../types/user";

interface UseWebRTCAudioProps {
  sendWebSocketMessage: (message: any) => void;
}

interface AudioParticipant extends User {
  isMuted: boolean;
  audioLevel: number;
  isCreator?: boolean;
}

export const useWebRTCAudio = ({
  sendWebSocketMessage,
}: UseWebRTCAudioProps) => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const audioAnalyzersRef = useRef<Map<string, AnalyserNode>>(new Map());
  const [isMuted, setIsMuted] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);
  const [participants, setParticipants] = useState<
    Map<string, AudioParticipant>
  >(new Map());
  const [audioLevels, setAudioLevels] = useState<Map<string, number>>(
    new Map()
  );

  // Initialize current user in participants
  const initializeCurrentUser = useCallback(
    (user: any, isCreator: boolean = false) => {
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        newParticipants.set(user.id, {
          ...user,
          isMuted: true,
          audioLevel: 0,
          isCreator,
        });
        return newParticipants;
      });
    },
    []
  );

  // Initialize existing participants when joining room
  const initializeExistingParticipants = useCallback(
    (existingUsers: User[], creatorId: string) => {
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        existingUsers.forEach((user) => {
          newParticipants.set(user.id, {
            ...user,
            isMuted: true,
            audioLevel: 0,
            isCreator: user.id === creatorId,
          });
        });
        return newParticipants;
      });
    },
    []
  );

  // Show toast notification
  const showToast = useCallback(
    (message: string, type: "info" | "success" | "warning" = "info") => {
      // Create toast element
      const toast = document.createElement("div");
      toast.className = `fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-white transition-all duration-300 ${
        type === "success"
          ? "bg-green-500"
          : type === "warning"
          ? "bg-orange-500"
          : "bg-blue-500"
      }`;
      toast.textContent = message;
      toast.style.transform = "translateX(100%)";

      document.body.appendChild(toast);

      // Animate in
      setTimeout(() => {
        toast.style.transform = "translateX(0)";
      }, 100);

      // Remove after 3 seconds
      setTimeout(() => {
        toast.style.transform = "translateX(100%)";
        setTimeout(() => {
          document.body.removeChild(toast);
        }, 300);
      }, 3000);
    },
    []
  );

  // Update current user mute status
  const updateCurrentUserMuteStatus = useCallback(
    (userId: string, muted: boolean) => {
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        const participant = newParticipants.get(userId);
        if (participant) {
          newParticipants.set(userId, {
            ...participant,
            isMuted: muted,
          });
        }
        return newParticipants;
      });
    },
    []
  );

  // Store data channels for each peer
  const dataChannelsRef = useRef<Map<string, RTCDataChannel>>(new Map());

  // Broadcast mute status to all peers
  const broadcastMuteStatus = useCallback((isMuted: boolean) => {
    dataChannelsRef.current.forEach((dataChannel, userId) => {
      if (dataChannel.readyState === "open") {
        try {
          dataChannel.send(
            JSON.stringify({
              type: "mute_status",
              isMuted,
            })
          );
        } catch (error) {
          console.log("Could not send mute status to user:", userId, error);
        }
      }
    });
  }, []);

  // Create peer connection for a user
  const createPeerConnection = useCallback(
    (userId: string) => {
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
      });

      // Create data channel for mute status
      const dataChannel = pc.createDataChannel("muteStatus", {
        ordered: true,
      });

      dataChannel.onopen = () => {
        console.log("Data channel opened for user:", userId);
        dataChannelsRef.current.set(userId, dataChannel);
      };

      dataChannel.onclose = () => {
        console.log("Data channel closed for user:", userId);
        dataChannelsRef.current.delete(userId);
      };

      dataChannel.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === "mute_status") {
            // Update remote user's mute status
            setParticipants((prev) => {
              const newParticipants = new Map(prev);
              const participant = newParticipants.get(userId);
              if (participant) {
                newParticipants.set(userId, {
                  ...participant,
                  isMuted: data.isMuted,
                });
              }
              return newParticipants;
            });
          }
        } catch (error) {
          console.error("Failed to parse data channel message:", error);
        }
      };

      // Handle incoming data channel
      pc.ondatachannel = (event) => {
        const channel = event.channel;

        channel.onopen = () => {
          console.log("Incoming data channel opened for user:", userId);
          dataChannelsRef.current.set(userId, channel);
        };

        channel.onclose = () => {
          console.log("Incoming data channel closed for user:", userId);
          dataChannelsRef.current.delete(userId);
        };

        channel.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "mute_status") {
              setParticipants((prev) => {
                const newParticipants = new Map(prev);
                const participant = newParticipants.get(userId);
                if (participant) {
                  newParticipants.set(userId, {
                    ...participant,
                    isMuted: data.isMuted,
                  });
                }
                return newParticipants;
              });
            }
          } catch (error) {
            console.error("Failed to parse data channel message:", error);
          }
        };
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log("Received remote stream from:", userId);
        const remoteStream = event.streams[0];
        remoteStreamsRef.current.set(userId, remoteStream);

        // Create audio element to play remote audio
        const audio = document.createElement("audio");
        audio.srcObject = remoteStream;
        audio.autoplay = true;
        audio.id = `audio-${userId}`;
        document.body.appendChild(audio);

        // Set up audio analysis for this stream
        setupAudioAnalysis(userId, remoteStream);
      };

      // Handle ICE candidates
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          sendWebSocketMessage({
            type: "webrtc_signal",
            signal_type: "ice-candidate",
            target_user_id: userId,
            data: event.candidate,
          });
        }
      };

      peerConnectionsRef.current.set(userId, pc);
      return pc;
    },
    [sendWebSocketMessage]
  );

  // Start audio stream
  const startAudioStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false,
      });

      // Start with tracks disabled since user starts muted
      stream.getAudioTracks().forEach((track) => {
        track.enabled = false;
      });

      localStreamRef.current = stream;
      setIsAudioEnabled(true);

      // Add stream to all existing peer connections
      peerConnectionsRef.current.forEach((pc) => {
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });
      });

      console.log("Audio stream started (muted)");
      return stream;
    } catch (error) {
      console.error("Failed to start audio stream:", error);
      throw error;
    }
  }, []);

  // Stop audio stream
  const stopAudioStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setIsAudioEnabled(false);
      setIsMuted(false);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(
    (currentUserId?: string) => {
      if (localStreamRef.current) {
        const audioTracks = localStreamRef.current.getAudioTracks();
        const newMutedState = !isMuted;

        audioTracks.forEach((track) => {
          track.enabled = !newMutedState;
        });

        setIsMuted(newMutedState);

        // Update participant mute status
        if (currentUserId) {
          updateCurrentUserMuteStatus(currentUserId, newMutedState);
        }

        // Broadcast mute status to other participants
        broadcastMuteStatus(newMutedState);

        console.log("Toggled mute:", newMutedState ? "muted" : "unmuted");
      }
    },
    [isMuted, updateCurrentUserMuteStatus, broadcastMuteStatus]
  );

  // Handle WebRTC signaling
  const handleWebRTCSignal = useCallback(
    async (message: any) => {
      const { from_user_id, signal_type, data } = message;
      let pc = peerConnectionsRef.current.get(from_user_id);

      if (!pc && signal_type === "offer") {
        pc = createPeerConnection(from_user_id);

        // Add local stream if available
        if (localStreamRef.current) {
          localStreamRef.current.getTracks().forEach((track) => {
            pc!.addTrack(track, localStreamRef.current!);
          });
        }
      }

      if (!pc) return;

      try {
        switch (signal_type) {
          case "offer":
            await pc.setRemoteDescription(data);
            const answer = await pc.createAnswer();
            await pc.setLocalDescription(answer);
            sendWebSocketMessage({
              type: "webrtc_signal",
              signal_type: "answer",
              target_user_id: from_user_id,
              data: answer,
            });
            break;

          case "answer":
            await pc.setRemoteDescription(data);
            break;

          case "ice-candidate":
            await pc.addIceCandidate(data);
            break;
        }
      } catch (error) {
        console.error("WebRTC signaling error:", error);
      }
    },
    [createPeerConnection, sendWebSocketMessage]
  );

  // Handle user joined event from WebSocket
  const handleUserJoined = useCallback(
    async (user: User) => {
      console.log("User joined audio room:", user);

      // Show toast notification
      showToast(`${user.fullName} joined the room`, "success");

      // Add to participants
      setParticipants((prev) => {
        const newParticipants = new Map(prev);
        newParticipants.set(user.id, {
          ...user,
          isMuted: true,
          audioLevel: 0,
        });
        return newParticipants;
      });

      // Create WebRTC connection
      const pc = createPeerConnection(user.id);

      // Add local stream if available
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          pc.addTrack(track, localStreamRef.current!);
        });
      }

      // Create and send offer
      try {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        sendWebSocketMessage({
          type: "webrtc_signal",
          signal_type: "offer",
          target_user_id: user.id,
          data: offer,
        });
      } catch (error) {
        console.error("Failed to create offer:", error);
      }
    },
    [createPeerConnection, sendWebSocketMessage]
  );

  // Handle user left event from WebSocket
  const handleUserLeft = useCallback((user: User) => {
    console.log("User left audio room:", user);

    // Show toast notification
    showToast(`${user.fullName} left the room`, "warning");

    // Remove from participants
    setParticipants((prev) => {
      const newParticipants = new Map(prev);
      newParticipants.delete(user.id);
      return newParticipants;
    });

    // Clean up WebRTC connection
    const pc = peerConnectionsRef.current.get(user.id);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(user.id);
    }

    // Clean up data channel
    dataChannelsRef.current.delete(user.id);

    remoteStreamsRef.current.delete(user.id);
    audioAnalyzersRef.current.delete(user.id);

    // Remove audio element
    const audioElement = document.getElementById(`audio-${user.id}`);
    if (audioElement) {
      audioElement.remove();
    }

    // Remove from audio levels
    setAudioLevels((prev) => {
      const newLevels = new Map(prev);
      newLevels.delete(user.id);
      return newLevels;
    });
  }, []);

  // Close all peer connections
  const closeAllPeerConnections = useCallback(() => {
    peerConnectionsRef.current.forEach((pc, userId) => {
      pc.close();
      // Remove audio elements
      const audioElement = document.getElementById(`audio-${userId}`);
      if (audioElement) {
        audioElement.remove();
      }
    });

    peerConnectionsRef.current.clear();
    remoteStreamsRef.current.clear();
    dataChannelsRef.current.clear();
    audioAnalyzersRef.current.clear();
    setParticipants(new Map());
    setAudioLevels(new Map());
  }, []);

  // Set up audio analysis for a stream
  const setupAudioAnalysis = useCallback(
    (userId: string, stream: MediaStream) => {
      try {
        const audioContext = new AudioContext();
        const analyser = audioContext.createAnalyser();
        const source = audioContext.createMediaStreamSource(stream);

        analyser.fftSize = 256;
        source.connect(analyser);

        audioAnalyzersRef.current.set(userId, analyser);

        // Start monitoring audio levels
        const monitorAudio = () => {
          const dataArray = new Uint8Array(analyser.frequencyBinCount);
          analyser.getByteFrequencyData(dataArray);

          // Calculate average volume
          const average =
            dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
          const normalizedLevel = Math.min(average / 128, 1); // Normalize to 0-1

          setAudioLevels((prev) => {
            const newLevels = new Map(prev);
            newLevels.set(userId, normalizedLevel);
            return newLevels;
          });

          requestAnimationFrame(monitorAudio);
        };

        monitorAudio();
      } catch (error) {
        console.error("Failed to setup audio analysis:", error);
      }
    },
    []
  );

  // Listen for WebRTC signals and user events
  useEffect(() => {
    const handleWebRTCEvent = (event: CustomEvent) => {
      handleWebRTCSignal(event.detail);
    };

    const handleUserJoinedEvent = (event: CustomEvent) => {
      const { user } = event.detail;
      if (user) {
        handleUserJoined(user);
      }
    };

    const handleUserLeftEvent = (event: CustomEvent) => {
      const { user } = event.detail;
      if (user) {
        handleUserLeft(user);
      }
    };

    const handleExistingParticipantsEvent = (event: CustomEvent) => {
      const { participants } = event.detail;
      if (participants && participants.length > 0) {
        console.log("Initializing existing participants:", participants);
        // Don't show toast for existing participants, just initialize them
        participants.forEach((user: User) => {
          setParticipants((prev) => {
            const newParticipants = new Map(prev);
            if (!newParticipants.has(user.id)) {
              newParticipants.set(user.id, {
                ...user,
                isMuted: true,
                audioLevel: 0,
                isCreator: false, // Will be updated when room data is available
              });
            }
            return newParticipants;
          });
        });
      }
    };

    window.addEventListener(
      "webrtc_signal",
      handleWebRTCEvent as EventListener
    );
    window.addEventListener(
      "user_joined",
      handleUserJoinedEvent as EventListener
    );
    window.addEventListener("user_left", handleUserLeftEvent as EventListener);
    window.addEventListener(
      "existing_participants",
      handleExistingParticipantsEvent as EventListener
    );

    return () => {
      window.removeEventListener(
        "webrtc_signal",
        handleWebRTCEvent as EventListener
      );
      window.removeEventListener(
        "user_joined",
        handleUserJoinedEvent as EventListener
      );
      window.removeEventListener(
        "user_left",
        handleUserLeftEvent as EventListener
      );
      window.removeEventListener(
        "existing_participants",
        handleExistingParticipantsEvent as EventListener
      );
    };
  }, [handleWebRTCSignal, handleUserJoined, handleUserLeft]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAudioStream();
      closeAllPeerConnections();
    };
  }, [stopAudioStream, closeAllPeerConnections]);

  return {
    startAudioStream,
    stopAudioStream,
    toggleMute,
    closeAllPeerConnections,
    handleUserJoined,
    handleUserLeft,
    isMuted,
    isAudioEnabled,
    participants,
    audioLevels,
    initializeCurrentUser,
    initializeExistingParticipants,
    updateCurrentUserMuteStatus,
  };
};
