"use client";

import type React from "react";
import { useState, useRef, useMemo, memo } from "react";
import { usePortfolioData } from "@/lib/homepageContext";
import type { ChartTimeframe } from "@/lib/api";
import { formatCurrency } from "@/lib/api";

const PortfolioChart = memo(function PortfolioChart() {
  const [activeRange, setActiveRange] = useState<ChartTimeframe>("1Y");
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const chartRef = useRef<SVGSVGElement>(null);

  
  const chartData = usePortfolioData(activeRange);

  
  const portfolioStats = useMemo(() => {
    if (chartData.length === 0) {
      return { startValue: 700, currentValue: 700, growthPercent: 0 };
    }
    const startValue = chartData[0]?.value || 700;
    const currentValue = chartData[chartData.length - 1]?.value || startValue;
    
    const growthPercent = chartData[chartData.length - 1]?.pnl || 0;
    return { 
      startValue: Math.round(startValue), 
      currentValue: Math.round(currentValue), 
      growthPercent: Math.round(growthPercent) 
    };
  }, [chartData]);

  
  const chartHeight = 160;
  const chartWidth = 380;
  const padding = { top: 16, bottom: 28, left: 8, right: 8 };

  
  const { minValue, maxValue } = useMemo(() => {
    if (chartData.length === 0) return { minValue: 0, maxValue: 100 };
    const values = chartData.map((d) => d.value);
    return {
      minValue: Math.min(...values),
      maxValue: Math.max(...values),
    };
  }, [chartData]);

  const getY = (value: number) => {
    const range = maxValue - minValue || 1;
    const normalized = (value - minValue) / range;
    return chartHeight - padding.bottom - normalized * (chartHeight - padding.top - padding.bottom);
  };

  const getX = (index: number) => {
    const len = chartData.length - 1 || 1;
    return padding.left + (index / len) * (chartWidth - padding.left - padding.right);
  };

  
  const generatePath = useMemo(() => {
    if (chartData.length === 0) return "";
    const points = chartData.map((d, i) => ({ x: getX(i), y: getY(d.value) }));

    let path = `M ${points[0].x} ${points[0].y}`;

    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i - 1] || points[i];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[i + 2] || p2;

      const tension = 0.35;
      const cp1x = p1.x + (p2.x - p0.x) * tension;
      const cp1y = p1.y + (p2.y - p0.y) * tension;
      const cp2x = p2.x - (p3.x - p1.x) * tension;
      const cp2y = p2.y - (p3.y - p1.y) * tension;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }

    return path;
  }, [chartData, maxValue, minValue]);

  
  const generateAreaPath = useMemo(() => {
    if (!generatePath || chartData.length === 0) return "";
    const lastPoint = chartData.length - 1;
    return `${generatePath} L ${getX(lastPoint)} ${chartHeight - padding.bottom} L ${getX(0)} ${chartHeight - padding.bottom} Z`;
  }, [generatePath, chartData.length]);

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!chartRef.current || chartData.length === 0) return;

    const rect = chartRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const relativeX = (x / rect.width) * chartWidth;

    let closestIndex = 0;
    let closestDist = Number.POSITIVE_INFINITY;

    chartData.forEach((_, i) => {
      const dist = Math.abs(getX(i) - relativeX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    setHoveredIndex(closestIndex);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const formatValue = (value: number) => {
    if (value >= 1000000) return `${(value / 1000000).toFixed(2)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(0);
  };

  return (
    <div className="relative w-full">
      {}
      <div className="relative overflow-hidden rounded-2xl bg-white/[0.02] backdrop-blur-sm p-4 border border-white/[0.05]">
        {}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <p className="text-xs font-medium tracking-wider text-[#6a6a7f] uppercase">Portfolio Performance</p>
            <h2 className="mt-1 text-3xl font-bold leading-none tracking-tight text-white font-mono">
              {formatCurrency(portfolioStats.currentValue)}
            </h2>
            <div className="mt-2.5 inline-flex items-center gap-2 rounded-full border border-[#00ffaa]/20 bg-[#00ffaa]/10 px-2.5 py-1">
              <span className="text-sm font-semibold text-[#00ffaa] font-mono">
                {portfolioStats.growthPercent >= 0 ? "+" : ""}{portfolioStats.growthPercent.toFixed(0)}%
              </span>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="text-[#00ffaa]">
                <path
                  d="M2 11L6 7L9 10L14 4"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 4H14V8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
          </div>

          {}
          <div className="flex gap-1 bg-white/[0.05] rounded-lg p-1">
            <button
              className="px-3 py-1.5 rounded-md text-xs font-medium bg-[#00ffaa]/10 text-[#00ffaa]"
            >
              1Y
            </button>
          </div>
        </div>

        {}
        <div className="relative">
          <svg
            ref={chartRef}
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="w-full"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: chartData.length > 0 ? "crosshair" : "default" }}
            preserveAspectRatio="xMidYMid meet"
          >
            <defs>
              <linearGradient id="portfolioAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00ffaa" stopOpacity="0.15" />
                <stop offset="50%" stopColor="#00ffaa" stopOpacity="0.05" />
                <stop offset="100%" stopColor="#00ffaa" stopOpacity="0" />
              </linearGradient>
              <filter id="portfolioDotGlow" x="-100%" y="-100%" width="300%" height="300%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {}
            {[0.33, 0.66].map((ratio, i) => (
              <line
                key={i}
                x1={padding.left}
                y1={padding.top + ratio * (chartHeight - padding.top - padding.bottom)}
                x2={chartWidth - padding.right}
                y2={padding.top + ratio * (chartHeight - padding.top - padding.bottom)}
                stroke="rgba(255,255,255,0.03)"
                strokeWidth="1"
              />
            ))}

            {}
            {chartData.length > 0 && (
              <path d={generateAreaPath} fill="url(#portfolioAreaGradient)" />
            )}

            {}
            {chartData.length > 0 && (
              <path
                d={generatePath}
                fill="none"
                stroke="#00ffaa"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {}
            {hoveredIndex !== null && chartData[hoveredIndex] && (
              <g className="transition-all duration-100">
                {}
                <line
                  x1={getX(hoveredIndex)}
                  y1={padding.top}
                  x2={getX(hoveredIndex)}
                  y2={chartHeight - padding.bottom}
                  stroke="#00ffaa"
                  strokeWidth="1"
                  strokeDasharray="3 3"
                  opacity="0.4"
                />
                {}
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(chartData[hoveredIndex].value)}
                  r="10"
                  fill="#00ffaa"
                  opacity="0.2"
                />
                {}
                <circle
                  cx={getX(hoveredIndex)}
                  cy={getY(chartData[hoveredIndex].value)}
                  r="4"
                  fill="var(--bg-secondary, #030306)"
                  stroke="#00ffaa"
                  strokeWidth="2"
                  filter="url(#portfolioDotGlow)"
                />
              </g>
            )}

            {}
            {chartData.length > 0 && (
              <>
                <text x={getX(0)} y={chartHeight - 8} textAnchor="start" className="text-[8px] fill-[#4a4a5f]">
                  {chartData[0].label}
                </text>
                {chartData.length > 2 && (
                  <text x={getX(Math.floor(chartData.length / 2))} y={chartHeight - 8} textAnchor="middle" className="text-[8px] fill-[#4a4a5f]">
                    {chartData[Math.floor(chartData.length / 2)]?.label}
                  </text>
                )}
                <text x={getX(chartData.length - 1)} y={chartHeight - 8} textAnchor="end" className="text-[8px] fill-[#4a4a5f]">
                  {chartData[chartData.length - 1].label}
                </text>
              </>
            )}
          </svg>

          {}
          {hoveredIndex !== null && chartData[hoveredIndex] && (
            <div
              className="pointer-events-none absolute transition-all duration-100 z-10"
              style={{
                left: `${(getX(hoveredIndex) / chartWidth) * 100}%`,
                top: `${(getY(chartData[hoveredIndex].value) / chartHeight) * 100}%`,
                transform: "translate(-50%, -140%)",
              }}
            >
              <div className="relative rounded-lg bg-[#00ffaa] px-3 py-1.5 shadow-lg shadow-[#00ffaa]/20">
                <div className="text-[10px] text-black/60 text-center">{chartData[hoveredIndex].label}</div>
                <span className="text-xs font-bold text-black font-mono">
                  {formatValue(chartData[hoveredIndex].value)}
                </span>
                <div className="absolute left-1/2 -bottom-1 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-[#00ffaa]" />
              </div>
            </div>
          )}

          {}
          {chartData.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-[#00ffaa]/20 border-t-[#00ffaa] rounded-full animate-spin" />
            </div>
          )}
        </div>

        {}
        <p className="text-[#4a4a5f] text-[10px] mt-3 text-center">
          Top 7 coins portfolio: {formatCurrency(portfolioStats.startValue)} → {formatCurrency(portfolioStats.currentValue)}
        </p>
      </div>
    </div>
  );
});

export default PortfolioChart;
