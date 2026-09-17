import React from 'react';

export interface StepColorConfig {
  hex: string;
  gradientFrom: string;
  gradientVia?: string;
  gradientTo: string;
  textClass: string;
  bgSolidClass: string;
  bgSoftClass: string;
  borderClass: string;
  ringClass: string;
  shadowClass: string;
  iconColor: string;
  tag: string;
}

export const STEP_COLORS: Record<string, StepColorConfig> = {
  // Option 1: Warm Sunny Yellow (FIRST OPTION in uploaded image)
  '01': {
    hex: '#EAB308',
    gradientFrom: '#FACC15',
    gradientVia: '#EAB308',
    gradientTo: '#CA8A04',
    textClass: 'text-amber-500 dark:text-amber-400',
    bgSolidClass: 'bg-amber-500',
    bgSoftClass: 'bg-amber-50 dark:bg-amber-950/40',
    borderClass: 'border-amber-400/50',
    ringClass: 'ring-amber-400/30',
    shadowClass: 'shadow-amber-500/30',
    iconColor: '#CA8A04',
    tag: 'FIRST OPTION',
  },
  // Option 2: Warm Bright Orange (SECOND OPTION in uploaded image)
  '02': {
    hex: '#F97316',
    gradientFrom: '#FB923C',
    gradientVia: '#F97316',
    gradientTo: '#EA580C',
    textClass: 'text-orange-500 dark:text-orange-400',
    bgSolidClass: 'bg-orange-500',
    bgSoftClass: 'bg-orange-50 dark:bg-orange-950/40',
    borderClass: 'border-orange-400/50',
    ringClass: 'ring-orange-400/30',
    shadowClass: 'shadow-orange-500/30',
    iconColor: '#EA580C',
    tag: 'SECOND OPTION',
  },
  // Option 3: Vivid Berry Pink / Magenta (THIRD OPTION in uploaded image)
  '03': {
    hex: '#EC4899',
    gradientFrom: '#F472B6',
    gradientVia: '#EC4899',
    gradientTo: '#DB2777',
    textClass: 'text-pink-500 dark:text-pink-400',
    bgSolidClass: 'bg-pink-500',
    bgSoftClass: 'bg-pink-50 dark:bg-pink-950/40',
    borderClass: 'border-pink-400/50',
    ringClass: 'ring-pink-400/30',
    shadowClass: 'shadow-pink-500/30',
    iconColor: '#BE185D',
    tag: 'THIRD OPTION',
  },
  // Option 4: Royal Purple / Violet (FOURTH OPTION in uploaded image)
  '04': {
    hex: '#8B5CF6',
    gradientFrom: '#A78BFA',
    gradientVia: '#8B5CF6',
    gradientTo: '#7C3AED',
    textClass: 'text-purple-500 dark:text-purple-400',
    bgSolidClass: 'bg-purple-500',
    bgSoftClass: 'bg-purple-50 dark:bg-purple-950/40',
    borderClass: 'border-purple-400/50',
    ringClass: 'ring-purple-400/30',
    shadowClass: 'shadow-purple-500/30',
    iconColor: '#6D28D9',
    tag: 'FOURTH OPTION',
  },
  // Option 5: Ocean Cyan / Blue-Teal (FIFTH OPTION in uploaded image)
  '05': {
    hex: '#06B6D4',
    gradientFrom: '#38BDF8',
    gradientVia: '#06B6D4',
    gradientTo: '#0284C7',
    textClass: 'text-cyan-500 dark:text-cyan-400',
    bgSolidClass: 'bg-cyan-500',
    bgSoftClass: 'bg-cyan-50 dark:bg-cyan-950/40',
    borderClass: 'border-cyan-400/50',
    ringClass: 'ring-cyan-400/30',
    shadowClass: 'shadow-cyan-500/30',
    iconColor: '#0891B2',
    tag: 'FIFTH OPTION',
  },
  // Option 6: Rose Red
  '06': {
    hex: '#F43F5E',
    gradientFrom: '#FB7185',
    gradientVia: '#F43F5E',
    gradientTo: '#E11D48',
    textClass: 'text-rose-500 dark:text-rose-400',
    bgSolidClass: 'bg-rose-500',
    bgSoftClass: 'bg-rose-50 dark:bg-rose-950/40',
    borderClass: 'border-rose-400/50',
    ringClass: 'ring-rose-400/30',
    shadowClass: 'shadow-rose-500/30',
    iconColor: '#BE123C',
    tag: 'SIXTH OPTION',
  },
  // Option 7: Royal Indigo
  '07': {
    hex: '#6366F1',
    gradientFrom: '#818CF8',
    gradientVia: '#6366F1',
    gradientTo: '#4F46E5',
    textClass: 'text-indigo-500 dark:text-indigo-400',
    bgSolidClass: 'bg-indigo-500',
    bgSoftClass: 'bg-indigo-50 dark:bg-indigo-950/40',
    borderClass: 'border-indigo-400/50',
    ringClass: 'ring-indigo-400/30',
    shadowClass: 'shadow-indigo-500/30',
    iconColor: '#4338CA',
    tag: 'SEVENTH OPTION',
  },
  // Option 8: Emerald Green
  '08': {
    hex: '#10B981',
    gradientFrom: '#34D399',
    gradientVia: '#10B981',
    gradientTo: '#059669',
    textClass: 'text-emerald-500 dark:text-emerald-400',
    bgSolidClass: 'bg-emerald-500',
    bgSoftClass: 'bg-emerald-50 dark:bg-emerald-950/40',
    borderClass: 'border-emerald-400/50',
    ringClass: 'ring-emerald-400/30',
    shadowClass: 'shadow-emerald-500/30',
    iconColor: '#047857',
    tag: 'EIGHTH OPTION',
  },
  // Option 9: Sky Blue
  '09': {
    hex: '#0284C7',
    gradientFrom: '#60A5FA',
    gradientVia: '#0284C7',
    gradientTo: '#1D4ED8',
    textClass: 'text-sky-500 dark:text-sky-400',
    bgSolidClass: 'bg-sky-500',
    bgSoftClass: 'bg-sky-50 dark:bg-sky-950/40',
    borderClass: 'border-sky-400/50',
    ringClass: 'ring-sky-400/30',
    shadowClass: 'shadow-sky-500/30',
    iconColor: '#0369A1',
    tag: 'NINTH OPTION',
  },
  // Option 10: Slate Graphite
  '10': {
    hex: '#64748B',
    gradientFrom: '#94A3B8',
    gradientVia: '#64748B',
    gradientTo: '#475569',
    textClass: 'text-slate-500 dark:text-slate-400',
    bgSolidClass: 'bg-slate-500',
    bgSoftClass: 'bg-slate-100 dark:bg-slate-800',
    borderClass: 'border-slate-400/50',
    ringClass: 'ring-slate-400/30',
    shadowClass: 'shadow-slate-500/30',
    iconColor: '#334155',
    tag: 'TENTH OPTION',
  },
};

export const getStepColor = (step: string): StepColorConfig => {
  return STEP_COLORS[step] || STEP_COLORS['01'];
};

interface NeumorphicDiscProps {
  step: string;
  icon?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  className?: string;
}

/**
 * 3D Neumorphic Embossed Circular Button Disc:
 * Directly matches the tactile 3D disc on the left side of each pill in image.png
 */
export const NeumorphicDisc: React.FC<NeumorphicDiscProps> = ({
  step,
  icon,
  size = 'md',
  active = false,
  className = '',
}) => {
  const color = getStepColor(step);

  const dim = {
    sm: {
      outer: 'w-9 h-9',
      inner: 'w-6.5 h-6.5',
      iconSize: 'scale-75',
    },
    md: {
      outer: 'w-12 h-12',
      inner: 'w-8.5 h-8.5',
      iconSize: 'scale-90',
    },
    lg: {
      outer: 'w-14 h-14',
      inner: 'w-10 h-10',
      iconSize: 'scale-100',
    },
  }[size];

  return (
    <div
      className={`relative shrink-0 rounded-full flex items-center justify-center transition-all duration-200 z-20 select-none ${dim.outer} ${className}`}
      style={{
        background: active
          ? 'linear-gradient(145deg, #FFFFFF, #F1F5F9)'
          : 'linear-gradient(145deg, #FFFFFF, #F8FAFC)',
        boxShadow: active
          ? `0 4px 12px -2px rgba(0,0,0,0.12), 0 0 0 2px ${color.hex}80`
          : '0 2px 6px -1px rgba(0,0,0,0.08), 0 0 0 1px rgba(226,232,240,0.9)',
      }}
    >
      {/* Outer Subtle Raised Ring */}
      <div
        className={`rounded-full flex items-center justify-center transition-all duration-200 ${dim.inner}`}
        style={{
          background: active
            ? 'linear-gradient(135deg, #F8FAFC 0%, #FFFFFF 100%)'
            : 'linear-gradient(135deg, #F1F5F9 0%, #FFFFFF 100%)',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
        }}
      >
        {/* Inner Icon with Exact Matching Color */}
        <div
          className={`flex items-center justify-center transition-transform duration-200 group-hover:scale-105 ${dim.iconSize}`}
          style={{ color: color.iconColor }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
};

interface StepCircleNodeProps {
  step: string;
  size?: 'sm' | 'md' | 'lg';
  active?: boolean;
  orbitPlacement?: 'left' | 'right';
  className?: string;
  icon?: React.ReactNode;
}

/**
 * Backward-compatible circle node wrapper that defaults to NeumorphicDisc
 */
export const StepCircleNode: React.FC<StepCircleNodeProps> = ({
  step,
  size = 'md',
  active = false,
  className = '',
  icon,
}) => {
  return (
    <NeumorphicDisc
      step={step}
      size={size}
      active={active}
      icon={icon || <span className="font-black text-xs">{step}</span>}
      className={className}
    />
  );
};

interface NeumorphicPillCardProps {
  step: string;
  title: string;
  subtitle: string;
  description?: string;
  icon: React.ReactNode;
  active?: boolean;
  onClick?: () => void;
  badge?: number | string;
  badgeColor?: string;
  className?: string;
  compact?: boolean;
}

/**
 * Clean Premium Capsule Card:
 * Refined for enterprise SaaS polish with subtle elevation and clear contrast
 */
export const NeumorphicPillCard: React.FC<NeumorphicPillCardProps> = ({
  step,
  title,
  subtitle,
  description,
  icon,
  active = false,
  onClick,
  badge,
  badgeColor,
  className = '',
  compact = false,
}) => {
  const color = getStepColor(step);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full flex items-center relative text-left outline-none select-none transition-all duration-200 active:scale-[0.99] ${className}`}
    >
      {/* 1. Subtle Circular Disc Button (Overlaps the left of the pill) */}
      <div className="shrink-0 z-20">
        <NeumorphicDisc
          step={step}
          icon={icon}
          size={compact ? 'sm' : 'md'}
          active={active}
        />
      </div>

      {/* 2. Sleek Capsule / Pill Bar */}
      <div
        className={`flex-1 -ml-4 pl-6 pr-3.5 py-2.5 rounded-r-2xl rounded-l-lg min-w-0 transition-all duration-200 relative z-10 flex items-center justify-between gap-2 border ${
          active
            ? 'text-white border-transparent shadow-md'
            : 'bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/80 dark:hover:bg-slate-800/70 shadow-2xs'
        }`}
        style={
          active
            ? {
                background: `linear-gradient(135deg, ${color.gradientFrom} 0%, ${color.gradientVia || color.gradientFrom} 50%, ${color.gradientTo} 100%)`,
                boxShadow: `0 4px 14px -3px ${color.hex}50`,
              }
            : undefined
        }
      >
        <div className="min-w-0 flex-1">
          {/* Row 1: Primary Title in Bold Uppercase */}
          <div className="flex items-center gap-1.5">
            <span
              className={`text-xs font-bold tracking-wider uppercase truncate ${
                active ? 'text-white' : 'text-slate-900 dark:text-white'
              }`}
            >
              {title}
            </span>

            {/* Step tag */}
            <span
              className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase shrink-0 ${
                active
                  ? 'bg-black/25 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
              }`}
            >
              {step}
            </span>
          </div>

          {/* Row 2: Subtitle Label */}
          <div
            className={`text-[10px] font-semibold uppercase tracking-wide truncate mt-0.5 ${
              active ? 'text-white/95' : 'text-slate-500 dark:text-slate-400'
            }`}
          >
            {subtitle}
          </div>

          {/* Row 3: Description Snippet */}
          {description && !compact && (
            <p
              className={`text-[9.5px] leading-tight line-clamp-2 mt-0.5 font-normal ${
                active ? 'text-white/85' : 'text-slate-400 dark:text-slate-500'
              }`}
            >
              {description}
            </p>
          )}
        </div>

        {/* Right Badge Count / Metric (if any) */}
        {badge !== undefined && (
          <div
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
              active
                ? 'bg-white/25 text-white'
                : badgeColor || 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}
          >
            {badge}
          </div>
        )}
      </div>
    </button>
  );
};

/**
 * Backward-compatible StepInfographicBanner
 */
export const StepInfographicBanner: React.FC<{
  step: string;
  title: string;
  subtitle: string;
  active?: boolean;
  direction?: 'normal' | 'reverse';
  onClick?: () => void;
  badge?: number | string;
  badgeColor?: string;
  className?: string;
  icon?: React.ReactNode;
}> = ({
  step,
  title,
  subtitle,
  active,
  onClick,
  badge,
  badgeColor,
  className,
  icon,
}) => {
  return (
    <NeumorphicPillCard
      step={step}
      title={title}
      subtitle={subtitle}
      description="Kelola workflow desain terintegrasi"
      active={active}
      onClick={onClick}
      badge={badge}
      badgeColor={badgeColor}
      className={className}
      icon={icon || <span className="font-bold text-xs">{step}</span>}
    />
  );
};
