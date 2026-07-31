"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "motion/react";
import { Children, type ElementType, type ReactNode } from "react";

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const viewport = { once: true, amount: 0.35, margin: "0px 0px -6% 0px" };

type RevealTag = "div" | "p" | "h1" | "h2" | "h3" | "h4" | "span" | "section" | "nav";

function MotionTag({ as, ...props }: { as: RevealTag } & HTMLMotionProps<"div">) {
  const Component = (
    motion as Record<RevealTag, typeof motion.div>
  )[as];
  return <Component {...props} />;
}

type RevealProps = Omit<HTMLMotionProps<"div">, "initial" | "animate"> & {
  as?: RevealTag;
  delay?: number;
  duration?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
  y?: number;
};

export function Reveal({
  as = "div",
  children,
  className,
  delay = 0,
  duration = 0.75,
  immediate = false,
  y = 28,
  ...rest
}: RevealProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as as ElementType;
    return (
      <Tag className={className} {...rest}>
        {children}
      </Tag>
    );
  }

  return (
    <MotionTag
      as={as}
      className={className}
      initial={{ opacity: 0, y }}
      {...(immediate
        ? { animate: { opacity: 1, y: 0 } }
        : { whileInView: { opacity: 1, y: 0 }, viewport })}
      transition={{ duration, delay, ease: EASE_OUT_EXPO }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}

type RevealWordsProps = {
  text: string;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
  as?: "span" | "p" | "h1" | "h2" | "h3";
};

export function RevealWords({
  text,
  className = "",
  delay = 0,
  stagger = 0.035,
  immediate = false,
  as = "span",
}: RevealWordsProps) {
  const reduce = useReducedMotion();
  const words = text.split(/\s+/).filter(Boolean);

  if (reduce) {
    const Tag = as;
    return <Tag className={className}>{text}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const word: Variants = {
    hidden: { y: "115%", opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.55, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <MotionTag
      as={as}
      className={className}
      variants={container}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport })}
      aria-label={text}
    >
      {words.map((w, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span className="inline-block" variants={word}>
            {w}
            {i < words.length - 1 ? "\u00A0" : ""}
          </motion.span>
        </span>
      ))}
    </MotionTag>
  );
}

type RevealStaggerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
  as?: RevealTag;
  y?: number;
};

export function RevealStagger({
  children,
  className,
  delay = 0,
  stagger = 0.1,
  immediate = false,
  as = "div",
  y = 28,
}: RevealStaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  const container: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: stagger, delayChildren: delay },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.7, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <MotionTag
      as={as}
      className={className}
      variants={container}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport })}
    >
      {Children.map(Children.toArray(children), (child, i) => (
        <motion.div key={i} variants={item}>
          {child}
        </motion.div>
      ))}
    </MotionTag>
  );
}

type RevealEyebrowProps = {
  children: ReactNode;
  className?: string;
  lineClassName?: string;
  centered?: boolean;
  delay?: number;
  immediate?: boolean;
};

export function RevealEyebrow({
  children,
  className = "text-accent",
  lineClassName = "bg-brand-500",
  centered = false,
  delay = 0,
  immediate = false,
}: RevealEyebrowProps) {
  const reduce = useReducedMotion();

  if (reduce) {
    return (
      <p
        className={`mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] ${centered ? "justify-center" : ""} ${className}`}
      >
        <span className={`inline-block h-px w-8 ${lineClassName}`} />
        {children}
        <span className={`inline-block h-px w-8 ${lineClassName}`} />
      </p>
    );
  }

  const line: Variants = {
    hidden: { scaleX: 0, opacity: 0 },
    visible: {
      scaleX: 1,
      opacity: 1,
      transition: { duration: 0.6, ease: EASE_OUT_EXPO },
    },
  };

  const label: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.55, delay: 0.08, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <motion.p
      className={`mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.25em] ${centered ? "justify-center" : ""} ${className}`}
      initial="hidden"
      {...(immediate
        ? { animate: "visible" }
        : { whileInView: "visible", viewport })}
      transition={{ delayChildren: delay }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.06, delayChildren: delay } },
      }}
    >
      <motion.span
        className={`inline-block h-px w-8 origin-left ${lineClassName}`}
        variants={line}
      />
      <motion.span variants={label}>{children}</motion.span>
      <motion.span
        className={`inline-block h-px w-8 origin-right ${lineClassName}`}
        variants={line}
      />
    </motion.p>
  );
}
