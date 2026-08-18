# 관리자 광고·방문 분석 로드맵

## Phase 1 — 구현 완료

- GA4 Data API 서비스 계정 인증
- 방문 KPI, 추이, 채널, 소스/매체, 인기 페이지, 기기, 지역
- 관리자 전용 내부 API와 기간 검증·서버 캐시
- 대시보드 오늘 방문자 연결

## Phase 2 — TODO

- Google Ads OAuth refresh token 인증 및 읽기 전용 클라이언트
- 캠페인·광고비·키워드·검색어 실적
- 캠페인 유형 필터와 일별 광고비 추이
- 대시보드 오늘 광고비 연결
- Google Ads 정상/인증 실패 모킹 테스트

광고 중지, 예산 변경, 제외 키워드 등록 등 쓰기 작업은 범위에서 제외합니다.

## Phase 3 — TODO

- `supabase/proposals/007_inquiry_attribution.sql` 승인 및 별도 적용
- 공개 문의 폼에서 UTM/GCLID/최초 방문 정보의 안전한 수집
- 문의 기여 분석, 고객명 마스킹, CSV 다운로드, 고급 필터

운영 migration과 기존 문의 데이터 변경은 별도 승인 전 수행하지 않습니다.
