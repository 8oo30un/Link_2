"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

interface Trip {
  id: string;
  title: string;
  description: string | null;
  destination: string;
  startDate: Date;
  endDate: Date;
  coverImage: string | null;
  status: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface TripCardProps {
  trip: Trip;
  isEditMode?: boolean;
  isBookmarked?: boolean;
  bookmarkedCount?: number;
  onBookmarkToggle?: () => void;
  onDelete?: () => void;
}

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
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.getFullYear()}-${
      start.getMonth() + 1
    }-${start.getDate()} - ${end.getFullYear()}-${
      end.getMonth() + 1
    }-${end.getDate()}`;
  };

  // 배경 이미지 선택 (라이트/다크)
  const backgroundImage = isDark
    ? "/images/backgrounds/TripCard_D.png"
    : "/images/backgrounds/TripCard_L.png";

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
          style={{
            width: "40px",
            height: "40px",
          }}
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
            width: "40px",
            height: "40px",
            zIndex: "0",
          }}
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
    <div
      className={`relative w-[484px] h-[260px] rounded-lg overflow-hidden transition-all ${
        isDark ? "shadow-md hover:shadow-xl" : ""
      } ${isEditMode ? "z-[100]" : "z-10"}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: "contain",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* 편집 모드일 때 삭제 버튼 */}
      {isEditMode && (
        <div className="absolute top-1 right-1 z-[350]">
          <DeleteIcon onClick={handleDelete} isDark={isDark} />
        </div>
      )}

      {/* 일반 모드일 때 북마크 버튼 */}
      {!isEditMode && (
        <div className="absolute top-1 right-1 z-[350]">
          <BookMarkIcon
            onClick={onBookmarkToggle || (() => {})}
            isMarked={isBookmarked}
            totalCount={bookmarkedCount}
            isDark={isDark}
          />
        </div>
      )}

      {/* 카드 내용 */}
      <div className="relative z-10 p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {trip.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
          📍 {trip.destination}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          📅 {formatDateRange(trip.startDate, trip.endDate)}
        </p>
      </div>

      {/* 삭제 확인 모달 */}
      {showDeleteConfirm && (
        <div
          className="absolute inset-0 bg-black/70 z-[360] flex items-center justify-center"
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
  );

  return isEditMode ? (
    <div className="block">{CardContent}</div>
  ) : (
    <Link href={`/dashboard/trips/${trip.id}`} className="block">
      {CardContent}
    </Link>
  );
}
