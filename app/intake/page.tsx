"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/components/auth/auth-provider";

const intakeSchema = z.object({
  business_name: z.string().min(1, "Business name is required"),
  contact_email: z.string().email("Invalid email address"),
});

type IntakeFormData = z.infer<typeof intakeSchema>;

export default function IntakePage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<IntakeFormData>({
    resolver: zodResolver(intakeSchema),
  });

  const onSubmit = async (data: IntakeFormData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/intake", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create project");
      }

      const { project } = await response.json();
      router.push(`/confirmation?projectId=${project.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-600">Please sign in to continue</p>
          <Button className="mt-4" onClick={() => router.push("/login")}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">
        Project Information
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        <div>
          <Label htmlFor="business_name">Business Name</Label>
          <Input
            id="business_name"
            {...register("business_name")}
            className="mt-1"
            placeholder="Enter your business name"
          />
          {errors.business_name && (
            <p className="mt-1 text-sm text-red-600">
              {errors.business_name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="contact_email">Contact Email</Label>
          <Input
            id="contact_email"
            type="email"
            {...register("contact_email")}
            className="mt-1"
            placeholder="your@email.com"
          />
          {errors.contact_email && (
            <p className="mt-1 text-sm text-red-600">
              {errors.contact_email.message}
            </p>
          )}
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? "Creating Project..." : "Create Project"}
          </Button>
        </div>
      </form>
    </div>
  );
}
