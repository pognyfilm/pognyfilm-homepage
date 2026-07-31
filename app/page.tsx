import LegacyInteractions from "./LegacyInteractions";
import FilmFinder from "../components/FilmFinder";
import FaqSection from "../components/FaqSection";
import PublicPortfolioSection from "../components/portfolio/PublicPortfolioSection";
import FilmRecommendationChatbot from "../components/FilmRecommendationChatbot";
import { AI_CHAT_ENABLED } from "../lib/features";

const legacyHtml = String.raw`<header class="site-header">
      <a class="logo" href="#home" aria-label="포그니필름 홈">
        <img src="/assets/pogny-logo-gold.png" width="1001" height="229" alt="POGNY FILM" decoding="async" />
      </a>
      <nav class="nav" aria-label="주요 메뉴">
        <a href="#products">PG FILM Series</a>
        <a href="#cases">시공사례</a>
        <a href="#film-finder">AI 필름 추천</a>
        <a href="/warranty">품질보증서 조회</a>
      </nav>
      <a class="header-call" href="tel:18334236">전화상담 1833-4236</a>
    </header>

    <main id="home">
      <section class="hero">
        <video class="hero-video" autoplay muted loop playsinline preload="metadata" poster="https://images.unsplash.com/photo-1497366672149-e5e4b4d34eb3?auto=format&fit=crop&w=1800&q=85" aria-hidden="true">
          <source src="/assets/pogny-main-hero.mp4" type="video/mp4" />
          <source src="https://videos.pexels.com/video-files/3773486/3773486-uhd_2560_1440_30fps.mp4" type="video/mp4" />
        </video>
        <div class="hero-overlay" aria-hidden="true"></div>
        <div class="hero-content">
          <p class="eyebrow hero-tags">
            <span>#열차단필름</span>
            <span>#단열필름</span>
            <span>#건물썬팅</span>
          </p>
          <h1>공간에 맞는 필름은<br /><span>따로 있습니다</span></h1>
          <p class="hero-copy">
            내 공간에 맞는 필름부터 전문 시공까지,<br />
            데이터로 증명하는 단열필름 솔루션
          </p>
          <div class="hero-actions">
            <a class="btn primary" href="#film-finder">내 공간 필름 추천받기 <span aria-hidden="true">→</span></a>
            <a class="btn secondary" href="#quote">1:1 문의상담 <span aria-hidden="true">→</span></a>
          </div>
        </div>
      </section>

      <section class="stats hero-proof" aria-label="포그니필름 신뢰 지표">
        <div class="stats-inner">
          <article>
            <span><b>01</b> 누적 시공</span>
            <strong><span class="count-up" data-target="10000">10,000</span>건 돌파</strong>
          </article>
          <article>
            <span><b>02</b> 외주 없는</span>
            <strong>직영 관리 시스템</strong>
          </article>
          <article>
            <span><b>03</b> 시공 후에도 안심</span>
            <strong>정품 품질보증서</strong>
          </article>
        </div>
      </section>

      <section class="section logo-flow" aria-labelledby="logo-flow-title">
        <div class="logo-flow-head">
          <span>EVERYWHERE</span>
          <h2 id="logo-flow-title">소규모 현장부터 대규모 현장까지</h2>
          <p>"유리가 있는 모든 공간이면 가능합니다!"</p>
        </div>
        <div class="logo-marquee" aria-label="포그니필름 시공 가능 고객군">
          <div class="logo-track">
            <span class="logo-item"><img src="/assets/assetsclient-logos/서울대학교.png" alt="서울대학교" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/연세대학교.png" alt="연세대학교" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/서강대학교.png" alt="서강대학교" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/GS건설.png" alt="GS건설" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/대우건설.png" alt="대우건설" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/하얏트.png" alt="하얏트" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/강남세브란스병원.png" alt="강남세브란스병원" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/고려대학교안암병원.png" alt="고려대학교안암병원" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/서울대학교.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/연세대학교.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/서강대학교.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/GS건설.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/대우건설.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/하얏트.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/강남세브란스병원.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/고려대학교안암병원.png" alt="" /></span>
          </div>
        </div>
        <div class="logo-marquee reverse" aria-hidden="true">
          <div class="logo-track">
            <span class="logo-item"><img src="/assets/assetsclient-logos/국방부.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/경기도김포교육지원청.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/한국전력공사.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/kwater.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/농협.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/다이소.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/포스코.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/현대카드.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/국방부.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/경기도김포교육지원청.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/한국전력공사.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/kwater.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/농협.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/다이소.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/포스코.png" alt="" /></span>
            <span class="logo-item"><img src="/assets/assetsclient-logos/현대카드.png" alt="" /></span>
          </div>
        </div>
      </section>

      <section class="section proof" aria-labelledby="proof-title">
        <div class="section-head">
          <p class="eyebrow">Real Pogny</p>
          <h2 id="proof-title">포그니가 '진짜'인 이유</h2>
        </div>
        <div class="proof-grid">
          <article class="proof-card direct">
            <span>01</span>
            <h3>100% 직영 시공팀의 하루 2곳 시공</h3>
            <p>포그니 직영 시공팀을 운영하여 AS가 확실한 무제한 책임 시공을 약속 드립니다.</p>
          </article>
          <article class="proof-card detail">
            <span>02</span>
            <h3>제작부터 시공까지 원스톱 시스템</h3>
            <p>정품 국산 필름을 제작하여 품질 좋은 제품을 저렴한 금액으로 고객분들에게 제공해드리고 있습니다.</p>
          </article>
          <article class="proof-card trust">
            <span>03</span>
            <h3>시공 후 확인 가능한<br />품질보증서 조회</h3>
            <p>정품 필름으로 안심하고 시공받으실 수 있도록, 언제든 확인 가능한 품질보증서 조회 서비스를 제공합니다.</p>
          </article>
        </div>
      </section>

      <section class="section reasons" aria-labelledby="reasons-title">
        <div class="section-head reason-lead">
          <p class="eyebrow">WHY POGNY FILM</p>
          <h2 id="reasons-title">단열필름 선택 전,<br />이 기준은 꼭 확인하세요</h2>
          <p>
            제조 방식부터 성능, 내구성, 시공 주체와 품질보증까지 함께 비교해 보세요.
          </p>
        </div>
        <div class="reason-premium-table-wrap" aria-label="단열필름 선택 기준 비교표">
          <table class="reason-premium-table">
            <thead>
              <tr>
                <th scope="col">포그니필름</th>
                <th scope="col">비교 항목</th>
                <th scope="col">일반 저가형·염색 필름</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td data-label="포그니필름"><span class="reason-check">✓</span>NSN 스퍼터링 필름</td>
                <th scope="row">제조 방식</th>
                <td data-label="일반 저가형·염색 필름"><span class="reason-cross">✕</span>단순 염색 또는 저가형 필름</td>
              </tr>
              <tr>
                <td data-label="포그니필름"><span class="reason-check">✓</span>열차단 99% / TSER 70% 이상</td>
                <th scope="row">열차단 성능</th>
                <td data-label="일반 저가형·염색 필름"><span class="reason-cross">✕</span>초기만 차단, 시간이 지날수록 급감</td>
              </tr>
              <tr>
                <td data-label="포그니필름"><span class="reason-check">✓</span>기포·변색 발생률 낮음 / A/S 보장</td>
                <th scope="row">내구성</th>
                <td data-label="일반 저가형·염색 필름"><span class="reason-cross">✕</span>1~2년 내 변색 및 기포 발생</td>
              </tr>
              <tr>
                <td data-label="포그니필름"><span class="reason-check">✓</span>나노 단위의 필름으로 시인성 극대화</td>
                <th scope="row">시인성</th>
                <td data-label="일반 저가형·염색 필름"><span class="reason-cross">✕</span>입자가 커 시인성 불편</td>
              </tr>
              <tr>
                <td data-label="포그니필름"><span class="reason-check">✓</span>100% 본사 직영 시공팀 책임 시공</td>
                <th scope="row">시공팀</th>
                <td data-label="일반 저가형·염색 필름"><span class="reason-cross">✕</span>출처가 불분명한 외주·하청 인력</td>
              </tr>
              <tr>
                <td data-label="포그니필름"><span class="reason-check">✓</span>최대 10년 정품 품질보증서 발급</td>
                <th scope="row">품질보증</th>
                <td data-label="일반 저가형·염색 필름"><span class="reason-cross">✕</span>정품 필름이 아니라 보증 불가</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="section tser-guide" aria-labelledby="tser-guide-title">
        <div class="tser-guide-shell">
          <header class="tser-guide-head">
            <h2 id="tser-guide-title">열차단필름의 고향 <strong class="tser-country">미국</strong>에서는<br /><span>'열차단율'보다</span><br /><strong>TSER</strong>을 먼저 봅니다.</h2>
          </header>

          <article class="tser-unified-card">
            <div class="tser-explainer">
              <p class="tser-question">“열차단율이 몇 %인가요?”</p>
              <p>단순히 940nm에서 측정한 적외선 차단율만으로는 필름 성능 전체를 판단하기 어렵습니다.</p>
            </div>
            <span class="tser-transition-arrow" aria-hidden="true">→</span>
            <div class="tser-focus-card">
              <div>
                <h3>TSER</h3>
                <strong>총태양에너지차단율</strong>
                <span>태양 에너지 전체를 기준으로 필름 성능을 확인하는 중요한 지표입니다.</span>
              </div>
            </div>
          </article>

          <p class="tser-compare-intro">
            대다수 업체가 단순한 열차단율만으로 성능을 설명하지만,
            실제로 가장 중요한 수치는 겉으로 드러나지 않는
            <strong>총태양에너지차단율(TSER)</strong>입니다.
          </p>

          <div class="tser-compare-bar" aria-label="필름 성능 확인 기준 비교">
            <span class="is-wrong"><i aria-hidden="true">×</i> 열차단율만 확인</span>
            <b aria-hidden="true">→</b>
            <span class="is-right"><i aria-hidden="true">✓</i> TSER로 필름 최종 성능 체크</span>
          </div>

          <footer class="tser-conclusion">
            <div>
              <h3>숫자보다 중요한 것은 <strong>올바른 기준</strong>입니다.</h3>
              <p>포그니필름은 시험성적서를 기반으로 실제 성능 데이터를 안내합니다.</p>
            </div>
          </footer>

          <aside class="section-cta-banner section-cta-banner-soft" aria-label="TSER 맞춤 필름 견적 안내">
            <a class="section-cta-button" href="#quote">무료 견적 받아보기</a>
          </aside>
        </div>
      </section>

      <section class="section certified-technology" aria-labelledby="certified-technology-title">
        <div class="certified-technology-shell">
          <header class="certified-technology-head">
            <p class="eyebrow">CERTIFIED TECHNOLOGY</p>
            <h2 id="certified-technology-title">말보다 확실한 기술의 증명</h2>
            <p>포그니필름은 특허와 상표등록,<br />공인 시험성적서를 바탕으로<br />제품의 기술력과 성능을 투명하게 증명합니다.</p>
          </header>

          <figure class="certified-technology-visual">
            <img
              src="/assets/certified-technology.png"
              width="1110"
              height="624"
              loading="lazy"
              alt="포그니필름 특허증, 상표등록증 및 공인 시험성적서"
            />
          </figure>

          <div class="certified-technology-trust">
            <strong>검증된 자료가<br />포그니필름의 기준입니다.</strong>
            <p>보이지 않는 수치까지<br />공인 시험자료를 기준으로 안내합니다.</p>
          </div>

          <a class="section-cta-button certified-technology-cta" href="#quote">검증된 필름 상담받기</a>
        </div>
      </section>

      <section class="section products" id="products" aria-labelledby="products-title">
        <div class="product-lineup">
          <div class="product-series-title">
            <p class="eyebrow">Premium Window Film</p>
            <h2>PG FILM Series</h2>
          </div>
          <div class="product-tabs" role="tablist" aria-label="포그니필름 제품 라인">
            <button class="active" type="button" role="tab" aria-selected="true" data-product-tab="air">PG AIR</button>
            <button type="button" role="tab" aria-selected="false" data-product-tab="x">PG X</button>
            <button type="button" role="tab" aria-selected="false" data-product-tab="pro">PG PRO</button>
            <button type="button" role="tab" aria-selected="false" data-product-tab="xo">PG XO</button>
          </div>

          <article class="product-panel active" data-product-panel="air">
            <div class="product-info">
              <p class="eyebrow">Premium Film Line-up</p>
              <h2 id="products-title">PG AIR FILM</h2>
              <p>
                열차단율 99%, 자외선 차단율 99%를 구현한 포그니필름의 플래그십 윈도우 필름입니다.<br />
                열차단 성능이 뛰어난 실버(Silver)층 양면에 내구성이 우수한 니켈크롬(Nickel-Chromium)을 적용한 NSN Technology를 통해 강력한 열차단 성능과 뛰어난 내구성을 동시에 구현했으며, 나노 세라믹 스퍼터링 기술을 더해 더욱 균일한 품질과 안정적인 열 제어 성능을 제공합니다.<br />
                또한 4대 유해 중금속이 검출되지 않은 안전한 소재와 2.5MIL 초하드코팅을 적용해 성능과 내구성, 안전성까지 모두 고려한 포그니필름의 프리미엄 플래그십 윈도우 필름으로, 프리미엄 공간을 위한 새로운 기준을 제시합니다.
              </p>
              <div class="product-feature-copy">
                <h3>특징</h3>
                <div class="product-feature-items">
                  <div>
                    <strong>NSN Technology</strong>
                    <p>열차단 성능이 뛰어난 실버(Silver)층 양면에 내구성이 우수한 니켈크롬(Nickel-Chromium)을 적용해 강력한 열차단 성능과 뛰어난 내구성을 동시에 구현한 포그니필름만의 핵심 기술입니다.</p>
                  </div>
                  <div>
                    <strong>나노 세라믹 스퍼터링</strong>
                    <p>초정밀 스퍼터링 공정을 통해 균일한 품질과 안정적인 열 제어 성능을 구현한 프리미엄 제조 기술입니다.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="product-detail">
              <div class="product-photo">
                <img src="/assets/product-pg-air.webp" width="900" height="900" loading="lazy" decoding="async" alt="PG AIR 필름 추천 공간 이미지" />
                <span>PG AIR · Bright Comfort</span>
              </div>
            </div>
          </article>

          <article class="product-panel" data-product-panel="x" hidden>
            <div class="product-info">
              <p class="eyebrow">Premium Balance</p>
              <h2>PG X FILM</h2>
              <p>
                열차단율 98%, 자외선 차단율 99%를 구현한 프리미엄 스퍼터링 윈도우 필름입니다.<br />
                높은 내열성과 안정성을 갖춘 텅스텐(Tungsten)을 적용해 강력한 열차단 성능과 뛰어난 내구성을 동시에 구현했으며, 나노 세라믹 스퍼터링 기술을 더해 더욱 균일한 품질과 안정적인 열 제어 성능을 제공합니다.<br />
                또한 과도한 외부 반사를 줄인 자연스러운 반사감으로 쾌적한 시야와 프라이버시를 함께 고려해 주거 공간부터 상업시설까지 다양한 환경에 조화롭게 적용할 수 있는 포그니필름의 프리미엄 스퍼터링 윈도우 필름입니다.
              </p>
              <div class="product-feature-copy">
                <h3>특징</h3>
                <div class="product-feature-items">
                  <div>
                    <strong>텅스텐 적용</strong>
                    <p>높은 내열성과 안정성을 갖춘 텅스텐(Tungsten)을 적용해 강력한 열차단 성능과 뛰어난 내구성을 구현한 포그니필름의 핵심 스퍼터링 기술입니다.</p>
                  </div>
                  <div>
                    <strong>나노 세라믹 스퍼터링</strong>
                    <p>초정밀 스퍼터링 공정을 통해 균일한 품질과 안정적인 열 제어 성능을 구현한 프리미엄 제조 기술입니다.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="product-detail">
              <div class="product-photo">
                <img src="/assets/product-pg-x.webp" width="900" height="900" loading="lazy" decoding="async" alt="PG X 필름 추천 공간 이미지" />
                <span>PG X · Premium Balance</span>
              </div>
            </div>
          </article>

          <article class="product-panel" data-product-panel="pro" hidden>
            <div class="product-info">
              <p class="eyebrow">Professional Grade</p>
              <h2>PG PRO FILM</h2>
              <p>
                열차단율 90%, 자외선 차단율 99%를 구현한 나노 세라믹 메탈 윈도우 필름입니다.<br />
                나노 세라믹 기술과 내열성과 내구성이 뛰어난 니켈크롬(Nickel-Chromium) 메탈층을 결합해 강력한 열차단 성능과 안정적인 내구성을 동시에 구현했으며, 균일한 품질과 우수한 시인성으로 더욱 쾌적한 실내 환경을 제공합니다.<br />
                또한 합리적인 가격과 프리미엄 성능의 균형을 갖춰 주거 공간부터 상업시설까지 폭넓게 적용할 수 있는 포그니필름의 프리미엄 나노 세라믹 메탈 윈도우 필름입니다.
              </p>
              <div class="product-feature-copy">
                <h3>특징</h3>
                <div class="product-feature-items">
                  <div>
                    <strong>나노 세라믹 메탈</strong>
                    <p>나노 세라믹과 메탈 기술을 결합해 우수한 열차단 성능과 안정적인 품질을 구현한 포그니필름의 프리미엄 필름 기술입니다.</p>
                  </div>
                  <div>
                    <strong>니켈크롬 메탈층</strong>
                    <p>다양한 메탈 소재 가운데 뛰어난 내구성과 내열성을 갖춘 니켈크롬(Nickel-Chromium)을 적용해 오랜 시간 균일한 성능을 유지하도록 설계했습니다.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="product-detail">
              <div class="product-photo">
                <img src="/assets/product-pg-pro.webp" width="900" height="900" loading="lazy" decoding="async" alt="PG PRO 필름 추천 공간 이미지" />
                <span>PG PRO · Professional Grade</span>
              </div>
            </div>
          </article>

          <article class="product-panel" data-product-panel="xo" hidden>
            <div class="product-info">
              <p class="eyebrow">Outdoor Privacy</p>
              <h2>PG XO FILM</h2>
              <p>
                열차단율 98%, 자외선 차단율 99%를 구현한 외부 전용 스퍼터링 윈도우 필름입니다.<br />
                높은 내열성과 안정성을 갖춘 텅스텐(Tungsten)을 적용해 강력한 열차단 성능을 구현했으며, 건물 외부 유리면에 직접 시공하는 방식으로 태양 복사열과 자외선을 실내 유입 전부터 효과적으로 차단합니다.<br />
                또한 3.5MIL 하드코팅 구조와 외부 환경을 고려한 설계를 적용해 강한 햇빛과 비바람, 다양한 기후 환경에서도 안정적인 성능을 유지하며, 대형 상업시설과 오피스, 통유리 건축물에 적합한 포그니필름의 외부 전용 프리미엄 스퍼터링 윈도우 필름입니다.
              </p>
              <div class="product-feature-copy">
                <h3>특징</h3>
                <div class="product-feature-items">
                  <div>
                    <strong>외부 전용 스퍼터링</strong>
                    <p>건물 외부 유리면에 직접 시공하는 외부 전용 필름으로 태양 복사열을 실내 유입 전에 효과적으로 제어해 더욱 효율적인 열 관리 환경을 제공합니다.</p>
                  </div>
                  <div>
                    <strong>3.5MIL 튼튼한 하드코팅 구조</strong>
                    <p>3.5MIL 두께의 견고한 구조를 적용해 강한 햇빛과 비바람, 온도 변화 등 다양한 외부 환경에서도 안정적인 성능을 유지합니다.</p>
                  </div>
                </div>
              </div>
            </div>
            <div class="product-detail">
              <div class="product-photo">
                <img src="/assets/product-pg-xo.webp" width="900" height="900" loading="lazy" decoding="async" alt="PG XO 필름 추천 공간 이미지" />
                <span>PG XO · Premium Privacy</span>
              </div>
            </div>
          </article>
        </div>
      </section>
<section class="section film-demo" aria-labelledby="film-demo-title">
        <div class="section-head split">
          <div>
            <p class="eyebrow">Before & After</p>
            <h2 id="film-demo-title">필름 시공 전후를 직접 비교해보세요</h2>
          </div>
          <p>샷시가 자동으로 열리고 닫히며 POGNY FILM 시공 전후의 눈부심, 색감, 시야 차이를 보여드립니다.</p>
        </div>
        <div class="film-compare" style="--position: 0%">
          <div class="compare-stage">
            <img
              class="compare-image"
              src="/assets/compare-window.webp"
              width="1200"
              height="676"
              loading="lazy"
              decoding="async"
              alt="강한 햇살이 들어오는 사무실 유리창"
            />
            <div class="compare-after" aria-hidden="true"></div>
            <div class="compare-room-shade" aria-hidden="true"></div>
            <div class="sash-window" aria-hidden="true">
              <div class="sash-frame"></div>
              <div class="sash-door sash-door-left"></div>
            </div>
            <div class="compare-message" aria-hidden="true">
              <span>필름 한 장으로 달라진</span>
              <strong>LIFE STYLE</strong>
            </div>
            <div class="compare-line" aria-hidden="true">
              <span></span>
            </div>
            <div class="compare-label before">시공 전</div>
            <div class="compare-label after">시공 후</div>
          </div>
        </div>
      </section>

      <section class="section shorts" aria-labelledby="shorts-title">
        <div class="section-head split shorts-head">
          <div>
            <p class="eyebrow">Pogny Shorts</p>
            <h2 id="shorts-title">영상으로 확인하는<br />포그니필름 리얼 현장</h2>
          </div>
          <p>현장 분위기, 시공 과정, 결과물을<br />짧은 영상으로 먼저 만나보세요.</p>
        </div>
        <div class="shorts-grid">
          <article class="short-card">
            <iframe
              src="https://www.youtube.com/embed/jHv2b61iciE"
              title="포그니필름 쇼츠 영상 1"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </article>
          <article class="short-card">
            <iframe
              src="https://www.youtube.com/embed/tbonvgbhTpU"
              title="포그니필름 쇼츠 영상 2"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </article>
          <article class="short-card">
            <iframe
              src="https://www.youtube.com/embed/WF-aCU1EY4Y"
              title="포그니필름 쇼츠 영상 3"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowfullscreen
            ></iframe>
          </article>
        </div>
        <aside class="section-cta-banner section-cta-banner-bright" aria-label="영상 시공 사례 상담 안내">
          <a class="section-cta-button" href="#quote">무료 상담 신청하기</a>
        </aside>
      </section>

      <section class="section process" aria-labelledby="process-title">
        <div class="process-title">
          <p class="eyebrow">Process</p>
          <h2 id="process-title">체계적인 고객 맞춤 시공과정</h2>
          <p>
            상담부터 검수까지,<br />
            한 팀이 책임집니다
          </p>
        </div>
        <ol class="process-list">
          <li class="process-step step-consult">
            <span>01</span>
            <strong>상담</strong>
            <p>공간 용도, 방향, 불편함을 확인해 필요한 필름 성능을 먼저 정리합니다.</p>
          </li>
          <li class="process-step step-visit">
            <span>02</span>
            <strong>현장방문</strong>
            <p>유리 상태와 시공 환경을 직접 확인해 가능한 시공 범위와 일정을 안내합니다.</p>
          </li>
          <li class="process-step step-film">
            <span>03</span>
            <strong>필름 선택</strong>
            <p>열차단, 사생활 보호, 안전필름 등 목적에 맞는 제품을 제안합니다.</p>
          </li>
          <li class="process-step step-measure">
            <span>04</span>
            <strong>실측</strong>
            <p>유리 규격을 정확히 측정해 필름 손실과 들뜸을 줄이도록 준비합니다.</p>
          </li>
          <li class="process-step step-install">
            <span>05</span>
            <strong>시공</strong>
            <p>보양과 바탕 정리 후 기포, 먼지, 방향성을 체크하며 부착합니다.</p>
          </li>
          <li class="process-step step-check">
            <span>06</span>
            <strong>최종검수</strong>
            <p>마감 상태와 시야, 들뜸 여부를 확인하고 관리 방법까지 안내합니다.</p>
          </li>
        </ol>
      </section>

      <section class="review-chat" aria-labelledby="review-chat-title">
        <div class="review-chat-head">
          <h2 id="review-chat-title">초밀착 1:1 케어로 확실하게</h2>
          <p>"보여드리고 증명하니까" 믿고 또 찾아주시는</p>
          <strong>포그니필름</strong>
        </div>
        <div class="chat-slider" aria-label="카카오톡 후기 슬라이더">
          <button class="chat-nav prev" type="button" aria-label="이전 후기">‹</button>
          <div class="phone-track">
            <article class="phone-chat">
              <img src="/assets/review-kakao-01.png" width="390" height="665" loading="lazy" decoding="async" alt="영등포 주택 고객 카카오톡 후기" />
            </article>
            <article class="phone-chat">
              <img src="/assets/review-kakao-02.png" width="390" height="665" loading="lazy" decoding="async" alt="강남 12층 사무실 고객 카카오톡 후기" />
            </article>
            <article class="phone-chat">
              <img src="/assets/review-kakao-03.png" width="390" height="665" loading="lazy" decoding="async" alt="인천 청라 아파트 고객 카카오톡 후기" />
            </article>
            <article class="phone-chat">
              <img src="/assets/review-kakao-04.png" width="390" height="665" loading="lazy" decoding="async" alt="광명 아파트 고객 카카오톡 후기" />
            </article>
            <article class="phone-chat">
              <img src="/assets/review-kakao-05.png" width="390" height="665" loading="lazy" decoding="async" alt="서초동 사무실 고객 카카오톡 후기" />
            </article>
            <article class="phone-chat">
              <img src="/assets/review-kakao-06.png" width="390" height="665" loading="lazy" decoding="async" alt="부천 아파트 고객 카카오톡 후기" />
            </article>
            <article class="phone-chat">
              <img src="/assets/review-kakao-07.png" width="390" height="665" loading="lazy" decoding="async" alt="일산 오피스텔 고객 카카오톡 후기" />
            </article>
          </div>
          <button class="chat-nav next" type="button" aria-label="다음 후기">›</button>
        </div>
        <aside class="section-cta-banner section-cta-banner-soft" aria-label="포그니필름 견적 안내">
          <a class="section-cta-button" href="#quote">무료 견적 받아보기</a>
        </aside>
      </section>

      <section class="section impact-lab data-report-lab" aria-labelledby="impact-lab-title">
        <div class="data-report-container">
          <div class="data-report-section-head">
            <p class="eyebrow">Real Data Report</p>
            <h2 id="impact-lab-title">포그니필름 시공 후,<br />실제 전기 사용량은 이렇게 달라졌습니다</h2>
            <p>동일 세대의 6월 납부내역을 시공 전·시공 후 1년 뒤·2년 뒤로 비교했습니다.</p>
            <small>단순한 예상 수치가 아닌 실제 납부내역을 바탕으로 확인한 변화입니다.</small>
          </div>

          <div class="data-period-flow" aria-label="연도별 관리비와 전기사용량 변화">
            <article class="data-period-card before">
              <div class="data-period-top">
                <span>2024년 6월</span>
                <em>시공 전</em>
              </div>
              <dl>
                <div><dt>총 관리비</dt><dd>238,550원</dd></div>
                <div><dt>전기사용량</dt><dd>436kWh</dd></div>
                <div><dt>세대전기요금</dt><dd>102,940원</dd></div>
              </dl>
            </article>
            <span class="data-report-arrow" aria-hidden="true">→</span>
            <article class="data-period-card after">
              <div class="data-period-top">
                <span>2025년 6월</span>
                <em>시공 후 1년 뒤</em>
              </div>
              <dl>
                <div><dt>총 관리비</dt><dd>204,130원</dd></div>
                <div><dt>전기사용량</dt><dd>318kWh</dd></div>
                <div><dt>세대전기요금</dt><dd>62,100원</dd></div>
              </dl>
            </article>
            <span class="data-report-arrow" aria-hidden="true">→</span>
            <article class="data-period-card sustain">
              <div class="data-period-top">
                <span>2026년 6월</span>
                <em>시공 후 2년 뒤</em>
              </div>
              <dl>
                <div><dt>총 관리비</dt><dd>189,300원</dd></div>
                <div><dt>전기사용량</dt><dd>343kWh</dd></div>
                <div><dt>세대전기요금</dt><dd>68,190원</dd></div>
              </dl>
            </article>
          </div>

          <div class="data-report-metrics" aria-label="시공 전 대비 핵심 변화">
            <article class="data-report-metric primary">
              <span>전기사용량 변화</span>
              <div class="data-report-metric-row">
                <strong>436kWh<br /><small class="data-report-target">→ 318kWh</small></strong>
                <div class="data-report-saving">
                  <em>118kWh 감소</em>
                  <p aria-label="시공 전 대비 27.1% 감소"><span aria-hidden="true">▼</span> 27.1% 감소</p>
                </div>
              </div>
            </article>
            <article class="data-report-metric primary">
              <span>세대전기요금 변화</span>
              <div class="data-report-metric-row">
                <strong>102,940원 → 62,100원</strong>
                <div class="data-report-saving">
                  <em>40,840원 감소</em>
                  <p aria-label="시공 전 대비 39.7% 감소"><span aria-hidden="true">▼</span> 39.7% 감소</p>
                </div>
              </div>
            </article>
          </div>

          <div class="data-report-summary-note">
            <p>2024년 열차단필름 시공 이후 2025년 전기사용량이 크게 감소하였으며,<br />2년이 지난 2026년에도 절감 효과가 안정적으로 유지되고 있습니다.</p>
            <div class="data-report-actions">
              <button class="data-report-source-button" type="button" data-report-open aria-haspopup="dialog" aria-controls="management-report-modal">실제 납부내역 보기</button>
            </div>
          </div>

          <div class="data-report-conversion-row">
            <aside class="section-cta-banner section-cta-banner-bright" aria-label="실제 절감 효과 상담 안내">
              <a class="section-cta-button" href="#quote">무료 상담 신청하기</a>
            </aside>
          </div>

          <div class="data-report-disclaimer">
            <p>※ 위 자료는 고객이 제공한 실제 납부내역을 바탕으로 정리했으며, 개인정보는 보호를 위해 일부 가림 처리했습니다.</p>
            <p>※ 전기사용량과 전기요금은 세대별 사용 환경, 기온, 생활 패턴, 냉난방기 사용 및 요금 정책에 따라 달라질 수 있습니다.</p>
          </div>
        </div>

        <div class="data-report-modal" id="management-report-modal" role="dialog" aria-modal="true" aria-labelledby="management-report-modal-title" hidden>
          <div class="data-report-modal-backdrop" data-report-close></div>
          <div class="data-report-modal-panel" role="document">
            <button class="data-report-modal-close" type="button" data-report-close aria-label="관리비 납부내역 확대보기 닫기">×</button>
            <div class="data-report-modal-head">
              <p class="eyebrow">Original Data</p>
              <h3 id="management-report-modal-title">실제 관리비 납부내역 비교 자료</h3>
              <span>2024년 6월 · 2025년 6월 · 2026년 6월</span>
            </div>
            <div class="data-report-modal-body">
              <img src="/assets/management-fee-report-2024-2026.webp" width="1200" height="800" loading="lazy" decoding="async" alt="포그니필름 시공 전후 3개년 전기사용량 및 관리비 비교 자료" />
            </div>
          </div>
        </div>
      </section>

      <section class="section cases" id="cases" aria-labelledby="cases-title">
        <div class="section-head split">
          <div>
            <p class="eyebrow">Portfolio</p>
            <h2 id="cases-title">시공사례</h2>
          </div>
          <div class="filters" aria-label="시공사례 필터">
            <button class="active" data-filter="all" type="button">전체</button>
            <button data-filter="home" type="button">주거</button>
            <button data-filter="office" type="button">사무실</button>
            <button data-filter="factory" type="button">공장</button>
            <button data-filter="public" type="button">관공서</button>
            <button data-filter="school" type="button">학교</button>
            <button data-filter="store" type="button">상가</button>
          </div>
        </div>
        <div class="case-grid" data-case-grid></div>
      </section>

      <div class="case-modal" data-case-modal aria-hidden="true">
        <div class="case-modal-backdrop" data-case-close></div>
        <section class="case-modal-panel" role="dialog" aria-modal="true" aria-labelledby="case-modal-title">
          <button class="case-modal-close" data-case-close type="button" aria-label="시공사례 상세 닫기">×</button>
          <div class="case-modal-head">
            <p class="eyebrow" data-case-category></p>
            <h2 id="case-modal-title" data-case-title></h2>
            <p data-case-summary></p>
          </div>
          <div class="case-modal-meta" data-case-meta></div>
          <a class="case-blog-banner" data-case-blog href="#" target="_blank" rel="noopener">
            <span>Blog Review</span>
            <strong>자세한 시공 후기를 블로그에서 확인하기</strong>
          </a>
          <div class="case-stage-grid" data-case-stages></div>
        </section>
      </div>

      <section class="section intro" aria-labelledby="intro-title">
        <div class="intro-inner">
          <div class="intro-copy">
            <p class="eyebrow">DIRECT TEAM PROMISE</p>
            <h2 id="intro-title"><span class="intro-yesman">YES맨</span><br />이반장 &amp; 이실장<br /><br /><span class="intro-subtitle">상담부터 시공까지,<br />포그니가 직접 책임집니다.</span></h2>
          </div>
          <aside class="intro-poster intro-team-photo" aria-label="포그니필름 본사 직영팀 사진">
            <img src="/assets/pogny-team-photo.webp" width="1000" height="785" loading="lazy" decoding="async" alt="포그니필름 본사 직영팀" />
            <span>포그니필름 본사 직영팀</span>
          </aside>
        </div>
        <div class="intro-closing" aria-label="포그니필름 책임 시공 약속">
          <p>
            수년간 하루 최대 2건만 시공하는 이유는 분명합니다.
          </p>
          <p>
            상담부터 현장 확인, 시공, 마지막 검수까지 외주나 하청 없이 본사 직영팀이 직접 책임지고 진행하기 때문입니다.
          </p>
          <p>
            좋은 시공은 작업이 끝나는 순간이 아니라 고객님의 일상이 더 편안해지는 순간 완성된다고 믿습니다.
          </p>
          <p>
            거짓 없는 믿을 수 있는 좋은 품질의 필름으로 좋은 시공을 약속드립니다.
          </p>
          <strong class="intro-signature"><span class="intro-signature-brand">포그니필름</span><span class="intro-signature-name">이반장</span></strong>
        </div>
      </section>

      <section class="section quote" aria-label="자주 묻는 질문 및 견적 문의">
        <div class="quote-shell">
          <div class="quote-copy">
            <div id="faq-root"></div>
          </div>
          <form class="quote-form" id="quote" data-quote-form aria-label="빠른 견적 문의">
            <div class="quote-form-head full">
              <span>빠른 견적 문의</span>
              <p>기본 정보를 남겨주시면 확인 후 빠르게 연락드리겠습니다.</p>
            </div>
            <label>
              <span>이름 <em>*</em></span>
              <input type="text" name="name" placeholder="성함을 입력해주세요" required data-quote-required data-clarity-mask="true" />
            </label>
            <label>
              <span>연락처 <em>*</em></span>
              <input type="tel" inputmode="tel" autocomplete="tel" name="phone" placeholder="010-0000-0000" required data-quote-required data-clarity-mask="true" />
            </label>
            <label>
              <span>지역</span>
              <input type="text" name="area" placeholder="예: 서울 강남구" data-clarity-mask="true" />
            </label>
            <label>
              <span>시공 장소</span>
              <select name="space">
                <option>주거공간</option>
                <option>상업공간</option>
                <option>공공기관</option>
                <option>기타</option>
              </select>
            </label>
            <label class="full">
              <span>문의 내용</span>
              <textarea name="message" rows="5" placeholder="시공 희망 공간, 대략적인 면적과 요청사항을 남겨주세요." data-clarity-mask="true"></textarea>
            </label>
            <label class="quote-consent full">
              <input type="checkbox" name="privacyConsent" data-quote-privacy required />
              <span>상담을 위한 개인정보 수집 및 이용에 동의합니다.</span>
            </label>
            <p class="quote-form-message full" data-quote-message aria-live="polite"></p>
            <button class="btn primary full" type="submit">무료 견적 요청하기</button>
          </form>
        </div>
      </section>

    </main>

    <footer class="footer">
      <div class="footer-inner">
        <div class="footer-main">
          <div class="footer-brand">
            <img class="footer-logo" src="/assets/pogny-logo-gold.png" width="1001" height="229" loading="lazy" decoding="async" alt="POGNY FILM" />
            <p>상담부터 시공, 품질보증까지<br />포그니필름이 직접 책임집니다.</p>
          </div>
          <div class="footer-contact">
            <strong>고객 상담</strong>
            <a class="footer-phone" href="tel:18334236">1833-4236</a>
          </div>
        </div>
        <div class="footer-bottom">
            <dl>
              <div><dt>상호명</dt><dd>포그니필름</dd></div>
              <div><dt>대표자</dt><dd>이성화</dd></div>
              <div><dt>사업자등록번호</dt><dd>128-39-78091</dd></div>
              <div><dt>주소</dt><dd>파주시 금빛로 24, 우평프라자 801호</dd></div>
              <div><dt>대표전화</dt><dd><a href="tel:18334236">1833-4236</a></dd></div>
              <div><dt>이메일</dt><dd><a href="mailto:pognyfilm@naver.com">pognyfilm@naver.com</a></dd></div>
            </dl>
          <p>© POGNY FILM. All rights reserved.</p>
        </div>
      </div>
    </footer>

    <nav class="quick-float" aria-label="빠른 상담 메뉴">
      <a class="quick-item quick-kakao" href="https://pf.kakao.com/_aYxmxmG/chat" target="_blank" rel="noopener" aria-label="카카오톡 상담">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M32 12C18.2 12 7 20.7 7 31.5c0 7 4.7 13.1 11.7 16.5l-2 8.2 9.7-5.4c1.8.3 3.7.4 5.6.4 13.8 0 25-8.7 25-19.5S45.8 12 32 12Z" />
          <text x="32" y="36" text-anchor="middle">TALK</text>
        </svg>
      </a>
      <a class="quick-item quick-call" href="tel:18334236" aria-label="전화문의 1833-4236">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <path d="M22.5 13.5 29 25.8l-5 4.2c3.7 7.1 8.9 12.3 16 16l4.2-5 12.3 6.5c.8.4 1.2 1.3.9 2.2-1.5 5-6 8.2-11.2 8.2C24.1 57.9 6.1 39.9 6.1 17.8c0-5.2 3.2-9.7 8.2-11.2.9-.3 1.8.1 2.2.9Z" />
        </svg>
      </a>
      <a class="quick-item quick-youtube" href="https://www.youtube.com/@%ED%8F%AC%EA%B7%B8%EB%8B%88%ED%95%84%EB%A6%84" target="_blank" rel="noopener" aria-label="유튜브 채널">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="9" y="17" width="46" height="30" rx="9" />
          <path d="M28 25.5v13l12-6.5-12-6.5Z" />
        </svg>
      </a>
      <a class="quick-item quick-blog" href="https://blog.naver.com/pognyfilm" target="_blank" rel="noopener" aria-label="네이버 블로그">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <rect x="10" y="14" width="44" height="34" rx="10" />
          <path d="M24 49 32 57l8-8" />
          <text x="32" y="36" text-anchor="middle">blog</text>
        </svg>
      </a>
    </nav>

    <a class="mobile-quick-call" href="tel:18334236" aria-label="대표번호 1833-4236로 전화하기">
      <span>
        <small>궁금한 점을 바로 상담해보세요</small>
        <strong>전화상담 1833-4236</strong>
      </span>
      <b>빠른 상담하기 <i aria-hidden="true">›</i></b>
    </a>`;

const impactSectionMarker = '<section class="section impact-lab data-report-lab" aria-labelledby="impact-lab-title">';
const casesSectionMarker = '<section class="section cases" id="cases" aria-labelledby="cases-title">';
const reasonsSectionMarker = '<section class="section reasons" aria-labelledby="reasons-title">';
const tserSectionMarker = '<section class="section tser-guide" aria-labelledby="tser-guide-title">';
const filmDemoSectionMarker = '<section class="section film-demo" aria-labelledby="film-demo-title">';
const shortsSectionMarker = '<section class="section shorts" aria-labelledby="shorts-title">';
const impactSectionStart = legacyHtml.indexOf(impactSectionMarker);
const impactSectionEnd = legacyHtml.indexOf(casesSectionMarker);
const impactSection = legacyHtml.slice(impactSectionStart, impactSectionEnd);
const legacyHtmlWithoutImpact =
  legacyHtml.slice(0, impactSectionStart) + legacyHtml.slice(impactSectionEnd);
const filmDemoSectionStart = legacyHtmlWithoutImpact.indexOf(filmDemoSectionMarker);
const filmDemoSectionEnd = legacyHtmlWithoutImpact.indexOf(shortsSectionMarker);
const filmDemoSection = legacyHtmlWithoutImpact.slice(filmDemoSectionStart, filmDemoSectionEnd);
const legacyHtmlWithoutFilmDemo =
  legacyHtmlWithoutImpact.slice(0, filmDemoSectionStart) +
  legacyHtmlWithoutImpact.slice(filmDemoSectionEnd);
const reasonsSectionStart = legacyHtmlWithoutFilmDemo.indexOf(reasonsSectionMarker);
const reasonsSectionEnd = legacyHtmlWithoutFilmDemo.indexOf(tserSectionMarker);
const reasonsSection = legacyHtmlWithoutFilmDemo.slice(reasonsSectionStart, reasonsSectionEnd);
const legacyHtmlWithoutFeaturedSections =
  legacyHtmlWithoutFilmDemo.slice(0, reasonsSectionStart) +
  legacyHtmlWithoutFilmDemo.slice(reasonsSectionEnd);
const legacyHtmlReordered = legacyHtmlWithoutFeaturedSections.replace(
  tserSectionMarker,
  `${impactSection}${reasonsSection}${filmDemoSection}${tserSectionMarker}`,
);

const legacyHtmlWithFinderSlot = legacyHtmlReordered.replace(
  shortsSectionMarker,
  `      <div id="film-finder-root"></div>\n      ${shortsSectionMarker}`,
);
const portfolioSectionStart = legacyHtmlWithFinderSlot.indexOf(casesSectionMarker);
const introSectionMarker = '<section class="section intro" aria-labelledby="intro-title">';
const portfolioSectionEnd = legacyHtmlWithFinderSlot.indexOf(introSectionMarker);
const legacyHtmlBeforePortfolio =
  legacyHtmlWithFinderSlot.slice(0, portfolioSectionStart) + "</main>";
const legacyHtmlAfterPortfolio =
  "<main>" + legacyHtmlWithFinderSlot.slice(portfolioSectionEnd);

export default function Home() {
  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: legacyHtmlBeforePortfolio }} />
      <PublicPortfolioSection />
      <div dangerouslySetInnerHTML={{ __html: legacyHtmlAfterPortfolio }} />
      <FilmFinder />
      {AI_CHAT_ENABLED && <FilmRecommendationChatbot />}
      <FaqSection />
      <LegacyInteractions key={legacyHtmlBeforePortfolio + legacyHtmlAfterPortfolio} />
    </>
  );
}
