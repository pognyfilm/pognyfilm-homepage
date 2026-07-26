const SITE_URL = "https://pogny.co.kr";

const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>포그니필름</title>
    <link>${SITE_URL}</link>
    <description>제조부터 시공, 품질보증까지 포그니필름이 직접 책임집니다.</description>
    <language>ko-KR</language>
    <item>
      <title>포그니필름</title>
      <link>${SITE_URL}</link>
      <guid isPermaLink="true">${SITE_URL}</guid>
      <description>공간에 맞는 필름을 제안하는 포그니필름 공식 홈페이지입니다.</description>
    </item>
  </channel>
</rss>
`;

export function GET() {
  return new Response(rss, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
    },
  });
}
