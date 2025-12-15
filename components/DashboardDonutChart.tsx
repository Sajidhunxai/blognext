"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface CategoryData {
  name: string;
  count: number;
}

interface DashboardDonutChartProps {
  percentage: number;
  categoryData?: CategoryData[];
  totalPosts?: number;
}

export default function DashboardDonutChart({ 
  percentage, 
  categoryData = [],
  totalPosts = 0 
}: DashboardDonutChartProps) {
  const COLORS = ["#f97316", "#1e3a8a", "#10b981", "#f59e0b", "#3b82f6"];

  // If we have category data, use it; otherwise use percentage
  const chartData = categoryData.length > 0
    ? categoryData.map((cat) => ({ name: cat.name, value: cat.count }))
    : [
        { name: "Top Category", value: percentage },
        { name: "Others", value: 100 - percentage },
      ];

  const topCategory = categoryData.length > 0 ? categoryData[0] : null;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Posts by Category</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
            startAngle={90}
            endAngle={-270}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
      <div className="mt-4 text-center">
        {topCategory ? (
          <>
            <p className="text-2xl font-bold text-gray-900">{topCategory.name}</p>
            <p className="text-sm text-gray-600 mt-2">{topCategory.count} posts</p>
            {categoryData.length > 1 && (
              <p className="text-sm text-gray-500 mt-1">
                {categoryData.length} categories total
              </p>
            )}
          </>
        ) : (
          <>
            <p className="text-2xl font-bold text-gray-900">{percentage}%</p>
            <p className="text-sm text-gray-600 mt-2">Top category</p>
          </>
        )}
        {totalPosts > 0 && (
          <p className="text-xs text-gray-500 mt-2">{totalPosts} posts in categories</p>
        )}
      </div>
    </div>
  );
}

