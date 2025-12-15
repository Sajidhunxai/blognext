import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import DashboardLayout from "@/components/DashboardLayout";

export default async function DashboardLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "admin") {
    redirect("/login");
  }

  const userName = session.user.name || "Admin User";
  const userEmail = session.user.email || "user@example.com";

  return (
    <DashboardLayout userName={userName} userEmail={userEmail}>
      {children}
    </DashboardLayout>
  );
}

