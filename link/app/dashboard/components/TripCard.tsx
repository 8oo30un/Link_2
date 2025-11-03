"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

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
  isBookmarked?: boolean;
  members?: string[];
  color?: string;
}

interface TripCardProps {
  trip: Trip;
  isEditMode?: boolean;
  isBookmarked?: boolean;
  bookmarkedCount?: number;
  onBookmarkToggle?: () => void;
  onDelete?: () => void;
}

// 색상별 이미지 매핑
const imageMap: { [key: string]: string } = {
  purple: "/images/icons/tripIcons/purple.png",
  green: "/images/icons/tripIcons/green.png",
  pink: "/images/icons/tripIcons/pink.png",
  darkblue: "/images/icons/tripIcons/blue.png",
  black: "/images/icons/tripIcons/black.png",
  orange: "/images/icons/tripIcons/orange.png",
  red: "/images/icons/tripIcons/red.png",
  gray: "/images/icons/tripIcons/gray.png",
  lightblue: "/images/icons/tripIcons/skyblue.png",
};

// 기본 배경 이미지 (다크모드/라이트모드별)
const getPieceBackground = (isDark: boolean) => {
  return isDark
    ? "/images/backgrounds/TripCard_D.png"
    : "/images/backgrounds/TripCard_L.png";
};

export default function TripCard({
  trip,
  isEditMode = false,
  isBookmarked = false,
  bookmarkedCount = 0,
  onBookmarkToggle,
  onDelete,
}: TripCardProps) {
  const [isDark, setIsDark] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const hasClassDark = document.documentElement.classList.contains("dark");
      const systemDark = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
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

  // 날짜 포맷팅
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getFullYear()}-${
      start.getMonth() + 1
    }-${start.getDate()} - ${end.getFullYear()}-${
      end.getMonth() + 1
    }-${end.getDate()}`;
  };

  // 색상 키 결정 (저장된 색상 또는 기본값)
  const getColorKey = () => {
    return trip.color || "purple";
  };

  const colorKey = getColorKey();
  const backgroundImage = imageMap[colorKey] || imageMap.purple;
  const pieceBackgroundImage = getPieceBackground(isDark);

  // 삭제 아이콘 컴포넌트
  const DeleteIcon = ({
    onClick,
    isDark,
  }: {
    onClick: () => void;
    isDark: boolean;
  }) => {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }}
        className="cursor-pointer"
        style={{
          filter: isDark ? "invert(1) brightness(0.9)" : "none",
          display: "inline-block",
        }}
      >
        {/* @ts-expect-error: lord-icon is a custom element */}
        <lord-icon
          src="https://cdn.lordicon.com/nqtddedc.json"
          trigger="hover"
          state="hover-cross-3"
          className="w-6 h-6 sm:w-10 sm:h-10"
        />
      </div>
    );
  };

  // 북마크 아이콘 컴포넌트
  const BookMarkIcon = ({
    onClick,
    isMarked,
    totalCount,
    isDark,
  }: {
    onClick: () => void;
    isMarked: boolean;
    totalCount: number;
    isDark: boolean;
  }) => {
    return (
      <div
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();

          // 북마크 개수가 5개 이상이고 현재 체크가 해제된 상태라면 클릭 무효화
          if (totalCount >= 5 && !isMarked) {
            return;
          }

          onClick();
        }}
        style={{
          cursor: totalCount >= 5 && !isMarked ? "not-allowed" : "pointer",
          display: "inline-block",
        }}
      >
        {/* @ts-expect-error: lord-icon is a custom element */}
        <lord-icon
          src="https://cdn.lordicon.com/oiiqgosg.json"
          trigger="hover"
          state={isMarked ? "morph-marked" : "morph-unmarked"}
          colors={
            isMarked
              ? "primary:#5ba8fb,secondary:#5ba8fb"
              : isDark
              ? "primary:#ffffff,secondary:#ffffff"
              : "primary:#bcbcbc,secondary:#bcbcbc"
          }
          style={{
            zIndex: "0",
          }}
          className="w-6 h-6 sm:w-10 sm:h-10"
          key={`bookmark-${isMarked}`}
        />
      </div>
    );
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const cancelDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  const CardContent = (
    <div className={`relative ${isEditMode ? "z-[1000]" : "z-10"}`}>
      {/* 메인 카드 컨테이너 */}
      <div
        className={`trip-card ${
          isEditMode ? "no-hover" : ""
        } w-[330px] h-[180px] sm:w-[484px] sm:h-[260px] rounded-[10px] overflow-hidden relative z-0`}
        style={{
          backgroundImage: `url('${pieceBackgroundImage}')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* 카드 내용 컨테이너 */}
        <div className="w-full h-full flex">
          {/* 왼쪽 컨테이너 - 텍스트 정보 */}
          <div className="flex flex-col w-[210px] sm:w-[234px] md:w-[264px] lg:w-[267px]">
            {/* 제목 섹션 */}
            <div className="h-[38px] flex flex-col justify-start mt-4 mx-3 sm:mx-4 md:mx-5">
              <div className="text-[#AFB8C1] dark:text-gray-400 text-xs font-normal leading-3 font-['Product_Sans']">
                제목
              </div>
              <div className="text-[#040404] dark:text-white text-sm sm:text-base md:text-lg lg:text-xl font-bold leading-[20px] sm:leading-[22px] md:leading-[24px] lg:leading-[26px] font-inter">
                {trip.title || "제목 없음"}
              </div>
            </div>

            {/* 날짜 섹션 */}
            <div className="h-[38px] flex flex-col justify-start mt-[6px] mx-3 sm:mx-4 md:mx-5">
              <div className="text-[#AFB8C1] dark:text-gray-400 text-xs font-normal leading-3 font-['Product_Sans']">
                날짜
              </div>
              <div className="text-[#040404] dark:text-white text-xs font-normal leading-4 font-['Product_Sans']">
                {formatDateRange(trip.startDate, trip.endDate) ||
                  "날짜 정보 없음"}
              </div>
            </div>

            {/* 멤버 섹션 */}
            <div className="flex flex-col justify-start mt-[0px] mx-3 sm:mx-4 md:mx-5">
              <div className="text-[#AFB8C1] dark:text-gray-400 text-xs font-normal leading-3 font-['Product_Sans']">
                멤버
              </div>
              <div className="mt-[7px] w-full flex flex-wrap gap-[8px] sm:gap-[10px]">
                {trip.members && trip.members.length > 0 ? (
                  trip.members.map((member, index) => (
                    <div
                      key={index}
                      className="text-[#040404] dark:text-gray-800 text-sm sm:text-base font-normal leading-4 font-['Product_Sans'] min-w-[60px] sm:min-w-[64px] h-5 sm:h-6 flex-shrink-0 rounded-[20px] bg-white dark:bg-gray-200 flex items-center justify-center px-2"
                    >
                      {member}
                    </div>
                  ))
                ) : (
                  <div className="text-[#040404] dark:text-gray-800 text-sm sm:text-base font-normal leading-4 font-['Product_Sans'] min-w-[60px] sm:min-w-[64px] h-5 sm:h-6 flex-shrink-0 rounded-[20px] bg-white dark:bg-gray-200 flex items-center justify-center px-2">
                    멤버 없음
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 오른쪽 컨테이너 - 트립피스 이미지 */}
          <div className="w-[217px] h-[260px] flex items-center justify-center">
            <div
              className="w-[170px] h-[170px] sm:w-[150px] sm:h-[150px] md:w-[180px] md:h-[180px] lg:w-[200px] lg:h-[200px] rounded-[10px] z-[1]] 
                         translate-y-[-30px] sm:translate-y-[-8px] md:translate-y-[8px] lg:translate-y-2
                         translate-x-[5px] sm:translate-x-[-8px] md:translate-x-[-12px] lg:translate-x-[-15px]"
              style={{
                backgroundImage: `url('${backgroundImage}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
          </div>
        </div>

        {/* 편집 모드일 때 삭제 버튼 */}
        {isEditMode && (
          <div className="absolute top-1 right-1 z-[500]">
            <DeleteIcon onClick={handleDelete} isDark={isDark} />
          </div>
        )}

        {/* 일반 모드일 때 북마크 버튼 */}
        {!isEditMode && (
          <div className="absolute top-1 right-1 z-[500]">
            <BookMarkIcon
              onClick={onBookmarkToggle || (() => {})}
              isMarked={isBookmarked}
              totalCount={bookmarkedCount}
              isDark={isDark}
            />
          </div>
        )}

        {/* 삭제 확인 모달 */}
        {showDeleteConfirm && (
          <div
            className="absolute inset-0 bg-black/70 z-[600] flex items-center justify-center"
            onClick={cancelDelete}
          >
            <div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-2xl max-w-sm mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                {trip.title} 카드를 삭제할까요?
              </h3>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={cancelDelete}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return isEditMode ? (
    <div className="block">{CardContent}</div>
  ) : (
    <Link href={`/dashboard/trips/${trip.id}`} className="block">
      {CardContent}
    </Link>
  );
}
