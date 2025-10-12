import Sidebar from "../components/Sidebar";
import Header from "../components/Header";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 헤더 */}
      <Header />

      {/* 사이드바 */}
      <Sidebar />

      {/* 메인 콘텐츠 (헤더와 하단바 여백) */}
      <main className="min-h-screen pt-20 px-4 sm:px-6 lg:px-8 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto py-6">{children}</div>
      </main>
    </div>
  );
}
