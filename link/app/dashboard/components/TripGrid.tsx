"use client";

import Image from "next/image";
import Link from "next/link";
import { Trip } from "@prisma/client";

interface TripGridProps {
  trips: Trip[];
}

export default function TripGrid({ trips }: TripGridProps) {
  // 날짜 포맷팅 함수
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 여행 상태 뱃지
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      planning: {
        label: "계획 중",
        color: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
      },
      ongoing: {
        label: "진행 중",
        color:
          "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
      },
      completed: {
        label: "완료",
        color: "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig.planning;

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}
      >
        {config.label}
      </span>
    );
  };

  // D-day 계산
  const getDday = (startDate: Date) => {
    const today = new Date();
    const start = new Date(startDate);
    const diff = Math.ceil(
      (start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diff < 0) return null;
    if (diff === 0) return "D-Day";
    return `D-${diff}`;
  };

  return (
    <div>
      {/* 액션 버튼 */}
      <div className="mb-6 flex justify-end">
        <Link
          href="/dashboard/trips/create"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
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
      </div>

      {/* 벤토 그리드 - 가로 2개씩 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {trips.map((trip) => {
          const dday = getDday(trip.startDate);

          return (
            <Link
              key={trip.id}
              href={`/dashboard/trips/${trip.id}`}
              className="group relative bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:scale-[1.02]"
            >
              {/* 커버 이미지 */}
              <div className="relative h-48 bg-gradient-to-br from-blue-400 to-purple-500 overflow-hidden">
                {trip.coverImage ? (
                  <Image
                    src={trip.coverImage}
                    alt={trip.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <svg
                      className="w-16 h-16 text-white/50"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                )}

                {/* D-day 뱃지 */}
                {dday && (
                  <div className="absolute top-4 right-4 px-3 py-1 bg-red-500 text-white font-bold text-sm rounded-full shadow-lg">
                    {dday}
                  </div>
                )}

                {/* 그라디언트 오버레이 */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
              </div>

              {/* 카드 내용 */}
              <div className="p-6">
                {/* 상태 뱃지 */}
                <div className="mb-3">{getStatusBadge(trip.status)}</div>

                {/* 제목 */}
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {trip.title}
                </h3>

                {/* 목적지 */}
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-3">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  <span className="text-sm font-medium">
                    {trip.destination}
                  </span>
                </div>

                {/* 설명 */}
                {trip.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {trip.description}
                  </p>
                )}

                {/* 날짜 */}
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <span>
                    {formatDate(trip.startDate)} ~ {formatDate(trip.endDate)}
                  </span>
                </div>
              </div>

              {/* 호버 시 화살표 */}
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <svg
                  className="w-6 h-6 text-blue-600 dark:text-blue-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7l5 5m0 0l-5 5m5-5H6"
                  />
                </svg>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
