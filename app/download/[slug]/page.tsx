import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DownloadClient from "./DownloadClient";
import FrontendLayout from "@/components/FrontendLayout";
import { buildCanonicalUrl } from "@/lib/url";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props) {
  const siteUrl =
    process.env.NEXT_PUBLIC_CANONICAL_URL ||
    process.env.NEXTAUTH_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: { title: true, slug: true },
  });

  return {
    title: post ? `Download ${post.title}` : "Download",
    robots: { index: false, follow: false },
    alternates: {
      canonical: post
        ? buildCanonicalUrl(siteUrl, `/post/${post.slug}`)
        : buildCanonicalUrl(siteUrl, "/"),
    },
  };
}

export default async function DownloadPage({ params }: Props) {
  // Fetch post on server - never exposed to client network tab
  const post = await prisma.post.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      title: true,
      slug: true,
      downloadLink: true,
      appVersion: true,
      appSize: true,
      requirements: true,
    },
  });

  if (!post || !post.downloadLink) {
    notFound();
  }

  return (
    <FrontendLayout>
      <DownloadClient post={post} />
    </FrontendLayout>
  );
}
