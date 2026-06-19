import { notFound } from "next/navigation";

type Props = {
  params: { slug: string[] };
};

/**
 * Catch-all for unknown paths. Redirects from the DB are handled in middleware
 * as real HTTP 301/302 responses — not meta refresh tags.
 */
export async function generateMetadata() {
  return { title: "Page Not Found", robots: { index: false, follow: false } };
}

export default function CatchAllPage(_props: Props) {
  notFound();
}
