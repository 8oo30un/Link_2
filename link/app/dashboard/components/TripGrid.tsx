"use client";

import TripCard from "./TripCard";

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

interface TripGridProps {
  trips: Trip[];
}

export default function TripGrid({ trips }: TripGridProps) {
  return (
    <div className="relative w-full flex justify-center">
      {/* 가로 2개씩 그리드 배열 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {trips.map((trip) => (
          <TripCard key={trip.id} trip={trip} />
        ))}
      </div>
    </div>
  );
}
