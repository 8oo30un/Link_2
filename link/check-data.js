const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function checkData() {
  try {
    // 모든 사용자 확인
    const users = await prisma.user.findMany();
    console.log("모든 사용자:", users);

    // 모든 여행 데이터 확인
    const trips = await prisma.trip.findMany();
    console.log("모든 여행 데이터:", trips);

    // 특정 사용자의 여행 데이터 확인
    const userTrips = await prisma.trip.findMany({
      where: {
        userId: "101805707966708549404",
      },
    });
    console.log("사용자 101805707966708549404의 여행 데이터:", userTrips);
  } catch (error) {
    console.error("에러:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
