import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import DownloadClient from "./DownloadClient";
import FrontendLayout from "@/components/FrontendLayout";

type Props = {
  params: { slug: string };
};

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
