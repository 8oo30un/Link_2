"use client";

import { useState, useEffect } from "react";
import TripCard from "./TripCard";

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

interface TripGridProps {
  trips: Trip[];
  isEditMode?: boolean;
  onTripDeleted?: (id: string) => void;
}

export default function TripGrid({
  trips: initialTrips,
  isEditMode = false,
  onTripDeleted,
}: TripGridProps) {
  const [trips, setTrips] = useState<Trip[]>(initialTrips);
  // 로딩 상태 관리 (향후 로딩 표시에 사용 가능)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [loadingTripId, setLoadingTripId] = useState<string | null>(null);

  // 초기 북마크 상태 설정
  useEffect(() => {
    setTrips(initialTrips);
  }, [initialTrips]);

  // 북마크된 개수 계산
  const bookmarkedCount = trips.filter((trip) => trip.isBookmarked).length;

  const handleBookmarkToggle = async (tripId: string) => {
    const trip = trips.find((t) => t.id === tripId);
    if (!trip) return;

    // 최대 5개 제한 확인
    if (!trip.isBookmarked && bookmarkedCount >= 5) {
      alert("북마크는 최대 5개까지만 가능합니다.");
      return;
    }

    setLoadingTripId(tripId);

    try {
      const response = await fetch(`/api/trips/${tripId}/bookmark`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "북마크 토글에 실패했습니다.");
        return;
      }

      const data = await response.json();

      // 상태 업데이트
      setTrips((prevTrips) =>
        prevTrips.map((t) =>
          t.id === tripId ? { ...t, isBookmarked: data.trip.isBookmarked } : t
        )
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
      alert("북마크 토글 중 오류가 발생했습니다.");
    } finally {
      setLoadingTripId(null);
    }
  };

  const handleDelete = async (tripId: string) => {
    setLoadingTripId(tripId);

    try {
      const response = await fetch(`/api/trips/${tripId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.error || "삭제에 실패했습니다.");
        return;
      }

      // 상태에서 제거
      setTrips((prevTrips) => prevTrips.filter((t) => t.id !== tripId));

      // 부모 컴포넌트에 알림
      onTripDeleted?.(tripId);
    } catch (error) {
      console.error("Error deleting trip:", error);
      alert("삭제 중 오류가 발생했습니다.");
    } finally {
      setLoadingTripId(null);
    }
  };

  return (
    <div
      className={`relative w-full flex justify-center ${
        isEditMode ? "z-[1000]" : "z-10"
      }`}
    >
      {/* 반응형 그리드 배열 */}
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-8 md:gap-10 lg:gap-12 justify-items-center">
        {trips.map((trip) => (
          <TripCard
            key={trip.id}
            trip={trip}
            isEditMode={isEditMode}
            isBookmarked={trip.isBookmarked || false}
            bookmarkedCount={bookmarkedCount}
            onBookmarkToggle={() => handleBookmarkToggle(trip.id)}
            onDelete={() => handleDelete(trip.id)}
          />
        ))}
      </div>
    </div>
  );
}
