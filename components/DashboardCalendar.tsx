"use client";

import { useState } from "react";

export default function DashboardCalendar() {
  const [currentDate] = useState(new Date());

  const daysOfWeek = ["S", "M", "T", "W", "T", "F", "S"];
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Generate calendar days
  const calendarDays: (number | null)[] = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Highlight specific dates (example: 3, 12, 13 in blue, 18, 25 in orange)
  const blueDates = [3, 12, 13];
  const orangeDates = [18, 25];

  const getDateClass = (day: number | null) => {
    if (day === null) return "";
    if (blueDates.includes(day)) return "bg-[#1e3a8a] text-white rounded-full";
    if (orangeDates.includes(day)) return "bg-orange-500 text-white rounded-full";
    return "text-gray-700 hover:bg-gray-100 rounded-full";
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {monthNames[month]} {year}
      </h3>
      <div className="grid grid-cols-7 gap-2">
        {/* Day headers */}
        {daysOfWeek.map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-gray-600 py-2">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={`text-center py-2 text-sm cursor-pointer transition-colors ${getDateClass(day)}`}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
}

