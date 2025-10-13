"use client";

import Link from "next/link";

export default function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      {/* 아이콘 */}
      <div className="mb-6">
        <svg
          className="w-24 h-24 text-gray-300 dark:text-gray-600"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          />
        </svg>
      </div>

      {/* 메시지 */}
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
        아직 여행이 없습니다
      </h2>
      <p className="text-gray-600 dark:text-gray-400 text-center mb-8 max-w-md">
        첫 번째 여행을 만들고 함께하는 설렘을 시작해보세요! 여행 계획부터
        공유까지 모든 것을 한 곳에서 관리할 수 있습니다.
      </p>

      {/* 버튼 */}
      <Link
        href="/dashboard/trips/create"
        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
        새 여행 만들기
      </Link>

      {/* 장식 요소 */}
      <div className="mt-16 grid grid-cols-3 gap-4 max-w-xl w-full opacity-50">
        <div className="h-2 bg-gradient-to-r from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-700 rounded-full"></div>
        <div className="h-2 bg-gradient-to-r from-purple-200 to-purple-300 dark:from-purple-800 dark:to-purple-700 rounded-full"></div>
        <div className="h-2 bg-gradient-to-r from-pink-200 to-pink-300 dark:from-pink-800 dark:to-pink-700 rounded-full"></div>
      </div>
    </div>
  );
}
