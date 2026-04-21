import Image from 'next/image';
import Link from 'next/link';
import { ChevronRight, Heart } from 'lucide-react';
import type { Locale, Product } from '@/lib/types';
import { t } from '@/lib/i18n';
import { Container } from '@/components/ui/container';

export function HomeReferenceHero({
  locale,
  plushProduct,
  accentProduct,
  giftProduct,
}: {
  locale: Locale;
  plushProduct?: Product;
  accentProduct?: Product;
  giftProduct?: Product;
}) {
  const content =
    locale === 'zh'
      ? {
          eyebrow: '可爱珍藏，闪亮时刻',
          title: '毛绒朋友与闪耀小物',
          description: '把软萌玩偶、精致首饰和送礼灵感放在同一个温柔首页里，营造轻甜完整的线上精品店氛围。',
          cta: '立即选购',
        }
      : {
          eyebrow: 'Cute Finds, Precious Moments',
          title: 'Plush Friends & Sparkling Details',
          description: 'Bring plush toys, delicate jewelry and gift-ready finds into one soft, polished storefront for a complete boutique shopping feel.',
          cta: 'Shop Now',
        };

  return (
    <section className='pt-6 sm:pt-8'>
      <Container>
        <div className='overflow-hidden rounded-[2rem] bg-[linear-gradient(135deg,#fff8fa_0%,#ffeef2_44%,#fff7f8_100%)] shadow-[0_30px_90px_-60px_rgba(244,143,177,0.42)] ring-1 ring-[rgba(252,182,197,0.42)]'>
          <div className='grid items-center gap-10 px-6 py-8 sm:px-8 lg:grid-cols-[0.44fr_0.56fr] lg:px-10 lg:py-10'>
            <div className='space-y-6 lg:pl-6'>
              <p className='text-[13px] font-medium tracking-[0.02em] text-[#5e5a5e]'>{content.eyebrow}</p>
              <h1 className='max-w-md font-sans text-[2.8rem] font-semibold leading-[1.06] tracking-[-0.04em] text-[#2f2b32] sm:text-[4rem]'>
                {content.title}
                <Heart className='ml-3 inline h-12 w-12 stroke-[1.8] text-[#ff7a8f] sm:h-14 sm:w-14' />
              </h1>
              <p className='max-w-md text-lg leading-8 text-[#615c64]'>{content.description}</p>
              <Link
                href={`/${locale}/shop`}
                className='inline-flex h-14 items-center rounded-full bg-[linear-gradient(90deg,#ff7f94_0%,#ff6d88_100%)] px-8 text-[15px] font-semibold text-white shadow-[0_20px_40px_-24px_rgba(255,109,136,0.8)] transition hover:-translate-y-0.5'
              >
                {content.cta}
                <ChevronRight className='ml-2 h-4 w-4' />
              </Link>
              <div className='flex items-center gap-3 pt-4'>
                <span className='h-1.5 w-6 rounded-full bg-[#ff7a8f]' />
                <span className='h-1.5 w-10 rounded-full bg-[#ffbac7]' />
                <span className='h-1.5 w-4 rounded-full bg-[#d3c8cd]' />
              </div>
            </div>

            <div className='relative min-h-[18rem] sm:min-h-[26rem] lg:min-h-[28rem] xl:min-h-[31rem]'>
              <div className='absolute inset-0 rounded-[1.8rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.72),transparent_48%),linear-gradient(180deg,rgba(255,233,239,0.82)_0%,rgba(255,244,246,0.55)_100%)]' />
              <div className='absolute right-[6%] top-[8%] h-40 w-40 rounded-full bg-[rgba(255,255,255,0.55)] blur-2xl' />
              <div className='absolute left-[8%] bottom-[10%] h-36 w-36 rounded-full bg-[rgba(255,212,222,0.56)] blur-2xl' />

              <div className='absolute left-[6%] top-[22%] z-10 w-[34%] max-w-[15rem] overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/78 p-2 shadow-[0_26px_60px_-38px_rgba(235,165,182,0.7)] backdrop-blur-xl'>
                <div className='relative aspect-square overflow-hidden rounded-[1.2rem] bg-[#fff7f8]'>
                  <Image
                    src={plushProduct?.image ?? '/products/aurora-bunny.svg'}
                    alt={plushProduct ? t(locale, plushProduct.name) : 'plush hero'}
                    fill
                    loading='eager'
                    sizes='(min-width: 1280px) 16vw, (min-width: 768px) 28vw, 40vw'
                    className='object-cover'
                  />
                </div>
              </div>

              <div className='absolute bottom-[6%] left-[38%] z-20 w-[30%] max-w-[12rem] overflow-hidden rounded-[1.5rem] border border-white/70 bg-white/82 p-2 shadow-[0_26px_60px_-38px_rgba(235,165,182,0.66)] backdrop-blur-xl'>
                <div className='relative aspect-square overflow-hidden rounded-[1rem] bg-[#fff7f8]'>
                  <Image
                    src={accentProduct?.image ?? '/products/luna-cat.svg'}
                    alt={accentProduct ? t(locale, accentProduct.name) : 'accent plush'}
                    fill
                    sizes='(min-width: 1280px) 13vw, (min-width: 768px) 20vw, 30vw'
                    className='object-cover'
                  />
                </div>
              </div>

              <div className='absolute right-[2%] top-[10%] z-30 w-[36%] max-w-[17rem] overflow-hidden rounded-[1.6rem] border border-[rgba(255,255,255,0.82)] bg-[linear-gradient(180deg,rgba(255,241,244,0.95)_0%,rgba(255,249,250,0.95)_100%)] p-4 shadow-[0_26px_62px_-38px_rgba(235,165,182,0.56)]'>
                <div className='rounded-[1.25rem] bg-[linear-gradient(180deg,#f4ccd5_0%,#d9b0bb_100%)] px-4 py-5'>
                  <div className='h-20 rounded-[1rem] border border-white/35 bg-[rgba(255,255,255,0.18)]' />
                </div>
              </div>

              <div className='absolute bottom-[4%] right-[4%] z-40 w-[35%] max-w-[16rem] overflow-hidden rounded-[1.6rem] border border-white/70 bg-white/82 p-3 shadow-[0_28px_68px_-40px_rgba(235,165,182,0.7)] backdrop-blur-xl'>
                <div className='relative aspect-[1.08/1] overflow-hidden rounded-[1.15rem] bg-[#fff7f8]'>
                  <Image
                    src={giftProduct?.image ?? '/products/starlight-earrings.svg'}
                    alt={giftProduct ? t(locale, giftProduct.name) : 'gift jewelry'}
                    fill
                    sizes='(min-width: 1280px) 15vw, (min-width: 768px) 24vw, 34vw'
                    className='object-cover'
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
