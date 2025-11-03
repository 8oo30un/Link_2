"use client";

import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
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

interface HeaderProps {
  isEditMode?: boolean;
}

export default function Header({ isEditMode = false }: HeaderProps) {
  const { data: session } = useSession();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDark, setIsDark] = useState(false);

  // 다크모드 감지
  useEffect(() => {
    const checkDarkMode = () => {
      const hasClassDark = document.documentElement.classList.contains("dark");
      const hasDataTheme =
        document.documentElement.getAttribute("data-theme") === "dark";
      const systemDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const bodyDark = document.body.classList.contains("dark");
      const isDarkMode = hasClassDark || hasDataTheme || bodyDark || systemDark;
      setIsDark(isDarkMode);
    };

    checkDarkMode();

    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class", "data-theme"],
    });

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", checkDarkMode);

    return () => {
      observer.disconnect();
      mediaQuery.removeEventListener("change", checkDarkMode);
    };
  }, []);

  // 외부 클릭 감지
  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isDropdownOpen && !target.closest("#hamburger-menu")) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("click", handleOutsideClick);
    } else {
      document.removeEventListener("click", handleOutsideClick);
    }

    return () => {
      document.removeEventListener("click", handleOutsideClick);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="fixed top-0 left-0 right-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm z-[1001]">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 relative">
          {/* 왼쪽 - 햄버거 메뉴 */}
          <div id="hamburger-menu" className="relative z-[1002]">
            {/* 햄버거 아이콘 */}
            <div
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="cursor-pointer"
              style={{
                filter: isDark ? "invert(1) brightness(2)" : "none",
                display: "inline-block",
              }}
            >
              {/* @ts-expect-error: lord-icon is a custom element */}
              <lord-icon
                src="https://cdn.lordicon.com/lqxfrxad.json"
                trigger="hover"
                colors="primary:#040404"
                style={{ width: "40px", height: "40px" }}
              />
            </div>

            {/* 드롭다운 메뉴 */}
            {isDropdownOpen && (
              <>
                {/* 모바일: 버튼 아래 드롭다운, 데스크톱: 사이드 패널 */}
                <div
                  className="absolute md:fixed top-full md:top-0 -left-4 md:left-0 mt-2 md:mt-0 md:h-screen w-[280px] md:w-[322px] bg-white dark:bg-gray-800 border border-[#AFB8C1] dark:border-gray-700 rounded-[20px] md:rounded-tr-[20px] md:rounded-br-[20px] md:rounded-tl-none md:rounded-bl-none z-[1002] flex flex-col shadow-xl"
                  style={{
                    boxShadow:
                      "0 4px 12px rgba(0, 0, 0, 0.15), 2px 2px 8px rgba(217, 217, 217, 0.3)",
                  }}
                >
                  {/* 상단 햄버거 아이콘 (데스크톱만) */}
                  <div className="hidden md:block mt-4 ml-[60px]">
                    <div
                      onClick={() => setIsDropdownOpen(false)}
                      className="cursor-pointer"
                      style={{
                        filter: isDark ? "invert(1) brightness(2)" : "none",
                        display: "inline-block",
                      }}
                    >
                      {/* @ts-expect-error: lord-icon is a custom element */}
                      <lord-icon
                        src="https://cdn.lordicon.com/lqxfrxad.json"
                        trigger="hover"
                        colors="primary:#040404"
                        style={{ width: "40px", height: "40px" }}
                      />
                    </div>
                  </div>

                  {/* 메뉴 항목들 */}
                  <div className="flex flex-col p-4 md:ml-[40px] md:mt-4 gap-2 font-['Product_Sans']">
                    <Link
                      href="/dashboard/profile"
                      onClick={() => setIsDropdownOpen(false)}
                      className="header-menu-item bg-white dark:bg-gray-800 px-5 py-3 rounded-[20px] text-left min-h-[44px] flex items-center cursor-pointer transition-all text-gray-900 dark:text-white text-base active:scale-95"
                    >
                      마이 페이지
                    </Link>
                    <Link
                      href="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="header-menu-item bg-white dark:bg-gray-800 px-5 py-3 rounded-[20px] text-left min-h-[44px] flex items-center cursor-pointer transition-all text-gray-900 dark:text-white text-base active:scale-95"
                    >
                      진행 중 링크
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="header-menu-item bg-white dark:bg-gray-800 px-5 py-3 rounded-[20px] text-left min-h-[44px] flex items-center cursor-pointer transition-all text-gray-900 dark:text-white text-base active:scale-95"
                    >
                      로그아웃
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* 중앙 - 로고 + 사이트 이름 */}
          <Link
            href="/dashboard"
            className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2"
          >
            <Image
              src="/images/logos/mainLogo.png"
              alt="Link Logo"
              width={40}
              height={30}
              className="h-8 w-auto"
            />
            <span className="hidden sm:block text-4xl font-bold text-gray-900 dark:text-white">
              L:nk
            </span>
          </Link>

          {/* 오른쪽 - 검색바 + 프로필 */}
          <div className="flex items-center gap-3 ml-auto mr-4">
            {/* 검색바 */}
            <div className="hidden md:block relative">
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
              />
              <svg
                className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            {/* 모바일 검색 버튼 */}
            <button className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
              <svg
                className="w-5 h-5 text-gray-700 dark:text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </button>

            {/* 프로필 사진 */}
            <Link
              href="/dashboard/profile"
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 transition-colors ring-2 ring-gray-200 dark:ring-gray-700 overflow-hidden"
            >
              {session?.user?.image ? (
                <Image
                  src={session.user.image}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-white text-sm font-semibold">
                  {session?.user?.name?.charAt(0) ||
                    session?.user?.email?.charAt(0) ||
                    "U"}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
