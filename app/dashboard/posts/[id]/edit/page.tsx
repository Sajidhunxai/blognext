import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPostForm from "@/components/EditPostForm";

export default async function EditPostPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const post = await prisma.post.findUnique({
    where: { id: params.id },
  });

  if (!post) {
    redirect("/dashboard");
  }

  return <EditPostForm post={post} />;
}

