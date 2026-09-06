"use client";

import { useCallback, useEffect, useRef } from "react";
import { Highlighter } from "@/components/ui/highlighter"
import { useTheme } from "@once-ui-system/core";

const morphTime = 1.5;
const cooldownTime = 0.5;

function useMorphingText(texts: string[]) {
  const textIndexRef = useRef(0);
  const morphRef = useRef(0);
  const cooldownRef = useRef(0);
  const timeRef = useRef(new Date());

  const text1Ref = useRef<HTMLSpanElement>(null);
  const text2Ref = useRef<HTMLSpanElement>(null);

  const setStyles = useCallback(
    (fraction: number) => {
      const [current1, current2] = [text1Ref.current, text2Ref.current];
      if (!current1 || !current2) return;

      current2.style.filter = `blur(${Math.min(4 / fraction - 4, 12)}px)`;
      current2.style.opacity = `${Math.pow(fraction, 0.4) * 100}%`;

      const invertedFraction = 1 - fraction;
      current1.style.filter = `blur(${Math.min(4 / invertedFraction - 4, 12)}px)`;
      current1.style.opacity = `${Math.pow(invertedFraction, 0.4) * 100}%`;

      current1.textContent = texts[textIndexRef.current % texts.length];
      current2.textContent = texts[(textIndexRef.current + 1) % texts.length];
    },
    [texts]
  );

  const doMorph = useCallback(() => {
    morphRef.current -= cooldownRef.current;
    cooldownRef.current = 0;

    let fraction = morphRef.current / morphTime;

    if (fraction > 1) {
      cooldownRef.current = cooldownTime;
      fraction = 1;
    }

    setStyles(fraction);

    if (fraction === 1) {
      textIndexRef.current++;
    }
  }, [setStyles]);

  const doCooldown = useCallback(() => {
    morphRef.current = 0;
    const [current1, current2] = [text1Ref.current, text2Ref.current];
    if (current1 && current2) {
      current2.style.filter = "none";
      current2.style.opacity = "100%";
      current1.style.filter = "none";
      current1.style.opacity = "0%";
    }
  }, []);

  useEffect(() => {
    let animationFrameId: number;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const newTime = new Date();
      const dt = (newTime.getTime() - timeRef.current.getTime()) / 1000;
      timeRef.current = newTime;

      cooldownRef.current -= dt;

      if (cooldownRef.current <= 0) doMorph();
      else doCooldown();
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [doMorph, doCooldown]);

  return { text1Ref, text2Ref };
}

// Aurora'nın gradient/clip stili - MorphingText'in iki span'ine doğrudan uygulanıyor
const auroraColors = ["#FF0080", "#7928CA", "#0070F3", "#38bdf8"];
const auroraStyle: React.CSSProperties = {
  backgroundImage: `linear-gradient(135deg, ${auroraColors.join(", ")}, ${auroraColors[0]})`,
  WebkitBackgroundClip: "text",
  WebkitTextFillColor: "transparent",
  backgroundClip: "text",
  color: "transparent",
  backgroundSize: "200% auto",
  // "animate-aurora" class'ı yerine burada elle animasyon veriyoruz --
  // "aurora" keyframe'i rotate/scale içerdiği için metni eğip duruyordu.
  // Bu ayrı, sadece arka plan rengini kaydıran ("aurora-shift") keyframe'i
  // custom.css'e eklemen gerekiyor (aşağıdaki notu oku).
  animation: "aurora-shift 10s ease-in-out infinite alternate",
};

interface MorphingAuroraTextProps {
  texts: string[];
  className?: string;
}

export function MorphingAuroraText({ texts, className = "" }: MorphingAuroraTextProps) {
  const { text1Ref, text2Ref } = useMorphingText(texts);

  return (
    <span
      className={`relative inline-grid whitespace-nowrap filter-[url(#morph-threshold)_blur(0.6px)] ${className}`}
    >
      {/* Görünmez "ölçü" span'leri: hiçbiri boyanmaz ama hepsi grid genişliğine katkı verir,
          böylece container her zaman EN UZUN kelimeye göre sabit genişlikte kalır ve
          "Continuous" satır ortalamasından dolayı kaymaz. */}
      {texts.map((t) => (
        <span key={t} aria-hidden="true" className="invisible [grid-area:1/1] whitespace-nowrap">
          {t}
        </span>
      ))}
      <span
        ref={text1Ref}
        className="[grid-area:1/1] whitespace-nowrap"
        style={auroraStyle}
      />
      <span
        ref={text2Ref}
        className="[grid-area:1/1] whitespace-nowrap"
        style={auroraStyle}
      />
      {/* Aynı sayfada başka bir MorphingText/threshold filtresi kullanmıyorsan bu SVG'yi bir kere eklemen yeterli */}
      <svg id="morph-threshold-svg" className="fixed h-0 w-0">
        <defs>
          <filter id="morph-threshold">
            <feColorMatrix
              in="SourceGraphic"
              type="matrix"
              values="1 0 0 0 0
                      0 1 0 0 0
                      0 0 1 0 0
                      0 0 0 255 -140"
            />
          </filter>
        </defs>
      </svg>
    </span>
  );
}

// Kullanım örneği: "Continuous" sabit, yanındaki kelime morph + aurora ile değişiyor
export function ContinuousHeadingTheme() { 
  const { theme } = useTheme();

    if (theme === "dark") {
        return (
            <span className="text-center text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
                <Highlighter animationDuration={1000} action="highlight" color="#5e0568"> 
            Continuous
          </Highlighter>{" "} <br></br>
              <MorphingAuroraText texts={["Development", "Deployment", "Integration", "Improvement"]} />
            </span>
          );
    } else {
        return (
            <span className="text-center text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
                <Highlighter animationDuration={1000} action="highlight" color="#39f0f0"> 
            Continuous
          </Highlighter>{" "} <br></br>
              <MorphingAuroraText texts={["Development", "Deployment", "Integration", "Improvement"]} />
            </span>
          );
    }
}

export function ContinuousHeading() {
  return (
    <span className="text-center text-4xl font-bold tracking-tighter md:text-5xl lg:text-7xl">
        <Highlighter animationDuration={1000} action="highlight" color="#5e0568"> 
    Continuous
  </Highlighter>{" "} <br></br>
      <MorphingAuroraText texts={["Development", "Integration", "Sustainability"]} />
    </span>
  );
}
// Kullanım örneği: "Continuous" sabit, yanındaki kelime morph + aurora ile değişiyor
// export function ContinuousHeading() {
//   return (
//     <span className="text-center text-4xl font-bold tracking-tighter md:text-4xl lg:text-4xl">
//       Continuous{"            "}
//       <MorphingAuroraText texts={["Development", "Integration", "Sustainability"]} />
//     </span>
//   );
// }