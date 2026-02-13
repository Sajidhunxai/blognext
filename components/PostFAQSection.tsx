interface FAQItem {
  question: string;
  answer: string;
}

interface PostFAQSectionProps {
  faqs: FAQItem[];
  title?: string;
}

export default function PostFAQSection({ faqs, title = "Frequently Asked Questions" }: PostFAQSectionProps) {
  if (!faqs.length) return null;

  return (
    <section aria-labelledby="faq-heading" className="mb-8 sm:mb-10">
      <h2 id="faq-heading" className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
        {title}
      </h2>
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/50 overflow-hidden shadow-sm">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {faqs.map((faq, index) => (
            <li key={index}>
              <details className="group">
                <summary className="flex items-center justify-between gap-3 py-4 px-4 sm:px-5 cursor-pointer list-none text-left font-medium text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <span className="pr-2">{faq.question}</span>
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 group-open:rotate-180 transition-transform">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </summary>
                <div className="pb-4 px-4 sm:px-5 pt-0 text-gray-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  {faq.answer}
                </div>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
