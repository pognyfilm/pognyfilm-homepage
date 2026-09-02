"use client";

import { useMemo, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

const pad = (value: number) => String(value).padStart(2, "0");
const toDateValue = (year: number, month: number, day: number) =>
  `${year}-${pad(month + 1)}-${pad(day)}`;

const parseDateValue = (value: string) => {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!matched) return null;
  return {
    year: Number(matched[1]),
    month: Number(matched[2]) - 1,
    day: Number(matched[3]),
  };
};

export const getTodayInKorea = () => {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
};

export default function AdminDatePicker({
  name,
  label,
  defaultValue,
  required = false,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  required?: boolean;
}) {
  const initialValue = defaultValue || "";
  const initialDate = parseDateValue(initialValue) || parseDateValue(getTodayInKorea())!;
  const [value, setValue] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(initialDate.year);
  const [viewMonth, setViewMonth] = useState(initialDate.month);

  const days = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstDay + 1;
      return day >= 1 && day <= lastDate ? day : null;
    });
  }, [viewMonth, viewYear]);

  const moveMonth = (amount: number) => {
    const next = new Date(viewYear, viewMonth + amount, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const openCalendar = () => {
    const selected = parseDateValue(value);
    if (selected) {
      setViewYear(selected.year);
      setViewMonth(selected.month);
    }
    setIsOpen((current) => !current);
  };

  return (
    <label className="admin-date-picker-field">
      <span>{label}{required ? " *" : ""}</span>
      <div className="admin-date-picker">
        <input
          name={name}
          type="text"
          inputMode="none"
          value={value}
          placeholder="YYYY-MM-DD"
          pattern="\d{4}-\d{2}-\d{2}"
          readOnly
          required={required}
          onClick={openCalendar}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
        />
        <button
          type="button"
          className="admin-date-picker-toggle"
          onClick={openCalendar}
          aria-label={`${label} 달력 ${isOpen ? "닫기" : "열기"}`}
          aria-expanded={isOpen}
        >
          <span aria-hidden="true">▦</span>
        </button>

        {isOpen && (
          <div className="admin-date-calendar" role="dialog" aria-label={`${label} 선택`}>
            <div className="admin-date-calendar-head">
              <button type="button" onClick={() => moveMonth(-1)} aria-label="이전 달">‹</button>
              <strong>{viewYear}년 {viewMonth + 1}월</strong>
              <button type="button" onClick={() => moveMonth(1)} aria-label="다음 달">›</button>
            </div>
            <div className="admin-date-calendar-weekdays" aria-hidden="true">
              {WEEKDAYS.map((weekday) => <span key={weekday}>{weekday}</span>)}
            </div>
            <div className="admin-date-calendar-grid">
              {days.map((day, index) => {
                if (!day) return <span key={`empty-${index}`} />;
                const dateValue = toDateValue(viewYear, viewMonth, day);
                const selected = dateValue === value;
                return (
                  <button
                    type="button"
                    key={dateValue}
                    className={selected ? "is-selected" : undefined}
                    aria-pressed={selected}
                    onClick={() => {
                      setValue(dateValue);
                      setIsOpen(false);
                    }}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
            <div className="admin-date-calendar-foot">
              <button
                type="button"
                onClick={() => {
                  const today = getTodayInKorea();
                  const parsed = parseDateValue(today)!;
                  setValue(today);
                  setViewYear(parsed.year);
                  setViewMonth(parsed.month);
                  setIsOpen(false);
                }}
              >
                오늘
              </button>
              <button type="button" onClick={() => setIsOpen(false)}>닫기</button>
            </div>
          </div>
        )}
      </div>
    </label>
  );
}
