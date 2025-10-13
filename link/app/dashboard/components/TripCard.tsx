"use client";

import Image from "next/image";
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
}

export default function TripCard({ trip }: TripCardProps) {
  const [isDark, setIsDark] = useState(false);

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

  return (
    <Link href={`/dashboard/trips/${trip.id}`} className="block">
      {/* 
        ===================================
        벤토 카드 디자인 영역
        배경 이미지가 카드 전체 디자인
        ===================================
      */}
      <div
        className={`relative w-[484px] h-[260px] rounded-lg overflow-hidden transition-all ${
          isDark ? "shadow-md hover:shadow-xl" : ""
        }`}
        style={{
          backgroundImage: `url('${backgroundImage}')`,
          backgroundSize: "contain",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* 카드 내용을 여기에 추가하세요 */}
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
      </div>
      {/* 
        ===================================
        벤토 카드 디자인 끝
        ===================================
      */}
    </Link>
  );
}
