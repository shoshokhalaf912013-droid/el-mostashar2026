import React from "react";
import { Link } from "react-router-dom";

export default function Courses() {
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">جميع الكورسات</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          to="/course/1"
          className="p-4 bg-white shadow rounded-lg hover:shadow-lg transition"
        >
          كورس مثال 1
        </Link>

        <Link
          to="/course/2"
          className="p-4 bg-white shadow rounded-lg hover:shadow-lg transition"
        >
          كورس مثال 2
        </Link>
      </div>
    </div>
  );
}
