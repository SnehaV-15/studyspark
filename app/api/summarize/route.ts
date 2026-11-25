
import { GoogleGenAI } from "@google/genai";
import { NextRequest } from "next/server";



const MAX_LENGTH = 12000;

export async function POST(request: NextRequest) {
  try {
    // Validate request body
    let body: { notes?: unknown };

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid request. Please provide valid JSON." },
        { status: 400 }
      );
    }

    const notes = body.notes;

    if (typeof notes !== "string" || !notes.trim()) {
      return Response.json(
        { error: "Please enter your study notes." },
        { status: 400 }
      );
    }

    if (notes.length > MAX_LENGTH) {
      return Response.json(
        { error: "Notes cannot exceed 12,000 characters." },
        { status: 400 }
      );
    }

    // Check API key
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Gemini API key is not configured." },
        { status: 500 }
      );
    }

    const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    timeout: 30000,
  },
});

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";

    const prompt = `
You are StudySpark, an AI study notes assistant.

Summarize the following study notes for a student.

Follow this structure:

1. Overview
2. Key Points
3. Important Terms and Definitions
4. Quick Revision

Use clear, simple language.
Preserve important facts and technical terms.
Do not add information that is not present in the notes.

STUDY NOTES:
${notes}
`;

    // Request a streaming response from Gemini
    const result = await ai.models.generateContentStream({
      model,
      contents: prompt,
    });

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result) {
            const text = chunk.text || "";

            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text })}\n\n`
                )
              );
            }
          }

          controller.enqueue(
            encoder.encode("data: [DONE]\n\n")
          );

          controller.close();
        } catch (error) {
          console.error("Gemini streaming error:", error);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "Unable to generate the summary. Please try again.",
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });

  } catch (error: any) {
  console.error("Summarization API error:", error);

  const status = error.status || error.code;

  if (status === 503) {
    return Response.json(
      {
        error: "Gemini is currently experiencing high demand. Please try again in a few minutes."
      },
      { status: 503 }
    );
  }

  if (status === 429) {
    return Response.json(
      {
        error: "API usage limit reached. Please try again later."
      },
      { status: 429 }
    );
  }

  return Response.json(
    {
      error: "Unable to generate your summary. Please try again."
    },
    { status: 500 }
  );
}}
