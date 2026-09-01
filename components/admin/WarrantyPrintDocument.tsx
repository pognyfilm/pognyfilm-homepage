"use client";

import { useEffect } from "react";
import type { Warranty } from "../../lib/warranty/types";
import WarrantyCertificate from "../warranty/WarrantyCertificate";

export default function WarrantyPrintDocument({
  item,
  autoPrint = true,
}: {
  item: Warranty;
  autoPrint?: boolean;
}) {
  useEffect(() => {
    if (!autoPrint) return;
    const timer = window.setTimeout(() => window.print(), 450);
    return () => window.clearTimeout(timer);
  }, [autoPrint]);

  return (
    <section className="warranty-print-screen">
      <div className="warranty-print-actions">
        <button type="button" onClick={() => window.print()}>PDF 출력</button>
        <button type="button" onClick={() => window.close()}>닫기</button>
      </div>

      <WarrantyCertificate item={item} />
    </section>
  );
}
