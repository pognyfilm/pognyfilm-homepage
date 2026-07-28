type AdminComingSoonProps = {
  title: string;
};

export default function AdminComingSoon({ title }: AdminComingSoonProps) {
  return (
    <section className="admin-coming-soon">
      <span>COMING SOON</span>
      <h1>{title}</h1>
      <p>이 기능은 다음 구축 단계에서 연결됩니다.</p>
    </section>
  );
}
