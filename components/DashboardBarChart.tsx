"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface ChartData {
  month: string;
  "This Year": number;
  "Last Year": number;
}

interface DashboardBarChartProps {
  data: ChartData[];
  title?: string;
}

export default function DashboardBarChart({ data, title = "Posts Created" }: DashboardBarChartProps) {
  const maxValue = Math.max(
    ...data.flatMap((d) => [d["This Year"], d["Last Year"]]),
    1
  );
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <button className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 transition-colors">
          View All
        </button>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" stroke="#6b7280" />
          <YAxis stroke="#6b7280" domain={[0, Math.max(maxValue + 2, 5)]} />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
            }}
          />
          <Legend />
          <Bar dataKey="This Year" fill="#1e3a8a" radius={[8, 8, 0, 0]} />
          <Bar dataKey="Last Year" fill="#f97316" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

