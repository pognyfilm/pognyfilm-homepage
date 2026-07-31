"use client";

import { FormEvent, useState } from "react";
import styles from "../../app/warranty/WarrantyPage.module.css";

type WarrantyResult = {
  warrantyNumber: string;
  customerName: string;
  installationDate: string;
  installationAddress: string;
  productName: string;
  warrantyPeriod: string;
  installerName: string;
  status: string;
  documentUrl: string;
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(`${value}T00:00:00+09:00`));

export default function WarrantyLookupClient() {
  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [result, setResult] = useState<WarrantyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    setIsLoading(true);
    setMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/warranty/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, phone }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
        warranty?: WarrantyResult;
      };

      if (!response.ok || !payload.ok || !payload.warranty) {
        setMessage(
          payload.message ||
            "등록된 품질보증서를 찾을 수 없습니다. 고객명과 연락처를 다시 확인해주세요.",
        );
        return;
      }

      setResult(payload.warranty);
    } catch {
      setMessage("현재 조회 서비스를 이용할 수 없습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  const details = result
    ? [
        ["보증서 번호", result.warrantyNumber],
        ["고객명", result.customerName],
        ["시공일", formatDate(result.installationDate)],
        ["시공 주소", result.installationAddress],
        ["시공 제품", result.productName],
        ["보증기간", result.warrantyPeriod],
        ["시공 담당", result.installerName],
        ["보증 상태", result.status],
      ]
    : [];

  return (
    <>
      <section className={styles.lookupCard} aria-label="품질보증서 조회 입력">
        <div className={styles.lookupHead}>
          <p>WARRANTY CHECK</p>
          <h2>품질보증서 조회</h2>
          <span>
            고객명과 연락처를 입력하시면 품질보증서를 확인하실 수 있습니다.
          </span>
        </div>
        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.field}>
            <span>고객명</span>
            <input
              type="text"
              autoComplete="name"
              maxLength={40}
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder="고객명을 입력해주세요"
              required
            />
          </label>
          <label className={styles.field}>
            <span>연락처</span>
            <input
              type="tel"
              inputMode="numeric"
              autoComplete="tel"
              maxLength={11}
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value.replace(/\D/g, "").slice(0, 11))
              }
              placeholder="숫자만 입력해주세요"
              required
            />
          </label>
          <button className={styles.submit} type="submit" disabled={isLoading}>
            {isLoading ? "조회 중" : "조회하기"}
          </button>
        </form>
        <p className={styles.securityNote}>
          <span aria-hidden="true">◆</span>
          입력하신 정보는 조회 목적 외에 사용되지 않으며 안전하게 보호됩니다.
        </p>
        <p className={styles.message} role="status" aria-live="polite">
          {message}
        </p>
      </section>

      {result ? (
        <section className={styles.result} aria-labelledby="warranty-result-title">
          <div className={styles.resultHead}>
            <div>
              <span>VERIFIED WARRANTY</span>
              <h2 id="warranty-result-title">품질보증서 조회 결과</h2>
            </div>
            <a
              className={styles.download}
              href={`${result.documentUrl}&print=1`}
              target="_blank"
              rel="noopener noreferrer"
            >
              PDF 다운로드
            </a>
          </div>
          <dl className={styles.details}>
            {details.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value || "-"}</dd>
              </div>
            ))}
          </dl>
          <div className={styles.preview}>
            <iframe
              title={`${result.warrantyNumber} 품질보증서 미리보기`}
              src={result.documentUrl}
              loading="lazy"
            />
          </div>
        </section>
      ) : null}
    </>
  );
}
