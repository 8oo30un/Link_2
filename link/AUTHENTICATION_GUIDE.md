# 🔐 Next.js 로그인 구현 가이드

## 목차

1. [NextAuth.js 사용 (권장)](#nextauthjs-사용-권장)
2. [직접 구현 방법](#직접-구현-방법)
3. [구글 OAuth 설정](#구글-oauth-설정)

---

## NextAuth.js 사용 (권장)

### 1단계: 패키지 설치

```bash
npm install next-auth @auth/prisma-adapter
npm install -D prisma
```

### 2단계: 환경 변수 설정

`.env.local` 파일 생성:

```env
# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (예: PostgreSQL)
DATABASE_URL="postgresql://user:password@localhost:5432/link_db"
```

> **Secret 생성 방법:**
>
> ```bash
> openssl rand -base64 32
> ```

### 3단계: NextAuth API Route 생성

`app/api/auth/[...nextauth]/route.ts` 파일 생성:

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    // 구글 로그인
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    // 이메일/비밀번호 로그인
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        // DB에서 사용자 찾기
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("존재하지 않는 사용자입니다.");
        }

        // 비밀번호 확인
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        );

        if (!isPasswordValid) {
          throw new Error("비밀번호가 일치하지 않습니다.");
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  // 페이지 설정
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  // 세션 설정
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

  // JWT 설정
  jwt: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  // 콜백
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // 디버그 (개발 환경에서만)
  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 4단계: Prisma 스키마 설정

`prisma/schema.prisma` 파일 생성:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  hashedPassword String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}
```

DB 마이그레이션:

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5단계: 로그인 페이지 수정

`app/auth/login/page.tsx`:

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 이메일 로그인
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError(result.error);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (error) {
      setError("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 구글 로그인
  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch (error) {
      setError("구글 로그인 중 오류가 발생했습니다.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-900">
      {/* 좌측 브랜딩 영역 */}
      <div className="hidden lg:flex flex-col lg:w-1/2 bg-gradient-to-br from-blue-300 to-blue-400 dark:from-blue-700 dark:to-blue-900 items-center justify-center p-12">
        {/* ... 기존 브랜딩 코드 ... */}
      </div>

      {/* 우측 로그인 폼 */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              로그인
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              L:nk에 오신 것을 환영합니다
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* 구글 로그인 버튼 */}
          <div className="mt-8 animate-slide-up">
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all shadow-sm hover:shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                {/* ... 구글 아이콘 SVG ... */}
              </svg>
              <span className="text-sm font-medium">
                {isLoading ? "로그인 중..." : "구글로 로그인"}
              </span>
            </button>
          </div>

          {/* 구분선 */}
          <div
            className="relative mt-6 animate-slide-up"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                또는 이메일로 로그인
              </span>
            </div>
          </div>

          {/* 이메일 로그인 폼 */}
          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 animate-slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <div className="space-y-5">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
                >
                  비밀번호
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="비밀번호를 입력하세요"
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                >
                  로그인 상태 유지
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  비밀번호 찾기
                </a>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "로그인 중..." : "로그인"}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                계정이 없으신가요?{" "}
                <Link
                  href="/auth/signup"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  회원가입
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 6단계: 회원가입 API 생성

`app/api/auth/signup/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    // 유효성 검사
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    // 이메일 형식 검사
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    // 비밀번호 길이 검사
    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    // 이미 존재하는 사용자 확인
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      );
    }

    // 비밀번호 해시
    const hashedPassword = await bcrypt.hash(password, 12);

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
      },
    });

    return NextResponse.json(
      {
        message: "회원가입이 완료되었습니다.",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "회원가입 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
```

### 7단계: 회원가입 페이지 수정

`app/auth/signup/page.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // 비밀번호 확인
    if (formData.password !== formData.confirmPassword) {
      setError("비밀번호가 일치하지 않습니다.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "회원가입에 실패했습니다.");
        return;
      }

      // 회원가입 성공 시 로그인 페이지로 이동
      router.push("/auth/login?signup=success");
    } catch (error) {
      setError("회원가입 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-900">
      {/* ... 좌측 브랜딩 영역 ... */}

      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md space-y-6 sm:space-y-8">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              회원가입
            </h2>
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              L:nk와 함께 여행을 시작하세요
            </p>
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <form
            onSubmit={handleSubmit}
            className="mt-8 space-y-5 animate-slide-up"
          >
            {/* 이름 입력 */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                이름
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="이름을 입력하세요"
              />
            </div>

            {/* 이메일 입력 */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                이메일
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="이메일을 입력하세요"
              />
            </div>

            {/* 비밀번호 입력 */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                비밀번호
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="비밀번호를 입력하세요 (최소 6자)"
              />
            </div>

            {/* 비밀번호 확인 */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
              >
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                disabled={isLoading}
                className="appearance-none block w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all disabled:opacity-50"
                placeholder="비밀번호를 다시 입력하세요"
              />
            </div>

            {/* 약관 동의 */}
            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800"
              />
              <label
                htmlFor="terms"
                className="ml-2 block text-xs sm:text-sm text-gray-900 dark:text-gray-300"
              >
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  이용약관
                </a>{" "}
                및{" "}
                <a
                  href="#"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  개인정보처리방침
                </a>
                에 동의합니다
              </label>
            </div>

            {/* 회원가입 버튼 */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "가입 중..." : "회원가입"}
              </button>
            </div>

            <div className="text-center pt-2">
              <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                이미 계정이 있으신가요?{" "}
                <Link
                  href="/auth/login"
                  className="font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
                >
                  로그인
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
```

### 8단계: 세션 제공자 추가

`app/providers.tsx` 생성:

```typescript
"use client";

import { SessionProvider } from "next-auth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

`app/layout.tsx` 수정:

```typescript
import { Providers } from "./providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 9단계: 인증 상태 확인

`app/dashboard/page.tsx`:

```typescript
"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            대시보드
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            환영합니다, {session.user?.name || session.user?.email}님!
          </p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
}
```

---

## 구글 OAuth 설정

### 1. Google Cloud Console 설정

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. **APIs & Services** > **OAuth consent screen** 선택
4. **External** 선택 후 앱 정보 입력
5. **Credentials** > **Create Credentials** > **OAuth client ID**
6. Application type: **Web application**
7. Authorized redirect URIs 추가:
   - `http://localhost:3000/api/auth/callback/google` (개발)
   - `https://yourdomain.com/api/auth/callback/google` (프로덕션)
8. Client ID와 Client Secret 복사

### 2. 환경 변수에 추가

`.env.local`:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

---

## 필수 패키지

```bash
# NextAuth.js
npm install next-auth

# Prisma (DB ORM)
npm install @prisma/client @auth/prisma-adapter
npm install -D prisma

# bcryptjs (비밀번호 해싱)
npm install bcryptjs
npm install -D @types/bcryptjs
```

---

## 보안 체크리스트

✅ 비밀번호는 항상 해시화하여 저장
✅ NEXTAUTH_SECRET은 안전하게 관리
✅ HTTPS 사용 (프로덕션)
✅ CSRF 토큰 자동 처리 (NextAuth 기본 제공)
✅ 세션 만료 시간 설정
✅ SQL Injection 방지 (Prisma 사용)
✅ XSS 공격 방지 (React 자동 이스케이핑)

---

## 디버깅 팁

1. **개발 모드에서 디버그 활성화**:

```typescript
debug: process.env.NODE_ENV === "development";
```

2. **로그 확인**:

```bash
# Prisma 쿼리 로그
DATABASE_URL="postgresql://...?schema=public&connection_limit=5&connect_timeout=10"
```

3. **세션 확인**:

```typescript
console.log("Session:", session);
console.log("Status:", status);
```

---

## 추가 기능

### 이메일 인증

- [Resend](https://resend.com/) 또는 [SendGrid](https://sendgrid.com/) 사용
- NextAuth의 EmailProvider 사용

### 소셜 로그인 추가

- GitHub, Facebook, Twitter 등
- NextAuth는 40+ 프로바이더 지원

### 2단계 인증 (2FA)

- [speakeasy](https://www.npmjs.com/package/speakeasy) 라이브러리 사용
- QR 코드 생성: [qrcode](https://www.npmjs.com/package/qrcode)

---

## 참고 자료

- [NextAuth.js 공식 문서](https://next-auth.js.org/)
- [Prisma 공식 문서](https://www.prisma.io/docs)
- [Next.js 공식 문서](https://nextjs.org/docs)
