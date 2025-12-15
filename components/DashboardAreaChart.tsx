"use client";

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface AreaChartData {
  name: string;
  Posts: number;
  Comments: number;
}

interface DashboardAreaChartProps {
  data: AreaChartData[];
}

export default function DashboardAreaChart({ data }: DashboardAreaChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((d) => [d.Posts, d.Comments]),
    1
  );

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Activity Overview</h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1e3a8a" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#1e3a8a" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" stroke="#6b7280" />
          <YAxis stroke="#6b7280" domain={[0, Math.max(maxValue + 2, 5)]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="Posts"
            stroke="#f97316"
            fillOpacity={1}
            fill="url(#colorPosts)"
          />
          <Area
            type="monotone"
            dataKey="Comments"
            stroke="#1e3a8a"
            fillOpacity={1}
            fill="url(#colorComments)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

