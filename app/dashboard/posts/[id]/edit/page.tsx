import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import dynamic from "next/dynamic";

const EditPostForm = dynamic(() => import("@/components/EditPostForm").then((m) => m.default), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <p className="text-gray-500">Loading...</p>
    </div>
  ),
});

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const row = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!row) {
    redirect("/dashboard");
  }

  const post = {
    ...row,
    faqs: Array.isArray(row.faqs) ? (row.faqs as { question: string; answer: string }[]) : null,
  };

  return <EditPostForm post={post as any} />;
}

