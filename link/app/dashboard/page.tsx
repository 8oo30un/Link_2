import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { prisma } from "../../lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  try {
    // 서버에서 세션 확인
    const session = await getServerSession(authOptions);

    console.log("Session:", session);

    if (!session) {
      redirect("/auth/login");
    }

    console.log("User ID:", session.user?.id);

    // 서버에서 trips 데이터 가져오기
    const trips = await prisma.trip.findMany({
      where: {
        userId: session.user?.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log("Trips found:", trips.length);
    console.log("Trips data:", trips);

    // Date 객체를 직렬화 가능한 형태로 변환하고 members 파싱
    const serializedTrips = trips.map((trip) => ({
      ...trip,
      startDate: trip.startDate.toISOString(),
      endDate: trip.endDate.toISOString(),
      createdAt: trip.createdAt.toISOString(),
      updatedAt: trip.updatedAt.toISOString(),
      members: trip.members ? JSON.parse(trip.members) : [],
    }));

    console.log("Serialized trips:", serializedTrips.length);

    return <DashboardClient initialTrips={serializedTrips} />;
  } catch (error) {
    console.error("Error in DashboardPage:", error);
    return <DashboardClient initialTrips={[]} />;
  }
}
