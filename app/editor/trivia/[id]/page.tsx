"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProtectedRoute } from "@/components/auth/protected-route";
import type { TriviaExperience, TriviaQuestion } from "@/types";

export default function EditTriviaPage() {
  const params = useParams();
  const router = useRouter();
  const triviaId = params.id as string;
  const [trivia, setTrivia] = useState<TriviaExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState("");

  const fetchTrivia = useCallback(async () => {
    if (!triviaId) return;
    try {
      const response = await fetch(`/api/trivia/${triviaId}`);
      if (response.ok) {
        const data = await response.json();
        setTrivia(data.trivia);
        setTitle(data.trivia.title);
      }
    } catch (error) {
      console.error("Error fetching trivia:", error);
    } finally {
      setLoading(false);
    }
  }, [triviaId]);

  useEffect(() => {
    if (triviaId) {
      fetchTrivia();
    }
  }, [triviaId, fetchTrivia]);

  const updateQuestion = (
    index: number,
    field: keyof TriviaQuestion,
    value: string | number | string[]
  ) => {
    if (!trivia) return;

    const updatedQuestions = [...trivia.questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value,
    };

    setTrivia({
      ...trivia,
      questions: updatedQuestions,
    });
  };

  const addQuestion = () => {
    if (!trivia) return;

    const newQuestion: TriviaQuestion = {
      question: "",
      options: ["", "", "", ""],
      correct_answer: 0,
    };

    setTrivia({
      ...trivia,
      questions: [...trivia.questions, newQuestion],
    });
  };

  const deleteQuestion = (index: number) => {
    if (!trivia) return;

    const updatedQuestions = trivia.questions.filter((_, i) => i !== index);
    setTrivia({
      ...trivia,
      questions: updatedQuestions,
    });
  };

  const saveTrivia = async () => {
    if (!trivia) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/trivia/${triviaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          questions: trivia.questions,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save trivia");
      }

      router.push(`/editor/projects/${trivia.project_id}`);
    } catch (error) {
      console.error("Error saving trivia:", error);
      alert("Failed to save trivia");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Loading...</div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!trivia) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-lg">Trivia experience not found</div>
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
                  href="/editor"
                  className="text-xl font-bold text-gray-900"
                >
                  Ask Ahoy - Editor
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-600">Edit Trivia</span>
              </div>
              <div className="flex space-x-2">
                <Button onClick={saveTrivia} disabled={saving}>
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-8">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-gray-900">Questions</h2>
            <Button onClick={addQuestion}>Add Question</Button>
          </div>

          <div className="space-y-6">
            {trivia.questions.map((question, index) => (
              <div
                key={index}
                className="rounded-lg border border-gray-200 bg-white p-6"
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Question {index + 1}
                  </h3>
                  <Button variant="ghost" onClick={() => deleteQuestion(index)}>
                    Delete
                  </Button>
                </div>

                <div className="mb-4">
                  <Label>Question Text</Label>
                  <Input
                    value={question.question}
                    onChange={(e) =>
                      updateQuestion(index, "question", e.target.value)
                    }
                    className="mt-1"
                    placeholder="Enter your question"
                  />
                </div>

                <div className="mb-4 space-y-2">
                  <Label>Answer Options</Label>
                  {question.options.map((option, optIndex) => (
                    <div key={optIndex} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`correct-${index}`}
                        checked={question.correct_answer === optIndex}
                        onChange={() =>
                          updateQuestion(index, "correct_answer", optIndex)
                        }
                        className="h-4 w-4"
                      />
                      <Input
                        value={option}
                        onChange={(e) => {
                          const newOptions = [...question.options];
                          newOptions[optIndex] = e.target.value;
                          updateQuestion(index, "options", newOptions);
                        }}
                        placeholder={`Option ${optIndex + 1}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}
