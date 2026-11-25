
"use client";

import { useState } from "react";

export default function Home() {
  const [notes, setNotes] = useState("");
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generateSummary() {
    setSummary("");
    setError("");
    setCopied(false);

    if (!notes.trim()) {
      setError("Please enter your study notes.");
      return;
    }

    if (notes.length > 12000) {
      setError("Notes cannot exceed 12,000 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/summarize", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notes }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Unable to generate summary.");
      }

      if (!response.body) {
        throw new Error("Streaming is not supported by this response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const event of events) {
          const line = event
            .split("\n")
            .find((item) => item.startsWith("data: "));

          if (!line) continue;

          const data = line.slice(6);

          if (data === "[DONE]") continue;

          const parsed = JSON.parse(data);

          if (parsed.error) {
            throw new Error(parsed.error);
          }

          if (parsed.text) {
            setSummary((previous) => previous + parsed.text);
          }
        }
      }

      buffer += decoder.decode();

      if (buffer.trim()) {
        const line = buffer
          .split("\n")
          .find((item) => item.startsWith("data: "));

        if (line) {
          const data = line.slice(6);

          if (data !== "[DONE]") {
            const parsed = JSON.parse(data);

            if (parsed.error) {
              throw new Error(parsed.error);
            }

            if (parsed.text) {
              setSummary((previous) => previous + parsed.text);
            }
          }
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  async function copySummary() {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Unable to copy summary. Please try again.");
    }
  }

  function clearAll() {
    setNotes("");
    setSummary("");
    setError("");
    setCopied(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <nav className="flex items-center justify-between border-b bg-white px-8 py-5">
        <h1 className="text-2xl font-bold text-indigo-600">
          StudySpark ✨
        </h1>

        <span className="text-sm text-slate-500">
          AI Study Notes Summarizer
        </span>
      </nav>

      <section className="mx-auto max-w-4xl px-6 py-16">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-bold tracking-tight">
            Turn your notes into
            <span className="text-indigo-600"> clear summaries.</span>
          </h2>

          <p className="mt-4 text-slate-500">
            Paste your study notes and let AI organize the important
            information for you.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <label className="mb-3 block font-semibold">
            Paste your study notes
          </label>

          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Paste your study notes here..."
            maxLength={12000}
            disabled={loading}
            className="h-64 w-full resize-y rounded-xl border border-slate-200 p-4 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-slate-50"
          />

          <div className="mt-2 flex justify-between text-sm text-slate-400">
            <span>Maximum 12,000 characters</span>
            <span>{notes.length}/12000</span>
          </div>

          <button
            onClick={generateSummary}
            disabled={loading || !notes.trim()}
            className="mt-6 w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? "Generating Summary..." : "Generate Summary ✨"}
          </button>

          <button
            onClick={clearAll}
            disabled={loading || (!notes && !summary && !error)}
            className="mt-3 w-full rounded-xl border border-slate-200 py-3 font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Clear All
          </button>

          {error && (
            <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </p>
          )}
        </div>

        {(summary || loading) && (
          <div className="mt-8 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-xl font-bold text-indigo-600">
                Your Summary ✨
              </h3>

              {summary && !loading && (
                <button
                  onClick={copySummary}
                  className="rounded-lg border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  {copied ? "Copied!" : "Copy Summary"}
                </button>
              )}
            </div>

            {summary ? (
              <div className="whitespace-pre-wrap leading-7 text-slate-700">
                {summary}
              </div>
            ) : (
              <div className="flex items-center gap-3 text-slate-400">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-200 border-t-indigo-600" />
                <p>Preparing your summary...</p>
              </div>
            )}

            {loading && (
              <span className="mt-3 inline-block animate-pulse text-sm text-indigo-500">
                AI is writing...
              </span>
            )}
          </div>
        )}
      </section>

      <footer className="py-8 text-center text-sm text-slate-400">
        StudySpark · Learn smarter, not harder.
      </footer>
    </main>
  );
}
