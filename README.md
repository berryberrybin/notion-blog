# Notion CMS Blog

Notion을 CMS로 사용하여 기술 블로그를 GitHub Pages에 자동 배포하는 시스템입니다.

[![Deploy to GitHub Pages](https://github.com/berryberrybin/notion-blog/actions/workflows/deploy.yml/badge.svg)](https://github.com/berryberrybin/notion-blog/actions/workflows/deploy.yml)

**Live Demo**: [https://berryberrybin.github.io/notion-blog/](https://berryberrybin.github.io/notion-blog/)

---

## 목차

- [기술 스택](#기술-스택)
- [주요 기능](#주요-기능)
- [프로젝트 구조](#프로젝트-구조)
- [시작하기](#시작하기)
  - [1. Notion 설정](#1-notion-설정)
  - [2. GitHub 저장소 설정](#2-github-저장소-설정)
  - [3. 로컬 개발 환경](#3-로컬-개발-환경)
- [배포](#배포)
  - [자동 배포](#자동-배포)
  - [수동 배포](#수동-배포)
- [Notion 데이터베이스 구조](#notion-데이터베이스-구조)
- [커스터마이징](#커스터마이징)
- [문제 해결](#문제-해결)

---

## 기술 스택

### Frontend
| 기술 | 버전 | 설명 |
|------|------|------|
| [Astro](https://astro.build/) | 5.x | 정적 사이트 생성기 (빠른 빌드, 0KB JavaScript) |
| [TypeScript](https://www.typescriptlang.org/) | 5.x | 타입 안전성 |
| CSS | - | 전역 스타일 + 컴포넌트 스코프 스타일 |

### CMS & 데이터
| 기술 | 설명 |
|------|------|
| [Notion API](https://developers.notion.com/) | 콘텐츠 관리 시스템 |
| [@notionhq/client](https://www.npmjs.com/package/@notionhq/client) | 공식 Notion SDK |
| [notion-to-md](https://www.npmjs.com/package/notion-to-md) | Notion 블록 → Markdown 변환 |

### 배포 & CI/CD
| 기술 | 설명 |
|------|------|
| [GitHub Pages](https://pages.github.com/) | 무료 정적 호스팅 |
| [GitHub Actions](https://github.com/features/actions) | 자동 빌드 및 배포 |

### 추가 기능
| 기술 | 설명 |
|------|------|
| [@astrojs/sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/) | 자동 사이트맵 생성 |
| [@astrojs/rss](https://docs.astro.build/en/guides/rss/) | RSS 피드 생성 |
| [Shiki](https://shiki.matsu.io/) | 코드 구문 강조 |

---

## 주요 기능

### 콘텐츠 관리
- **Notion 기반 CMS**: Notion에서 글 작성, 수정, 관리
- **자동 동기화**: Notion 데이터베이스 → Markdown 파일 자동 변환
- **이미지 자동 처리**: Notion 이미지 다운로드 및 로컬 저장

### 블로그 기능
- **게시글 목록/상세**: 제목, 요약, 본문, 이미지, 코드블록 지원
- **카테고리 분류**: 카테고리별 게시글 필터링
- **태그 시스템**: 태그별 게시글 검색
- **정렬 기능**:
  - 목차 순서(Number)별 정렬
  - 게시일(PublishedAt)별 정렬
  - 수정일(UpdatedAt)별 정렬

### UI/UX
- **다크모드**: 시스템 설정 자동 감지 + 수동 토글
- **반응형 디자인**: 모바일/태블릿/데스크톱 지원
- **목차(TOC)**: 게시글 내 자동 목차 생성
- **코드 하이라이팅**: 다양한 언어 구문 강조

### SEO & 성능
- **메타 태그**: Open Graph, Twitter Card 지원
- **RSS 피드**: `/rss.xml` 자동 생성
- **사이트맵**: `/sitemap-index.xml` 자동 생성
- **정적 생성**: 빠른 로딩 속도

---

## 프로젝트 구조

```
notion-blog/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 배포 워크플로우
├── public/
│   ├── favicon.svg             # 파비콘
│   ├── robots.txt              # 크롤러 설정
│   └── images/
│       └── posts/              # Notion에서 다운로드된 이미지
├── scripts/
│   └── sync-notion.ts          # Notion 동기화 스크립트
├── src/
│   ├── components/
│   │   ├── BaseHead.astro      # SEO 메타 태그
│   │   ├── Header.astro        # 네비게이션 헤더
│   │   ├── Footer.astro        # 푸터
│   │   ├── PostCard.astro      # 게시글 카드
│   │   ├── TagList.astro       # 태그 목록
│   │   ├── CategoryNav.astro   # 카테고리 네비게이션
│   │   ├── TableOfContents.astro # 목차
│   │   └── ThemeToggle.astro   # 다크모드 토글
│   ├── content/
│   │   └── posts/              # 동기화된 Markdown 파일
│   ├── layouts/
│   │   ├── BaseLayout.astro    # 기본 레이아웃
│   │   └── PostLayout.astro    # 게시글 레이아웃
│   ├── pages/
│   │   ├── index.astro         # 홈페이지
│   │   ├── 404.astro           # 404 페이지
│   │   ├── rss.xml.ts          # RSS 피드
│   │   ├── posts/
│   │   │   ├── index.astro     # 게시글 목록
│   │   │   └── [...slug].astro # 게시글 상세
│   │   ├── categories/
│   │   │   ├── index.astro     # 카테고리 목록
│   │   │   └── [category].astro # 카테고리별 게시글
│   │   └── tags/
│   │       ├── index.astro     # 태그 목록
│   │       └── [tag].astro     # 태그별 게시글
│   ├── styles/
│   │   └── global.css          # 전역 스타일
│   ├── utils/
│   │   └── posts.ts            # 유틸리티 함수
│   ├── content.config.ts       # Content Collections 설정
│   └── env.d.ts                # TypeScript 환경 정의
├── astro.config.mjs            # Astro 설정
├── package.json
├── tsconfig.json
├── .env.example                # 환경변수 예시
└── README.md
```

---

## 시작하기

### 1. Notion 설정

#### 1.1 Integration 생성

1. [Notion Developers](https://developers.notion.com/) 접속
2. **"New integration"** 클릭
3. 설정:
   - **Name**: `Blog Sync` (또는 원하는 이름)
   - **Associated workspace**: 본인 워크스페이스 선택
   - **Capabilities**: `Read content` 체크
4. **"Submit"** 클릭
5. **Internal Integration Token** 복사 (나중에 `NOTION_TOKEN`으로 사용)

#### 1.2 데이터베이스 생성

Notion에서 새 데이터베이스를 생성하고 다음 속성들을 추가합니다:

| 속성명 | 타입 | 필수 | 설명 |
|--------|------|------|------|
| `Title` | Title | ✅ | 게시글 제목 |
| `Slug` | Text | ✅ | URL 슬러그 (예: `my-first-post`) |
| `Summary` | Text | | 게시글 요약 |
| `Category` | Select | ✅ | 카테고리 (예: Frontend, Backend) |
| `Tags` | Multi-select | | 태그 목록 |
| `PublishStatus` | Checkbox | ✅ | 체크하면 배포됨 |
| `Status` | Select | | 작성 상태 (Draft, Done) |
| `Number` | Number | | 목차 순서 |
| `PublishedAt` | Date | | 게시일 |
| `CreatedAt` | Created time | | 등록일 (자동) |
| `UpdatedAt` | Last edited time | | 수정일 (자동) |

#### 1.3 Integration 연결

1. 생성한 데이터베이스 페이지 열기
2. 우측 상단 **"..."** 메뉴 클릭
3. **"Connections"** → 생성한 Integration 선택

#### 1.4 데이터베이스 ID 확인

데이터베이스 URL에서 ID를 추출합니다:

```
https://www.notion.so/{DATABASE_ID}?v=...
                      ^^^^^^^^^^^^
                      이 32자리가 DATABASE_ID
```

---

### 2. GitHub 저장소 설정

#### 2.1 저장소 Fork 또는 Clone

```bash
# Clone
git clone https://github.com/berryberrybin/notion-blog.git
cd notion-blog

# 또는 Fork 후 Clone
```

#### 2.2 Secrets 설정

GitHub 저장소 → **Settings** → **Secrets and variables** → **Actions**

다음 시크릿을 추가합니다:

| Name | Value |
|------|-------|
| `NOTION_TOKEN` | Notion Integration Token |
| `NOTION_DATABASE_ID` | Notion 데이터베이스 ID (32자리) |

#### 2.3 GitHub Pages 설정

1. 저장소 → **Settings** → **Pages**
2. **Source**: `GitHub Actions` 선택
3. 저장

#### 2.4 설정 수정 (선택)

`astro.config.mjs`에서 사이트 URL을 수정합니다:

```javascript
export default defineConfig({
  site: 'https://YOUR_USERNAME.github.io',
  base: '/YOUR_REPO_NAME/',
  // ...
});
```

---

### 3. 로컬 개발 환경

#### 3.1 의존성 설치

```bash
npm install
```

#### 3.2 환경변수 설정

```bash
# .env 파일 생성
cp .env.example .env

# .env 파일 편집
NOTION_TOKEN=your_notion_token_here
NOTION_DATABASE_ID=your_database_id_here
```

#### 3.3 Notion 동기화

```bash
npm run sync
```

#### 3.4 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:4321/notion-blog/ 접속

#### 3.5 빌드 테스트

```bash
npm run build
npm run preview
```

---

## 배포

### 자동 배포

GitHub Actions가 다음 조건에서 자동으로 배포합니다:

| 트리거 | 설명 |
|--------|------|
| **Push to main** | main 브랜치에 코드 푸시 시 |
| **매일 09:00 (KST)** | 스케줄 (cron: `0 0 * * *` UTC) |
| **수동 실행** | Actions 탭에서 "Run workflow" 클릭 |

### 배포 프로세스

```
1. Notion에서 데이터 동기화 (npm run sync)
   ↓
2. Markdown 파일 생성 (src/content/posts/)
   ↓
3. 이미지 다운로드 (public/images/posts/)
   ↓
4. Astro 빌드 (npm run build)
   ↓
5. GitHub Pages 배포 (dist/ → gh-pages)
```

### 수동 배포

1. GitHub 저장소 → **Actions** 탭
2. **"Deploy to GitHub Pages"** 워크플로우 선택
3. **"Run workflow"** 버튼 클릭
4. 브랜치 선택 후 **"Run workflow"** 클릭

### 배포 일정 변경

`.github/workflows/deploy.yml`에서 스케줄 수정:

```yaml
on:
  schedule:
    # 매일 09:00 KST (00:00 UTC)
    - cron: '0 0 * * *'

    # 매시간
    # - cron: '0 * * * *'

    # 매주 월요일 09:00 KST
    # - cron: '0 0 * * 1'
```

---

## Notion 데이터베이스 구조

### 속성 상세 설명

#### Title (제목)
- **타입**: Title
- **설명**: 게시글 제목
- **예시**: `React Hooks 완벽 가이드`

#### Slug (URL)
- **타입**: Text
- **설명**: URL에 사용될 슬러그
- **규칙**:
  - 소문자, 숫자, 하이픈만 사용 권장
  - 특수문자(`/`, `\`, `:` 등)는 자동으로 `-`로 변환
  - 공백은 `-`로 변환
- **예시**: `react-hooks-guide`

#### Summary (요약)
- **타입**: Text
- **설명**: 게시글 요약 (목록에서 표시)
- **예시**: `React Hooks의 기본 개념과 활용법을 알아봅니다.`

#### Category (카테고리)
- **타입**: Select
- **설명**: 게시글 분류
- **예시**: `Frontend`, `Backend`, `DevOps`

#### Tags (태그)
- **타입**: Multi-select
- **설명**: 게시글 태그 (여러 개 선택 가능)
- **예시**: `React`, `JavaScript`, `Tutorial`

#### PublishStatus (게시 여부)
- **타입**: Checkbox
- **설명**: 체크하면 블로그에 배포됨
- **중요**: **체크되지 않은 글은 배포되지 않음**

#### Number (순서)
- **타입**: Number
- **설명**: 목차 순서 (낮은 숫자가 먼저)
- **예시**: `1`, `2`, `3`

#### PublishedAt (게시일)
- **타입**: Date
- **설명**: 게시일 (수동 설정)
- **예시**: `2025-01-14`

---

## 커스터마이징

### 사이트 정보 변경

`astro.config.mjs`:
```javascript
export default defineConfig({
  site: 'https://your-domain.com',
  base: '/your-repo/',
});
```

### 블로그 제목 변경

`src/components/Header.astro`:
```astro
<span class="logo-text">Your Blog Name</span>
```

`src/pages/index.astro`:
```astro
<h1>Your Blog Name</h1>
<p class="hero-description">
  Your blog description here.
</p>
```

### 스타일 변경

`src/styles/global.css`에서 CSS 변수 수정:

```css
:root {
  --accent-color: #0066cc;    /* 메인 컬러 */
  --bg-color: #ffffff;         /* 배경색 */
  --text-color: #1a1a1a;       /* 텍스트 색 */
}

[data-theme="dark"] {
  --accent-color: #66b3ff;
  --bg-color: #1a1a1a;
  --text-color: #f5f5f5;
}
```

### 코드 테마 변경

`astro.config.mjs`:
```javascript
markdown: {
  shikiConfig: {
    theme: 'github-dark', // 또는 'github-light', 'dracula', 'nord' 등
  },
},
```

---

## 문제 해결

### 동기화 오류

#### "NOTION_TOKEN is required"
```bash
# .env 파일 확인
cat .env

# 토큰이 올바른지 확인
```

#### "Provided ID is a page, not a database"
- 페이지 ID가 아닌 **데이터베이스 ID**를 사용해야 합니다
- 데이터베이스를 전체 페이지로 열고 URL에서 ID 확인

#### "Could not find database"
- Notion Integration이 데이터베이스에 연결되었는지 확인
- 데이터베이스 → ... → Connections → Integration 추가

### 빌드 오류

#### "The collection posts does not exist"
- Notion에서 `PublishStatus`가 체크된 글이 있는지 확인
- `npm run sync` 실행 후 `src/content/posts/` 폴더 확인

### 배포 오류

#### GitHub Actions 실패
1. Actions 탭에서 실패한 워크플로우 클릭
2. 로그에서 에러 메시지 확인
3. Secrets가 올바르게 설정되었는지 확인

#### 404 오류
- `astro.config.mjs`의 `base` 설정 확인
- URL 끝에 `/` 포함 여부 확인

### 이미지 로딩 오류

- Notion 이미지 URL은 1시간 후 만료됨
- 동기화 스크립트가 이미지를 로컬에 다운로드하므로 정상 작동해야 함
- 문제 시 `npm run sync` 다시 실행

---

## 스크립트 명령어

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run sync` | Notion 데이터 동기화 |
| `npm run sync:build` | 동기화 + 빌드 |

---

## 라이선스

MIT License

---

## 기여

이슈 및 PR 환영합니다!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request