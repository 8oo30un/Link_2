import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-blue-400 to-white dark:from-gray-800 dark:to-blue-400">
        <div>
          {/* Logo */}
          <div className="mt-[191px] mb-0 sm:mb-0 flex justify-center ">
            <Image
              src="/images/logos/landingLogo.png"
              alt="Landing Logo"
              width={360}
              height={260}
              className="w-auto h-auto max-w-[200px] sm:max-w-[300px] lg:max-w-[360px]"
              priority
            />
          </div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-8xl sm:text-7xl md:text-[140px] lg:text-[170px] font-bold text-white dark:text-gray-100 mb-6 flex items-center justify-center mt-7">
              L:nk
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <Link
                href="/auth/login"
                className="bg-[#5BA8FB] hover:bg-[#4A97EA] dark:bg-blue-600 dark:hover:bg-blue-700 text-white font-bold py-4 rounded-[20px] text-3xl sm:text-3xl transition-colors duration-200 w-[360px] sm:w-[360px] mt-13 flex items-center justify-center shadow-lg hover:shadow-xl"
              >
                함께 링크하기
              </Link>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 mb-[191px] flex justify-center h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] w-full">
          <div className="flex items-center justify-center text-gray-500 dark:text-gray-400"></div>
        </div>

        <div className="mt-16 mb-[30vh] flex flex-col lg:flex-row items-center gap-8 lg:gap-16 px-4">
          <div className="flex-1 flex justify-center lg:justify-start">
            <Image
              src="/images/backgrounds/LandingDetail1.png"
              alt="Landing 1"
              width={800}
              height={600}
              className="max-w-full h-auto w-full max-w-[400px] sm:max-w-[500px] lg:max-w-[600px]"
              priority
            />
          </div>
          <div className="flex-1 flex flex-col justify-center lg:justify-start">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center lg:text-left text-gray-900 dark:text-white">
              <span className="text-blue-600 dark:text-blue-400">
                여행의 시작,
              </span>
              <br />
              함께하는 설렘을 더하다
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-500 dark:text-gray-400 font-bold text-center lg:text-left mt-6">
              여행 준비를 위한 참여자-주최자 간<br />
              양방향 소통 플랫폼 &ldquo;L:nk&rdquo;
            </p>
          </div>
        </div>

        <div className="mt-16 mb-[30vh] w-full px-4 sm:px-6 lg:px-8">
          {/* 모바일/태블릿 레이아웃 (레이어드) */}
          <div className="lg:hidden relative max-w-2xl mx-auto min-h-[400px] sm:min-h-[450px]">
            {/* 왼쪽 이미지 - 텍스트 위에 절대 위치 */}
            <div className="absolute left-0 sm:left-4 top-0 z-0">
              <div className="w-[110px] sm:w-[140px] md:w-[160px] rotate-[-10deg]">
                <Image
                  src="/images/backgrounds/L1.png"
                  alt="Landing Left"
                  width={200}
                  height={240}
                  className="w-full h-auto drop-shadow-lg opacity-70"
                  priority
                />
              </div>
            </div>

            {/* 오른쪽 이미지 - 텍스트 위에 절대 위치 */}
            <div className="absolute right-0 sm:right-4 top-8 sm:top-12 z-0">
              <div className="w-[130px] sm:w-[180px] md:w-[220px] rotate-[10deg]">
                <Image
                  src="/images/backgrounds/L2.png"
                  alt="Landing Right"
                  width={300}
                  height={360}
                  className="w-full h-auto drop-shadow-lg opacity-70"
                  priority
                />
              </div>
            </div>

            {/* 텍스트 (양쪽 이미지 사이) */}
            <div className="relative z-10 pt-24 sm:pt-28 md:pt-32 px-6 sm:px-8">
              <h2 className="text-base sm:text-lg md:text-xl font-bold text-center leading-relaxed text-gray-900 dark:text-white">
                여행 준비의 모든 정보를 한 곳에 모아, <br />
                주최자와 참여자 간의 여행 준비 과정의 <br />
                불편함을 해소하고 효율적인 소통과 <br />
                정보 공유를 도와드릴게요.
              </h2>
            </div>
          </div>

          {/* 데스크톱 레이아웃 (절대 위치) */}
          <div className="hidden lg:block">
            <div className="relative flex items-center justify-center min-h-[500px]">
              {/* 왼쪽 이미지 */}
              <div className="absolute left-[5%] xl:left-[8%] top-[35%] -translate-y-1/2">
                <div className="w-[180px] xl:w-[220px] rotate-[-10deg]">
                  <Image
                    src="/images/backgrounds/L1.png"
                    alt="Landing Left"
                    width={220}
                    height={264}
                    className="w-full h-auto drop-shadow-lg"
                    priority
                  />
                </div>
              </div>

              {/* 중앙 텍스트 */}
              <div className="relative z-10 flex items-center justify-center px-[250px] xl:px-[300px]">
                <h2 className="text-2xl xl:text-3xl 2xl:text-4xl font-bold text-center leading-relaxed text-gray-900 dark:text-white">
                  여행 준비의 모든 정보를 한 곳에 모아, <br />
                  주최자와 참여자 간의 여행 준비 과정의 <br />
                  불편함을 해소하고 효율적인 소통과 <br />
                  정보 공유를 도와드릴게요.
                </h2>
              </div>

              {/* 오른쪽 이미지 (더 크고 위에) */}
              <div className="absolute right-[5%] xl:right-[8%] top-[15%] -translate-y-1/2">
                <div className="w-[300px] xl:w-[380px] rotate-[10deg]">
                  <Image
                    src="/images/backgrounds/L2.png"
                    alt="Landing Right"
                    width={380}
                    height={456}
                    className="w-full h-auto drop-shadow-lg"
                    priority
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Gradient */}
      {/* <div
        className="h-32 w-full"
        style={{ background: "linear-gradient(180deg, #FFF 0%, #7EBCFF 100%)" }}
      ></div> */}
    </div>
  );
}
