import type { User } from "@/types/user";
import UserAvatar from "../global/UserAvatar";

interface UsersListProps {
  users: User[];
  loading: boolean;
  error: string | null;
}

export default function UsersList({ users, loading, error }: UsersListProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No users found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div
          key={user.id}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200"
        >
          <UserAvatar size="md" />
          <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 truncate">
              {user.fullName}
            </p>
            <p className="text-sm text-gray-500 truncate">@{user.username}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
