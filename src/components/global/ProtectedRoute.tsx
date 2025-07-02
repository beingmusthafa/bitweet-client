"use client";

import type React from "react";

import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../store/hooks";
import { fetchProfile } from "../../store/slices/authSlice";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) {
      dispatch(fetchProfile());
    }
  }, [dispatch, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
