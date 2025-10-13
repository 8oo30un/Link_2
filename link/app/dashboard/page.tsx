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

  // 여행 목록 조회
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
      {/* 페이지 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          내 여행
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          함께하는 설렘을 계획하고 공유하세요
        </p>
      </div>

      {/* 여행 목록 또는 빈 상태 */}
      {trips.length === 0 ? <EmptyState /> : <TripGrid trips={trips} />}
    </div>
  );
}
