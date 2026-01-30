import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey =
  process.env.aska_GEMINI_API_KEY ||
  process.env.GEMINI_API_KEY ||
  process.env.GOOGLE_GENERATIVE_AI_API_KEY;

if (!apiKey) {
  throw new Error(
    "Missing Gemini API key environment variable (aska_GEMINI_API_KEY, GEMINI_API_KEY, or GOOGLE_GENERATIVE_AI_API_KEY)"
  );
}

const genAI = new GoogleGenerativeAI(apiKey);

export async function convertDocumentToTrivia(documentText: string): Promise<
  Array<{
    question: string;
    options: string[];
    correct_answer: number;
  }>
> {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const prompt = `Convert the following document into a quiz/trivia format. Extract key information and create 10-20 multiple choice questions. Each question should have:
- A clear, concise question
- Exactly 4 answer options
- The correct answer index (0-3)

Format your response as a valid JSON array of objects with this exact structure:
[
  {
    "question": "Question text here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
    "correct_answer": 0
  }
]

Document content:
${documentText}

Return only the JSON array, no additional text or markdown formatting.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response - remove markdown code blocks if present
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const triviaData = JSON.parse(cleanedText);

    // Validate structure
    if (!Array.isArray(triviaData)) {
      throw new Error("Invalid response format: expected array");
    }

    return triviaData.map((item, index) => ({
      question: item.question || `Question ${index + 1}`,
      options: Array.isArray(item.options) ? item.options : [],
      correct_answer:
        typeof item.correct_answer === "number"
          ? item.correct_answer
          : parseInt(item.correct_answer) || 0,
    }));
  } catch (error) {
    console.error("Error converting document to trivia:", error);
    throw new Error(
      `Failed to convert document to trivia: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
