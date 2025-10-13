# Vercel Blob Storage 설정 가이드

## 📦 Vercel Blob Storage란?

프로필 이미지와 같은 파일을 저장할 수 있는 Vercel의 서버리스 파일 스토리지입니다.

## 🚀 설정 방법

### 1. Vercel 대시보드에서 Blob Storage 생성

1. [Vercel 대시보드](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** → **Blob** 선택
5. 데이터베이스 이름 입력 (예: `link-blob-storage`)
6. **Create** 클릭

### 2. 환경 변수 복사

Blob Storage가 생성되면 자동으로 환경 변수가 생성됩니다:

```bash
BLOB_READ_WRITE_TOKEN="vercel_blob_..."
```

### 3. 로컬 환경에 추가

`.env.local` 파일에 토큰을 추가하세요:

```bash
# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN="여기에_토큰_붙여넣기"
```

### 4. Vercel 프로덕션 환경 설정

Vercel에 배포할 때는 자동으로 환경 변수가 설정되므로 추가 작업이 필요 없습니다.

## 💡 작동 원리

### 프로필 이미지 업로드 플로우

```
1. 사용자가 이미지 선택
   ↓
2. 브라우저에서 Base64로 미리보기
   ↓
3. "저장" 버튼 클릭
   ↓
4. FormData로 서버에 전송
   ↓
5. API Route에서 Vercel Blob에 업로드
   ↓
6. Blob URL 받기 (예: https://blob.vercel-storage.com/...)
   ↓
7. Prisma로 DB의 user.image 업데이트
   ↓
8. 세션 업데이트
```

## 📝 API Route 코드 설명

```typescript
// app/api/user/update/route.ts

import { put } from "@vercel/blob";

// 이미지 업로드
if (imageFile && imageFile.size > 0) {
  const blob = await put(imageFile.name, imageFile, {
    access: "public", // 공개 접근 허용
  });
  imageUrl = blob.url; // https://blob.vercel-storage.com/...
}

// DB 업데이트
await prisma.user.update({
  where: { email: session.user.email },
  data: { image: imageUrl },
});
```

## 🔒 보안

- **Public Access**: 프로필 이미지는 공개 URL로 접근 가능
- **인증 확인**: API Route에서 세션 확인 (로그인한 사용자만 업데이트 가능)
- **파일명 타임스탬프**: `profile-{timestamp}.png` 형식으로 중복 방지

## 💰 비용

- **무료 플랜**: 월 5GB 스토리지, 100GB 대역폭
- **프로 플랜**: 더 많은 용량 제공

자세한 내용: https://vercel.com/docs/storage/vercel-blob/pricing

## 🧪 테스트

1. 로컬 환경에서 `npm run dev` 실행
2. http://localhost:3000/dashboard/profile 접속
3. "프로필 수정" 클릭
4. 이미지 선택 및 저장
5. 새로고침해도 이미지가 유지되는지 확인

## 📌 참고

- Blob Storage 없이도 외부 이미지 URL (구글 프로필 사진 등)은 계속 작동합니다
- 로컬 개발 시에도 실제 Vercel Blob에 업로드됩니다 (테스트 주의!)

## 🛠️ 대안

Vercel Blob 대신 다른 서비스를 사용하려면:

- **Cloudinary**: 이미지 최적화 및 변환 기능
- **AWS S3**: 더 많은 제어와 설정
- **Supabase Storage**: 오픈소스 대안

각 서비스의 SDK를 설치하고 `app/api/user/update/route.ts`의 업로드 코드만 변경하면 됩니다.


