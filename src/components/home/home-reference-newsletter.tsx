import { Mail } from 'lucide-react';
import type { Locale } from '@/lib/types';
import { Container } from '@/components/ui/container';

export function HomeReferenceNewsletter({ locale }: { locale: Locale }) {
  const content =
    locale === 'zh'
      ? {
          title: '首单享 10% 优惠',
          description: '订阅新品、补货提醒与送礼灵感，第一时间收到品牌更新。',
          placeholder: '输入你的邮箱',
          button: '订阅',
        }
      : {
          title: 'Get 10% Off Your First Order',
          description: 'Subscribe for new arrivals, restock notices and gift-ready inspiration from the brand.',
          placeholder: 'Enter your email',
          button: 'Subscribe',
        };

  return (
    <section className='pb-8 pt-10 sm:pb-10'>
      <Container>
        <div className='grid gap-6 rounded-[1.8rem] bg-[linear-gradient(180deg,#fff1f4_0%,#fff9fb_100%)] px-6 py-6 shadow-[0_24px_60px_-42px_rgba(233,165,186,0.42)] ring-1 ring-[rgba(248,192,205,0.38)] lg:grid-cols-[0.58fr_0.42fr] lg:items-center lg:px-8'>
          <div className='flex items-start gap-4'>
            <div className='flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(180deg,#ff9eb0_0%,#ff7e95_100%)] text-white shadow-[0_18px_30px_-22px_rgba(255,109,136,0.82)]'>
              <Mail className='h-6 w-6' />
            </div>
            <div>
              <h3 className='text-[2rem] font-semibold tracking-[-0.03em] text-[#2f2b32]'>{content.title}</h3>
              <p className='mt-2 max-w-2xl text-[15px] leading-7 text-[#6c6570]'>{content.description}</p>
            </div>
          </div>

          <form suppressHydrationWarning className='grid gap-3 sm:grid-cols-[1fr_auto]' action='#'>
            <input
              suppressHydrationWarning
              type='email'
              placeholder={content.placeholder}
              className='h-14 rounded-full border border-[rgba(241,203,213,0.86)] bg-white px-5 text-[15px] text-[#2f2b32] outline-none placeholder:text-[#9a929d]'
            />
            <button
              type='submit'
              className='h-14 rounded-full bg-[linear-gradient(90deg,#ff8aa1_0%,#ff6d88_100%)] px-7 text-[15px] font-semibold text-white shadow-[0_20px_40px_-24px_rgba(255,109,136,0.8)] transition hover:-translate-y-0.5'
            >
              {content.button}
            </button>
          </form>
        </div>
      </Container>
    </section>
  );
}
