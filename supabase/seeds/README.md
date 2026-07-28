# 기존 CASE_STUDIES 이전 절차

이 디렉터리의 내용은 자동 실행되지 않습니다. 반드시 홈페이지 관리자용
Supabase 프로젝트에서만 작업합니다.

1. `LegacyInteractions.tsx`의 `CASE_STUDIES` 배열을 JSON으로 추출합니다.
2. 각 항목에 새로운 UUID를 발급하고 아래 필드로 변환합니다.
   - `id` → 신규 UUID
   - `title` → `portfolio_items.title`
   - `category` → `portfolio_items.category`
   - `location` → `portfolio_items.place`
   - `film` → `portfolio_items.product`
   - `summary` → `portfolio_items.summary`
   - `blogUrl` → `portfolio_items.blog_url`
   - 배열 순서 → `portfolio_items.sort_order`
   - 최초 상태 → `draft`
3. 외부 이미지와 `/public/assets` 이미지를 다운로드한 뒤 관리자 업로드 처리와
   동일하게 1920px 이하 WebP로 변환합니다.
4. 변환 이미지의 저장 경로는 `{portfolio_id}/{uuid}.webp`로 생성합니다.
5. `cover`는 `cover_image_path`, `stages`의 각 이미지는
   `portfolio_images`로 변환합니다.
6. 기존 단계명은 `before`, `during`, `after`, 그 외는 `general`로 매핑합니다.
7. 변환 결과를 모두 검수한 뒤 관리자 화면에서 `published`로 변경합니다.
8. 모든 기존 항목의 공개 출력이 확인되기 전까지 `CASE_STUDIES` 배열을
   삭제하지 않습니다. Supabase 조회 실패 시 현재 배열이 fallback으로
   계속 사용됩니다.
