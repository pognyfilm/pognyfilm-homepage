"use client";

import { useEffect } from "react";
import { trackAnalyticsEvent } from "./analytics";

const formatNumber = (value: number) => new Intl.NumberFormat("ko-KR").format(value);

type CaseStage = {
  label: string;
  text: string;
  image?: string;
  images?: string[];
};

type CaseStudy = {
  id: string;
  category: string;
  categoryLabel: string;
  title: string;
  location: string;
  film: string;
  summary: string;
  cover: string;
  blogUrl?: string;
  youtubeUrl?: string;
  stages: CaseStage[];
};

const CASE_STUDIES: CaseStudy[] = [
  {
    id: "home-balcony-film",
    category: "home",
    categoryLabel: "주거",
    title: "주거공간 거실 창 필름 시공",
    location: "아파트 · 거실/베란다",
    film: "PG PRO 1590",
    summary: "강한 오후 햇빛과 눈부심을 줄이면서 창밖 조망은 자연스럽게 유지한 주거공간 시공 사례입니다.",
    cover: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
    stages: [
      {
        label: "시공 전",
        images: [
          "/assets/pg-pro-1590-before.webp",
          "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1600607687644-c7171b42498b?auto=format&fit=crop&w=900&q=80",
        ],
        text: "창으로 들어오는 빛이 강해 실내 온도와 눈부심 부담이 큰 상태를 확인합니다.",
      },
      {
        label: "시공 중",
        images: [
          "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
        ],
        text: "유리면 세척, 실측, 재단 후 먼지와 기포를 줄이며 필름을 부착합니다.",
      },
      {
        label: "시공 후",
        images: [
          "/assets/pg-pro-1590-after.webp",
          "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=900&q=80",
          "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80",
        ],
        text: "외부 시야는 유지하고 햇빛과 난반사를 차분하게 낮춘 상태로 마감합니다.",
      },
    ],
  },
  {
    id: "office-partition-film",
    category: "office",
    categoryLabel: "사무실",
    title: "사무실 외부창 열차단 필름",
    location: "오피스 · 업무공간",
    film: "PG PRO",
    summary: "업무 중 눈부심을 줄이고 냉방 효율을 높이기 위해 창 방향과 채광량에 맞춰 시공했습니다.",
    cover: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=900&q=80",
    stages: [
      {
        label: "시공 전",
        image: "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?auto=format&fit=crop&w=900&q=80",
        text: "좌석 배치와 모니터 방향을 기준으로 눈부심이 발생하는 유리면을 점검합니다.",
      },
      {
        label: "시공 중",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80",
        text: "업무 동선을 방해하지 않도록 구역을 나누어 보양과 필름 부착을 진행합니다.",
      },
      {
        label: "시공 후",
        image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80",
        text: "공간의 밝기는 살리면서 유리면으로 들어오는 열감과 눈부심을 완화합니다.",
      },
    ],
  },
  {
    id: "factory-safety-film",
    category: "factory",
    categoryLabel: "공장",
    title: "공장 고창 안전/열차단 필름",
    location: "공장 · 생산시설",
    film: "PG X",
    summary: "넓은 유리면의 열 유입과 파손 리스크를 함께 고려해 작업 환경을 안정적으로 개선했습니다.",
    cover: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=80",
    stages: [
      {
        label: "시공 전",
        image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=900&q=80",
        text: "높은 창과 설비 주변 유리 상태, 작업자 동선을 먼저 확인합니다.",
      },
      {
        label: "시공 중",
        image: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?auto=format&fit=crop&w=900&q=80",
        text: "고소 작업 안전 기준에 맞춰 구역별로 필름 부착과 마감을 진행합니다.",
      },
      {
        label: "시공 후",
        image: "https://images.unsplash.com/photo-1565008447742-97f6f38c985c?auto=format&fit=crop&w=900&q=80",
        text: "설비와 작업 공간의 열 부담을 줄이고 유리 파손 시 비산 위험을 완화합니다.",
      },
    ],
  },
  {
    id: "public-building-film",
    category: "public",
    categoryLabel: "관공서",
    title: "공공기관 청사 유리 필름",
    location: "공공기관 · 청사",
    film: "PG AIR",
    summary: "방문객과 직원이 함께 이용하는 공간에 맞춰 쾌적성과 안정성을 균형 있게 고려했습니다.",
    cover: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
    stages: [
      {
        label: "시공 전",
        image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
        text: "층별 채광과 민원 동선, 유리 파손 위험 구간을 점검합니다.",
      },
      {
        label: "시공 중",
        image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=900&q=80",
        text: "운영 시간과 동선을 고려해 구역별 시공 계획에 따라 진행합니다.",
      },
      {
        label: "시공 후",
        image: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=900&q=80",
        text: "실내 밝기와 외관 이미지를 해치지 않으면서 열 유입과 눈부심을 줄입니다.",
      },
    ],
  },
  {
    id: "school-classroom-film",
    category: "school",
    categoryLabel: "학교",
    title: "학교 교실 창문 필름",
    location: "학교 · 교실/복도",
    film: "PG PRO",
    summary: "수업 중 칠판과 화면 반사를 줄이고 학생들이 머무는 공간의 쾌적성을 높였습니다.",
    cover: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
    stages: [
      {
        label: "시공 전",
        image: "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=900&q=80",
        text: "교실 방향, 책상 배치, 화면 반사 위치를 기준으로 필요한 필름 성능을 정합니다.",
      },
      {
        label: "시공 중",
        image: "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=900&q=80",
        text: "학사 일정에 맞춰 소음과 동선을 줄이고 창문별로 순차 시공합니다.",
      },
      {
        label: "시공 후",
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=900&q=80",
        text: "수업 집중도를 방해하는 빛 반사를 줄이고 안정적인 실내 밝기를 유지합니다.",
      },
    ],
  },
  {
    id: "store-show-window-film",
    category: "store",
    categoryLabel: "상가",
    title: "상가 쇼윈도 열차단 필름",
    location: "상가 · 쇼윈도",
    film: "PG X",
    summary: "상품 변색과 실내 열감을 줄이면서 매장 전면의 개방감은 유지한 시공 사례입니다.",
    cover: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80",
    stages: [
      {
        label: "시공 전",
        image: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=900&q=80",
        text: "전면 유리의 일사량과 진열 상품의 변색 가능성을 확인합니다.",
      },
      {
        label: "시공 중",
        image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=900&q=80",
        text: "영업 공간과 진열대를 보호하며 쇼윈도 면을 깨끗하게 시공합니다.",
      },
      {
        label: "시공 후",
        image: "https://images.unsplash.com/photo-1528698827591-e19ccd7bc23d?auto=format&fit=crop&w=900&q=80",
        text: "매장 분위기는 유지하고 열감과 자외선으로 인한 상품 손상을 줄입니다.",
      },
    ],
  },
];

export default function LegacyInteractions() {
  useEffect(() => {
    const cleanupCallbacks: Array<() => void> = [];

    const addListener = <K extends keyof HTMLElementEventMap>(
      element: HTMLElement | Window | Document,
      type: K,
      listener: EventListenerOrEventListenerObject,
    ) => {
      element.addEventListener(type, listener);
      cleanupCallbacks.push(() => element.removeEventListener(type, listener));
    };

    const menuToggles = Array.from(
      document.querySelectorAll<HTMLElement>("[data-menu-toggle], .menu-toggle, .nav-toggle"),
    );
    const nav = document.querySelector<HTMLElement>(".nav");
    const header = document.querySelector<HTMLElement>(".site-header");

    if (menuToggles.length && nav) {
      const setMenuOpen = (isOpen: boolean) => {
        nav.classList.toggle("open", isOpen);
        nav.classList.toggle("active", isOpen);
        header?.classList.toggle("menu-open", isOpen);
        menuToggles.forEach((toggle) => toggle.setAttribute("aria-expanded", String(isOpen)));
      };

      menuToggles.forEach((toggle) => {
        addListener(toggle, "click", () => {
          const isOpen = toggle.getAttribute("aria-expanded") === "true";
          setMenuOpen(!isOpen);
        });
      });

      nav.querySelectorAll<HTMLAnchorElement>("a").forEach((link) => {
        addListener(link, "click", () => setMenuOpen(false));
      });

      addListener(document, "keydown", (event) => {
        if (event instanceof KeyboardEvent && event.key === "Escape") {
          setMenuOpen(false);
        }
      });
    }

    const counters = Array.from(document.querySelectorAll<HTMLElement>(".count-up"));
    const counterFrames = new Map<HTMLElement, number>();
    const finishCounter = (counter: HTMLElement) => {
      const target = Number(counter.dataset.target || 0);
      counter.textContent = formatNumber(target);
      counter.dataset.hasAnimated = "true";
      const frame = counterFrames.get(counter);
      if (frame) cancelAnimationFrame(frame);
      counterFrames.delete(counter);
    };

    const animateCounter = (counter: HTMLElement) => {
      const target = Number(counter.dataset.target || 0);
      const duration = target === 0 ? 400 : 1800;
      const startTime = performance.now();
      counter.dataset.hasAnimated = "true";
      counter.textContent = "0";

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = formatNumber(Math.round(target * eased));

        if (progress < 1) {
          counterFrames.set(counter, requestAnimationFrame(tick));
        } else {
          finishCounter(counter);
        }
      };

      counterFrames.set(counter, requestAnimationFrame(tick));
    };

    if (counters.length) {
      const counterObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            const counter = entry.target as HTMLElement;
            if (counter.dataset.hasAnimated === "true") {
              finishCounter(counter);
            } else {
              animateCounter(counter);
            }
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.35 },
      );

      counters.forEach((counter) => {
        if (counter.dataset.hasAnimated === "true") {
          finishCounter(counter);
          return;
        }
        counter.textContent = formatNumber(Number(counter.dataset.target || 0));
        counterObserver.observe(counter);
      });
      cleanupCallbacks.push(() => {
        counterObserver.disconnect();
        counters.forEach(finishCounter);
      });
    }

    const productTabs = Array.from(document.querySelectorAll<HTMLElement>("[data-product-tab]"));
    const productPanels = Array.from(document.querySelectorAll<HTMLElement>("[data-product-panel]"));

    if (productTabs.length && productPanels.length) {
      const activateProduct = (name: string) => {
        productTabs.forEach((tab) => {
          const isActive = tab.dataset.productTab === name;
          tab.classList.toggle("active", isActive);
          tab.setAttribute("aria-selected", String(isActive));
        });

        productPanels.forEach((panel) => {
          const isActive = panel.dataset.productPanel === name;
          panel.hidden = !isActive;
          panel.classList.toggle("active", isActive);
        });
      };

      productTabs.forEach((tab) => {
        addListener(tab, "click", () => activateProduct(tab.dataset.productTab || ""));
      });
    }

    const filterButtons = Array.from(document.querySelectorAll<HTMLElement>(".filters button"));
    const caseGrid = document.querySelector<HTMLElement>("[data-case-grid]");
    const caseModal = document.querySelector<HTMLElement>("[data-case-modal]");
    const caseModalTitle = document.querySelector<HTMLElement>("[data-case-title]");
    const caseModalCategory = document.querySelector<HTMLElement>("[data-case-category]");
    const caseModalSummary = document.querySelector<HTMLElement>("[data-case-summary]");
    const caseModalMeta = document.querySelector<HTMLElement>("[data-case-meta]");
    const caseModalStages = document.querySelector<HTMLElement>("[data-case-stages]");
    const caseModalBlog = document.querySelector<HTMLAnchorElement>("[data-case-blog]");
    const caseModalYoutube = document.querySelector<HTMLAnchorElement>("[data-case-youtube]");
    const caseExternalLinks = document.querySelector<HTMLElement>(".case-external-links-legacy");
    const caseCloseButtons = Array.from(document.querySelectorAll<HTMLElement>("[data-case-close]"));

    const renderCaseStudies = (filter = "all") => {
      if (!caseGrid) return;

      const visibleCases = CASE_STUDIES.filter((item) => filter === "all" || item.category === filter);

      caseGrid.innerHTML = visibleCases
        .map(
          (item) => `
            <button class="case-item" data-case-id="${item.id}" data-category="${item.category}" type="button">
              <img src="${item.cover}" alt="${item.title}" />
              <span>${item.categoryLabel}</span>
              <strong>${item.title}</strong>
            </button>
          `,
        )
        .join("");
    };

    const closeCaseModal = () => {
      if (!caseModal) return;
      caseModal.setAttribute("aria-hidden", "true");
      document.body.classList.remove("modal-open");
    };

    const openCaseModal = (caseId: string | undefined) => {
      const item = CASE_STUDIES.find((caseItem) => caseItem.id === caseId);

      if (
        !item ||
        !caseModal ||
        !caseModalCategory ||
        !caseModalTitle ||
        !caseModalSummary ||
        !caseModalMeta ||
        !caseModalStages
      ) {
        return;
      }

      caseModalCategory.textContent = item.categoryLabel;
      caseModalTitle.textContent = item.title;
      caseModalSummary.textContent = item.summary;
      caseModalMeta.innerHTML = `
        <span><b>공간</b>${item.location}</span>
        <span><b>제품</b>${item.film}</span>
      `;

      if (caseModalBlog) {
        if (item.blogUrl) {
          caseModalBlog.href = item.blogUrl;
          caseModalBlog.hidden = false;
        } else {
          caseModalBlog.hidden = true;
          caseModalBlog.removeAttribute("href");
        }
      }

      if (caseModalYoutube) {
        if (item.youtubeUrl) {
          caseModalYoutube.href = item.youtubeUrl;
          caseModalYoutube.hidden = false;
        } else {
          caseModalYoutube.hidden = true;
          caseModalYoutube.removeAttribute("href");
        }
      }
      if (caseExternalLinks) {
        caseExternalLinks.hidden = !item.blogUrl && !item.youtubeUrl;
      }

      caseModalStages.innerHTML = item.stages
        .map((stage, index) => {
          const images = (stage.images && stage.images.length ? stage.images : [stage.image]).filter(Boolean).slice(0, 3);

          return `
            <article class="case-stage" style="--image-count: ${images.length}">
              <div class="case-stage-gallery">
                ${images
                  .map(
                    (image, imageIndex) => `
                      <figure class="case-stage-image">
                        <img src="${image}" alt="${item.title} ${stage.label} 사진 ${imageIndex + 1}" />
                        <span>${String(index + 1)}-${imageIndex + 1}</span>
                      </figure>
                    `,
                  )
                  .join("")}
              </div>
              <div>
                <strong>${stage.label}</strong>
                <p>${stage.text}</p>
              </div>
            </article>
          `;
        })
        .join("");

      caseModal.setAttribute("aria-hidden", "false");
      document.body.classList.add("modal-open");
    };

    renderCaseStudies();

    if (caseGrid) {
      addListener(caseGrid, "click", (event) => {
        const target = event.target;
        if (!(target instanceof Element)) return;

        const caseButton = target.closest<HTMLElement>("[data-case-id]");
        if (!caseButton) return;

        openCaseModal(caseButton.dataset.caseId);
      });
    }

    filterButtons.forEach((button) => {
      addListener(button, "click", () => {
        const filter = button.dataset.filter || "all";

        filterButtons.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");

        renderCaseStudies(filter);
      });
    });

    caseCloseButtons.forEach((button) => addListener(button, "click", closeCaseModal));
    addListener(document, "keydown", (event) => {
      if ((event as KeyboardEvent).key === "Escape") closeCaseModal();
    });

    const phoneTrack = document.querySelector<HTMLElement>(".phone-track");

    if (phoneTrack) {
      const existingClones = Array.from(phoneTrack.querySelectorAll<HTMLElement>("[data-chat-clone='true']"));
      existingClones.forEach((clone) => clone.remove());

      const originalChatCards = Array.from(phoneTrack.querySelectorAll<HTMLElement>(".phone-chat"));
      originalChatCards.forEach((card) => {
        const clone = card.cloneNode(true) as HTMLElement;
        clone.setAttribute("aria-hidden", "true");
        clone.dataset.chatClone = "true";
        phoneTrack.appendChild(clone);
      });

      phoneTrack.classList.add("is-marquee");

      let marqueeWidth = 0;
      let position = 0;
      let currentSpeed = 42;
      let targetSpeed = 42;
      let lastTime = performance.now();
      let marqueeFrame = 0;

      const measureMarquee = () => {
        if (!originalChatCards.length) return;

        const styles = window.getComputedStyle(phoneTrack);
        const gap = Number.parseFloat(styles.columnGap || styles.gap || "0") || 0;
        const first = originalChatCards[0];
        const last = originalChatCards[originalChatCards.length - 1];
        marqueeWidth = last.offsetLeft + last.offsetWidth - first.offsetLeft + gap;
      };

      const tickMarquee = (now: number) => {
        const delta = Math.min((now - lastTime) / 1000, 0.05);
        lastTime = now;
        currentSpeed += (targetSpeed - currentSpeed) * 0.08;

        if (marqueeWidth > 0) {
          position -= currentSpeed * delta;

          if (position <= -marqueeWidth) {
            position += marqueeWidth;
          }

          phoneTrack.style.transform = `translate3d(${position}px, 0, 0)`;
        }

        marqueeFrame = requestAnimationFrame(tickMarquee);
      };

      const slowToStop = () => {
        targetSpeed = 0;
      };
      const resumeMarquee = () => {
        targetSpeed = 42;
      };
      const handleResize = () => {
        measureMarquee();
        position = marqueeWidth > 0 ? position % marqueeWidth : 0;
      };

      measureMarquee();
      addListener(phoneTrack, "mouseenter", slowToStop);
      addListener(phoneTrack, "mouseleave", resumeMarquee);
      addListener(window, "resize", handleResize);

      marqueeFrame = requestAnimationFrame(tickMarquee);
      cleanupCallbacks.push(() => {
        cancelAnimationFrame(marqueeFrame);
        phoneTrack.classList.remove("is-marquee");
        phoneTrack.style.transform = "";
        Array.from(phoneTrack.querySelectorAll<HTMLElement>("[data-chat-clone='true']")).forEach((clone) =>
          clone.remove(),
        );
      });
    }

    const impactLab = document.querySelector<HTMLElement>(".impact-lab");

    if (impactLab) {
      impactLab.classList.add("is-impact-pending");
      const animationFrames: number[] = [];
      const animationTimers: number[] = [];
      const impactCards = Array.from(impactLab.querySelectorAll<HTMLElement>(".impact-card"));

      const readNumber = (text: string) => Number(text.replace(/[^\d]/g, ""));

      const animateAmount = (element: HTMLElement, from: number, to: number, duration = 1100) => {
        const startTime = performance.now();

        const tick = (now: number) => {
          const progress = Math.min((now - startTime) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          const value = Math.round(from + (to - from) * eased);

          element.textContent = `${formatNumber(value)}원`;

          if (progress < 1) {
            animationFrames.push(requestAnimationFrame(tick));
          }
        };

        animationFrames.push(requestAnimationFrame(tick));
      };

      const clearAnimationWork = () => {
        while (animationTimers.length) {
          const timer = animationTimers.pop();
          if (timer) window.clearTimeout(timer);
        }

        while (animationFrames.length) {
          const frame = animationFrames.pop();
          if (frame) cancelAnimationFrame(frame);
        }
      };

      const resetEnergyNumbers = (card: HTMLElement) => {
        const costRows = Array.from(card.querySelectorAll<HTMLElement>(".cost-compare > div"));

        costRows.forEach((row) => {
          const amounts = row.querySelectorAll<HTMLElement>("em b");
          const beforeAmount = amounts[0];

          if (!beforeAmount) return;

          if (!beforeAmount.dataset.startAmount) {
            beforeAmount.dataset.startAmount = String(readNumber(beforeAmount.textContent || ""));
          }

          beforeAmount.textContent = `${formatNumber(Number(beforeAmount.dataset.startAmount))}원`;
        });
      };

      const runCardAnimation = (card: HTMLElement, clearExisting = true) => {
        if (clearExisting) {
          clearAnimationWork();
        }

        card.classList.remove("is-card-playing");
        resetEnergyNumbers(card);
        void card.offsetWidth;
        card.classList.add("is-card-playing");

        if (!card.classList.contains("energy-card")) return;

        const costRows = Array.from(card.querySelectorAll<HTMLElement>(".cost-compare > div"));
        const timer = window.setTimeout(() => {
          costRows.forEach((row) => {
            const amounts = row.querySelectorAll<HTMLElement>("em b");
            const beforeAmount = amounts[0];
            const afterAmount = amounts[1];

            if (!beforeAmount || !afterAmount) return;

            const startAmount = Number(beforeAmount.dataset.startAmount || readNumber(beforeAmount.textContent || ""));
            animateAmount(beforeAmount, startAmount, readNumber(afterAmount.textContent || ""));
          });
        }, 500);

        animationTimers.push(timer);
      };

      const runImpactAnimation = () => {
        impactLab.classList.add("is-impact-visible");
        impactLab.classList.remove("is-impact-pending");
        clearAnimationWork();
        impactCards.forEach((card) => runCardAnimation(card, false));
      };

      impactCards.forEach((card) => {
        addListener(card, "mouseenter", () => runCardAnimation(card));
        addListener(card, "pointerdown", () => runCardAnimation(card));
      });

      const impactObserver = new IntersectionObserver(
        (entries, observer) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;

            runImpactAnimation();
            observer.unobserve(entry.target);
          });
        },
        { threshold: 0.28 },
      );

      impactObserver.observe(impactLab);

      const reportModal = document.getElementById("management-report-modal");
      const reportOpenButton = document.querySelector<HTMLButtonElement>("[data-report-open]");
      const reportCloseElements = reportModal
        ? Array.from(reportModal.querySelectorAll<HTMLElement>("[data-report-close]"))
        : [];
      let reportLastFocus: HTMLElement | null = null;
      let reportCloseTimer: number | undefined;

      const openReportModal = () => {
        if (!reportModal) return;

        reportLastFocus = document.activeElement instanceof HTMLElement ? document.activeElement : reportOpenButton;

        if (reportCloseTimer) {
          window.clearTimeout(reportCloseTimer);
        }

        reportModal.hidden = false;
        document.body.classList.add("report-modal-open");
        requestAnimationFrame(() => reportModal.classList.add("is-open"));
        reportModal.querySelector<HTMLButtonElement>("[data-report-close]")?.focus();
      };

      const closeReportModal = () => {
        if (!reportModal || reportModal.hidden) return;

        reportModal.classList.remove("is-open");
        document.body.classList.remove("report-modal-open");
        reportCloseTimer = window.setTimeout(() => {
          reportModal.hidden = true;
          reportLastFocus?.focus();
        }, 180);
      };

      if (reportModal && reportOpenButton) {
        addListener(reportOpenButton, "click", openReportModal);
        reportCloseElements.forEach((element) => addListener(element, "click", closeReportModal));
        addListener(document, "keydown", (event) => {
          if ((event as KeyboardEvent).key === "Escape") {
            closeReportModal();
          }
        });
      }

      cleanupCallbacks.push(() => {
        impactObserver.disconnect();
        impactLab.classList.remove("is-impact-pending");
        impactLab.classList.add("is-impact-visible");
        clearAnimationWork();
        if (reportCloseTimer) {
          window.clearTimeout(reportCloseTimer);
        }
        document.body.classList.remove("report-modal-open");
        reportModal?.classList.remove("is-open");
      });
    }

    const warrantyForm = document.querySelector<HTMLFormElement>("[data-warranty-form]");
    const warrantyMessage = document.querySelector<HTMLElement>("[data-warranty-message]");
    const warrantyResult = document.querySelector<HTMLElement>("[data-warranty-result]");
    const warrantyFrame = document.querySelector<HTMLImageElement>("[data-warranty-frame]");
    const warrantyDownload = document.querySelector<HTMLAnchorElement>("[data-warranty-download]");
    const warrantyResultTitle = document.querySelector<HTMLElement>("[data-warranty-result-title]");

    const warrantyRecords = [
      {
        name: "테스트고객",
        phone: "01000000000",
        title: "포그니필름 품질보증서 (K-SWISS)",
        file: "/assets/pogny-warranty-k-swiss.pdf",
        preview: "/assets/pogny-warranty-preview.png",
      },
    ];

    const normalizeWarrantyName = (value: string) => value.trim().replace(/\s+/g, "");
    const normalizeWarrantyPhone = (value: string) => value.replace(/[^0-9]/g, "");

    const quoteForm = document.querySelector<HTMLFormElement>("[data-quote-form]");
    const quoteMessage = document.querySelector<HTMLElement>("[data-quote-message]");
    const quotePrivacy = document.querySelector<HTMLInputElement>("[data-quote-privacy]");
    const quoteSubmitButton = quoteForm?.querySelector<HTMLButtonElement>('button[type="submit"]');

    addListener(document, "click", (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;

      const link = target.closest<HTMLAnchorElement>("a");
      const button = target.closest<HTMLButtonElement>("button");

      if (button === quoteSubmitButton) {
        trackAnalyticsEvent("quote_button_click", { form_name: "free_quote" });
        return;
      }

      if (!link) return;

      if (link.href.startsWith("tel:")) {
        trackAnalyticsEvent("phone_click", { link_url: link.href });
      } else if (link.matches(".quick-kakao")) {
        trackAnalyticsEvent("kakao_click", { link_url: link.href });
      } else if (link.matches(".quick-youtube")) {
        trackAnalyticsEvent("youtube_click", { link_url: link.href });
      } else if (link.matches(".quick-blog, [data-case-blog]")) {
        trackAnalyticsEvent("blog_click", { link_url: link.href });
      }
    });

    if (quoteForm && quoteMessage && quoteSubmitButton) {
      const defaultSubmitLabel = quoteSubmitButton.textContent || "무료 견적 요청하기";
      let isSubmitting = false;

      const setQuoteMessage = (message: string, isSuccess = false) => {
        quoteMessage.textContent = message;
        quoteMessage.classList.toggle("success", isSuccess);
      };

      const setSubmitting = (submitting: boolean) => {
        isSubmitting = submitting;
        quoteSubmitButton.disabled = submitting;
        quoteSubmitButton.textContent = submitting ? "접수 중..." : defaultSubmitLabel;
        quoteForm.setAttribute("aria-busy", String(submitting));
      };

      addListener(quoteForm, "submit", async (event) => {
        event.preventDefault();

        if (isSubmitting) return;

        if (!quoteForm.checkValidity()) {
          setQuoteMessage("필수 항목과 개인정보 동의 여부를 확인해주세요.");
          quoteForm.reportValidity();
          return;
        }

        const formData = new FormData(quoteForm);
        const phone = String(formData.get("phone") || "").replace(/[^0-9]/g, "");

        if (!/^010\d{8}$/.test(phone)) {
          setQuoteMessage("연락처를 010-0000-0000 형식으로 입력해주세요.");
          quoteForm.querySelector<HTMLInputElement>('[name="phone"]')?.focus();
          return;
        }

        setQuoteMessage("");
        setSubmitting(true);

        try {
          const response = await fetch("/api/quote", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: String(formData.get("name") || ""),
              phone,
              area: String(formData.get("area") || ""),
              space: String(formData.get("space") || ""),
              message: String(formData.get("message") || ""),
              privacyConsent: formData.get("privacyConsent") === "on",
            }),
          });

          const responseBody = (await response.json().catch(() => null)) as
            | { code?: string; message?: string }
            | null;

          if (!response.ok) {
            if (
              response.status === 503 &&
              responseBody?.code === "SERVICE_UNAVAILABLE"
            ) {
              setQuoteMessage(
                responseBody.message ||
                  "현재 상담 접수 시스템 점검 중입니다.\n잠시 후 다시 시도해주세요.",
              );
              return;
            }
            throw new Error("Quote request failed");
          }

          setQuoteMessage(
            "문의가 정상적으로 접수되었습니다.\n담당자가 확인 후 빠르게 연락드리겠습니다.\n급한 상담은 1833-4236으로 연락주시면\n더 빠르게 상담받으실 수 있습니다.",
            true,
          );
          trackAnalyticsEvent("generate_lead", {
            form_name: "free_quote",
            lead_source: "website",
            region: String(formData.get("area") || ""),
            space: String(formData.get("space") || ""),
            recommended_product: quoteForm.dataset.recommendedProduct || "not_selected",
          });
          quoteForm.reset();
          delete quoteForm.dataset.recommendedProduct;
        } catch {
          setQuoteMessage(
            "문의 접수에 실패했습니다.\n잠시 후 다시 시도해주세요.\n또는 1833-4236으로 전화주시면\n빠르게 상담 가능합니다.",
          );
        } finally {
          setSubmitting(false);
        }
      });

      addListener(quoteForm, "input", () => {
        if (quoteMessage.textContent) {
          setQuoteMessage("");
        }
      });

      if (quotePrivacy) {
        addListener(quotePrivacy, "change", () => {
          if (quoteMessage.textContent) {
            setQuoteMessage("");
          }
        });
      }
    }

    if (warrantyForm && warrantyMessage && warrantyResult && warrantyFrame && warrantyDownload) {
      addListener(warrantyForm, "submit", (event) => {
        event.preventDefault();

        const formData = new FormData(warrantyForm);
        const name = normalizeWarrantyName(String(formData.get("name") || ""));
        const phone = normalizeWarrantyPhone(String(formData.get("phone") || ""));
        const record = warrantyRecords.find(
          (item) => normalizeWarrantyName(item.name) === name && normalizeWarrantyPhone(item.phone) === phone,
        );

        if (!record) {
          warrantyMessage.textContent =
            "입력하신 정보와 일치하는 품질보증서를 찾을 수 없습니다. 성함과 연락처를 다시 확인해주세요.";
          warrantyMessage.classList.remove("success");
          warrantyResult.hidden = true;
          warrantyFrame.removeAttribute("src");
          warrantyDownload.href = "#";
          return;
        }

        warrantyMessage.textContent = "정상적으로 등록된 품질보증서입니다.";
        warrantyMessage.classList.add("success");
        warrantyResult.hidden = false;
        warrantyFrame.src = record.preview;
        warrantyDownload.href = record.file;
        warrantyDownload.setAttribute("download", `${record.title}.pdf`);

        if (warrantyResultTitle) {
          warrantyResultTitle.textContent = record.title;
        }
      });
    }

    return () => {
      cleanupCallbacks.reverse().forEach((cleanup) => cleanup());
    };
  }, []);

  return null;
}
