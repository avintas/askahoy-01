"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const projectId = searchParams.get("projectId");

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-lg bg-green-50 p-8 text-center">
        <div className="mb-4 text-6xl">✓</div>
        <h1 className="mb-4 text-3xl font-bold text-gray-900">
          Project Created Successfully!
        </h1>
        <p className="mb-6 text-lg text-gray-600">
          We&apos;ll have your interactive quiz experience ready in 3-5 business
          days.
        </p>
        {projectId && (
          <p className="mb-6 text-sm text-gray-500">Project ID: {projectId}</p>
        )}
        <div className="flex justify-center space-x-4">
          <Link href="/dashboard">
            <Button>Go to Dashboard</Button>
          </Link>
          <Link href="/">
            <Button variant="outline">Back to Home</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-12">
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <div className="text-lg">Loading...</div>
          </div>
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
