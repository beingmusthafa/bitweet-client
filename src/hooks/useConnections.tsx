import { api } from "@/lib/api";
import { endpoints } from "@/lib/endpoints";
import type { User } from "@/types/user";
import { useState, useEffect } from "react";

export function useFollowers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowers = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoints.getFollowers);
        setUsers(response.data.followers);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch followers");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowers();
  }, []);

  return { users, loading, error };
}

export function useFollowing() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFollowing = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(endpoints.getFollowing);
        setUsers(response.data.following);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch following");
      } finally {
        setLoading(false);
      }
    };

    fetchFollowing();
  }, []);

  return { users, loading, error };
}
