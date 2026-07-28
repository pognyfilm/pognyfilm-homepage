"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "../../app/admin/actions";

type AdminLoginFormProps = {
  initialError?: string;
};

export default function AdminLoginForm({
  initialError,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState(initialError || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSubmitting) return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const email = String(formData.get("email") || "").trim();
    const password = String(formData.get("password") || "");

    setError("");
    setIsSubmitting(true);

    try {
      const result = await signIn(email, password);

      if (!result.success) {
        console.error("[Admin signInWithPassword failed]", result.error);
        setError(result.error.message);
        return;
      }

      router.replace("/admin");
      router.refresh();
    } catch (caughtError) {
      console.error("[Admin login action failed]", caughtError);
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "알 수 없는 로그인 오류가 발생했습니다.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="admin-login-form" onSubmit={handleSubmit}>
      <label>
        <span>이메일</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          placeholder="admin@example.com"
          required
          disabled={isSubmitting}
        />
      </label>
      <label>
        <span>비밀번호</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          placeholder="비밀번호를 입력해주세요"
          required
          disabled={isSubmitting}
        />
      </label>
      <p className="admin-form-error" role="alert" aria-live="polite">
        {error}
      </p>
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "로그인 중..." : "로그인"}
      </button>
    </form>
  );
}
