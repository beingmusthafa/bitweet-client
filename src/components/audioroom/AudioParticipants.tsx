import { User, Mic, MicOff, Crown } from 'lucide-react';
import { Card } from '../ui/card';

interface AudioParticipant {
  id: string;
  username: string;
  fullName: string;
  email: string;
  isMuted: boolean;
  audioLevel: number;
  isCreator?: boolean;
}

interface AudioParticipantsProps {
  participants: Map<string, AudioParticipant>;
  audioLevels: Map<string, number>;
  creatorId?: string;
  currentUserId?: string;
}

export default function AudioParticipants({ 
  participants, 
  audioLevels, 
  creatorId,
  currentUserId 
}: AudioParticipantsProps) {
  const participantsList = Array.from(participants.values());

  const getAudioLevel = (userId: string) => {
    return audioLevels.get(userId) || 0;
  };

  const getBorderStyle = (userId: string, audioLevel: number) => {
    if (audioLevel > 0.1) {
      const intensity = Math.min(audioLevel * 4, 1);
      const borderWidth = 2 + (intensity * 4);
      return {
        borderWidth: `${borderWidth}px`,
        borderColor: `rgba(34, 197, 94, ${0.5 + intensity * 0.5})`,
        boxShadow: `0 0 ${intensity * 10}px rgba(34, 197, 94, ${intensity * 0.3})`
      };
    }
    return {
      borderWidth: '2px',
      borderColor: 'rgb(229, 231, 235)'
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        Participants ({participantsList.length})
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {participantsList.map((participant) => {
          const audioLevel = getAudioLevel(participant.id);
          const isCreator = participant.id === creatorId;
          const isCurrentUser = participant.id === currentUserId;
          
          return (
            <Card 
              key={participant.id} 
              className="p-3 text-center relative transition-all duration-150"
            >
              {/* Creator Crown */}
              {isCreator && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 rounded-full p-1">
                  <Crown className="h-3 w-3 text-white" />
                </div>
              )}
              
              {/* Avatar */}
              <div className="relative mx-auto mb-2">
                <div 
                  className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center transition-all duration-150"
                  style={getBorderStyle(participant.id, audioLevel)}
                >
                  <User className="h-8 w-8 text-gray-500" />
                </div>
                
                {/* Mic Status */}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 border-2 border-gray-200">
                  {participant.isMuted ? (
                    <MicOff className="h-3 w-3 text-red-500" />
                  ) : (
                    <Mic className="h-3 w-3 text-green-500" />
                  )}
                </div>
              </div>
              
              {/* User Info */}
              <div className="space-y-1">
                <p className="font-medium text-sm truncate" title={participant.fullName}>
                  {participant.fullName}
                  {isCurrentUser && ' (You)'}
                </p>
                <p className="text-xs text-gray-500 truncate" title={participant.username}>
                  @{participant.username}
                </p>
              </div>
              
              {/* Audio Level Indicator */}
              {audioLevel > 0.1 && (
                <div className="mt-2">
                  <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-green-500 transition-all duration-150 rounded-full"
                      style={{ width: `${Math.min(audioLevel * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}