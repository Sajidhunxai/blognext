"use client";

export interface FaqItem {
  question: string;
  answer: string;
}

interface FaqEditorProps {
  value: FaqItem[];
  onChange: (faqs: FaqItem[]) => void;
  maxItems?: number;
}

export default function FaqEditor({ value, onChange, maxItems = 10 }: FaqEditorProps) {
  const faqs = value?.length ? value : [];

  const addFaq = () => {
    if (faqs.length >= maxItems) return;
    onChange([...faqs, { question: "", answer: "" }]);
  };

  const removeFaq = (index: number) => {
    onChange(faqs.filter((_, i) => i !== index));
  };

  const updateFaq = (index: number, field: "question" | "answer", text: string) => {
    const next = [...faqs];
    next[index] = { ...next[index], [field]: text };
    onChange(next);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Add questions and answers for the FAQ section and FAQ schema (helps SEO).
        </p>
        {faqs.length < maxItems && (
          <button
            type="button"
            onClick={addFaq}
            className="text-sm font-medium text-primary hover:underline"
          >
            + Add FAQ
          </button>
        )}
      </div>
      {faqs.length === 0 ? (
        <button
          type="button"
          onClick={addFaq}
          className="w-full py-6 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-primary hover:text-primary transition"
        >
          + Add first FAQ
        </button>
      ) : (
        <ul className="space-y-4">
          {faqs.map((faq, index) => (
            <li key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50/50 space-y-3">
              <div className="flex justify-between items-start gap-2">
                <span className="text-xs font-medium text-gray-500">FAQ {index + 1}</span>
                <button
                  type="button"
                  onClick={() => removeFaq(index)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Remove
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Question</label>
                <input
                  type="text"
                  value={faq.question}
                  onChange={(e) => updateFaq(index, "question", e.target.value)}
                  placeholder="e.g. How do I install this app?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Answer</label>
                <textarea
                  value={faq.answer}
                  onChange={(e) => updateFaq(index, "answer", e.target.value)}
                  placeholder="Short answer (shown on post and in FAQ schema)"
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
