import { redirect } from "next/navigation";

type Props = {
  params: { slug: string };
};

export default function PostsRedirectPage({ params }: Props) {
  // Redirect from /posts/[slug] to /post/[slug]
  redirect(`/post/${params.slug}`);
}
