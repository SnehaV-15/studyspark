
import Groq from "groq-sdk";
import { NextRequest } from "next/server";

const MAX_LENGTH = 12000;
const MODEL = "openai/gpt-oss-120b";

export async function POST(request: NextRequest) {
  try {
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

    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      return Response.json(
        { error: "Groq API key is not configured." },
        { status: 500 }
      );
    }

    const groq = new Groq({ apiKey });

    const stream = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are StudySpark, an AI study notes assistant.

Summarize the student's notes using exactly these sections:

1. Overview
2. Key Points
3. Important Terms and Definitions
4. Quick Revision

Use simple, clear language.
Preserve important facts and technical terms.
Do not invent information that is not present in the notes.
Use bullet points where appropriate.`,
        },
        {
          role: "user",
          content: `Summarize these study notes:\n\n${notes}`,
        },
      ],
      temperature: 0.3,
      max_completion_tokens: 2000,
      stream: true,
    });

    const encoder = new TextEncoder();

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const text = chunk.choices[0]?.delta?.content || "";

            if (text) {
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ text })}\n\n`
                )
              );
            }
          }

          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (error) {
          console.error("Groq streaming error:", error);

          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({
                error: "Unable to complete the summary. Please try again.",
              })}\n\n`
            )
          );

          controller.close();
        }
      },
    });

    return new Response(responseStream, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Summarization API error:", error);

    const status =
      typeof error === "object" && error !== null && "status" in error
        ? Number(error.status)
        : 500;

    if (status === 429) {
      return Response.json(
        { error: "Groq API usage limit reached. Please try again later." },
        { status: 429 }
      );
    }

    return Response.json(
      { error: "Unable to generate your summary. Please try again." },
      { status: status >= 400 && status < 600 ? status : 500 }
    );
  }
}
