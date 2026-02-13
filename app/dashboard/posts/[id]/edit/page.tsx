import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPostForm, { type Post } from "@/components/EditPostForm";

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

  const post: Post = {
    ...row,
    faqs: Array.isArray(row.faqs) ? (row.faqs as { question: string; answer: string }[]) : null,
  };

  return <EditPostForm post={post} />;
}

