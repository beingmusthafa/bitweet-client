import { Users, Mic, Clock, Volume2 } from "lucide-react";
import type { AudioRoom } from "../../types/audioroom";

interface AudioRoomCardProps {
  room: AudioRoom;
  onJoinRoom: (room: AudioRoom) => void;
}

export default function AudioRoomCard({
  room,
  onJoinRoom,
}: AudioRoomCardProps) {
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return `${diffInMinutes}m ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  return (
    <div key={room.id} className="bg-card border border-gray-700 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-2 h-2 ${
                  room.is_live ? "bg-red-500 animate-pulse" : "bg-gray-500"
                }`}
              ></div>
              <span
                className={`text-sm font-semibold ${
                  room.is_live ? "text-red-400" : "text-gray-400"
                }`}
              >
                {room.is_live ? "LIVE" : "NOT STARTED"}
              </span>
            </div>
            {/* TODO: Add topic field to room data model */}
            <span className="bg-accent/600/20 text-accent/300 px-2 py-1 text-xs border border-accent/600/30">
              General
            </span>
          </div>
          <h4 className="text-lg font-semibold text-white mb-2">
            {room.title}
          </h4>
          {/* TODO: Add description field to room data model */}
          <p className="text-gray-400 text-sm mb-3">
            Join this interactive room discussion
          </p>

          <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {(room.active_participants || 0).toLocaleString()}
            </span>
            {/* TODO: Add speakers count to room data model */}
            <span className="flex items-center gap-1">
              <Mic className="w-4 h-4" />1
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {formatTimeAgo(room.created_at)}
            </span>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400">Hosted by</span>
            <span className="text-accent font-semibold">
              @{room.host?.fullName || "Unknown"}
            </span>
            {/* TODO: Add coHosts field to room data model */}
            {/* Keeping this structure for when coHosts data is available */}
            {/*{false && (
              <>
                <span className="text-gray-500">•</span>
                <span className="text-sm text-gray-400">
                  with @{[].join(", @")}
                </span>
              </>
            )}*/}
          </div>

          {/* TODO: Add tags field to room data model */}
          <div className="flex gap-2 flex-wrap">
            {["discussion", "community"].map((tag) => (
              <span
                key={tag}
                className="bg-gray-700 text-gray-300 px-2 py-1 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-2 ml-4">
          <button
            onClick={() => onJoinRoom(room)}
            className="bg-accent/90 hover:bg-accent text-white px-4 py-2 font-semibold transition-colors flex items-center gap-2"
          >
            <Volume2 className="w-4 h-4" />
            Join
          </button>
        </div>
      </div>
    </div>
  );
}
