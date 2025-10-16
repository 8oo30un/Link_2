import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

// 여행 목록 조회
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const trips = await prisma.trip.findMany({
      where: {
        user: {
          email: session.user.email,
        },
      },
      orderBy: {
        startDate: "desc",
      },
    });

    return NextResponse.json({ trips }, { status: 200 });
  } catch (error) {
    console.error("Error fetching trips:", error);
    return NextResponse.json(
      { error: "Failed to fetch trips" },
      { status: 500 }
    );
  }
}

// 여행 생성
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const destination = formData.get("destination") as string;
    const startDate = formData.get("startDate") as string;
    const endDate = formData.get("endDate") as string;
    const coverImageFile = formData.get("coverImage") as File | null;

    // 필수 필드 검증
    if (!title || !destination || !startDate || !endDate) {
      return NextResponse.json(
        { error: "필수 필드를 모두 입력해주세요." },
        { status: 400 }
      );
    }

    // 커버 이미지 업로드
    let coverImageUrl: string | undefined;
    if (coverImageFile && coverImageFile.size > 0) {
      const blob = await put(coverImageFile.name, coverImageFile, {
        access: "public",
      });
      coverImageUrl = blob.url;
    }

    // 사용자 찾기
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 여행 생성
    const trip = await prisma.trip.create({
      data: {
        title,
        description: description || null,
        destination,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverImage: coverImageUrl,
        userId: user.id,
      },
    });

    return NextResponse.json({ trip }, { status: 201 });
  } catch (error) {
    console.error("Error creating trip:", error);
    return NextResponse.json(
      { error: "Failed to create trip" },
      { status: 500 }
    );
  }
}
