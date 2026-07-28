"use client";

export default function InquiriesError({ reset }: { reset: () => void }) {
  return (
    <section className="admin-inquiry-state" role="alert">
      <strong>문의 화면을 표시하지 못했습니다.</strong>
      <p>일시적인 오류일 수 있습니다.</p>
      <button type="button" onClick={reset}>다시 시도</button>
    </section>
  );
}
