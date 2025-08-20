import { User, Mic, MicOff } from "lucide-react";

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
  currentUserId,
}: AudioParticipantsProps) {
  const participantsList = Array.from(participants.values());

  const getAudioLevel = (userId: string) => {
    return audioLevels.get(userId) || 0;
  };

  const getBorderStyle = (
    isCurrentUser: boolean,
    audioLevel: number,
    isCreator: boolean
  ) => {
    if (isCurrentUser) {
      return {
        borderWidth: "3px",
        borderColor: "rgb(255, 255, 255)", // White border for current user
        boxShadow: "0 0 8px rgba(255, 255, 255, 0.3)",
      };
    }

    if (isCreator) {
      return {
        borderWidth: "3px",
        borderColor: "rgb(34, 197, 94)", // Green border for host
        boxShadow: "0 0 8px rgba(34, 197, 94, 0.3)",
      };
    }

    if (audioLevel > 0.1) {
      return {
        borderWidth: "3px",
        borderColor: "rgb(147, 51, 234)", // Purple border when speaking
        boxShadow: "0 0 8px rgba(147, 51, 234, 0.3)",
      };
    }

    return {
      borderWidth: "2px",
      borderColor: "rgb(75, 85, 99)", // Gray border default
    };
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white">
        Participants ({participantsList.length})
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {participantsList.map((participant) => {
          const audioLevel = getAudioLevel(participant.id);
          const isCreator = participant.id === creatorId;
          const isCurrentUser = participant.id === currentUserId;
          const isSpeaking = audioLevel > 0.1;

          return (
            <div key={participant.id} className="relative size-32">
              {/* HOST Badge */}
              {isCreator && (
                <div className="absolute -top-2 left-0 bg-green-600 text-white text-[0.5rem] font-bold px-2 py-1 rounded z-10">
                  HOST
                </div>
              )}

              {/* Avatar Container */}
              <div>
                <div
                  className="relative size-32 bg-gray-700 flex items-center justify-center transition-all duration-150"
                  style={getBorderStyle(isCurrentUser, audioLevel, isCreator)}
                >
                  <User className="h-16 w-16 text-gray-400" />
                  {/* Mic Status */}
                  <div className="absolute -bottom-2 -right-2 bg-gray-800 p-1 border-2 border-gray-700">
                    {participant.isMuted ? (
                      <MicOff className="h-3 w-3 text-red-500" />
                    ) : (
                      <Mic className="h-3 w-3 text-green-500" />
                    )}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div className="mt-2 space-y-1">
                <p
                  className="font-medium text-sm text-white truncate"
                  title={participant.fullName}
                >
                  {participant.fullName}
                </p>
                <p
                  className="text-xs text-gray-400 truncate"
                  title={participant.username}
                >
                  @{participant.username}
                </p>

                {/* Speaking Status */}
                {isSpeaking && !participant.isMuted && (
                  <p className="text-xs text-purple-400 font-medium">
                    Speaking...
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
