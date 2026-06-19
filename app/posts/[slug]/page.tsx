import { notFound } from "next/navigation";

type Props = {
  params: { slug: string };
};

/**
 * Legacy /posts/[slug] URLs are 301-redirected to /post/[slug] in middleware
 * and next.config.js (real HTTP redirect — no meta refresh tag).
 */
export default function PostsRedirectPage(_props: Props) {
  notFound();
}
