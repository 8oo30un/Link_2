import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 북마크 토글
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const tripId = params.id;

    // 트립이 존재하고 사용자가 소유자인지 확인
    const trip = await prisma.trip.findUnique({
      where: { id: tripId },
    });

    if (!trip) {
      return NextResponse.json({ error: "Trip not found" }, { status: 404 });
    }

    if (trip.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 현재 북마크된 개수 확인 (최대 5개 제한)
    if (!trip.isBookmarked) {
      const bookmarkedCount = await prisma.trip.count({
        where: {
          userId: session.user.id,
          isBookmarked: true,
        },
      });

      if (bookmarkedCount >= 5) {
        return NextResponse.json(
          { error: "북마크는 최대 5개까지만 가능합니다." },
          { status: 400 }
        );
      }
    }

    // 북마크 토글
    const updatedTrip = await prisma.trip.update({
      where: { id: tripId },
      data: {
        isBookmarked: !trip.isBookmarked,
      },
    });

    return NextResponse.json({ trip: updatedTrip }, { status: 200 });
  } catch (error) {
    console.error("Error toggling bookmark:", error);
    return NextResponse.json(
      { error: "Failed to toggle bookmark" },
      { status: 500 }
    );
  }
}
