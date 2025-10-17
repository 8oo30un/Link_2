const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient({
  datasources: {
    db: {
      url:
        process.env.DATABASE_URL ||
        "postgres://1dd2f2aea5489dcfd88156041704f4e0d268bde76d1bc949e36bba0daa94cb4b:sk_TWzxoFFlFt5g86odmWri2@db.prisma.io:5432/postgres?sslmode=require",
    },
  },
});

async function main() {
  console.log("🔍 Checking existing users...");

  // 모든 사용자 조회
  const users = await prisma.user.findMany();
  console.log(
    "📊 Existing users:",
    users.map((u) => ({ id: u.id, email: u.email, name: u.name }))
  );

  // 특정 이메일로 사용자 찾기
  const targetEmail = "22100157@handong.ac.kr";
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
  });

  if (!user) {
    console.log("❌ User not found, creating new user...");
    const newUser = await prisma.user.create({
      data: {
        email: targetEmail,
        name: "김우현학부생",
        image:
          "https://lh3.googleusercontent.com/a/ACg8ocKV26Czf3hs9lgttfmO-q2pk20YJp81bGgRx07jD5C3023emw=s96-c",
      },
    });
    console.log("✅ Created user:", newUser);
  } else {
    console.log("✅ Found user:", user);
  }

  // 사용자의 trips 조회
  const trips = await prisma.trip.findMany({
    where: {
      userId:
        user?.id ||
        (
          await prisma.user.findUnique({ where: { email: targetEmail } })
        )?.id,
    },
  });
  console.log("📊 User trips:", trips.length);

  if (trips.length === 0) {
    console.log("🌱 Adding sample trips...");

    const userId =
      user?.id ||
      (await prisma.user.findUnique({ where: { email: targetEmail } }))?.id;

    const sampleTrips = [
      {
        title: "제주도 힐링 여행",
        description: "친구들과 함께하는 제주도 3박 4일 여행",
        destination: "제주도",
        startDate: new Date("2024-11-01"),
        endDate: new Date("2024-11-04"),
        status: "planning",
        isBookmarked: false,
        members: JSON.stringify(["김우현", "박민수", "이지은"]),
        color: "purple",
        userId: userId,
      },
      {
        title: "부산 바다 여행",
        description: "가족과 함께하는 부산 해운대 여행",
        destination: "부산",
        startDate: new Date("2024-12-15"),
        endDate: new Date("2024-12-17"),
        status: "planning",
        isBookmarked: true,
        members: JSON.stringify(["김우현", "김엄마", "김아빠"]),
        color: "blue",
        userId: userId,
      },
      {
        title: "서울 맛집 투어",
        description: "서울의 유명한 맛집들을 돌아다니는 투어",
        destination: "서울",
        startDate: new Date("2024-10-20"),
        endDate: new Date("2024-10-20"),
        status: "completed",
        isBookmarked: false,
        members: JSON.stringify(["김우현", "최영희"]),
        color: "pink",
        userId: userId,
      },
    ];

    for (const tripData of sampleTrips) {
      const trip = await prisma.trip.create({
        data: tripData,
      });
      console.log("✅ Created trip:", trip.title);
    }
  }

  console.log("🎉 Data fix completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
