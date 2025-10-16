"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

// Lord Icon 타입 정의
/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace JSX {
    interface IntrinsicElements {
      "lord-icon": React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement>,
        HTMLElement
      > & {
        src?: string;
        trigger?: string;
        colors?: string;
        style?: React.CSSProperties;
      };
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

// Lord Icon 컴포넌트들
const AddIcon = ({ size = 40 }: { size?: number }) => {
  useEffect(() => {
    // lord-icon 스크립트 로드
    if (typeof window !== "undefined") {
      const win = window as Window & { lordicon?: unknown };
      if (!win.lordicon) {
        const script = document.createElement("script");
        script.src = "https://cdn.lordicon.com/lordicon.js";
        document.body.appendChild(script);
      }
    }
  }, []);

  return (
    // @ts-expect-error: lord-icon is a custom element
    <lord-icon
      src="https://cdn.lordicon.com/hqymfzvj.json"
      trigger="hover"
      colors="primary:#5ba8fb"
      style={{ width: `${size}px`, height: `${size}px` }}
    />
  );
};

const HomeIcon = ({
  size = 40,
  isDark = false,
}: {
  size?: number;
  isDark?: boolean;
}) => {
  return (
    <div
      style={{
        filter: isDark ? "invert(1) brightness(2)" : "none",
        display: "inline-block",
      }}
    >
      {/* @ts-expect-error: lord-icon is a custom element */}
      <lord-icon
        src="https://cdn.lordicon.com/cnpvyndp.json"
        trigger="hover"
        colors="primary:#040404"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

const ShareIcon = ({
  size = 40,
  isDark = false,
}: {
  size?: number;
  isDark?: boolean;
}) => {
  return (
    <div
      style={{
        filter: isDark ? "invert(1) brightness(2)" : "none",
        display: "inline-block",
      }}
    >
      {/* @ts-expect-error: lord-icon is a custom element */}
      <lord-icon
        src="https://cdn.lordicon.com/ercyvufy.json"
        trigger="hover"
        colors="primary:#040404"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

const AlarmIcon = ({
  size = 40,
  isDark = false,
}: {
  size?: number;
  isDark?: boolean;
}) => {
  return (
    <div
      style={{
        filter: isDark ? "invert(1) brightness(2)" : "none",
        display: "inline-block",
      }}
    >
      {/* @ts-expect-error: lord-icon is a custom element */}
      <lord-icon
        src="https://cdn.lordicon.com/vspbqszr.json"
        trigger="hover"
        colors="primary:#040404"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </div>
  );
};

interface SidebarProps {
  isEditMode?: boolean;
}

export default function Sidebar({ isEditMode = false }: SidebarProps) {
  const pathname = usePathname();
  const [windowWidth, setWindowWidth] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // 다크모드 감지 (여러 방법 시도)
    const checkDarkMode = () => {
      // 방법 1: HTML 클래스 체크
      const hasClassDark = document.documentElement.classList.contains("dark");

      // 방법 2: data-theme 체크
      const hasDataTheme =
        document.documentElement.getAttribute("data-theme") === "dark";

      // 방법 3: 시스템 다크모드 체크
      const systemDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;

      // 방법 4: body 클래스 체크
      const bodyDark = document.body.classList.contains("dark");

      // 시스템 다크모드를 우선적으로 사용
      const isDarkMode = hasClassDark || hasDataTheme || bodyDark || systemDark;

      console.log("=== 다크모드 디버깅 ===");
      console.log("HTML class 'dark':", hasClassDark);
      console.log(
        "data-theme:",
        document.documentElement.getAttribute("data-theme")
      );
      console.log("시스템 다크모드:", systemDark);
      console.log("body class 'dark':", bodyDark);
      console.log("최종 다크모드 상태:", isDarkMode);
      console.log("===================");

      setIsDark(isDarkMode);
    };

    // 초기 체크
    checkDarkMode();

    // MutationObserver로 다크모드 변경 감지
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // 시스템 다크모드 변경 감지
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleMediaChange = () => checkDarkMode();
    mediaQuery.addEventListener("change", handleMediaChange);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", handleMediaChange);
    };
  }, []);

  const iconSize = windowWidth <= 480 ? 28 : windowWidth <= 768 ? 32 : 40;

  const menuItems = [
    {
      name: "추가",
      href: "/dashboard/trips/create",
      icon: AddIcon,
    },
    {
      name: "홈",
      href: "/dashboard",
      icon: HomeIcon,
    },
    {
      name: "공유",
      href: "/dashboard/share",
      icon: ShareIcon,
      isShare: true, // 공유 버튼 플래그
    },
    {
      name: "알림",
      href: "/dashboard/notifications",
      icon: AlarmIcon,
      isNotification: true, // 알림 버튼 플래그
    },
  ];

  return (
    <>
      {/* 모바일 하단 네비게이션 */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg z-[1001]">
        <div className="flex items-center justify-around px-2 py-3">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all min-w-[60px]
                  ${
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-600 dark:text-gray-400"
                  }
                `}
              >
                <Icon size={iconSize} isDark={isDark} />
                <span className="text-xs font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* 데스크톱 사이드바 - 오른쪽 중앙에 lord-icon */}
      <aside className="hidden lg:flex fixed right-[1vw] top-1/10 flex-col items-center gap-0 bg-white dark:bg-gray-800 shadow-xl rounded-[20px] py-4 px-0 border border-[#afb8c1] dark:border-gray-700 z-[1001] w-[85px] h-[280px]">
        {/* 메뉴 아이콘들만 */}
        {menuItems.map((item, index) => {
          const Icon = item.icon;

          // 공유 버튼과 알림 버튼은 일반 버튼으로 처리 (페이지 이동 없음)
          if (item.isShare || item.isNotification) {
            return (
              <button
                key={item.name}
                onClick={() => {
                  if (item.isShare) {
                    // 공유 기능
                    const currentUrl = window.location.href;
                    navigator.clipboard.writeText(currentUrl).then(() => {
                      alert("링크가 복사되었습니다!");
                    });
                  } else if (item.isNotification) {
                    // 알림 기능 (추후 구현)
                    alert("알림 기능은 준비 중입니다.");
                  }
                }}
                className={`
                  group relative flex items-center justify-center w-[60px] h-[60px] transition-all cursor-pointer
                  ${index < menuItems.length - 1 ? "mb-[21px]" : ""}
                `}
                title={item.name}
              >
                <Icon size={40} isDark={isDark} />
                {/* 호버 툴팁 */}
                <div
                  className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ right: "60px", top: "10px" }}
                >
                  <div className="w-[243px] h-[59px] bg-[#5ba8fb] text-white flex items-center justify-center rounded-tl-[20px] rounded-bl-[20px] rounded-br-[20px] shadow-lg">
                    <span className="font-['Product_Sans'] text-xl text-center">
                      {item.name}
                    </span>
                  </div>
                </div>
              </button>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                group relative flex items-center justify-center w-[60px] h-[60px] transition-all cursor-pointer
                ${index < menuItems.length - 1 ? "mb-[21px]" : ""}
              `}
              title={item.name}
            >
              <Icon size={40} isDark={isDark} />
              {/* 호버 툴팁 */}
              <div
                className="absolute opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ right: "60px", top: "10px" }}
              >
                <div className="w-[243px] h-[59px] bg-[#5ba8fb] text-white flex items-center justify-center rounded-tl-[20px] rounded-bl-[20px] rounded-br-[20px] shadow-lg">
                  <span className="font-['Product_Sans'] text-xl text-center">
                    {item.name === "추가" ? "함께 링크하기" : item.name}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </aside>
    </>
  );
}
