"use client";

import { useState } from "react";

type Answer = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  text: string;
  answers: Answer[];
};

type Props = {
  questions: Question[];
};

export default function QuizPlayer({ questions }: Props) {
  // selected: set of checked answer IDs per question
  const [selected, setSelected] = useState<Record<string, Set<string>>>({});
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});

  function toggle(questionId: string, answerId: string) {
    setSelected((prev) => {
      const current = new Set(prev[questionId] ?? []);
      if (current.has(answerId)) current.delete(answerId);
      else current.add(answerId);
      return { ...prev, [questionId]: current };
    });
  }

  if (questions.length === 0) {
    return (
      <p className="text-sm text-gray-500 text-center py-6">
        Dieses Quiz enthält noch keine Fragen.
      </p>
    );
  }

  return (
    <div className="space-y-5">
      {questions.map((question, qIndex) => {
        const checkedIds = selected[question.id] ?? new Set<string>();
        const isRevealed = revealed[question.id];
        const correctIds = new Set(question.answers.filter((a) => a.isCorrect).map((a) => a.id));

        const allCorrectChecked = [...correctIds].every((id) => checkedIds.has(id));
        const noWrongChecked = [...checkedIds].every((id) => correctIds.has(id));
        const isPerfect = allCorrectChecked && noWrongChecked;

        const multipleCorrect = correctIds.size > 1;

        return (
          <div key={question.id} className="border border-gray-200 rounded-xl p-5">
            <div className="flex items-start gap-2 mb-1">
              <p className="text-sm font-semibold text-gray-900">
                <span className="text-purple-600 font-bold mr-2">Frage {qIndex + 1}:</span>
                {question.text}
              </p>
            </div>
            {multipleCorrect && (
              <p className="text-[11px] text-gray-400 mb-3">Mehrere Antworten können richtig sein.</p>
            )}

            <div className="space-y-2">
              {question.answers.map((answer) => {
                const isChecked = checkedIds.has(answer.id);
                let cls =
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-sm text-left transition";

                if (!isRevealed) {
                  cls += isChecked
                    ? " border-purple-400 bg-purple-50 text-purple-800 cursor-pointer"
                    : " border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700 cursor-pointer";
                } else {
                  if (answer.isCorrect) {
                    cls += " border-green-300 bg-green-50 text-green-800";
                  } else if (isChecked) {
                    cls += " border-red-300 bg-red-50 text-red-700";
                  } else {
                    cls += " border-gray-100 text-gray-400";
                  }
                }

                return (
                  <label key={answer.id} className={cls}>
                    <input
                      type="checkbox"
                      checked={isChecked}
                      disabled={isRevealed}
                      onChange={() => toggle(question.id, answer.id)}
                      className="sr-only"
                    />
                    <span
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 text-[10px] font-bold transition ${
                        isRevealed && answer.isCorrect
                          ? "border-green-500 bg-green-500 text-white"
                          : isRevealed && isChecked && !answer.isCorrect
                            ? "border-red-400 bg-red-400 text-white"
                            : isChecked
                              ? "border-purple-600 bg-purple-600 text-white"
                              : "border-gray-300"
                      }`}
                    >
                      {(isRevealed && answer.isCorrect) || (!isRevealed && isChecked) ? "✓" : ""}
                    </span>
                    {answer.text}
                  </label>
                );
              })}
            </div>

            {!isRevealed && checkedIds.size > 0 && (
              <button
                type="button"
                onClick={() => setRevealed((prev) => ({ ...prev, [question.id]: true }))}
                className="mt-4 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-xl transition"
              >
                Antwort prüfen
              </button>
            )}

            {isRevealed && (
              <p
                className={`mt-4 text-xs font-semibold px-3 py-2 rounded-xl inline-block ${
                  isPerfect ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}
              >
                {isPerfect
                  ? "Richtig!"
                  : "Leider falsch — die richtigen Antworten sind grün markiert."}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
