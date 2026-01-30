"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { Project, Document, TriviaExperience } from "@/types";

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [triviaExperiences, setTriviaExperiences] = useState<
    TriviaExperience[]
  >([]);
  const [loading, setLoading] = useState(true);

  const fetchProjectDetails = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      if (response.ok) {
        const data = await response.json();
        setProject(data.project);
        setDocuments(data.documents || []);
        setTriviaExperiences(data.triviaExperiences || []);
      }
    } catch (error) {
      console.error("Error fetching project details:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId) {
      fetchProjectDetails();
    }
  }, [projectId, fetchProjectDetails]);

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Project not found</div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="border-b border-gray-200 bg-white">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center space-x-4">
                <Link
                  href="/dashboard"
                  className="text-xl font-bold text-gray-900"
                >
                  Ask Ahoy
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">{project.business_name}</span>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              {project.business_name}
            </h1>
            <p className="mt-2 text-gray-600">{project.contact_email}</p>
          </div>

          {/* Documents Section */}
          <section className="mb-12">
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Documents
            </h2>
            {documents.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="text-gray-600">No documents uploaded yet.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-lg border border-gray-200 bg-white p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">
                          {doc.file_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {(doc.file_size / 1024).toFixed(2)} KB •{" "}
                          {new Date(doc.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Trivia Experiences Section */}
          <section>
            <h2 className="mb-4 text-2xl font-semibold text-gray-900">
              Quiz Experiences
            </h2>
            {triviaExperiences.length === 0 ? (
              <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
                <p className="mb-4 text-gray-600">
                  No quiz experiences created yet.
                </p>
                <p className="text-sm text-gray-500">
                  Your content editor will process your documents and create
                  quiz experiences for you.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {triviaExperiences.map((trivia) => (
                  <div
                    key={trivia.id}
                    className="rounded-lg border border-gray-200 bg-white p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {trivia.title}
                        </h3>
                        <p className="mt-1 text-sm text-gray-600">
                          {trivia.questions.length} questions
                        </p>
                        {trivia.shareable_url && (
                          <Link
                            href={`/play/${trivia.id}`}
                            className="mt-2 inline-block text-sm text-blue-600 hover:text-blue-700"
                          >
                            View Quiz →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
