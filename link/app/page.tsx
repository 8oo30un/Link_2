import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #5BA8FB 0%, #FFF 80%)",
        }}
      >
        <div>
          {/* Logo */}
          <div className="mt-[191px] mb-0 sm:mb-0 flex justify-center ">
            <Image
              src="/images/logos/landingLogo.png"
              alt="Landing Logo"
              width={360}
              height={260}
              className="w-auto h-auto max-w-[240px] sm:max-w-[300px] lg:max-w-[360px]"
              priority
            />
          </div>

          {/* Main Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="text-[160px] font-bold text-white mb-6  h-[120px] flex items-center justify-center mt-7">
              L:nk
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center">
              <button className="bg-[#5BA8FB] hover:bg-[#5BA8FB] text-white font-bold py-4 rounded-[20px] text-3xl sm:text-3xl transition-colors duration-200 w-[360px] sm:w-[360px] mt-13">
                함께 링크하기
              </button>
            </div>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-16 mb-8 flex justify-center h-[200px] sm:h-[300px] md:h-[400px] lg:h-[500px] w-full">
          <div className="flex items-center justify-center text-gray-500"></div>
        </div>

        <div className="mt-16 mb-8 flex flex-col lg:flex-row items-center gap-8 lg:gap-16 px-4">
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
            <h2 className="gradient-text-responsive text-center lg:text-left">
              <span
                className="text-blue"
                style={{
                  color: "#3597ff",
                  background: "none",
                  WebkitTextFillColor: "#3597ff",
                  backgroundClip: "initial",
                  WebkitBackgroundClip: "initial",
                }}
              >
                여행의 시작,
              </span>
              <br />
              함께하는 설렘을 더하다
            </h2>
            <p className="subtitle-text text-center lg:text-left mt-6">
              여행 준비를 위한 참여자-주최자 간<br />
              양방향 소통 플랫폼 "L:nk"
            </p>
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
