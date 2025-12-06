import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import FrontendLayout from "@/components/FrontendLayout";

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  let page = null;
  try {
    if (prisma && 'page' in prisma) {
      page = await (prisma as any).page.findUnique({
        where: { slug: params.slug },
      });
    }
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page || !page.published) {
    return {
      title: "Page Not Found",
    };
  }

  const siteUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const metaTitle = page.metaTitle || page.title;
  const metaDescription = page.metaDescription || page.content.substring(0, 160);

  return {
    title: metaTitle,
    description: metaDescription,
    openGraph: {
      title: metaTitle,
      description: metaDescription,
      url: `${siteUrl}/pages/${page.slug}`,
      siteName: "PKR Games",
      type: "website",
    },
    alternates: {
      canonical: `${siteUrl}/pages/${page.slug}`,
    },
  };
}

export default async function PagePage({ params }: Props) {
  let page = null;
  try {
    if (prisma && 'page' in prisma) {
      page = await (prisma as any).page.findUnique({
        where: { slug: params.slug },
      });
    }
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page || !page.published) {
    notFound();
  }

  const settings = await getSettings();

  return (
    <FrontendLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article className="bg-white">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-8">
            {page.title}
          </h1>
          
          <div 
            className="prose prose-lg max-w-none text-gray-700"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </article>
      </div>
    </FrontendLayout>
  );
}

