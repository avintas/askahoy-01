"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import type { TriviaExperience } from "@/types";

interface AnswerState {
  questionIndex: number;
  selectedAnswer: number | null;
  isCorrect: boolean | null;
}

export default function PlayTriviaPage() {
  const params = useParams();
  const triviaId = params.id as string;
  const [trivia, setTrivia] = useState<TriviaExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<AnswerState[]>([]);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(0);

  const fetchTrivia = useCallback(async () => {
    if (!triviaId) return;
    try {
      const response = await fetch(`/api/trivia/${triviaId}`);
      if (response.ok) {
        const data = await response.json();
        setTrivia(data.trivia);
        // Initialize answers array
        setAnswers(
          data.trivia.questions.map(() => ({
            questionIndex: 0,
            selectedAnswer: null,
            isCorrect: null,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching trivia:", error);
    } finally {
      setLoading(false);
    }
  }, [triviaId]);

  const trackEvent = useCallback(
    async (
      eventType: string,
      questionId?: string,
      metadata?: Record<string, unknown>
    ) => {
      if (!trivia) return;

      try {
        await fetch("/api/analytics", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            experience_id: trivia.id,
            project_id: trivia.project_id,
            user_id: trivia.user_id,
            event_type: eventType,
            question_id: questionId,
            metadata,
          }),
        });
      } catch (error) {
        console.error("Error tracking event:", error);
      }
    },
    [trivia]
  );

  useEffect(() => {
    if (triviaId) {
      fetchTrivia();
    }
  }, [triviaId, fetchTrivia]);

  useEffect(() => {
    if (trivia) {
      trackEvent("view");
    }
  }, [trivia, trackEvent]);

  const startQuiz = () => {
    setQuizStarted(true);
    trackEvent("start");
  };

  const selectAnswer = (answerIndex: number) => {
    if (!trivia) return;

    const question = trivia.questions[currentQuestion];
    const isCorrect = answerIndex === question.correct_answer;

    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestion] = {
      questionIndex: currentQuestion,
      selectedAnswer: answerIndex,
      isCorrect,
    };
    setAnswers(updatedAnswers);

    // Track answer
    trackEvent("question_answer", currentQuestion.toString(), {
      selected: answerIndex,
      correct: isCorrect,
    });

    // Move to next question after a short delay
    setTimeout(() => {
      if (currentQuestion < trivia.questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // Quiz completed
        const finalScore = updatedAnswers.filter((a) => a.isCorrect).length;
        setScore(finalScore);
        setQuizCompleted(true);
        trackEvent("quiz_complete", undefined, {
          score: finalScore,
          total: trivia.questions.length,
        });
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Loading quiz...</div>
      </div>
    );
  }

  if (!trivia) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg">Quiz not found</div>
      </div>
    );
  }

  if (!quizStarted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            {trivia.title}
          </h1>
          <p className="mb-8 text-lg text-gray-600">
            {trivia.questions.length} questions
          </p>
          <Button onClick={startQuiz} size="lg">
            Start Quiz
          </Button>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="mx-auto max-w-2xl rounded-lg border border-gray-200 bg-white p-12 text-center shadow-sm">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">
            Quiz Complete!
          </h1>
          <p className="mb-2 text-2xl text-gray-700">
            Your Score: {score} / {trivia.questions.length}
          </p>
          <p className="mb-8 text-lg text-gray-600">
            {Math.round((score / trivia.questions.length) * 100)}% Correct
          </p>
        </div>
      </div>
    );
  }

  const question = trivia.questions[currentQuestion];
  const currentAnswer = answers[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-3xl px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-600">
            <span>
              Question {currentQuestion + 1} of {trivia.questions.length}
            </span>
            <span>
              {Math.round(
                ((currentQuestion + 1) / trivia.questions.length) * 100
              )}
              %
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-blue-600 transition-all"
              style={{
                width: `${((currentQuestion + 1) / trivia.questions.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 text-2xl font-semibold text-gray-900">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = currentAnswer?.selectedAnswer === index;
              const isCorrect = index === question.correct_answer;
              const showResult = currentAnswer?.selectedAnswer !== null;

              let buttonClass =
                "w-full rounded-lg border p-4 text-left transition-colors ";
              if (showResult) {
                if (isCorrect) {
                  buttonClass += "border-green-500 bg-green-50 text-green-900";
                } else if (isSelected && !isCorrect) {
                  buttonClass += "border-red-500 bg-red-50 text-red-900";
                } else {
                  buttonClass += "border-gray-200 bg-gray-50 text-gray-500";
                }
              } else {
                buttonClass +=
                  "border-gray-300 bg-white hover:border-blue-500 hover:bg-blue-50 cursor-pointer";
              }

              return (
                <button
                  key={index}
                  onClick={() => selectAnswer(index)}
                  disabled={showResult}
                  className={buttonClass}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {showResult && isCorrect && (
                      <span className="text-green-600">✓</span>
                    )}
                    {showResult && isSelected && !isCorrect && (
                      <span className="text-red-600">✗</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
