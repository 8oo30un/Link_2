const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // 실제 사용자 ID (터미널 로그에서 확인된 ID)
  const realUserId = "101805707966708549404";

  // 기존 사용자가 있는지 확인
  let user = await prisma.user.findUnique({
    where: { id: realUserId },
  });

  if (!user) {
    // 사용자가 없으면 생성
    user = await prisma.user.create({
      data: {
        id: realUserId,
        name: "김우현학부생",
        email: "22100157@handong.ac.kr",
        image:
          "https://lh3.googleusercontent.com/a/ACg8ocKV26Czf3hs9lgttfmO-q2pk20YJp81bGgRx07jD5C3023emw=s96-c",
      },
    });
    console.log("사용자가 생성되었습니다:", user);
  } else {
    console.log("기존 사용자를 찾았습니다:", user);
  }

  // 샘플 여행 데이터 생성
  const trip1 = await prisma.trip.create({
    data: {
      title: "서울 여행",
      destination: "서울",
      description: "서울 명소 탐방",
      startDate: new Date("2024-01-15"),
      endDate: new Date("2024-01-18"),
      status: "planning",
      userId: realUserId,
      isBookmarked: false,
    },
  });

  const trip2 = await prisma.trip.create({
    data: {
      title: "부산 바다 여행",
      destination: "부산",
      description: "부산 해운대와 감천문화마을",
      startDate: new Date("2024-02-10"),
      endDate: new Date("2024-02-12"),
      status: "planning",
      userId: realUserId,
      isBookmarked: true,
    },
  });

  console.log("샘플 데이터가 생성되었습니다:", { trip1, trip2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
