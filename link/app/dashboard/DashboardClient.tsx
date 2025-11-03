"use client";

import { useState, useMemo, useEffect } from "react";
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

type SortOption = "created" | "upcoming";

interface DashboardClientProps {
  initialTrips: Trip[];
}

export default function DashboardClient({
  initialTrips,
}: DashboardClientProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  const [isEditMode, setIsEditMode] = useState(false);
  const [sortOption, setSortOption] = useState<SortOption | "">("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const hasClassDark = document.documentElement.classList.contains("dark");
      const systemDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const isDarkMode = hasClassDark || systemDark;
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", checkDarkMode);
    };
  }, []);

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest("#sort-dropdown-container")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // 정렬된 trips 계산
  const sortedTrips = useMemo(() => {
    // sortOption이 없으면 기본적으로 "upcoming" 정렬 적용
    const activeSortOption = sortOption || "upcoming";

    const sorted = [...trips];

    if (activeSortOption === "created") {
      // 링크 생성순: createdAt 기준 최신순
      return sorted.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (activeSortOption === "upcoming") {
      // 링크 가까운 순: 다가오는 일정 → 지난 일정
      const now = new Date();
      const upcoming = sorted.filter(
        (trip) => new Date(trip.startDate).getTime() >= now.getTime()
      );
      const past = sorted.filter(
        (trip) => new Date(trip.startDate).getTime() < now.getTime()
      );

      // 다가오는 일정: startDate 오름차순 (가까운 순)
      upcoming.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );

      // 지난 일정: startDate 내림차순 (최근 순)
      past.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );

      return [...upcoming, ...past];
    }

    return sorted;
  }, [trips, sortOption]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <Header isEditMode={isEditMode} />

      {/* 사이드바 */}
      <Sidebar isEditMode={isEditMode} />

      {/* 메인 콘텐츠 */}
      <main className="min-h-screen pt-0 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto pt-0">
          <div className="relative px-0 mx-auto max-w-[1040px]">
            {/* 정렬 드롭다운 */}
            {trips.length > 0 && (
              <div
                className={`relative mx-[-20px] mb-8 ${
                  isEditMode ? "z-[100]" : "z-[1002]"
                }`}
                style={{
                  width: "fit-content",
                }}
              >
                <div
                  className="relative rounded-[20px] custom-dropdown"
                  id="sort-dropdown-container"
                  style={{
                    zIndex: isEditMode ? 100 : 1002,
                  }}
                >
                  {/* 드롭다운 버튼 */}
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="custom-dropdown-button bg-white dark:bg-gray-800 font-bold border border-[#afb8c1] dark:border-gray-700 rounded-[20px] pl-4 pr-3 py-2 text-sm sm:pl-4 sm:pr-3 sm:py-2.5 sm:text-base md:pl-5 md:pr-4 md:text-[16px] font-inter text-[#040404] dark:text-white cursor-pointer focus:outline-none transition-all w-full sm:w-auto flex items-center justify-between relative"
                    style={{
                      zIndex: isEditMode ? 100 : 1002,
                    }}
                  >
                    <span>
                      {sortOption === "upcoming"
                        ? "링크 가까운 순"
                        : sortOption === "created"
                        ? "링크 생성순"
                        : "선택"}
                    </span>
                  </button>

                  {/* Lord Icon 드롭다운 아이콘 - 버튼 외부에 절대 위치로 배치 */}
                  <div
                    className="flex items-center sort-dropdown-icon-wrapper absolute pointer-events-none"
                    style={{
                      right: "12px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      zIndex: isEditMode ? 100 : 1003,
                    }}
                  >
                    {/* @ts-expect-error: lord-icon is a custom element */}
                    <lord-icon
                      src="https://cdn.lordicon.com/rmkahxvq.json"
                      trigger="none"
                      colors={isDark ? "primary:#ffffff" : "primary:#5ba8fb"}
                      className="dropdown-icon-thick"
                      style={{
                        width: "24px",
                        height: "24px",
                        transform: isDropdownOpen
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                        transition: "transform 0.5s ease",
                        position: "relative",
                        zIndex: isEditMode ? 100 : 1003,
                      }}
                    />
                  </div>

                  {/* 드롭다운 메뉴 */}
                  {isDropdownOpen && (
                    <div
                      className="custom-dropdown-menu absolute left-0 bg-white dark:bg-gray-800 border border-[#afb8c1] dark:border-gray-700 rounded-[20px] shadow-lg"
                      style={{
                        top: 0,
                        zIndex: isEditMode ? 100 : 1002,
                      }}
                    >
                      {/* 선택된 옵션을 맨 위에 표시 */}
                      {sortOption === "" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            선택
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("created");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            링크 생성순
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("upcoming");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            링크 가까운 순
                          </button>
                        </>
                      ) : sortOption === "upcoming" ? (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("upcoming");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            링크 가까운 순
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("created");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            링크 생성순
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("created");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            링크 생성순
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setSortOption("upcoming");
                              setIsDropdownOpen(false);
                            }}
                            className="custom-dropdown-option w-full text-left pl-4 pr-10 text-sm sm:pl-4 sm:pr-12 sm:text-base md:pl-5 md:pr-14 md:text-[16px] font-bold font-inter transition-colors bg-white dark:bg-gray-800 text-[#040404] dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                          >
                            링크 가까운 순
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* L:nk, pages, delete 버튼 */}
            {trips.length > 0 && (
              <div
                className={`relative mb-10 sm:mb-16 md:mb-[50px] ${
                  isEditMode ? "z-[1000]" : "z-10"
                }`}
              >
                <div className="flex items-center justify-between">
                  {/* 왼쪽: L:nk + pages */}
                  <div className="flex items-center gap-0">
                    <span className="text-base sm:text-lg md:text-[20px] font-bold text-[#040404] dark:text-white font-inter">
                      L:nk
                    </span>
                    <div className="ml-[4px] sm:ml-[6px] px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] md:px-[20px] md:py-[10px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] bg-gradient-to-r from-[#89C2FF] to-[#5BA8FB] dark:from-gray-700 dark:to-gray-600">
                      <span className="text-base sm:text-lg md:text-[20px] font-bold text-[#040404] dark:text-white font-inter">
                        pages
                      </span>
                    </div>
                  </div>

                  {/* 오른쪽: delete 버튼 */}
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className={`
                      px-[12px] py-[6px] sm:px-[16px] sm:py-[8px] md:px-[20px] md:py-[10px] rounded-[16px] sm:rounded-[18px] md:rounded-[20px] font-inter text-base sm:text-lg md:text-[20px] font-bold
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
                trips={sortedTrips}
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
