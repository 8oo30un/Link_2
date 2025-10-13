"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      {/* 
        ===================================
        목록이 없을 때 UI
        여기를 자유롭게 디자인하세요
        ===================================
      */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
        아직 여행이 없습니다
      </h2>
      <p className="text-gray-600 dark:text-gray-400 mb-8">
        첫 번째 여행을 만들어보세요!
      </p>
      <Link
        href="/dashboard/trips/create"
        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
      >
        새 여행 만들기
      </Link>
    </div>
  );
}
