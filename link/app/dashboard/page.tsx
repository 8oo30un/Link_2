"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import TripGrid from "../dashboard/components/TripGrid";
import EmptyState from "../dashboard/components/EmptyState";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await fetch("/api/trips");
        if (response.ok) {
          const data = await response.json();
          setTrips(data.trips || []);
        }
      } catch (error) {
        console.error("Failed to fetch trips:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchTrips();
    }
  }, [status]);

  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="relative px-0 py-6 mx-auto max-w-[1040px]">
      {/* L:nk, pages, delete 버튼 */}
      {trips.length > 0 && (
        <div
          className={`relative mb-[88px] ${isEditMode ? "z-[100]" : "z-10"}`}
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
              style={{ position: "relative", zIndex: isEditMode ? 100 : 10 }}
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
            setTrips(trips.filter((t: any) => t.id !== id));
          }}
        />
      )}

      {/* 편집 모드일 때 배경 오버레이 */}
      {isEditMode && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/50 z-[50]"
          onClick={() => setIsEditMode(false)}
        />
      )}
    </div>
  );
}
