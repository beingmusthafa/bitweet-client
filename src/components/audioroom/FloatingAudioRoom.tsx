import { useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import type { RootState } from '../../store';
import { useAudioRoom } from '../../hooks/useAudioRoom';
import { useWebRTCAudio } from '../../hooks/useWebRTCAudio';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { Mic, MicOff, Phone, Maximize2, Users } from 'lucide-react';

export default function FloatingAudioRoom() {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentRoom, isConnected } = useSelector(
    (state: RootState) => state.audioroom
  );
  const { leaveRoom, sendWebSocketMessage } = useAudioRoom();
  const { participants, isMuted, isAudioEnabled } = useWebRTCAudio({
    sendWebSocketMessage,
  });

  // Don't show floating window if user is already on audioroom pages or not in a room
  if (!currentRoom || !isConnected || location.pathname.startsWith('/audioroom')) {
    return null;
  }

  const handleExpand = () => {
    navigate(`/audioroom/${currentRoom.id}`);
  };

  const handleLeave = async () => {
    try {
      await leaveRoom();
    } catch (error) {
      console.error('Failed to leave room:', error);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 border-2 shadow-lg bg-background/95 backdrop-blur-sm">
        <CardContent className="p-4">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm truncate" title={currentRoom.title}>
                  {currentRoom.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={isConnected ? "default" : "secondary"} className="text-xs">
                    {isConnected ? "Connected" : "Connecting..."}
                  </Badge>
                </div>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleExpand}
                className="h-6 w-6 p-0 ml-2"
              >
                <Maximize2 className="h-3 w-3" />
              </Button>
            </div>

            {/* Participants Count */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Users className="h-3 w-3" />
              <span>{participants.size} participants</span>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {isAudioEnabled && (
                  <div className="flex items-center gap-1">
                    {isMuted ? (
                      <MicOff className="h-4 w-4 text-destructive" />
                    ) : (
                      <Mic className="h-4 w-4 text-green-500" />
                    )}
                    <span className="text-xs">
                      {isMuted ? 'Muted' : 'Speaking'}
                    </span>
                  </div>
                )}
                {!isAudioEnabled && (
                  <span className="text-xs text-muted-foreground">Listening</span>
                )}
              </div>

              <Button
                size="sm"
                variant="destructive"
                onClick={handleLeave}
                className="h-7 px-2 text-xs"
              >
                <Phone className="h-3 w-3 mr-1" />
                Leave
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
