import Image from "next/image";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div
        className="relative w-full h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8"
        style={{
          background: "linear-gradient(180deg, #5BA8FB 0%, #FFF 140%)",
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
      </div>

      {/* Bottom Gradient */}
      {/* <div
        className="h-32 w-full"
        style={{ background: "linear-gradient(180deg, #FFF 0%, #7EBCFF 100%)" }}
      ></div> */}
    </div>
  );
}
