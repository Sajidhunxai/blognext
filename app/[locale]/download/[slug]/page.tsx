import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { addLocalePrefix, type Locale } from "@/lib/i18n/config";
import DownloadClient from "@/app/download/[slug]/DownloadClient";
import FrontendLayout from "@/components/FrontendLayout";

type Props = {
  params: { locale: string; slug: string };
};

export default async function LocaleDownloadPage({ params }: Props) {
  const locale = params.locale as Locale;
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

  const backHref = addLocalePrefix(`/post/${post.slug}`, locale);

  return (
    <FrontendLayout>
      <DownloadClient post={post} backHref={backHref} />
    </FrontendLayout>
  );
}
