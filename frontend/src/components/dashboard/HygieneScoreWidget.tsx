import { getScoreStroke } from '@/utils/formatters';

/**
 * HygieneScoreWidget — Animated SVG circular progress meter.
 * @param score - Hygiene score 0-100
 * @param size - SVG size in px (default 160)
 * @param label - Label below the score
 */
interface HygieneScoreWidgetProps {
  score: number;
  size?: number;
  label?: string;
}

export default function HygieneScoreWidget({ score, size = 160, label = 'Avg Hygiene Score' }: HygieneScoreWidgetProps) {
  const radius = (size - 24) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;
  const stroke = getScoreStroke(score);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Track */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#2d3449"
            strokeWidth={12}
          />
          {/* Progress ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={12}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="score-ring"
            style={{ filter: `drop-shadow(0 0 8px ${stroke}60)` }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-heading text-4xl font-bold" style={{ color: stroke }}>{score}</span>
          <span className="text-xs text-slate-500 font-medium">/100</span>
        </div>
      </div>
      <p className="text-sm text-slate-400 font-medium">{label}</p>
    </div>
  );
}
