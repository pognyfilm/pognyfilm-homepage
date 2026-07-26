# POGNY FILM Homepage Handoff

이 문서는 포그니필름 홈페이지 Next.js 작업본을 다른 작업자가 이어받기 위한 인수인계 메모입니다.

## 프로젝트 위치

- 작업 폴더: `C:\Users\정현겸\Documents\포그니 홈페이지\pognyfilm-next`
- 원본 정적 사이트는 상위 폴더에 보존되어 있습니다.
- 현재 작업 대상은 Next.js 프로젝트입니다.

## 기술 구성

- Next.js App Router
- TypeScript
- CSS: `app/globals.css`
- 메인 페이지: `app/page.tsx`
- 주요 클라이언트 기능:
  - `components/LegacyInteractions.tsx`
  - `components/InteractiveBenefitSection.tsx`
  - `components/FilmFinder.tsx`

## 실행 방법

```bash
npm install
npm run dev
npm run build
```

로컬 확인 기본 주소는 보통 `http://localhost:3000` 입니다. 포트가 이미 사용 중이면 Next.js가 다른 포트를 안내할 수 있습니다.

## 주요 파일

- `app/page.tsx`
  - 전체 랜딩 페이지의 섹션 구조가 대부분 들어 있습니다.
  - Header, Hero, PG FILM Series, 시공과정, 시공사례, 문의, Footer 등 주요 마크업이 포함되어 있습니다.

- `app/globals.css`
  - 사이트 전체 디자인, 반응형, 섹션 스타일, 인터랙션 스타일이 들어 있습니다.
  - 기존 정적 사이트의 CSS를 기반으로 계속 확장된 상태입니다.

- `app/film-recommendation-data.ts`
  - PG FILM 추천 프로그램의 제품 데이터입니다.
  - 제품 성능 수치나 추천 기준을 수정할 때는 이 파일을 먼저 확인하세요.

- `components/FilmFinder.tsx`
  - `나에게 맞는 PG FILM 찾기` 추천 프로그램입니다.
  - 현재 6단계 질문 방식이며, 최종 추천 제품은 1개만 표시합니다.
  - `잘 모르겠어요` 선택지는 모든 질문에서 제거된 상태입니다.

- `components/InteractiveBenefitSection.tsx`
  - 냉난방비 절감, 열차단, 자외선·적외선 차단 체감 효과 카드 섹션입니다.
  - IntersectionObserver와 hover/touch 재실행 애니메이션이 들어 있습니다.

- `components/LegacyInteractions.tsx`
  - 기존 정적 사이트에서 옮긴 메뉴, 카운터, 탭, 슬라이더 등 DOM 기반 보조 인터랙션입니다.

- `public/assets`
  - 이미지, 영상, PDF 등 사이트 에셋이 정리되어 있습니다.
  - 주요 에셋:
    - `pogne-hero.mp4`: 메인 히어로 배경 영상
    - `pogny-logo.png`, `pogny-logo.svg`: 로고
    - `product-pg-air.png`, `product-pg-x.png`, `product-pg-pro.png`, `product-pg-xo.png`: 제품 이미지
    - `process-01-consult.png` ~ `process-06-check.png`: 시공과정 이미지
    - `review-kakao-01.png` 등: 후기 이미지
    - `pogny-warranty-k-swiss.pdf`: 품질보증서 PDF

## 현재 구현된 주요 기능

- 메인 히어로 배경 영상 유지
- PG FILM Series 제품 탭
- PG FILM MATCH 추천 프로그램
- 시공과정 6단계 카드
- 시공사례 필터 및 팝업 구조
- 카카오톡 후기 무한 흐름 섹션
- 체감 효과 인터랙션 카드
- 품질보증서 조회 테스트 화면
- 문의 폼 UI 및 기존 제출 구조 유지
- 우측 고정 퀵메뉴:
  - 카카오톡
  - 전화
  - 유튜브
  - 블로그

## 최근 수정 사항

- 시공과정 보조 문구를 아래 문구로 변경했습니다.

```text
상담부터 검수까지,
한 팀이 책임집니다
```

- PG FILM MATCH의 모든 질문에서 `잘 모르겠어요` 선택지를 삭제했습니다.
- 추천 결과는 대안 제품 없이 1개 제품만 표시하도록 작업된 상태입니다.

## 주의사항

- 메인 히어로의 `<video>` 요소와 `pogne-hero.mp4`는 삭제하거나 이미지로 대체하지 마세요.
- 기존 문의 폼의 제출 로직을 변경하지 말고, UI 수정 시에도 name 속성과 submit 흐름을 유지하세요.
- 제품 성능 수치, 보증기간, 추천 기준은 임의로 만들지 말고 `film-recommendation-data.ts`와 사용자가 제공한 문구를 기준으로 수정하세요.
- 한글 인코딩은 UTF-8을 유지하세요.
- 디자인 수정은 가능하면 해당 섹션 전용 class 범위에서 처리해 다른 섹션에 영향이 가지 않도록 하세요.
- `app/page.tsx`가 큰 파일이므로, 섹션 위치 변경 시 JSX 닫힘 태그를 특히 주의하세요.

## 다음 작업 추천

- PC와 모바일에서 PG FILM MATCH 전체 6단계 다시 테스트
- 문의 폼 실제 전송처/API 연결 여부 최종 점검
- 품질보증서 조회 데이터 구조를 실제 운영 방식에 맞게 정리
- 배포 전 `npm run build` 통과 확인
- Vercel 배포 시 `public/assets` 내 대용량 영상/이미지 용량 점검
