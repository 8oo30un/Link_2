"use client";

import { useState } from "react";
import TripGrid from "./components/TripGrid";
import EmptyState from "./components/EmptyState";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

interface Trip {
  id: string;
  title: string;
  description: string | null;
  destination: string;
  startDate: string;
  endDate: string;
  coverImage: string | null;
  status: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  isBookmarked: boolean;
}

interface DashboardClientProps {
  initialTrips: Trip[];
}

export default function DashboardClient({
  initialTrips,
}: DashboardClientProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isEditMode, setIsEditMode] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <Header isEditMode={isEditMode} />

      {/* 사이드바 */}
      <Sidebar isEditMode={isEditMode} />

      {/* 메인 콘텐츠 */}
      <main className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto py-6">
          <div className="relative px-0 py-6 mx-auto max-w-[1040px]">
            {/* L:nk, pages, delete 버튼 */}
            {trips.length > 0 && (
              <div
                className={`relative mb-[88px] ${
                  isEditMode ? "z-[1000]" : "z-10"
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* 왼쪽: L:nk + pages */}
                  <div className="flex items-center gap-0">
                    <span className="text-[20px] font-bold text-[#040404] dark:text-white font-inter">
                      L:nk
                    </span>
                    <div className="ml-[6px] px-[20px] py-[10px] rounded-[20px] bg-gradient-to-r from-[#89C2FF] to-[#5BA8FB] dark:from-gray-700 dark:to-gray-600">
                      <span className="text-[20px] font-bold text-[#040404] dark:text-white font-inter">
                        pages
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: delete 버튼 */}
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`
                      px-[20px] py-[10px] rounded-[20px] font-inter text-[20px] font-bold
                      transition-all duration-200 cursor-pointer
                      ${
                        isEditMode
                          ? "bg-[#5ba8fb] text-black"
                          : "bg-white dark:bg-gray-800 text-[#040404] dark:text-white border border-[#afb8c1] dark:border-gray-700"
                      }
                      hover:bg-[#5ba8fb] hover:text-white hover:border-[#afb8c1]
                    `}
                    style={{
                      position: "relative",
                      zIndex: isEditMode ? 1000 : 10,
                    }}
                  >
                    delete
                  </button>
                </div>
              </div>
            )}

            {/* 여행 목록 표시 or 빈 상태 UI */}
            {trips.length === 0 ? (
              <EmptyState />
            ) : (
              <TripGrid
                trips={trips}
                isEditMode={isEditMode}
                onTripDeleted={(id) => {
                  // 상태에서 삭제된 트립 제거
                  setTrips((prevTrips) => prevTrips.filter((t) => t.id !== id));
                }}
              />
            )}

            {/* 편집 모드일 때 배경 오버레이 */}
            {isEditMode && (
              <div
                className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[999]"
                onClick={() => setIsEditMode(false)}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
