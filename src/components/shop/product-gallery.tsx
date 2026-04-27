"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import type { Locale, Product } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProductGallery({ product, locale }: { product: Product; locale: Locale }) {
  const images = useMemo(
    () => (product.images.length > 0 ? product.images : [{ url: product.image, alt: product.name, isCover: true }]),
    [product.image, product.images, product.name],
  );

  const coverIndex = Math.max(0, images.findIndex((image) => image.isCover));
  const preferredIndex = useMemo(() => {
    const cover = images[coverIndex];
    if (cover?.url?.includes("/thumbnail.") && images.length > 1) {
      const highResIndex = images.findIndex((image) => !image.url.includes("/thumbnail."));
      return highResIndex >= 0 ? highResIndex : coverIndex;
    }
    return coverIndex;
  }, [coverIndex, images]);

  const [activeIndex, setActiveIndex] = useState(() => preferredIndex);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const canLoop = images.length > 1;
  const copy = locale === "zh"
    ? {
        gallery: "商品图集",
        openLightbox: "打开大图预览",
        previous: "上一张",
        next: "下一张",
        previousInLightbox: "灯箱上一张",
        nextInLightbox: "灯箱下一张",
        closeLightbox: "关闭大图预览",
        detailShots: "多图结构",
        detailShotsText: "主图、细节图与场景图分层展示。",
        curation: "桌面端体验",
        curationText: "桌面端采用左侧缩略图、右侧主图的标准商品图布局。",
        focus: "购买判断",
        focusText: "先看清图片细节，再确认价格与购买信息。",
      }
    : {
        gallery: "Gallery view",
        openLightbox: "Open image lightbox",
        previous: "Previous image",
        next: "Next image",
        previousInLightbox: "Previous image in lightbox",
        nextInLightbox: "Next image in lightbox",
        closeLightbox: "Close lightbox",
        detailShots: "Layered gallery",
        detailShotsText: "Hero, detail and lifestyle images are separated more clearly.",
        curation: "Desktop layout",
        curationText: "Desktop uses a thumbnail rail with a large main product image.",
        focus: "Decision flow",
        focusText: "Review the visuals first, then continue to pricing and purchase details.",
      };

  const moveTo = useCallback(
    (nextIndex: number) => {
      if (!canLoop) return;
      const normalized = (nextIndex + images.length) % images.length;
      setActiveIndex(normalized);
    },
    [canLoop, images.length],
  );

  useEffect(() => {
    if (!lightboxOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
      }
      if (event.key === "ArrowLeft") {
        moveTo(activeIndex - 1);
      }
      if (event.key === "ArrowRight") {
        moveTo(activeIndex + 1);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [activeIndex, lightboxOpen, moveTo]);

  const activeImage = images[activeIndex] ?? images[preferredIndex] ?? images[0];

  return (
    <>
      <div className="space-y-3 overflow-x-hidden sm:space-y-4">
        <div className="grid justify-items-center gap-3 overflow-x-hidden sm:justify-items-stretch sm:gap-4 lg:grid-cols-[88px_minmax(0,1fr)] lg:items-start xl:grid-cols-[96px_minmax(0,1fr)]">
          {canLoop ? (
            <div className="hidden lg:flex lg:max-h-[44rem] lg:flex-col lg:gap-3 lg:overflow-y-auto lg:pr-1">
              {images.map((image, index) => (
                <button
                  key={`desktop-${image.url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "group relative overflow-hidden rounded-[1.35rem] border bg-white shadow-[0_18px_36px_-26px_rgba(214,187,198,0.72)] transition",
                    activeIndex === index
                      ? "border-[rgba(255,126,149,0.65)] ring-2 ring-[rgba(255,126,149,0.2)]"
                      : "border-[rgba(241,203,213,0.9)] hover:border-[rgba(255,126,149,0.55)]",
                  )}
                  aria-label={locale === "zh" ? `查看第 ${index + 1} 张图` : `Show image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt[locale] ?? product.name[locale]}
                    width={240}
                    height={240}
                    sizes="96px"
                    className="aspect-square w-full object-cover transition duration-300 group-hover:scale-105"
                  />
                  {activeIndex === index ? <span className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-[#ff6d88]" /> : null}
                </button>
              ))}
            </div>
          ) : null}

          <div className="relative w-full max-w-[24rem] justify-self-center overflow-hidden rounded-[1.8rem] border border-[rgba(241,225,230,0.95)] bg-[linear-gradient(180deg,#fff8fa_0%,#fffdfd_100%)] shadow-[0_28px_70px_-46px_rgba(29,22,18,0.42)] sm:max-w-none sm:rounded-[2.15rem]">
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-center px-4 py-4 sm:justify-between sm:px-6 sm:py-5 lg:px-8">
              <div className="rounded-full border border-[rgba(241,225,230,0.95)] bg-[rgba(255,255,255,0.78)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#8f8791] backdrop-blur-xl sm:text-[11px] sm:tracking-[0.24em]">
                {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </div>
              <div className="hidden rounded-full border border-[rgba(248,192,205,0.62)] bg-[rgba(255,243,246,0.96)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[#ff6d88] backdrop-blur-xl sm:block sm:text-[11px] sm:tracking-[0.24em]">
                {copy.gallery}
              </div>
            </div>

            <div className="relative p-3 sm:p-6 xl:p-7">
              <div className="relative overflow-hidden rounded-[1.45rem] border border-[rgba(59,47,37,0.07)] bg-white/70 sm:rounded-[1.7rem]">
                <button
                  type="button"
                  onClick={() => setLightboxOpen(true)}
                  className="group relative block w-full text-left"
                  aria-label={copy.openLightbox}
                >
                  <div className="relative aspect-square w-full">
                    <div className="absolute inset-0 flex items-center justify-center p-3 sm:p-6 lg:p-8">
                      <div className="relative h-full w-full">
                        <Image
                          src={activeImage.url}
                          alt={activeImage.alt[locale] ?? product.name[locale]}
                          fill
                          sizes="(min-width: 1536px) 42rem, (min-width: 1280px) 40rem, (min-width: 1024px) min(52vw, 44rem), 100vw"
                          loading="eager"
                          className="object-contain object-center transition duration-300 group-hover:scale-[1.015]"
                        />
                      </div>
                    </div>
                  </div>
                  <span className="absolute bottom-3 left-1/2 inline-flex h-10 w-10 -translate-x-1/2 items-center justify-center rounded-full border border-[rgba(59,47,37,0.1)] bg-[rgba(255,255,255,0.92)] text-[#2f2b32] shadow-[0_18px_36px_-24px_rgba(214,187,198,0.78)] transition group-hover:scale-[1.04] sm:bottom-5 sm:left-auto sm:right-5 sm:translate-x-0 sm:h-11 sm:w-11">
                    <Expand className="h-4 w-4" />
                  </span>
                </button>

                {canLoop ? (
                  <>
                    <button
                      type="button"
                      onClick={() => moveTo(activeIndex - 1)}
                      className="absolute left-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(59,47,37,0.1)] bg-[rgba(255,255,255,0.88)] text-[#2f2b32] shadow-[0_18px_36px_-24px_rgba(214,187,198,0.78)] transition hover:scale-[1.03] hover:bg-white lg:inline-flex"
                      aria-label={copy.previous}
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveTo(activeIndex + 1)}
                      className="absolute right-4 top-1/2 z-20 hidden h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-[rgba(59,47,37,0.1)] bg-[rgba(255,255,255,0.88)] text-[#2f2b32] shadow-[0_18px_36px_-24px_rgba(214,187,198,0.78)] transition hover:scale-[1.03] hover:bg-white lg:inline-flex"
                      aria-label={copy.next}
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                ) : null}
              </div>
            </div>

            <div className="border-t border-[rgba(241,225,230,0.95)] bg-[#fff8fa]/90 px-4 py-3 sm:hidden">
              <p className="text-xs leading-6 text-[#6d6670]">
                {locale === "zh"
                  ? `共 ${images.length} 张图，支持左右切换与大图预览；更多商品说明已放到下方内容区。`
                  : `${images.length} images available with swipe-style switching and zoom; fuller product context continues below.`}
              </p>
            </div>

            <div className="hidden gap-3 border-t border-[rgba(241,225,230,0.95)] bg-[#fff8fa]/90 px-4 py-4 md:grid md:grid-cols-3 md:px-6 lg:px-7">
              <div className="rounded-[1.35rem] border border-[rgba(241,225,230,0.95)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.detailShots}</p>
                <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.detailShotsText}</p>
              </div>
              <div className="rounded-[1.35rem] border border-[rgba(241,225,230,0.95)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.curation}</p>
                <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.curationText}</p>
              </div>
              <div className="rounded-[1.35rem] border border-[rgba(241,225,230,0.95)] bg-white/80 px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#ff7e95]">{copy.focus}</p>
                <p className="mt-2 text-sm leading-7 text-[#6d6670]">{copy.focusText}</p>
              </div>
            </div>
          </div>
        </div>

        {canLoop ? (
          <div className="mx-auto w-full max-w-[24rem] overflow-hidden rounded-[1.45rem] border border-[rgba(241,225,230,0.95)] bg-[rgba(255,255,255,0.94)] p-2.5 shadow-[0_24px_60px_-46px_rgba(29,22,18,0.42)] backdrop-blur-xl sm:max-w-none sm:p-3 lg:hidden">
            <div className="flex gap-2.5 overflow-x-auto pb-1 sm:gap-3">
              {images.map((image, index) => (
                <button
                  key={`mobile-${image.url}-${index}`}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={cn(
                    "group relative min-w-[92px] overflow-hidden rounded-[1.2rem] border bg-white shadow-sm transition",
                    activeIndex === index
                      ? "border-[rgba(255,126,149,0.65)] ring-2 ring-[rgba(255,126,149,0.2)]"
                      : "border-[rgba(241,203,213,0.9)] hover:border-[rgba(255,126,149,0.55)]",
                  )}
                  aria-label={locale === "zh" ? `查看第 ${index + 1} 张图` : `Show image ${index + 1}`}
                >
                  <Image
                    src={image.url}
                    alt={image.alt[locale] ?? product.name[locale]}
                    width={240}
                    height={240}
                    sizes="80px"
                    className="aspect-square w-[80px] object-cover transition duration-300 group-hover:scale-105 sm:w-[92px]"
                  />
                  {activeIndex === index ? <span className="absolute inset-x-3 bottom-2 h-1 rounded-full bg-[#ff6d88]" /> : null}
                </button>
              ))}
            </div>

            <div className="mt-2.5 flex items-center justify-between gap-3 px-1 sm:mt-3 sm:gap-4">
              <button
                type="button"
                onClick={() => moveTo(activeIndex - 1)}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[rgba(59,47,37,0.1)] bg-[#fffdfd] px-3.5 text-sm font-medium text-[#2f2b32] sm:h-10 sm:px-4"
              >
                <ChevronLeft className="mr-1 h-4 w-4" /> {locale === "zh" ? "上一张" : "Prev"}
              </button>
              <button
                type="button"
                onClick={() => moveTo(activeIndex + 1)}
                className="inline-flex h-9 items-center justify-center rounded-full border border-[rgba(59,47,37,0.1)] bg-[#fffdfd] px-3.5 text-sm font-medium text-[#2f2b32] sm:h-10 sm:px-4"
              >
                {locale === "zh" ? "下一张" : "Next"} <ChevronRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        ) : null}
      </div>

      {lightboxOpen ? (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center bg-[rgba(59,39,48,0.88)] px-4 py-6"
          onClick={() => setLightboxOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="relative flex h-full w-full max-w-7xl items-center justify-center" onClick={(event) => event.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="absolute right-0 top-0 z-30 inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/18"
              aria-label={copy.closeLightbox}
            >
              <X className="h-5 w-5" />
            </button>

            {canLoop ? (
              <button
                type="button"
                onClick={() => moveTo(activeIndex - 1)}
                className="absolute left-0 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/18 lg:inline-flex"
                aria-label={copy.previousInLightbox}
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            ) : null}

            <div className="relative h-full w-full px-0 sm:px-16 lg:px-24">
              <div className="relative h-full w-full">
                <Image
                  src={activeImage.url}
                  alt={activeImage.alt[locale] ?? product.name[locale]}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </div>
            </div>

            {canLoop ? (
              <button
                type="button"
                onClick={() => moveTo(activeIndex + 1)}
                className="absolute right-0 top-1/2 z-30 hidden h-14 w-14 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-white/10 text-white backdrop-blur transition hover:bg-white/18 lg:inline-flex"
                aria-label={copy.nextInLightbox}
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            ) : null}

            <div className="absolute bottom-0 left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-white/80 backdrop-blur-xl">
              {String(activeIndex + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
