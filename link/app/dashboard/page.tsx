import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import TripGrid from "../dashboard/components/TripGrid";
import EmptyState from "../dashboard/components/EmptyState";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  // 서버에서 여행 목록 데이터 가져오기 (SSR)
  const trips = await prisma.trip.findMany({
    where: {
      user: {
        email: session.user?.email || "",
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* 
        ===================================
        페이지 헤더 영역 (선택사항)
        필요하면 여기에 추가하세요
        ===================================
      */}

      {/* 여행 목록 표시 or 빈 상태 UI */}
      {trips.length === 0 ? <EmptyState /> : <TripGrid trips={trips} />}
    </div>
  );
}
