import { useCallback, useRef, useEffect, useState } from 'react';

interface UseWebRTCAudioProps {
  sendWebSocketMessage: (message: any) => void;
}

export const useWebRTCAudio = ({ sendWebSocketMessage }: UseWebRTCAudioProps) => {
  const localStreamRef = useRef<MediaStream | null>(null);
  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(false);

  // Create peer connection for a user
  const createPeerConnection = useCallback((userId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote stream from:', userId);
      const remoteStream = event.streams[0];
      remoteStreamsRef.current.set(userId, remoteStream);
      
      // Create audio element to play remote audio
      const audio = document.createElement('audio');
      audio.srcObject = remoteStream;
      audio.autoplay = true;
      audio.id = `audio-${userId}`;
      document.body.appendChild(audio);
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendWebSocketMessage({
          type: 'webrtc_signal',
          signal_type: 'ice-candidate',
          target_user_id: userId,
          data: event.candidate
        });
      }
    };

    peerConnectionsRef.current.set(userId, pc);
    return pc;
  }, [sendWebSocketMessage]);

  // Start audio stream
  const startAudioStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: true, 
        video: false 
      });
      
      localStreamRef.current = stream;
      setIsAudioEnabled(true);
      
      // Add stream to all existing peer connections
      peerConnectionsRef.current.forEach((pc) => {
        stream.getTracks().forEach(track => {
          pc.addTrack(track, stream);
        });
      });

      console.log('Audio stream started');
      return stream;
    } catch (error) {
      console.error('Failed to start audio stream:', error);
      throw error;
    }
  }, []);

  // Stop audio stream
  const stopAudioStream = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
      setIsAudioEnabled(false);
      setIsMuted(false);
    }
  }, []);

  // Toggle mute
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTracks = localStreamRef.current.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = !track.enabled;
      });
      setIsMuted(!audioTracks[0]?.enabled);
    }
  }, []);

  // Handle WebRTC signaling
  const handleWebRTCSignal = useCallback(async (message: any) => {
    const { from_user_id, signal_type, data } = message;
    let pc = peerConnectionsRef.current.get(from_user_id);

    if (!pc && signal_type === 'offer') {
      pc = createPeerConnection(from_user_id);
      
      // Add local stream if available
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => {
          pc!.addTrack(track, localStreamRef.current!);
        });
      }
    }

    if (!pc) return;

    try {
      switch (signal_type) {
        case 'offer':
          await pc.setRemoteDescription(data);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendWebSocketMessage({
            type: 'webrtc_signal',
            signal_type: 'answer',
            target_user_id: from_user_id,
            data: answer
          });
          break;

        case 'answer':
          await pc.setRemoteDescription(data);
          break;

        case 'ice-candidate':
          await pc.addIceCandidate(data);
          break;
      }
    } catch (error) {
      console.error('WebRTC signaling error:', error);
    }
  }, [createPeerConnection, sendWebSocketMessage]);

  // Handle user joined - create offer
  const handleUserJoined = useCallback(async (userId: string) => {
    const pc = createPeerConnection(userId);
    
    // Add local stream if available
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current!);
      });
    }
    
    // Create and send offer
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      
      sendWebSocketMessage({
        type: 'webrtc_signal',
        signal_type: 'offer',
        target_user_id: userId,
        data: offer
      });
    } catch (error) {
      console.error('Failed to create offer:', error);
    }
  }, [createPeerConnection, sendWebSocketMessage]);

  // Handle user left
  const handleUserLeft = useCallback((userId: string) => {
    const pc = peerConnectionsRef.current.get(userId);
    if (pc) {
      pc.close();
      peerConnectionsRef.current.delete(userId);
    }
    
    remoteStreamsRef.current.delete(userId);
    
    // Remove audio element
    const audioElement = document.getElementById(`audio-${userId}`);
    if (audioElement) {
      audioElement.remove();
    }
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
  }, []);

  // Listen for WebRTC signals
  useEffect(() => {
    const handleWebRTCEvent = (event: CustomEvent) => {
      handleWebRTCSignal(event.detail);
    };

    window.addEventListener('webrtc_signal', handleWebRTCEvent as EventListener);
    
    return () => {
      window.removeEventListener('webrtc_signal', handleWebRTCEvent as EventListener);
    };
  }, [handleWebRTCSignal]);

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
  };
};