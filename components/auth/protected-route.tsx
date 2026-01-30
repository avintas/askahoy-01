"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./auth-provider";

export function ProtectedRoute({
  children,
}: {
  children: React.ReactNode;
  requireEditor?: boolean;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // TODO: Add editor role check when user metadata is set up
  // if (requireEditor && user.user_metadata?.role !== "editor") {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center">
  //       <div className="text-lg">Access denied. Editor role required.</div>
  //     </div>
  //   );
  // }

  return <>{children}</>;
}
