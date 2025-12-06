import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EditPageForm from "@/components/EditPageForm";

export default async function EditPagePage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  let page = null;
  try {
    if (prisma && 'page' in prisma) {
      page = await (prisma as any).page.findUnique({
        where: { id: params.id },
      });
    }
  } catch (error) {
    console.error("Error fetching page:", error);
  }

  if (!page) {
    redirect("/dashboard/pages");
  }

  return <EditPageForm page={page} />;
}

