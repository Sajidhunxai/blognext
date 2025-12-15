import { prisma } from "@/lib/prisma";
import DashboardMetricCard from "@/components/DashboardMetricCard";
import DashboardBarChart from "@/components/DashboardBarChart";
import DashboardAreaChart from "@/components/DashboardAreaChart";
import DashboardDonutChart from "@/components/DashboardDonutChart";
import DashboardCalendar from "@/components/DashboardCalendar";
import { FileText, CheckCircle, MessageSquare, Folder } from "lucide-react";

export default async function DashboardPage() {

  // Fetch dashboard statistics
  const [posts, comments, categories, pages] = await Promise.all([
    prisma.post.findMany({
      select: {
        published: true,
        createdAt: true,
        categoryId: true,
        rating: true,
        ratingCount: true,
        downloads: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.comment.findMany({
      select: {
        createdAt: true,
        approved: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({
      include: {
        posts: {
          select: {
            id: true,
          },
        },
      },
    }),
    prisma.page.findMany({
      select: {
        published: true,
      },
    }),
  ]);

  // Calculate metrics
  const totalPosts = posts.length;
  const publishedPosts = posts.filter((p) => p.published).length;
  const draftPosts = posts.filter((p) => !p.published).length;
  const totalComments = comments.length;
  const approvedComments = comments.filter((c) => c.approved).length;
  const pendingComments = comments.filter((c) => !c.approved).length;
  const totalCategories = categories.length;
  const totalPages = pages.length;
  const publishedPages = pages.filter((p) => p.published).length;

  // Calculate posts by month for the last 6 months
  const now = new Date();
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleString("default", { month: "short" }).toUpperCase(),
      date,
    });
  }

  const barChartData = months.map((m) => {
    const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
    const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0);
    
    const thisMonthPosts = posts.filter((p) => {
      const postDate = new Date(p.createdAt);
      return postDate >= monthStart && postDate <= monthEnd;
    });

    const lastYearMonthStart = new Date(m.date.getFullYear() - 1, m.date.getMonth(), 1);
    const lastYearMonthEnd = new Date(m.date.getFullYear() - 1, m.date.getMonth() + 1, 0);
    
    const lastYearPosts = posts.filter((p) => {
      const postDate = new Date(p.createdAt);
      return postDate >= lastYearMonthStart && postDate <= lastYearMonthEnd;
    });

    return {
      month: m.month,
      "This Year": thisMonthPosts.length,
      "Last Year": lastYearPosts.length,
    };
  });

  // Calculate comments and posts over time for area chart (last 6 months)
  const areaChartData = months.map((m) => {
    const monthStart = new Date(m.date.getFullYear(), m.date.getMonth(), 1);
    const monthEnd = new Date(m.date.getFullYear(), m.date.getMonth() + 1, 0);
    
    const monthPosts = posts.filter((p) => {
      const postDate = new Date(p.createdAt);
      return postDate >= monthStart && postDate <= monthEnd;
    });

    const monthComments = comments.filter((c) => {
      const commentDate = new Date(c.createdAt);
      return commentDate >= monthStart && commentDate <= monthEnd;
    });

    return {
      name: m.month.substring(0, 3),
      Posts: monthPosts.length,
      Comments: monthComments.length,
    };
  });

  // Calculate posts by category for donut chart
  const categoryData = categories
    .map((cat) => ({
      name: cat.name,
      count: cat.posts.length,
    }))
    .filter((cat) => cat.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5); // Top 5 categories

  const totalPostsInCategories = categoryData.reduce((sum, cat) => sum + cat.count, 0);
  const topCategoryPercentage = totalPostsInCategories > 0
    ? Math.round((categoryData[0]?.count || 0) / totalPostsInCategories * 100)
    : 0;

  return (
    <>
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <DashboardMetricCard
              title="Total Posts"
              value={totalPosts}
              icon={FileText}
              bgColor="blue"
              iconBgColor="blue"
            />
            <DashboardMetricCard
              title="Published"
              value={publishedPosts}
              icon={CheckCircle}
              bgColor="white"
              iconBgColor="green"
            />
            <DashboardMetricCard
              title="Comments"
              value={totalComments}
              icon={MessageSquare}
              bgColor="white"
              iconBgColor="beige"
            />
            <DashboardMetricCard
              title="Categories"
              value={totalCategories}
              icon={Folder}
              bgColor="white"
              iconBgColor="grey"
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Bar Chart - Takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <DashboardBarChart data={barChartData} title="Posts Created" />
            </div>

            {/* Calendar - Takes 1 column on large screens */}
            <div className="lg:col-span-1">
              <DashboardCalendar />
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Area Chart */}
            <div>
              <DashboardAreaChart data={areaChartData} />
            </div>

            {/* Donut Chart */}
            <div>
              <DashboardDonutChart 
                percentage={topCategoryPercentage} 
                categoryData={categoryData}
                totalPosts={totalPostsInCategories}
              />
            </div>
          </div>
    </>
  );
}
