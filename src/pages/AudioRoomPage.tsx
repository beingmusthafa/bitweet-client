import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAudioRoom } from "../hooks/useAudioRoom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../components/ui/dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Mic, Plus } from "lucide-react";
import type { AudioRoom } from "../types/audioroom";
import AudioRoomCard from "../components/audioroom/AudioRoomCard";

export default function AudioRoomPage() {
  const navigate = useNavigate();
  const { activeRooms, isLoading, error, fetchActiveRooms, createRoom } =
    useAudioRoom();

  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newRoomTitle, setNewRoomTitle] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    fetchActiveRooms();
  }, [fetchActiveRooms]);

  const handleCreateRoom = async () => {
    if (!newRoomTitle.trim()) return;

    try {
      setIsCreating(true);
      const room = await createRoom(newRoomTitle.trim());
      setNewRoomTitle("");
      setIsCreateDialogOpen(false);
      navigate(`/audioroom/${room.id}`);
    } catch (error) {
      console.error("Failed to create room:", error);
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinRoom = (room: AudioRoom) => {
    navigate(`/audioroom/${room.id}`);
  };

  if (isLoading && activeRooms.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Audio Rooms</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-4 bg-muted rounded w-full mb-2"></div>
                <div className="h-10 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-6">
      <div className="flex items-center justify-between">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Room
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Audio Room</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="room-title">Room Title</Label>
                <Input
                  id="room-title"
                  value={newRoomTitle}
                  onChange={(e) => setNewRoomTitle(e.target.value)}
                  placeholder="Enter room title..."
                  onKeyDown={(e) => e.key === "Enter" && handleCreateRoom()}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleCreateRoom}
                  disabled={!newRoomTitle.trim() || isCreating}
                >
                  {isCreating ? "Creating..." : "Create Room"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {error && (
        <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive">
          {error}
        </div>
      )}

      {activeRooms.length === 0 && !isLoading ? (
        <div className="text-center py-12">
          <Mic className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Active Rooms</h3>
          <p className="text-muted-foreground mb-4">
            Be the first to start an audio conversation!
          </p>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            Create First Room
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {activeRooms.map((room) => (
            <AudioRoomCard
              key={room.id}
              room={room}
              onJoinRoom={handleJoinRoom}
            />
          ))}
        </div>
      )}

      {isLoading && activeRooms.length > 0 && (
        <div className="text-center py-4">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full mx-auto"></div>
        </div>
      )}
    </div>
  );
}
