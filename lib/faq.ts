/**
 * Extract FAQ pairs from HTML content (questions in h2-h4 ending with ?, answer from next paragraph).
 * Used for both StructuredData schema and on-page FAQ section.
 */
export function extractFAQsFromContent(content: string): Array<{ question: string; answer: string }> {
  const faqs: Array<{ question: string; answer: string }> = [];
  const questionRegex = /<h[2-4][^>]*>([^<]*\?[^<]*)<\/h[2-4]>/g;
  let match;
  const questions: string[] = [];
  while ((match = questionRegex.exec(content)) !== null) {
    questions.push(match[1].replace(/<[^>]*>/g, "").trim());
  }
  questions.forEach((question) => {
    const questionIndex = content.indexOf(question);
    if (questionIndex !== -1) {
      const afterQuestion = content.substring(questionIndex + question.length);
      const answerMatch = afterQuestion.match(/<p[^>]*>([^<]+)<\/p>/);
      if (answerMatch?.[1]) {
        faqs.push({
          question,
          answer: answerMatch[1].replace(/<[^>]*>/g, "").trim().substring(0, 500),
        });
      }
    }
  });
  return faqs;
}
