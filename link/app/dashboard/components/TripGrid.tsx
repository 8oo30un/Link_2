"use client";

import { useState } from "react";
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
}

interface TripGridProps {
  trips: Trip[];
  isEditMode?: boolean;
  onTripDeleted?: (id: string) => void;
}

export default function TripGrid({
  trips,
  isEditMode = false,
  onTripDeleted,
}: TripGridProps) {
  const [bookmarkedTrips, setBookmarkedTrips] = useState<Set<string>>(
    new Set()
  );

  const handleBookmarkToggle = (tripId: string) => {
    setBookmarkedTrips((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(tripId)) {
        newSet.delete(tripId);
      } else {
        // 최대 5개 제한
        if (newSet.size >= 5) {
          alert("북마크는 최대 5개까지만 가능합니다.");
          return prev;
        }
        newSet.add(tripId);
      }
      return newSet;
    });
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
            isBookmarked={bookmarkedTrips.has(trip.id)}
            bookmarkedCount={bookmarkedTrips.size}
            onBookmarkToggle={() => handleBookmarkToggle(trip.id)}
            onDelete={() => onTripDeleted?.(trip.id)}
          />
        ))}
      </div>
    </div>
  );
}
