# 🔷 Vercel Postgres로 인증 구현하기

## Vercel Postgres 설정

### 1단계: Vercel Dashboard에서 데이터베이스 생성

1. [Vercel Dashboard](https://vercel.com/dashboard) 접속
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** 클릭
5. **Postgres** 선택
6. 데이터베이스 이름 입력 (예: `link-db`)
7. 지역 선택 (서울: `icn1` 추천)
8. **Create** 클릭

### 2단계: 환경 변수 자동 연결

데이터베이스 생성 후:

1. **Connect Project** 클릭
2. 프로젝트 선택
3. Vercel이 자동으로 환경 변수 추가:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
   - 기타...

### 3단계: 로컬 환경 변수 다운로드

터미널에서 실행:

```bash
# Vercel CLI 설치 (아직 설치 안 했다면)
npm i -g vercel

# 프로젝트 연결
vercel link

# 환경 변수 다운로드
vercel env pull .env.local
```

또는 수동으로 `.env.local` 파일 생성:

```env
# Vercel Postgres (Vercel Dashboard에서 복사)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."
POSTGRES_USER="..."
POSTGRES_HOST="..."
POSTGRES_PASSWORD="..."
POSTGRES_DATABASE="..."

# NextAuth (로컬에서 생성)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-here

# Google OAuth (선택사항)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

---

## Prisma 설정

### 1단계: Prisma 초기화

```bash
npx prisma init
```

### 2단계: `prisma/schema.prisma` 수정

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("POSTGRES_PRISMA_URL") // Vercel Postgres 사용
  directUrl = env("POSTGRES_URL_NON_POOLING") // 마이그레이션용
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

### 3단계: 데이터베이스 마이그레이션

```bash
# Prisma 클라이언트 생성
npx prisma generate

# 마이그레이션 실행
npx prisma migrate dev --name init

# 또는 프로덕션용
npx prisma migrate deploy
```

### 4단계: Prisma Studio로 확인 (선택사항)

```bash
npx prisma studio
```

---

## Prisma 클라이언트 싱글톤 설정

`lib/prisma.ts` 파일 생성:

```typescript
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

이렇게 하면:

- 개발 중 Hot Reload로 인한 다중 인스턴스 방지
- 프로덕션에서 효율적인 연결 관리

---

## NextAuth API Route 설정

`app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma"; // 위에서 만든 파일
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),

    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("이메일과 비밀번호를 입력해주세요.");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.hashedPassword) {
          throw new Error("존재하지 않는 사용자입니다.");
        }

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

  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30일
  },

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

  debug: process.env.NODE_ENV === "development",
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

---

## 회원가입 API

`app/api/auth/signup/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "올바른 이메일 형식이 아닙니다." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "비밀번호는 최소 6자 이상이어야 합니다." },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "이미 등록된 이메일입니다." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

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

---

## Vercel 배포 시 주의사항

### 1. 환경 변수 설정

Vercel Dashboard > Project > Settings > Environment Variables에서 설정:

- `NEXTAUTH_URL`: `https://your-domain.vercel.app`
- `NEXTAUTH_SECRET`: (새로운 secret 생성)
- `GOOGLE_CLIENT_ID`: (구글 OAuth)
- `GOOGLE_CLIENT_SECRET`: (구글 OAuth)

### 2. 데이터베이스 마이그레이션

배포 전에 마이그레이션 실행:

```bash
# 프로덕션 환경 변수 사용
vercel env pull .env.production.local

# 마이그레이션
npx prisma migrate deploy
```

### 3. Build 명령어 수정 (선택사항)

`package.json`:

```json
{
  "scripts": {
    "build": "prisma generate && next build"
  }
}
```

### 4. Prisma Post-Install (권장)

`package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

---

## TypeScript 타입 설정

`types/next-auth.d.ts` 파일 생성:

```typescript
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}
```

---

## 완료 체크리스트

✅ Vercel Postgres 생성
✅ 환경 변수 설정 (.env.local)
✅ Prisma 스키마 작성
✅ 데이터베이스 마이그레이션
✅ lib/prisma.ts 생성
✅ NextAuth API Route 생성
✅ 회원가입 API 생성
✅ TypeScript 타입 정의
✅ 로컬 테스트
✅ Vercel 배포

---

## 유용한 명령어

```bash
# Prisma Studio 실행
npx prisma studio

# 스키마 동기화 (개발)
npx prisma db push

# 마이그레이션 생성
npx prisma migrate dev --name your-migration-name

# 마이그레이션 배포 (프로덕션)
npx prisma migrate deploy

# Prisma 클라이언트 재생성
npx prisma generate

# 데이터베이스 초기화 (주의!)
npx prisma migrate reset
```

---

## 참고 자료

- [Vercel Postgres 문서](https://vercel.com/docs/storage/vercel-postgres)
- [Prisma + Vercel 가이드](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [NextAuth.js + Prisma](https://next-auth.js.org/adapters/prisma)
