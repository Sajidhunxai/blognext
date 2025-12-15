import { LucideIcon } from "lucide-react";

interface DashboardMetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor?: "blue" | "white";
  iconBgColor?: "blue" | "green" | "beige" | "grey";
}

export default function DashboardMetricCard({
  title,
  value,
  icon: Icon,
  bgColor = "white",
  iconBgColor = "blue",
}: DashboardMetricCardProps) {
  const bgClasses = bgColor === "blue" ? "bg-[#1e3a8a] text-white" : "bg-white text-gray-900";
  
  const iconBgClasses = {
    blue: "bg-blue-100",
    green: "bg-green-100",
    beige: "bg-amber-100",
    grey: "bg-gray-100",
  };
  
  const iconColorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    beige: "text-amber-600",
    grey: "text-gray-600",
  };

  return (
    <div className={`${bgClasses} rounded-lg shadow-md p-6 transition-transform hover:scale-105`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm ${bgColor === "blue" ? "text-blue-200" : "text-gray-600"} mb-2`}>
            {title}
          </p>
          <p className={`text-3xl font-bold ${bgColor === "blue" ? "text-white" : "text-gray-900"}`}>
            {value}
          </p>
        </div>
        <div className={`${iconBgClasses[iconBgColor]} p-3 rounded-full`}>
          <Icon className={`w-6 h-6 ${iconColorClasses[iconBgColor]}`} />
        </div>
      </div>
    </div>
  );
}

