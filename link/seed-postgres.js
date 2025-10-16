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
  console.log("🌱 Starting database seeding...");

  // 기존 데이터 정리
  await prisma.trip.deleteMany();
  await prisma.user.deleteMany();

  // 테스트 사용자 생성
  const testUser = await prisma.user.create({
    data: {
      email: "22100157@handong.ac.kr",
      name: "김우현",
      image: "https://lh3.googleusercontent.com/a/ACg8ocK...",
    },
  });

  console.log("✅ Created user:", testUser.email);

  // 샘플 여행 데이터 생성
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
      userId: testUser.id,
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
      userId: testUser.id,
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
      userId: testUser.id,
    },
  ];

  for (const tripData of sampleTrips) {
    const trip = await prisma.trip.create({
      data: tripData,
    });
    console.log("✅ Created trip:", trip.title);
  }

  console.log("🎉 Database seeding completed!");
  console.log(
    `📊 Created ${sampleTrips.length} trips for user ${testUser.email}`
  );
}

main()
  .catch((e) => {
    console.error("❌ Error during seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
