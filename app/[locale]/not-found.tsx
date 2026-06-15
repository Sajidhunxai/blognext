import { notFound } from "next/navigation";

/**
 * All /en/*, /ur/*, /hi/* routes 301 redirect to their English equivalents
 * via middleware, so this component should never actually render.
 * Call notFound() to fall through to the root not-found page.
 */
export default function LocaleNotFound() {
  notFound();
}
