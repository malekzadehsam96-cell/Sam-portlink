import React, { useState, useEffect, useRef } from "react";
import {
  Shield,
  Activity,
  Flame,
  Globe,
  Radio,
  Sliders,
  Sparkles,
  RefreshCw,
  Eye,
  Settings,
  AlertTriangle,
  Zap,
  ZoomIn,
  ZoomOut,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

// Types
export interface Hotspot {
  id: string;
  name: string;
  lat: number;
  lng: number;
  x: number; // percentage width
  y: number; // percentage height
  threatLevel: "high" | "medium" | "low";
  threatCount: number;
  threatTypes: { vpn: number; tor: number; botnet: number; malware: number };
  riskIndex: number;
  countryCode: string;
  activeStatus: string;
  trend: string;
}

// Initial regions definition with interactive coordinate percentage
const INITIAL_HOTSPOTS: Hotspot[] = [
  {
    id: "na-east",
    name: "North America (East)",
    lat: 38.9,
    lng: -77.0,
    x: 24,
    y: 30,
    threatLevel: "high",
    threatCount: 14520,
    threatTypes: { vpn: 4500, tor: 3100, botnet: 5200, malware: 1720 },
    riskIndex: 89,
    countryCode: "US",
    activeStatus: "Heavy Botnet Infiltration",
    trend: "+14.3%",
  },
  {
    id: "na-west",
    name: "North America (West)",
    lat: 37.7,
    lng: -122.4,
    x: 16,
    y: 32,
    threatLevel: "medium",
    threatCount: 8200,
    threatTypes: { vpn: 3500, tor: 1200, botnet: 2400, malware: 1100 },
    riskIndex: 65,
    countryCode: "US",
    activeStatus: "VPN brute force attacks",
    trend: "-2.4%",
  },
  {
    id: "europe-central",
    name: "Central Europe (Frankfurt)",
    lat: 50.1,
    lng: 8.6,
    x: 52,
    y: 24,
    threatLevel: "high",
    threatCount: 19800,
    threatTypes: { vpn: 6100, tor: 5800, botnet: 4900, malware: 3000 },
    riskIndex: 94,
    countryCode: "DE",
    activeStatus: "High-Volume Tor Exit Node Leak",
    trend: "+21.9%",
  },
  {
    id: "asia-east",
    name: "East Asia (Tokyo / Seoul)",
    lat: 35.6,
    lng: 139.6,
    x: 82,
    y: 34,
    threatLevel: "high",
    threatCount: 16100,
    threatTypes: { vpn: 5200, tor: 2200, botnet: 6100, malware: 2600 },
    riskIndex: 91,
    countryCode: "JP",
    activeStatus: "Targeted API Probing Detect",
    trend: "+8.7%",
  },
  {
    id: "asia-south",
    name: "South Asia (Singapore / India)",
    lat: 1.3,
    lng: 103.8,
    x: 76,
    y: 52,
    threatLevel: "medium",
    threatCount: 9700,
    threatTypes: { vpn: 4100, tor: 1800, botnet: 2800, malware: 1000 },
    riskIndex: 72,
    countryCode: "SG",
    activeStatus: "SSH credential stuffing login",
    trend: "+11.1%",
  },
  {
    id: "sa-east",
    name: "South America (São Paulo)",
    lat: -23.5,
    lng: -46.6,
    x: 35,
    y: 68,
    threatLevel: "low",
    threatCount: 3100,
    threatTypes: { vpn: 1100, tor: 300, botnet: 1200, malware: 500 },
    riskIndex: 34,
    countryCode: "BR",
    activeStatus: "Scan operations on web ports",
    trend: "-5.0%",
  },
  {
    id: "oceania",
    name: "Oceania (Sydney)",
    lat: -33.8,
    lng: 151.2,
    x: 88,
    y: 72,
    threatLevel: "low",
    threatCount: 2400,
    threatTypes: { vpn: 900, tor: 400, botnet: 800, malware: 300 },
    riskIndex: 28,
    countryCode: "AU",
    activeStatus: "Dormant, baseline integrity OK",
    trend: "-12.5%",
  },
];

// Stylized coordinate dots to simulate low fidelity continents list
// format: [x%, y%] of land dots
const MAP_LAND_GRID: [number, number][] = [
  // North America
  [12, 22], [14, 21], [16, 20], [18, 19], [20, 18], [22, 17], [24, 16],
  [13, 25], [15, 24], [17, 23], [19, 22], [21, 21], [23, 20], [25, 19],
  [11, 28], [13, 28], [15, 27], [17, 26], [19, 25], [21, 24], [23, 23], [25, 22], [27, 21],
  [12, 31], [14, 31], [16, 30], [18, 29], [20, 28], [22, 27], [24, 26], [26, 25], [28, 24],
  [15, 33], [17, 33], [19, 32], [21, 31], [23, 30], [25, 29], [27, 28],
  [21, 35], [23, 34], [25, 33], [27, 32],
  [22, 38], [24, 37], [26, 36],

  // South America
  [28, 45], [30, 47], [32, 49], [34, 51],
  [29, 54], [31, 54], [33, 53], [35, 52], [37, 51],
  [30, 58], [32, 58], [34, 57], [36, 56], [38, 55],
  [31, 62], [33, 62], [34, 61], [36, 60], [38, 59], [40, 58],
  [32, 66], [33, 67], [35, 66], [37, 64], [39, 62],
  [33, 71], [35, 71], [37, 69],
  [34, 75], [36, 74],
  [35, 78], [35, 82],

  // Europe
  [45, 20], [47, 19], [49, 18], [51, 18],
  [44, 23], [46, 22], [48, 21], [50, 20], [52, 20], [54, 21],
  [45, 26], [47, 25], [49, 24], [51, 23], [53, 23], [55, 24], [57, 25],
  [48, 29], [50, 28], [52, 27], [54, 27], [56, 28],

  // Africa
  [45, 38], [47, 37], [49, 36], [51, 36], [53, 37], [55, 38], [57, 39],
  [46, 42], [48, 41], [50, 40], [52, 40], [54, 41], [56, 42], [58, 43], [60, 44],
  [48, 46], [50, 45], [52, 44], [54, 44], [56, 45], [58, 46], [60, 47],
  [51, 50], [53, 49], [55, 48], [57, 49], [59, 50],
  [52, 54], [54, 53], [56, 52], [58, 53],
  [53, 58], [55, 57], [57, 57],
  [54, 62], [56, 61],
  [55, 66], [57, 65],
  [55, 70], [56, 73],

  // Asia
  [58, 25], [60, 24], [62, 23], [64, 22], [66, 21], [68, 20], [70, 19], [72, 19], [74, 20], [76, 21], [78, 22], [80, 23], [82, 24], [84, 25], [86, 26], [88, 27],
  [59, 29], [61, 28], [63, 27], [65, 26], [67, 25], [69, 24], [71, 24], [73, 25], [75, 26], [77, 27], [79, 28], [81, 29], [83, 30], [85, 31], [87, 32], [89, 33], [91, 34],
  [61, 33], [63, 32], [65, 31], [67, 30], [69, 29], [71, 29], [73, 30], [75, 31], [77, 32], [79, 33], [81, 34], [83, 35], [85, 36], [87, 37], [89, 38], [91, 39],
  [62, 37], [64, 36], [66, 35], [68, 34], [70, 34], [72, 34], [74, 35], [76, 36], [78, 37], [81, 39], [83, 40], [85, 41], [87, 42],
  [64, 41], [66, 41], [68, 40], [70, 39], [72, 39], [74, 40], [76, 41], [78, 42], [80, 43], [82, 44], [84, 45],
  [71, 45], [73, 45], [75, 45], [77, 46], [79, 47], [81, 48],
  [74, 49], [76, 49], [78, 50], [80, 51],

  // Oceania
  [82, 65], [84, 64], [86, 64], [88, 65],
  [81, 69], [83, 68], [85, 68], [87, 69], [89, 70],
  [82, 73], [84, 72], [86, 72], [88, 73],
  [83, 77], [85, 77], [87, 76],
  [88, 80], [90, 81],
];

// Reusable micro-line sparkline chart for recent hour volume fluctuation
function Sparkline({ data, color }: { data: number[]; color: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min === 0 ? 1 : max - min;
  const width = 64;
  const height = 20;
  const padding = 1;

  // Map each data point to svg coordinates
  const points = data.map((val, index) => {
    const x = padding + (index / (data.length - 1)) * (width - padding * 2);
    // Invert y because SVG 0 is at top
    const y = padding + (1 - (val - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  }).join(" ");

  const colorClean = color.replace("#", "");

  return (
    <svg width={width} height={height} className="overflow-visible inline-block">
      {/* Sparkline glow/shadow effect */}
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        style={{ filter: `drop-shadow(0 0 3px ${color}50)` }}
      />
      {/* Filled area underneath */}
      <path
        d={`M ${padding},${height} L ${points} L ${width - padding},${height} Z`}
        fill={`url(#spark-grad-${colorClean})`}
        opacity="0.1"
      />
      <defs>
        <linearGradient id={`spark-grad-${colorClean}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* Small pulsing dot at the last point */}
      <circle
        cx={padding + (data.length - 1) / (data.length - 1) * (width - padding * 2)}
        cy={padding + (1 - (data[data.length - 1] - min) / range) * (height - padding * 2)}
        r="1.5"
        fill={color}
        className="animate-pulse"
      />
    </svg>
  );
}

export function TrafficMap() {
  const [mapMode, setMapMode] = useState<"heatmap" | "dots" | "hybrid">("heatmap");
  const [threatHistory, setThreatHistory] = useState<Record<string, number[]>>(() => {
    const initialHist: Record<string, number[]> = {};
    INITIAL_HOTSPOTS.forEach((h) => {
      const points: number[] = [];
      let base = h.threatCount;
      // create 12 points representing history leading up to the current count
      for (let i = 0; i < 12; i++) {
        const factor = 0.9 + (i * 0.01) + (Math.sin(i * 1.5) * 0.05) + ((Math.random() - 0.5) * 0.03);
        points.push(Math.floor(base * factor));
      }
      points.push(base); // end with exact current count
      initialHist[h.id] = points;
    });
    return initialHist;
  });
  const [activeThreatTypes, setActiveThreatTypes] = useState<{
    vpn: boolean;
    tor: boolean;
    botnet: boolean;
    malware: boolean;
  }>({
    vpn: true,
    tor: true,
    botnet: true,
    malware: true,
  });
  const [heatIntensity, setHeatIntensity] = useState<number>(1.2);
  const [gradientTheme, setGradientTheme] = useState<"tactical" | "infrared" | "nebula">("tactical");
  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(INITIAL_HOTSPOTS[0]);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);
  const [hotspots, setHotspots] = useState<Hotspot[]>(INITIAL_HOTSPOTS);

  // Active attacks animated visualization
  const [liveAttacks, setLiveAttacks] = useState<{
    id: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
    color: string;
    progress: number;
  }[]>([]);

  // Real-time interval timer state to fetch refreshed threat data every 30 seconds
  const [countdown, setCountdown] = useState<number>(30);
  const [lastFetched, setLastFetched] = useState<Date>(new Date());
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const highRiskHotspots = hotspots.filter((h) => h.riskIndex > 90);
  const hasHighAnomaly = highRiskHotspots.length > 0;

  // Zoom and Pan states
  const [zoom, setZoom] = useState<number>(1);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // Only capture left click for drag panning
    if (e.button !== 0) return;
    
    // Bypass if capturing on interactive controls/hotspots
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("select") || target.closest("input")) {
      return;
    }
    
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const newX = e.clientX - dragStartRef.current.x;
    const newY = e.clientY - dragStartRef.current.y;
    
    // Contain panning boundaries to prevent zooming/scrolling off limits (scaled by zoom factor)
    const panLimit = 250 * zoom;
    setPan({
      x: Math.max(-panLimit, Math.min(panLimit, newX)),
      y: Math.max(-panLimit, Math.min(panLimit, newY)),
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleZoomIn = () => {
    setZoom((z) => Math.min(4, z + 0.25));
  };

  const handleZoomOut = () => {
    setZoom((z) => {
      const nextZ = Math.max(1, z - 0.25);
      if (nextZ === 1) {
        setPan({ x: 0, y: 0 }); // Recenter if zoom is reset to 1x
      }
      return nextZ;
    });
  };

  const handlePan = (direction: "up" | "down" | "left" | "right") => {
    const panStep = 50;
    setPan((currentPan) => {
      let dx = 0;
      let dy = 0;
      if (direction === "up") dy = panStep;
      if (direction === "down") dy = -panStep;
      if (direction === "left") dx = panStep;
      if (direction === "right") dx = -panStep;

      const panLimit = 250 * zoom;
      return {
        x: Math.max(-panLimit, Math.min(panLimit, currentPan.x + dx)),
        y: Math.max(-panLimit, Math.min(panLimit, currentPan.y + dy)),
      };
    });
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Sync historical values whenever hotspots counts are updated
  useEffect(() => {
    setThreatHistory((prev) => {
      const updated = { ...prev };
      hotspots.forEach((h) => {
        const currentHist = prev[h.id] || [];
        if (currentHist.length === 0) {
          const points: number[] = [];
          for (let i = 0; i < 12; i++) {
            points.push(Math.floor(h.threatCount * (0.9 + (i * 0.01) + (Math.sin(i * 1.5) * 0.05))));
          }
          points.push(h.threatCount);
          updated[h.id] = points;
        } else {
          const lastValue = currentHist[currentHist.length - 1];
          if (lastValue !== h.threatCount) {
            const nextHist = [...currentHist, h.threatCount];
            if (nextHist.length > 15) {
              nextHist.shift();
            }
            updated[h.id] = nextHist;
          }
        }
      });
      return updated;
    });
  }, [hotspots]);

  const fetchThreatData = async () => {
    setIsFetching(true);
    // Simulate API network load latency of 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));

    setHotspots((prev) =>
      prev.map((h) => {
        // Shift base metrics around by up to 10% variance to simulate freshly fetched backend data
        const varianceCoefficient = (Math.random() - 0.5) * 0.12;
        const newTotalCount = Math.max(1500, Math.floor(h.threatCount * (1 + varianceCoefficient)));
        
        // Distribute variance to individual threat vectors
        const vpnCount = Math.max(300, Math.floor(h.threatTypes.vpn * (1 + (Math.random() - 0.5) * 0.1)));
        const torCount = Math.max(150, Math.floor(h.threatTypes.tor * (1 + (Math.random() - 0.5) * 0.1)));
        const botnetCount = Math.max(400, Math.floor(h.threatTypes.botnet * (1 + (Math.random() - 0.5) * 0.1)));
        const malwareCount = Math.max(100, Math.floor(h.threatTypes.malware * (1 + (Math.random() - 0.5) * 0.1)));

        // Live Risk indices fluctuates based on refreshed vectors
        const newRiskIndex = Math.max(20, Math.min(100, h.riskIndex + Math.floor((Math.random() - 0.5) * 8)));

        return {
          ...h,
          threatCount: newTotalCount,
          riskIndex: newRiskIndex,
          threatTypes: {
            vpn: vpnCount,
            tor: torCount,
            botnet: botnetCount,
            malware: malwareCount,
          },
        };
      })
    );

    setLastFetched(new Date());
    setIsFetching(false);
    setCountdown(30);
  };

  // Synchronous tick timer for real-time auto-sync countdown of 30 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          fetchThreatData();
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Update selected hotspot reference details if it exists to maintain live metrics on detail overlay
  useEffect(() => {
    if (selectedHotspot) {
      const match = hotspots.find((h) => h.id === selectedHotspot.id);
      if (match) {
        setSelectedHotspot(match);
      }
    }
  }, [hotspots]);

  // Simulation of incoming cyber-attacks to add dynamic UI response
  const triggerAttackSim = () => {
    const fromOptions = [
      { x: 35, y: 68, label: "South America" },
      { x: 52, y: 24, label: "Europe" },
      { x: 76, y: 52, label: "South Asia" },
      { x: 88, y: 72, label: "Oceania" },
    ];
    const toOptions = [
      { x: 24, y: 30, idx: 0 }, // North America East
      { x: 16, y: 32, idx: 1 }, // North America West
      { x: 52, y: 24, idx: 2 }, // Europe
      { x: 82, y: 34, idx: 3 }, // East Asia
    ];

    const source = fromOptions[Math.floor(Math.random() * fromOptions.length)];
    const target = toOptions[Math.floor(Math.random() * toOptions.length)];

    const colors = ["#F43F5E", "#F59E0B", "#8B5CF6", "#E11D48"];
    const attackColor = colors[Math.floor(Math.random() * colors.length)];

    const newAttack = {
      id: Math.random().toString(),
      fromX: source.x,
      fromY: source.y,
      toX: target.x,
      toY: target.y,
      color: attackColor,
      progress: 0,
    };

    setLiveAttacks((prev) => [...prev, newAttack]);

    // Boost the target threat level momentarily
    setHotspots((prev) =>
      prev.map((h, i) => {
        if (i === target.idx) {
          const addedCount = Math.floor(Math.random() * 800) + 400;
          return {
            ...h,
            threatCount: h.threatCount + addedCount,
            riskIndex: Math.min(100, h.riskIndex + 2),
            threatTypes: {
              ...h.threatTypes,
              botnet: h.threatTypes.botnet + Math.floor(addedCount * 0.4),
              vpn: h.threatTypes.vpn + Math.floor(addedCount * 0.3),
            },
          };
        }
        return h;
      })
    );
  };

  // Live attack beam tick handler
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveAttacks((prev) =>
        prev
          .map((attack) => ({
            ...attack,
            progress: attack.progress + 4,
          }))
          .filter((attack) => attack.progress <= 100)
      );
    }, 80);

    return () => clearInterval(timer);
  }, []);

  // Periodic threat tick simulation to look highly dynamic
  useEffect(() => {
    const simulationTimer = setInterval(() => {
      // Small random changes to counts
      setHotspots((prev) =>
        prev.map((h) => {
          const delta = Math.floor((Math.random() - 0.48) * 120);
          const nextCount = Math.max(1000, h.threatCount + delta);
          return {
            ...h,
            threatCount: nextCount,
          };
        })
      );
    }, 4500);

    return () => clearInterval(simulationTimer);
  }, []);

  // Get localized color based on threat level and styling gradients
  const getGradientColors = (level: "high" | "medium" | "low") => {
    if (gradientTheme === "tactical") {
      switch (level) {
        case "high":
          return {
            center: "rgba(244, 63, 94, 0.55)", // Rose-500
            mid: "rgba(244, 63, 94, 0.25)",
            outer: "rgba(244, 63, 94, 0.0)",
            stroke: "border-rose-500/50",
            text: "text-rose-400",
            fill: "#F43F5E",
          };
        case "medium":
          return {
            center: "rgba(245, 158, 11, 0.45)", // Amber-500
            mid: "rgba(245, 158, 11, 0.2)",
            outer: "rgba(245, 158, 11, 0.0)",
            stroke: "border-amber-500/50",
            text: "text-amber-400",
            fill: "#F59E0B",
          };
        case "low":
          return {
            center: "rgba(16, 185, 129, 0.35)", // Emerald-500
            mid: "rgba(16, 185, 129, 0.15)",
            outer: "rgba(16, 185, 129, 0.0)",
            stroke: "border-emerald-500/40",
            text: "text-emerald-400",
            fill: "#10B981",
          };
      }
    } else if (gradientTheme === "infrared") {
      // Pure thermal camera mapping: White-hot -> Yellow -> Red -> Blue
      switch (level) {
        case "high":
          return {
            center: "rgba(255, 255, 255, 0.7)",
            mid: "rgba(255, 235, 59, 0.4)", // Yellow
            outer: "rgba(244, 67, 54, 0.1)",  // Red bleed
            stroke: "border-yellow-400/50",
            text: "text-yellow-300",
            fill: "#FFF59D",
          };
        case "medium":
          return {
            center: "rgba(244, 67, 54, 0.5)",
            mid: "rgba(233, 30, 99, 0.25)",
            outer: "rgba(63, 81, 181, 0.0)",
            stroke: "border-red-500/50",
            text: "text-red-400",
            fill: "#EF5350",
          };
        case "low":
          return {
            center: "rgba(33, 150, 243, 0.4)",
            mid: "rgba(63, 81, 181, 0.15)",
            outer: "rgba(0, 0, 0, 0.0)",
            stroke: "border-blue-500/40",
            text: "text-blue-400",
            fill: "#42A5F5",
          };
      }
    } else {
      // Nebula theme: Neon violet, Pink-gold, Cyan
      switch (level) {
        case "high":
          return {
            center: "rgba(168, 85, 247, 0.6)", // Purple-500
            mid: "rgba(236, 72, 153, 0.25)", // Pink-500
            outer: "rgba(168, 85, 247, 0.0)",
            stroke: "border-purple-500/60",
            text: "text-purple-400",
            fill: "#A855F7",
          };
        case "medium":
          return {
            center: "rgba(236, 72, 153, 0.45)", // Pink-500
            mid: "rgba(249, 115, 22, 0.2)", // Orange-500
            outer: "rgba(236, 72, 153, 0.0)",
            stroke: "border-pink-500/50",
            text: "text-pink-400",
            fill: "#EC4899",
          };
        case "low":
          return {
            center: "rgba(6, 182, 212, 0.35)", // Cyan-500
            mid: "rgba(59, 130, 246, 0.15)", // Blue-500
            outer: "rgba(6, 182, 212, 0.0)",
            stroke: "border-cyan-500/40",
            text: "text-cyan-400",
            fill: "#06B6D4",
          };
      }
    }
  };

  const getFilteredCount = (h: Hotspot) => {
    let sum = 0;
    if (activeThreatTypes.vpn) sum += h.threatTypes.vpn;
    if (activeThreatTypes.tor) sum += h.threatTypes.tor;
    if (activeThreatTypes.botnet) sum += h.threatTypes.botnet;
    if (activeThreatTypes.malware) sum += h.threatTypes.malware;
    return sum;
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      {/* Tactical Map Setup Panel */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-950/40 p-3 rounded-lg border border-slate-800/60">
        <div className="flex items-center gap-4">
          {/* Mode Selector */}
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-md">
            <button
              onClick={() => setMapMode("heatmap")}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded transition-all ${
                mapMode === "heatmap"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Heatmap
            </button>
            <button
              onClick={() => setMapMode("dots")}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded transition-all ${
                mapMode === "dots"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Dots Model
            </button>
            <button
              onClick={() => setMapMode("hybrid")}
              className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded transition-all ${
                mapMode === "hybrid"
                  ? "bg-indigo-600 text-white shadow-sm shadow-indigo-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              Tactical Hybrid
            </button>
          </div>

          {/* Theme Gradient Settings */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-md">
            <button
              onClick={() => setGradientTheme("tactical")}
              title="Tactical Security theme"
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                gradientTheme === "tactical"
                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              TAC
            </button>
            <button
              onClick={() => setGradientTheme("infrared")}
              title="Infrared Thermal mapping"
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                gradientTheme === "infrared"
                  ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              INF
            </button>
            <button
              onClick={() => setGradientTheme("nebula")}
              title="Neon Nebula styling"
              className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                gradientTheme === "nebula"
                  ? "bg-purple-500/20 text-purple-400 border border-purple-500/40"
                  : "text-slate-500 hover:text-slate-300"
              }`}
            >
              NEB
            </button>
          </div>
          
          {/* Real-time Threat Sync Controller */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-1 rounded-md">
            <div className="flex items-center gap-1.5">
              {isFetching ? (
                <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              )}
              <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                Sync in <span className="text-white font-bold">{countdown}s</span>
              </span>
            </div>
            <div className="h-3 w-px bg-slate-800" />
            <button
              onClick={fetchThreatData}
              disabled={isFetching}
              className="text-[9px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-widest disabled:opacity-50 font-mono transition-all"
              title="Manually force database polling & refresh current stats"
            >
              Force Sync
            </button>
          </div>
        </div>

        {/* Threat Category Multiselect Filter Panel */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 p-1 rounded-md">
            {[
              { id: "vpn" as const, label: "VPN", color: "border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10" },
              { id: "tor" as const, label: "Tor Exit", color: "border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10" },
              { id: "botnet" as const, label: "Botnet", color: "border-rose-500/30 text-rose-400 bg-rose-500/5 hover:bg-rose-500/10" },
              { id: "malware" as const, label: "Malware", color: "border-cyan-500/30 text-cyan-400 bg-cyan-500/5 hover:bg-cyan-500/10" },
            ].map((type) => {
              const isActive = activeThreatTypes[type.id];
              return (
                <button
                  key={type.id}
                  onClick={() =>
                    setActiveThreatTypes((prev) => ({
                      ...prev,
                      [type.id]: !prev[type.id],
                    }))
                  }
                  className={`px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider rounded border transition-all ${
                    isActive
                      ? `${type.color} border-indigo-500/50 bg-indigo-500/10 font-bold opacity-100`
                      : "text-slate-500 bg-transparent border-slate-800 opacity-50 hover:opacity-80"
                  }`}
                >
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Manual Strike Simulator button */}
          <button
            onClick={triggerAttackSim}
            className="flex items-center gap-1.5 bg-gradient-to-r from-red-950 to-rose-900 border border-rose-800/40 hover:border-rose-500/50 px-3 py-1.5 rounded text-xs text-rose-300 font-semibold transition-all shadow-[0_0_10px_rgba(225,29,72,0.15)] hover:shadow-[0_0_15px_rgba(225,29,72,0.3)]"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 animate-pulse animate-bounce" />
            <span>Simulate Incident</span>
          </button>
        </div>
      </div>

      <div className="relative flex-1 min-h-[340px] bg-[#03060E] rounded-xl border border-slate-800/80 overflow-hidden group">
        {/* Absolute Background Tactical Matrix Grid */}
        <div className="absolute inset-0 opacity-[0.25] bg-[linear-gradient(rgba(148,163,184,0.05)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(148,163,184,0.05)_1px,_transparent_1px)] bg-[size:16px_16px] pointer-events-none"></div>

        {/* Crosshair Graphic Elements */}
        <div className="absolute left-4 top-4 text-slate-700 font-mono text-[9px] pointer-events-none select-none">
          SEC-GRID SYS v7.42 // HEATMAP OVERLAY ACTIVE
        </div>
        <div className="absolute right-4 top-4 text-slate-700 font-mono text-[9px] pointer-events-none select-none">
          SYSTEM_CONFIDENCE: 98.7%
        </div>

        {/* Zoom and Pan interactive graphics viewport */}
        <div
          className={`absolute inset-0 origin-center ${isDragging ? "" : "transition-transform duration-300 ease-out"}`}
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            cursor: isDragging ? "grabbing" : "grab",
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
        >
          {/* Geographical Outline: Land Grid */}
          <div className="absolute inset-0 p-4 pointer-events-none select-none">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              {MAP_LAND_GRID.map(([cx, cy], idx) => {
                // Highlight land points that are near high threat hotspots in hybrid mode
                let isHeated = false;
                if (mapMode === "hybrid" || mapMode === "heatmap") {
                  hotspots.forEach((h) => {
                    const dist = Math.sqrt(Math.pow(cx - h.x, 2) + Math.pow(cy - h.y, 2));
                    if (dist < 10 && h.threatLevel === "high") {
                      isHeated = true;
                    }
                  });
                }

                return (
                  <circle
                    key={idx}
                    cx={cx}
                    cy={cy}
                    r={isHeated ? "0.45" : "0.3"}
                    fill={isHeated ? "rgba(239, 68, 68, 0.4)" : "rgba(71, 85, 105, 0.25)"}
                    className="transition-all duration-700"
                  />
                );
              })}
            </svg>
          </div>

          {/* Live Attack Tracers Animation */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {liveAttacks.map((attack) => {
              const dx = attack.toX - attack.fromX;
              const dy = attack.toY - attack.fromY;
              const length = Math.sqrt(dx * dx + dy * dy);
              const angle = Math.atan2(dy, dx) * (180 / Math.PI);

              // Calculate current animated tip coordinates along the path
              const currentX = attack.fromX + (dx * attack.progress) / 100;
              const currentY = attack.fromY + (dy * attack.progress) / 100;

              return (
                <g key={attack.id}>
                  {/* Attack beam path */}
                  <line
                    x1={`${attack.fromX}%`}
                    y1={`${attack.fromY}%`}
                    x2={`${currentX}%`}
                    y2={`${currentY}%`}
                    stroke={attack.color}
                    strokeWidth="1.5"
                    strokeDasharray="4 2"
                    opacity="0.7"
                  />
                  {/* Moving flare */}
                  <circle
                    cx={`${currentX}%`}
                    cy={`${currentY}%`}
                    r="4"
                    fill="#ffffff"
                    style={{ filter: `drop-shadow(0 0 8px ${attack.color})` }}
                    className="animate-pulse"
                  />
                  <circle
                    cx={`${currentX}%`}
                    cy={`${currentY}%`}
                    r="8"
                    fill="none"
                    stroke={attack.color}
                    strokeWidth="1"
                    opacity="0.8"
                  />
                </g>
              );
            })}
          </svg>

          {/* Real Dynamic Heatmap Density Vector Overlay */}
          {(mapMode === "heatmap" || mapMode === "hybrid") && (
            <div className="absolute inset-0 pointer-events-none z-0">
              {hotspots.map((h) => {
                const activeCount = getFilteredCount(h);
                // Scaled circle base radius based on active threat ratio
                const scale = Math.min(2.5, Math.max(0.6, (activeCount / 12000) * heatIntensity));
                const radius = scale * 12; // Radius in percent-like calculation

                const config = getGradientColors(h.threatLevel);

                return (
                  <div
                    key={`heat-${h.id}`}
                    className="absolute rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                    style={{
                      left: `${h.x}%`,
                      top: `${h.y}%`,
                      width: `${radius * 5}%`,
                      height: `${radius * 5}%`,
                      background: `radial-gradient(circle, ${config.center} 0%, ${config.mid} 40%, ${config.outer} 70%)`,
                      filter: "blur(18px)",
                      mixBlendMode: "screen",
                    }}
                  />
                );
              })}
            </div>
          )}

          {/* Hotspots Interactive Trigger Elements */}
          {hotspots.map((h) => {
            const config = getGradientColors(h.threatLevel);
            const activeCount = getFilteredCount(h);
            const size = h.threatLevel === "high" ? 14 : h.threatLevel === "medium" ? 10 : 8;

            return (
              <div
                key={h.id}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
                style={{ left: `${h.x}%`, top: `${h.y}%` }}
                onMouseEnter={() => setHoveredHotspot(h)}
                onMouseLeave={() => setHoveredHotspot(null)}
                onClick={() => setSelectedHotspot(h)}
              >
                {/* Outer Pulsating Ring if High Mode */}
                {h.threatLevel === "high" && (
                  <div
                    className="absolute rounded-full -inset-4 animate-ping opacity-25"
                    style={{ backgroundColor: config.fill }}
                  />
                )}

                {/* Dot Center Trigger Button */}
                <button
                  className={`relative rounded-full border shadow-lg transition-all focus:outline-none flex items-center justify-center ${
                    selectedHotspot?.id === h.id
                      ? "scale-125 z-30"
                      : "hover:scale-110"
                  }`}
                  style={{
                    width: `${size + 10}px`,
                    height: `${size + 10}px`,
                    backgroundColor: "rgba(3, 6, 14, 0.9)",
                    borderColor: selectedHotspot?.id === h.id ? "#ffffff" : config.fill,
                    boxShadow: `0 0 12px ${config.fill}`,
                  }}
                >
                  {/* Active Inner Core Color */}
                  <div
                    className="rounded-full animate-pulse"
                    style={{
                      width: `${size}px`,
                      height: `${size}px`,
                      backgroundColor: config.fill,
                    }}
                  />
                </button>

                {/* Label Tag Float if map mode dots or hybrid */}
                {(mapMode === "dots" || mapMode === "hybrid" || selectedHotspot?.id === h.id) && (
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 bg-slate-950/90 backdrop-blur-md border border-slate-800 rounded px-2 py-1 text-slate-300 pointer-events-none shadow-xl flex items-center gap-1.5 whitespace-nowrap z-20">
                    <span className="text-[10px] font-mono font-extrabold" style={{ color: config.fill }}>
                      {h.countryCode}
                    </span>
                    <span className="text-[11px] font-medium font-sans">
                      {(activeCount / 1000).toFixed(1)}K Reqs
                    </span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Dynamic Tooltip on Hover */}
          {hoveredHotspot && (
            <div
              className="absolute z-50 bg-[#090D18]/95 border border-slate-700/80 rounded-lg p-3 shadow-2xl backdrop-blur-md w-64 pointer-events-none flex flex-col space-y-2 text-left"
              style={{
                left: hoveredHotspot.x > 70 ? `${hoveredHotspot.x - 32}%` : `${hoveredHotspot.x + 3}%`,
                top: hoveredHotspot.y > 60 ? `${hoveredHotspot.y - 30}%` : `${hoveredHotspot.y + 3}%`,
              }}
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-1.5">
                <span className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span className="text-sm">{hoveredHotspot.countryCode === "US" ? "🇺🇸" : hoveredHotspot.countryCode === "DE" ? "🇩🇪" : hoveredHotspot.countryCode === "JP" ? "🇯🇵" : hoveredHotspot.countryCode === "SG" ? "🇸🇬" : hoveredHotspot.countryCode === "BR" ? "🇧🇷" : "🇦🇺"}</span>
                  {hoveredHotspot.name}
                </span>
                <span
                  className="text-[9px] px-1.5 py-0.5 rounded font-extrabold"
                  style={{
                    backgroundColor: `${getGradientColors(hoveredHotspot.threatLevel).fill}15`,
                    color: getGradientColors(hoveredHotspot.threatLevel).fill,
                    border: `1px solid ${getGradientColors(hoveredHotspot.threatLevel).fill}25`,
                  }}
                >
                  RISK {hoveredHotspot.riskIndex}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px]">
                <div>
                  <span className="text-slate-500 block">Total Threats:</span>
                  <span className="text-slate-200 font-bold font-mono text-xs">
                    {hoveredHotspot.threatCount.toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Current Status:</span>
                  <span className="text-slate-400 truncate block font-medium">
                    {hoveredHotspot.activeStatus}
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-800 pt-1.5">
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest block mb-1">
                  Category Split
                </span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-0.5 text-[9px] font-mono">
                  <div className={`flex justify-between transition-opacity ${activeThreatTypes.vpn ? 'text-slate-400' : 'text-slate-600 line-through opacity-40'}`}>
                    <span>VPN Abuse:</span>
                    <span className={`${activeThreatTypes.vpn ? 'text-slate-300' : 'text-slate-600'} font-bold`}>{hoveredHotspot.threatTypes.vpn}</span>
                  </div>
                  <div className={`flex justify-between transition-opacity ${activeThreatTypes.tor ? 'text-slate-400' : 'text-slate-600 line-through opacity-40'}`}>
                    <span>Tor Exit:</span>
                    <span className={`${activeThreatTypes.tor ? 'text-slate-300' : 'text-slate-600'} font-bold`}>{hoveredHotspot.threatTypes.tor}</span>
                  </div>
                  <div className={`flex justify-between transition-opacity ${activeThreatTypes.botnet ? 'text-slate-400' : 'text-slate-600 line-through opacity-40'}`}>
                    <span>Botnet:</span>
                    <span className={`${activeThreatTypes.botnet ? 'text-slate-300' : 'text-slate-600'} font-bold`}>{hoveredHotspot.threatTypes.botnet}</span>
                  </div>
                  <div className={`flex justify-between transition-opacity ${activeThreatTypes.malware ? 'text-slate-400' : 'text-slate-600 line-through opacity-40'}`}>
                    <span>Malware IP:</span>
                    <span className={`${activeThreatTypes.malware ? 'text-slate-300' : 'text-slate-600'} font-bold`}>{hoveredHotspot.threatTypes.malware}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Floating Zoom & Pan Tactical Control Panel Overlay */}
        <div className="absolute right-4 top-10 flex flex-col bg-slate-950/90 backdrop-blur-md border border-slate-800/80 p-2 text-left rounded shadow-2xl z-20 space-y-1.5 select-none w-28">
          <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-widest border-b border-slate-800/80 pb-0.5 mt-0.5 block text-center w-full">Tactical NAV</span>
          
          {/* Virtual Steering Compass D-Pad */}
          <div className="relative w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-slate-900/80 border border-slate-800">
            <button
              onClick={() => handlePan("up")}
              className="absolute top-0.5 text-slate-400 hover:text-indigo-400 active:scale-90 transition-all"
              title="Pan Up"
            >
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePan("left")}
              className="absolute left-0.5 text-slate-400 hover:text-indigo-400 active:scale-90 transition-all"
              title="Pan Left"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleReset}
              className="absolute text-[8px] font-bold font-mono text-center text-slate-400 bg-slate-950 hover:bg-slate-900 px-1 py-0.5 border border-slate-800 rounded uppercase hover:text-white transition-all active:scale-95"
              title="Reset Zoom/Pan"
            >
              RST
            </button>
            <button
              onClick={() => handlePan("right")}
              className="absolute right-0.5 text-slate-400 hover:text-indigo-400 active:scale-90 transition-all"
              title="Pan Right"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => handlePan("down")}
              className="absolute bottom-0.5 text-slate-400 hover:text-indigo-400 active:scale-90 transition-all"
              title="Pan Down"
            >
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-px bg-slate-800" />

          {/* Zoom Actions Row with visual indicator */}
          <div className="flex items-center justify-between gap-1 w-full px-0.5">
            <button
              onClick={handleZoomOut}
              disabled={zoom <= 1}
              className="w-6 h-6 rounded flex items-center justify-center bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Zoom Out"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <span className="text-[10px] font-mono font-extrabold text-indigo-400 w-8 text-center">{zoom.toFixed(1)}x</span>
            <button
              onClick={handleZoomIn}
              disabled={zoom >= 4}
              className="w-6 h-6 rounded flex items-center justify-center bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all"
              title="Zoom In"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
          </div>
          <span className="text-[7px] font-mono text-slate-500 text-center uppercase tracking-tighter block pt-0.5">Drag map workspace</span>
        </div>

        {/* Legend Overlay on Map */}
        <div className="absolute left-4 bottom-4 bg-[#050914]/90 backdrop-blur-md border border-slate-800/80 p-2.5 rounded shadow-lg space-y-1.5 text-left z-20">
          <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 pb-1">
            <Sliders className="w-3 h-3 text-slate-400" /> Heat Density
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: getGradientColors("high").fill }}
            />
            <span>Critical Threat Zone (&gt;10K)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: getGradientColors("medium").fill }}
            />
            <span>Elevated Suspicion (1K-10K)</span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span
              className="w-2.5 h-2.5 rounded-sm"
              style={{ backgroundColor: getGradientColors("low").fill }}
            />
            <span>Secure Base System (&lt;1K)</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 mt-1 flex items-center justify-between gap-4 text-[9px] text-slate-400">
            <span>Heat Multiplier:</span>
            <input
              type="range"
              min="0.5"
              max="2.5"
              step="0.1"
              value={heatIntensity}
              onChange={(e) => setHeatIntensity(parseFloat(e.target.value))}
              className="w-20 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>

        {/* High Anomaly Alarm Banner */}
        {hasHighAnomaly && (
          <div className="absolute right-4 bottom-4 max-w-sm bg-rose-950/90 backdrop-blur-md border border-rose-500/40 rounded-lg p-3.5 shadow-xl shadow-rose-950/40 z-20 flex items-start gap-3 border-l-4 border-l-rose-500 animate-pulse">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-left flex-1 min-w-0">
              <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest font-mono block">Threat Threshold Warning</span>
              <h5 className="text-xs font-bold text-white uppercase tracking-wider mt-0.5">High Anomaly Identified</h5>
              <p className="text-[10px] text-rose-200 mt-1 leading-relaxed">
                Critical risk score &gt;90 identified in:{" "}
                <span className="font-extrabold text-white">
                  {highRiskHotspots.map((h) => `${h.name} (${h.countryCode})`).join(", ")}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Selected Hotspot Detailed Risk Explorer Bottom Bar */}
      {selectedHotspot && (
        <div className="bg-[#070A15] border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-left">
          <div className="space-y-1 md:max-w-md">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{selectedHotspot.countryCode === "US" ? "🇺🇸" : selectedHotspot.countryCode === "DE" ? "🇩🇪" : selectedHotspot.countryCode === "JP" ? "🇯🇵" : selectedHotspot.countryCode === "SG" ? "🇬🇸" : selectedHotspot.countryCode === "BR" ? "🇧🇷" : "🇦🇺"}</span>
              <h4 className="text-sm font-bold text-white uppercase tracking-wider">{selectedHotspot.name} Region</h4>
              <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded uppercase font-semibold">
                ID: {selectedHotspot.id}
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              Security Core State: <strong className="text-slate-100">{selectedHotspot.activeStatus}</strong>
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 flex-1 max-w-2xl">
            {/* Risk Index Gauge view */}
            <div className="border border-slate-800 p-2 rounded bg-[#03060E]/50 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Risk Index</span>
                <span className="text-base font-bold text-white font-mono">{selectedHotspot.riskIndex}/100</span>
              </div>
              <div
                className="w-2.5 h-8 rounded-full overflow-hidden bg-slate-800 flex flex-col justify-end"
                title={`${selectedHotspot.riskIndex}% risk score`}
              >
                <div
                  className="w-full rounded-full transition-all duration-700"
                  style={{
                    height: `${selectedHotspot.riskIndex}%`,
                    backgroundColor: getGradientColors(selectedHotspot.threatLevel).fill,
                  }}
                />
              </div>
            </div>

            {/* Total Block Reqs */}
            <div className="border border-slate-800 p-2 rounded bg-[#03060E]/50 flex items-center justify-between gap-2.5">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Total Threats</span>
                <span className="text-sm font-bold text-white font-mono flex items-center gap-1">
                  {selectedHotspot.threatCount.toLocaleString()}{" "}
                  <span className="text-[9px] text-rose-500 font-semibold">{selectedHotspot.trend}</span>
                </span>
              </div>
              <div className="shrink-0 flex items-center">
                <Sparkline
                  data={threatHistory[selectedHotspot.id] || []}
                  color={getGradientColors(selectedHotspot.threatLevel).fill}
                />
              </div>
            </div>

            {/* Core Vector Type */}
            <div className="border border-slate-800 p-2 rounded bg-[#03060E]/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Dominant Threat</span>
              <span className="text-xs font-bold text-amber-400 block truncate uppercase tracking-wide mt-0.5">
                {selectedHotspot.threatTypes.botnet > selectedHotspot.threatTypes.vpn ? "Botnet Network" : "Proxy Brute Force"}
              </span>
            </div>

            {/* Geographical Lat Long */}
            <div className="border border-slate-800 p-2 rounded bg-[#03060E]/50">
              <span className="text-[10px] uppercase font-bold text-slate-500 block">Coordinates (GPS)</span>
              <span className="text-xs font-bold text-slate-400 font-mono block mt-1">
                {selectedHotspot.lat}°N, {selectedHotspot.lng}°E
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
