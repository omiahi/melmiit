import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { useSite, usePrefersReducedMotion } from '../state';
import { Herd } from './Herd';

const LOGO_RATIO = 875 / 666; // emblem width / height

export function Hero() {
  const { ui } = useSite();
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const fade = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], ['0%', reduced ? '0%' : '-12%']);

  const ease = [0.22, 1, 0.36, 1] as const;

  return (
    <section ref={ref} className="relative isolate h-[100svh] min-h-[600px] overflow-hidden bg-night" aria-label="Dayan Melmiit">
      {/* A faint warm light behind the emblem */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            'radial-gradient(42% 36% at 50% 34%, rgba(184,151,90,0.13) 0%, rgba(184,151,90,0.04) 45%, transparent 75%)',
        }}
      />

      {/* The steppe and the horsemen */}
      <motion.div
        aria-hidden
        className="absolute inset-x-0 bottom-0 -z-10 h-[46%]"
        initial={reduced ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 2.2, ease }}
      >
        <Herd className="h-full w-full" />
      </motion.div>

      <motion.div
        style={{ opacity: fade, y: lift }}
        className="flex h-[58%] flex-col items-center justify-end px-4 pb-2 pt-20"
      >
        <motion.img
          src="/brand/logo-700.webp"
          srcSet="/brand/logo-700.webp 700w, /brand/logo.webp 875w"
          sizes="(max-width: 700px) 84vw, 560px"
          alt="Dayan Melmiit"
          initial={reduced ? false : { opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 2, ease }}
          className="select-none"
          style={{
            width: `min(84vw, 560px, calc(40svh * ${LOGO_RATIO}))`,
            filter: 'drop-shadow(0 30px 60px rgba(0,0,0,0.8))',
          }}
          draggable={false}
        />
        <motion.div
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 1.6, ease }}
          className="mt-6 flex items-center gap-4 text-center"
        >
          <span aria-hidden className="hidden h-px w-14 bg-gradient-to-r from-transparent to-gold/70 sm:block" />
          <p className="font-display text-[clamp(1.1rem,2.1vw,1.45rem)] italic tracking-wide text-parchment/80">
            {ui.tagline}
          </p>
          <span aria-hidden className="hidden h-px w-14 bg-gradient-to-l from-transparent to-gold/70 sm:block" />
        </motion.div>
      </motion.div>

      <a
        href="#stories"
        className="absolute bottom-5 left-1/2 -translate-x-1/2 text-[13px] tracking-[0.2em] text-parchment/55 transition-colors hover:text-gold-bright"
      >
        {ui.scroll}
      </a>
    </section>
  );
}
