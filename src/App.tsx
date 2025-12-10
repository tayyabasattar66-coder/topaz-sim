// src/App.tsx
import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import "./App.css";

/* ─────────────────── Types ─────────────────── */

type Region = "Export" | "South" | "West" | "North";

type ProductName = "Product 1" | "Product 2" | "Product 3";

type ProductDecision = {
  name: ProductName;
  majorChange: boolean; // still used internally for quality
  priceExport: number;
  priceHome: number;
  adTradePress: number; // £'000
  adPressTV: number; // £'000
  adMerchandising: number; // £'000
  assemblyTime: number; // minutes per unit
};

type GeneralDecisions = {
  salespeopleExport: number;
  salespeopleSouth: number;
  salespeopleWest: number;
  salespeopleNorth: number;
  salesCommissionPct: number;
  salespersonSalaryHundreds: number; // £00 per quarter
  managementBudgetThousands: number; // £'000 per quarter
};

type PlayerDecisions = {
  id: number;
  name: string;
  color: string;
  general: GeneralDecisions;
  products: ProductDecision[];
};

type MarketRegionInfo = {
  region: Region;
  demandPerProduct: Record<ProductName, number>; // units per quarter
};

type QuarterResult = {
  quarterIndex: number;
  revenue: number;
  advertisingCost: number;
  salesCost: number;
  managementCost: number;
  profit: number;
  marketSharePercent: number;
  news: string[];

  // macro-economy + acquisition info
  economyName: string;
  economyDescription: string;
  cashAfter: number;
  acquisitionEligible: boolean;

  // economic indicators
  gdpIndex: number;
  unemploymentRatePct: number;
  centralBankRatePct: number;
  materialPricePerThousand: number;

  // per-product revenue (for growth table)
  prod1Revenue: number;
  prod2Revenue: number;
  prod3Revenue: number;
};

type PlayerState = {
  decisions: PlayerDecisions;
  results: QuarterResult[];

  // cash tracking + bankruptcy flag
  cashBalance: number;
  bankrupt: boolean;
};

/* ─────────────────── Market + Economy ─────────────────── */

const productNames: ProductName[] = ["Product 1", "Product 2", "Product 3"];

const baseMarket: MarketRegionInfo[] = [
  {
    region: "Export",
    demandPerProduct: {
      "Product 1": 6000,
      "Product 2": 4000,
      "Product 3": 3000,
    },
  },
  {
    region: "South",
    demandPerProduct: {
      "Product 1": 3000,
      "Product 2": 3500,
      "Product 3": 2000,
    },
  },
  {
    region: "West",
    demandPerProduct: {
      "Product 1": 2800,
      "Product 2": 3200,
      "Product 3": 2200,
    },
  },
  {
    region: "North",
    demandPerProduct: {
      "Product 1": 2600,
      "Product 2": 3000,
      "Product 3": 2100,
    },
  },
];

type EconomyPhase = {
  name: string;
  description: string;
  demandMultiplier: number; // scales overall demand
  gdpIndex: number;
  unemploymentRatePct: number;
  centralBankRatePct: number;
  materialPricePerThousand: number;
};

const MAX_QUARTERS = 10;
const STARTING_CASH = 1_000_000; // £ starting cash for each company

const economyPhases: EconomyPhase[] = [
  {
    name: "Stable Growth",
    description:
      "Pakistan’s economy is growing steadily. Demand is normal and exporters are optimistic.",
    demandMultiplier: 1.0,
    gdpIndex: 734,
    unemploymentRatePct: 5,
    centralBankRatePct: 5,
    materialPricePerThousand: 50231,
  },
  {
    name: "Mild Slowdown",
    description:
      "Growth is slowing, interest rates are higher and customers are more price sensitive.",
    demandMultiplier: 0.9,
    gdpIndex: 710,
    unemploymentRatePct: 6,
    centralBankRatePct: 6,
    materialPricePerThousand: 49800,
  },
  {
    name: "Recession",
    description:
      "The economy is in recession. Demand is weak, especially for expensive products.",
    demandMultiplier: 0.75,
    gdpIndex: 680,
    unemploymentRatePct: 8,
    centralBankRatePct: 4,
    materialPricePerThousand: 48000,
  },
  {
    name: "Recovery",
    description:
      "The economy is recovering. Confidence improves and demand starts to come back.",
    demandMultiplier: 1.05,
    gdpIndex: 720,
    unemploymentRatePct: 6,
    centralBankRatePct: 4,
    materialPricePerThousand: 49000,
  },
  {
    name: "High Growth",
    description:
      "Strong growth and high confidence. Demand is high but competition is aggressive.",
    demandMultiplier: 1.15,
    gdpIndex: 760,
    unemploymentRatePct: 4,
    centralBankRatePct: 5,
    materialPricePerThousand: 51000,
  },
];

function getEconomyForQuarter(globalQuarterIndex: number): EconomyPhase {
  const idx = Math.max(1, Math.min(globalQuarterIndex, MAX_QUARTERS)) - 1; // 0–9
  const phaseIndex = Math.floor(
    (idx / (MAX_QUARTERS - 1)) * (economyPhases.length - 1)
  );
  return economyPhases[phaseIndex];
}

/* ─────────────────── Starting decisions ─────────────────── */

const baseProducts: ProductDecision[] = [
  {
    name: "Product 1",
    majorChange: false,
    priceExport: 400,
    priceHome: 380,
    adTradePress: 30,
    adPressTV: 25,
    adMerchandising: 15,
    assemblyTime: 40,
  },
  {
    name: "Product 2",
    majorChange: false,
    priceExport: 360,
    priceHome: 350,
    adTradePress: 25,
    adPressTV: 20,
    adMerchandising: 12,
    assemblyTime: 35,
  },
  {
    name: "Product 3",
    majorChange: false,
    priceExport: 340,
    priceHome: 330,
    adTradePress: 20,
    adPressTV: 18,
    adMerchandising: 10,
    assemblyTime: 30,
  },
];

const baseGeneral: GeneralDecisions = {
  salespeopleExport: 13,
  salespeopleSouth: 1,
  salespeopleWest: 1,
  salespeopleNorth: 3,
  salesCommissionPct: 2,
  salespersonSalaryHundreds: 50,
  managementBudgetThousands: 120,
};

const cloneProducts = (): ProductDecision[] => baseProducts.map((p) => ({ ...p }));

const defaultPlayers: PlayerDecisions[] = [
  {
    id: 1,
    name: "Company 1",
    color: "#1f77b4",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 2,
    name: "Company 2",
    color: "#ff7f0e",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 3,
    name: "Company 3",
    color: "#2ca02c",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 4,
    name: "Company 4",
    color: "#d62728",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 5,
    name: "Company 5",
    color: "#9467bd",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 6,
    name: "Company 6",
    color: "#8c564b",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 7,
    name: "Company 7",
    color: "#e377c2",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
  {
    id: 8,
    name: "Company 8",
    color: "#7f7f7f",
    general: { ...baseGeneral },
    products: cloneProducts(),
  },
];

/* ─────────────────── Helpers ─────────────────── */

function regionWeight(region: Region): number {
  switch (region) {
    case "Export":
      return 1.2;
    case "South":
      return 1.0;
    case "West":
      return 0.95;
    case "North":
      return 0.9;
    default:
      return 1;
  }
}

function attractivenessScore(product: ProductDecision, region: Region): number {
  const priceWeight = region === "Export" ? 0.4 : 0.35;
  const promoWeight = 0.35;
  const qualityWeight = 0.25;

  const price = region === "Export" ? product.priceExport : product.priceHome;
  const maxReasonablePrice = 500;
  const priceScore = Math.max(0, (maxReasonablePrice - price) / maxReasonablePrice);

  const promotionSpend =
    product.adTradePress + product.adPressTV + product.adMerchandising;
  const promoScore = Math.tanh(promotionSpend / 50);

  const qualityScore = product.majorChange ? 1 : 0.7;

  const score =
    (priceScore * priceWeight +
      promoScore * promoWeight +
      qualityScore * qualityWeight) *
    regionWeight(region);

  return Math.max(score, 0.0001);
}

function applyMarketShocks(
  regions: MarketRegionInfo[]
): { shockedMarket: MarketRegionInfo[]; news: string[] } {
  const news: string[] = [];
  const shocked = regions.map((r) => {
    const factor = 0.9 + Math.random() * 0.2; // 0.9–1.1
    news.push(
      `${r.region}: market demand ${
        factor > 1 ? "rose" : "fell"
      } by ${(factor * 100 - 100).toFixed(1)}%.`
    );
    const newDemand: Record<ProductName, number> = {
      ...r.demandPerProduct,
    };
    (Object.keys(newDemand) as ProductName[]).forEach((p) => {
      newDemand[p] = Math.round(newDemand[p] * factor);
    });
    return { region: r.region, demandPerProduct: newDemand };
  });

  return { shockedMarket: shocked, news };
}

// simple share-price model based on cumulative profit
function computeSharePrice(player: PlayerState): number {
  const totalProfit = player.results.reduce((sum, r) => sum + r.profit, 0);
  const basePrice = 10; // £10 starting
  const price = basePrice + totalProfit / 100_000; // £1 per 100k profit
  return Math.max(1, parseFloat(price.toFixed(2)));
}

// number formatting with commas
function formatCurrency(n: number): string {
  return n.toLocaleString("en-GB", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDecimal(n: number, fractionDigits: number): string {
  return n.toLocaleString("en-GB", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  });
}

/* ─────────────────── App ─────────────────── */

const App: React.FC = () => {
  const [players, setPlayers] = useState<PlayerState[]>(
    defaultPlayers.map((p) => ({
      decisions: p,
      results: [],
      cashBalance: STARTING_CASH,
      bankrupt: false,
    }))
  );

  type TabId = "overview" | "decisions" | "market" | "results" | "management";

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [activePlayerId, setActivePlayerId] = useState<number>(1);
  const [latestNews, setLatestNews] = useState<{
    companyName: string;
    news: string[];
  } | null>(null);

  const activePlayer = players.find((p) => p.decisions.id === activePlayerId)!;

  /* ---- update handlers ---- */

  const updateGeneral = (
    playerId: number,
    field: keyof GeneralDecisions,
    value: number
  ) => {
    setPlayers((prev) =>
      prev.map((ps) =>
        ps.decisions.id === playerId
          ? {
              ...ps,
              decisions: {
                ...ps.decisions,
                general: { ...ps.decisions.general, [field]: value },
              },
            }
          : ps
      )
    );
  };

  const updateProduct = (
    playerId: number,
    index: number,
    field: keyof ProductDecision,
    value: number | boolean
  ) => {
    setPlayers((prev) =>
      prev.map((ps) => {
        if (ps.decisions.id !== playerId) return ps;
        const products = ps.decisions.products.map((p, i) =>
          i === index ? { ...p, [field]: value } : p
        );
        return {
          ...ps,
          decisions: { ...ps.decisions, products },
        };
      })
    );
  };

  const updatePlayerName = (playerId: number, newName: string) => {
    setPlayers((prev) =>
      prev.map((ps) =>
        ps.decisions.id === playerId
          ? {
              ...ps,
              decisions: {
                ...ps.decisions,
                name: newName || ps.decisions.name,
              },
            }
          : ps
      )
    );
  };

  /* ---- run a quarter for ONE company (internal helper) ---- */

  const runQuarterForPlayer = (playerId: number) => {
    const target = players.find((ps) => ps.decisions.id === playerId);
    if (!target) return;

    // stop if company is already bankrupt or has run 10 quarters
    if (target.bankrupt || target.results.length >= MAX_QUARTERS) {
      return;
    }

    // Global simulation quarter (for economy narrative)
    const maxQuartersSoFar = Math.max(0, ...players.map((ps) => ps.results.length));
    const globalQuarterIndex = maxQuartersSoFar + 1;
    const economy = getEconomyForQuarter(globalQuarterIndex);

    // scale market demand by economy before applying random shocks
    const economyAdjustedMarket: MarketRegionInfo[] = baseMarket.map((m) => {
      const scaled: Record<ProductName, number> = {
        ...m.demandPerProduct,
      };
      (Object.keys(scaled) as ProductName[]).forEach((prod) => {
        scaled[prod] = scaled[prod] * economy.demandMultiplier;
      });
      return { region: m.region, demandPerProduct: scaled };
    });

    // 1) compute advertising cost and initialise revenue maps for ALL players
    const allRevenue = new Map<number, number>();
    const allAdvertising = new Map<number, number>();

    // NEW: track per-product revenue for each company
    const productRevenue = new Map<number, { prod1: number; prod2: number; prod3: number }>();

    players.forEach((ps) => {
      productRevenue.set(ps.decisions.id, {
        prod1: 0,
        prod2: 0,
        prod3: 0,
      });
    });

    players.forEach((ps) => {
      const id = ps.decisions.id;
      allRevenue.set(id, 0);

      let advCost = 0;
      ps.decisions.products.forEach((p) => {
        const totalAdv = p.adTradePress + p.adPressTV + p.adMerchandising; // £'000
        advCost += totalAdv * 1000;
      });
      allAdvertising.set(id, advCost);
    });

    // 2) apply market shocks (on top of economy condition)
    const { shockedMarket, news: shockNews } = applyMarketShocks(economyAdjustedMarket);

    const news: string[] = [
      `Pakistan economy this quarter: ${economy.name}`,
      economy.description,
      ...shockNews,
    ];

    // 3) share demand between companies in each region
    for (const r of shockedMarket) {
      const demandByProduct = r.demandPerProduct;

      for (const productName of productNames) {
        const demand = demandByProduct[productName];
        if (!demand) continue;

        const scores: {
          id: number;
          product: ProductDecision;
          score: number;
        }[] = [];

        players.forEach((ps) => {
          const product = ps.decisions.products.find((p) => p.name === productName);
          if (!product) return;
          scores.push({
            id: ps.decisions.id,
            product,
            score: attractivenessScore(product, r.region),
          });
        });

        const totalScore = scores.reduce((s, x) => s + x.score, 0);
        if (totalScore <= 0) continue;

        scores.forEach((s) => {
          const share = s.score / totalScore;
          const unitsSold = demand * share;
          const price = r.region === "Export" ? s.product.priceExport : s.product.priceHome;
          const revenue = unitsSold * price;

          allRevenue.set(s.id, (allRevenue.get(s.id) || 0) + revenue);

          // NEW: accumulate per-product revenue
          const pr = productRevenue.get(s.id);
          if (pr) {
            if (productName === "Product 1") pr.prod1 += revenue;
            if (productName === "Product 2") pr.prod2 += revenue;
            if (productName === "Product 3") pr.prod3 += revenue;
          }
        });
      }
    }

    // 4) build result ONLY for target player and update its cash
    setPlayers((prev) =>
      prev.map((ps) => {
        if (ps.decisions.id !== playerId) return ps;

        const g = ps.decisions.general;
        const totalSalespeople =
          g.salespeopleExport + g.salespeopleSouth + g.salespeopleWest + g.salespeopleNorth;

        const salesCost = totalSalespeople * g.salespersonSalaryHundreds * 100; // £00 → £
        const managementCost = g.managementBudgetThousands * 1000;

        const revenue = allRevenue.get(playerId) || 0;
        const adv = allAdvertising.get(playerId) || 0;

        const totalMarketRevenue = Array.from(allRevenue.values()).reduce(
          (s, v) => s + v,
          0
        );

        const profit = revenue - (salesCost + managementCost + adv);
        const marketSharePercent =
          totalMarketRevenue > 0 ? (revenue / totalMarketRevenue) * 100 : 0;

        const oldCash = ps.cashBalance;
        const newCash = oldCash + profit;
        const quarterIndex = ps.results.length + 1;

        // acquisition rule
        const acquisitionEligible =
          profit > 0 && newCash > STARTING_CASH * 1.1 && quarterIndex >= 3;

        const pr = productRevenue.get(playerId);

        const newResult: QuarterResult = {
          quarterIndex,
          revenue,
          advertisingCost: adv,
          salesCost,
          managementCost,
          profit,
          marketSharePercent,
          news,
          economyName: economy.name,
          economyDescription: economy.description,
          cashAfter: newCash,
          acquisitionEligible,
          gdpIndex: economy.gdpIndex,
          unemploymentRatePct: economy.unemploymentRatePct,
          centralBankRatePct: economy.centralBankRatePct,
          materialPricePerThousand: economy.materialPricePerThousand,
          prod1Revenue: pr?.prod1 ?? 0,
          prod2Revenue: pr?.prod2 ?? 0,
          prod3Revenue: pr?.prod3 ?? 0,
        };

        return {
          ...ps,
          cashBalance: newCash,
          bankrupt: newCash <= 0,
          results: [...ps.results, newResult],
        };
      })
    );

    setLatestNews({
      companyName: target.decisions.name,
      news,
    });
  };

  /* ---- run a quarter for ALL companies (button the user sees) ---- */

  const runQuarterForAllPlayers = () => {
    players.forEach((p) => {
      if (!p.bankrupt && p.results.length < MAX_QUARTERS) {
        runQuarterForPlayer(p.decisions.id);
      }
    });
    setActiveTab("results");
  };

  /* ---- chart data: use max quarter count across companies ---- */

  const maxQuarters = Math.max(0, ...players.map((p) => p.results.length));
  const chartData = Array.from({ length: maxQuarters }).map((_, i) => {
    const quarterIndex = i + 1;
    const point: any = { name: `Q${quarterIndex}` };
    players.forEach((p) => {
      const r = p.results.find((x) => x.quarterIndex === quarterIndex);
      point[`profit_${p.decisions.id}`] = r ? r.profit : 0;
    });
    return point;
  });

  return (
    <div className="app-container">
      <header>
        <h1 className="simTitle">THE STELLARS – MANAGEMENT SIMULATION</h1>
        <p className="subtitle">
          8-player quarterly decision game – all companies advance together each quarter under
          the same market and economy conditions.
        </p>
      </header>

      {/* Main tabs */}
      <div className="main-tabs">
        <button
          onClick={() => setActiveTab("overview")}
          className={activeTab === "overview" ? "active" : ""}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab("decisions")}
          className={activeTab === "decisions" ? "active" : ""}
        >
          Decisions Sheet
        </button>
        <button
          onClick={() => setActiveTab("market")}
          className={activeTab === "market" ? "active" : ""}
        >
          Market &amp; Competitors
        </button>
        <button
          onClick={() => setActiveTab("results")}
          className={activeTab === "results" ? "active" : ""}
        >
          Results &amp; History
        </button>
        <button
          onClick={() => setActiveTab("management")}
          className={activeTab === "management" ? "active" : ""}
        >
          Management Report
        </button>
      </div>

      {/* Player selector (only for decisions view) */}
      {activeTab === "decisions" && (
        <div className="player-tabs">
          {players.map((p) => (
            <button
              key={p.decisions.id}
              onClick={() => setActivePlayerId(p.decisions.id)}
              className={activePlayerId === p.decisions.id ? "active" : ""}
            >
              {p.decisions.name}
              {p.bankrupt ? " (Bankrupt)" : ""}
            </button>
          ))}
        </div>
      )}

      {/* Overview panel */}
      {activeTab === "overview" && (
        <div className="panel">
          <h2>Welcome to The Stellars</h2>
          <p className="hint">
            This simulation allows you to manage pricing, advertising, sales force and production
            decisions, and compete against other companies in a shared economic environment.
          </p>
        </div>
      )}

      {/* Decisions panel */}
      {activeTab === "decisions" && (
        <>
          <DecisionsPanel
            player={activePlayer}
            onUpdateGeneral={updateGeneral}
            onUpdateProduct={updateProduct}
            onUpdateName={updatePlayerName}
          />
          <div style={{ marginTop: "1.5rem", textAlign: "center" }}>
            <button
              className="primary-btn"
              onClick={runQuarterForAllPlayers}
              disabled={players.every((p) => p.bankrupt || p.results.length >= MAX_QUARTERS)}
            >
              Run Quarter for ALL Companies
            </button>
          </div>
        </>
      )}

      {/* Market panel */}
      {activeTab === "market" && <MarketPanel players={players} />}

      {/* Results panel */}
      {activeTab === "results" && (
        <ResultsPanel players={players} chartData={chartData} latestNews={latestNews} />
      )}

      {/* Management report */}
      {activeTab === "management" && <ManagementReport players={players} />}
    </div>
  );
};

/* ─────────────────── Decisions Panel ─────────────────── */

const DecisionsPanel: React.FC<{
  player: PlayerState;
  onUpdateGeneral: (
    playerId: number,
    field: keyof GeneralDecisions,
    value: number
  ) => void;
  onUpdateProduct: (
    playerId: number,
    index: number,
    field: keyof ProductDecision,
    value: number | boolean
  ) => void;
  onUpdateName: (playerId: number, name: string) => void;
}> = ({ player, onUpdateGeneral, onUpdateProduct, onUpdateName }) => {
  const g = player.decisions.general;
  const pid = player.decisions.id;

  const nextQuarterIndex = player.results.length + 1;
  const reachedLimit = nextQuarterIndex > MAX_QUARTERS;

  // bulk paste state for product decisions
  const [bulkText, setBulkText] = useState("");

  const handleApplyBulk = () => {
    const lines = bulkText.trim().split(/\r?\n/);
    lines.forEach((line, rowIndex) => {
      if (rowIndex >= player.decisions.products.length) return;

      const parts = line
        .split(/[\t,; ]+/)
        .map((p) => p.trim())
        .filter(Boolean);

      if (parts.length === 0) return;

      const nums = parts.map((p) => Number(p.replace(/[^0-9.-]/g, "")));

      const [priceExport, priceHome, tradePress, pressTV, merch, asmTime] = nums;

      if (!Number.isNaN(priceExport)) {
        onUpdateProduct(pid, rowIndex, "priceExport", priceExport);
      }
      if (!Number.isNaN(priceHome)) {
        onUpdateProduct(pid, rowIndex, "priceHome", priceHome);
      }
      if (!Number.isNaN(tradePress)) {
        onUpdateProduct(pid, rowIndex, "adTradePress", tradePress);
      }
      if (!Number.isNaN(pressTV)) {
        onUpdateProduct(pid, rowIndex, "adPressTV", pressTV);
      }
      if (!Number.isNaN(merch)) {
        onUpdateProduct(pid, rowIndex, "adMerchandising", merch);
      }
      if (!Number.isNaN(asmTime)) {
        onUpdateProduct(pid, rowIndex, "assemblyTime", asmTime);
      }
    });
  };

  return (
    <div className="panel">
      <h2>Decisions – {player.decisions.name}</h2>

      <div className="top-summary">
        <div className="top-summary-col">
          <label className="field-label">Company name</label>
          <input
            type="text"
            value={player.decisions.name}
            onChange={(e) => onUpdateName(pid, e.target.value)}
          />
        </div>
        <div className="top-summary-col">
          <p>
            <strong>Current cash: </strong>£{formatCurrency(player.cashBalance)}
          </p>
          <p>
            <strong>Quarters played: </strong>
            {player.results.length} / {MAX_QUARTERS}
          </p>
          {player.bankrupt && (
            <p style={{ color: "#b91c1c" }}>
              This company has run out of cash and cannot continue.
            </p>
          )}
          {reachedLimit && !player.bankrupt && (
            <p style={{ color: "#6b7280" }}>
              This company has completed all simulation quarters.
            </p>
          )}
        </div>
      </div>

      <div className="decisions-grid">
        <section className="decision-card">
          <h3>Sales Force &amp; Management</h3>
          <table className="table compact">
            <tbody>
              <tr>
                <th>Salespeople – Export</th>
                <td>
                  <NumberInput
                    value={g.salespeopleExport}
                    onChange={(v) => onUpdateGeneral(pid, "salespeopleExport", v)}
                  />
                </td>
              </tr>
              <tr>
                <th>Salespeople – South</th>
                <td>
                  <NumberInput
                    value={g.salespeopleSouth}
                    onChange={(v) => onUpdateGeneral(pid, "salespeopleSouth", v)}
                  />
                </td>
              </tr>
              <tr>
                <th>Salespeople – West</th>
                <td>
                  <NumberInput
                    value={g.salespeopleWest}
                    onChange={(v) => onUpdateGeneral(pid, "salespeopleWest", v)}
                  />
                </td>
              </tr>
              <tr>
                <th>Salespeople – North</th>
                <td>
                  <NumberInput
                    value={g.salespeopleNorth}
                    onChange={(v) => onUpdateGeneral(pid, "salespeopleNorth", v)}
                  />
                </td>
              </tr>
              <tr>
                <th>Sales Commission %</th>
                <td>
                  <NumberInput
                    value={g.salesCommissionPct}
                    onChange={(v) => onUpdateGeneral(pid, "salesCommissionPct", v)}
                  />
                </td>
              </tr>
              <tr>
                <th>Salesperson Quarterly Salary (£00)</th>
                <td>
                  <NumberInput
                    value={g.salespersonSalaryHundreds}
                    onChange={(v) =>
                      onUpdateGeneral(pid, "salespersonSalaryHundreds", v)
                    }
                  />
                </td>
              </tr>
              <tr>
                <th>Management Budget (£&apos;000)</th>
                <td>
                  <NumberInput
                    value={g.managementBudgetThousands}
                    onChange={(v) =>
                      onUpdateGeneral(pid, "managementBudgetThousands", v)
                    }
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="decisions-products decision-card">
          <h3>Product Decisions &amp; Quantities</h3>
          <table className="table compact">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price Export</th>
                <th>Price Home</th>
                <th>Trade Press</th>
                <th>Press &amp; TV</th>
                <th>Merch.</th>
                <th>Asm. Time</th>
              </tr>
            </thead>
            <tbody>
              {player.decisions.products.map((p, idx) => (
                <tr key={p.name}>
                  <td>{p.name}</td>
                  <td>
                    <NumberInput
                      value={p.priceExport}
                      onChange={(v) => onUpdateProduct(pid, idx, "priceExport", v)}
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={p.priceHome}
                      onChange={(v) => onUpdateProduct(pid, idx, "priceHome", v)}
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={p.adTradePress}
                      onChange={(v) => onUpdateProduct(pid, idx, "adTradePress", v)}
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={p.adPressTV}
                      onChange={(v) => onUpdateProduct(pid, idx, "adPressTV", v)}
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={p.adMerchandising}
                      onChange={(v) =>
                        onUpdateProduct(pid, idx, "adMerchandising", v)
                      }
                    />
                  </td>
                  <td>
                    <NumberInput
                      value={p.assemblyTime}
                      onChange={(v) => onUpdateProduct(pid, idx, "assemblyTime", v)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="bulk-paste">
            <h4>Quick paste from GPT / Excel</h4>
            <p className="hint">
              Paste 3 lines (one per product). Columns: Export price, Home price, Trade Press,
              Press &amp; TV, Merchandising, Assembly time.
            </p>
            <textarea
              value={bulkText}
              onChange={(e) => setBulkText(e.target.value)}
              rows={4}
              placeholder={`Example:\n400 380 30 25 15 40\n360 350 25 20 12 35\n340 330 20 18 10 30`}
            />
            <button
              type="button"
              className="secondary-btn"
              onClick={handleApplyBulk}
            >
              Apply to products
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};

/* ─────────────────── Market Panel ─────────────────── */

const MarketPanel: React.FC<{
  players: PlayerState[];
}> = ({ players }) => {
  return (
    <div className="panel">
      <h2>Market &amp; Competitors Overview</h2>
      <p className="hint">
        This view compares each company’s product prices and advertising decisions.
      </p>

      <table className="table compact">
        <thead>
          <tr>
            <th>Company</th>
            <th>Product</th>
            <th>Export Price</th>
            <th>Home Price</th>
            <th>Trade Press</th>
            <th>Press &amp; TV</th>
            <th>Merchandising</th>
          </tr>
        </thead>
        <tbody>
          {players.flatMap((ps) =>
            ps.decisions.products.map((p) => (
              <tr key={`${ps.decisions.id}-${p.name}`}>
                <td>{ps.decisions.name}</td>
                <td>{p.name}</td>
                <td>{p.priceExport}</td>
                <td>{p.priceHome}</td>
                <td>{p.adTradePress}</td>
                <td>{p.adPressTV}</td>
                <td>{p.adMerchandising}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

/* ─────────────────── Results Panel ─────────────────── */

const ResultsPanel: React.FC<{
  players: PlayerState[];
  chartData: any[];
  latestNews: { companyName: string; news: string[] } | null;
}> = ({ players, chartData, latestNews }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number>(
    players[0]?.decisions.id ?? 1
  );

  const selectedPlayer =
    players.find((p) => p.decisions.id === selectedCompanyId) || players[0];

  const latestResult =
    selectedPlayer && selectedPlayer.results.length > 0
      ? selectedPlayer.results[selectedPlayer.results.length - 1]
      : null;

  const priceChartData =
    selectedPlayer?.decisions.products.map((p) => ({
      product: p.name,
      Export: p.priceExport,
      Home: p.priceHome,
    })) ?? [];

  const advChartData =
    selectedPlayer?.decisions.products.map((p) => ({
      product: p.name,
      TradePress: p.adTradePress,
      PressTV: p.adPressTV,
      Merch: p.adMerchandising,
    })) ?? [];

  return (
    <div className="panel">
      <h2>Quarterly Results &amp; History</h2>

      {/* Winner Announcement (appears only after last quarter) */}
      {players.every((p) => p.results.length >= MAX_QUARTERS) && (
        <div className="winnerBanner">
          {(() => {
            const profits = players.map((p) => ({
              name: p.decisions.name,
              total: p.results.reduce((sum, r) => sum + r.profit, 0),
            }));
            const winner = profits.sort((a, b) => b.total - a.total)[0];
            return (
              <div>
                <h3>🏆 Winner: {winner.name}</h3>
                <p>Total Profit: £{formatCurrency(winner.total)}</p>
              </div>
            );
          })()}
        </div>
      )}

      <div className="results-header-row">
        <div>
          <label className="field-label">Focus company for dashboard</label>
          <select
            value={selectedCompanyId}
            onChange={(e) => setSelectedCompanyId(Number(e.target.value))}
          >
            {players.map((p) => (
              <option key={p.decisions.id} value={p.decisions.id}>
                {p.decisions.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI cards */}
      {latestResult && (
        <div className="kpi-row">
          <div className="kpi-card">
            <h4>Revenue (latest quarter)</h4>
            <p className="kpi-main">£{formatCurrency(latestResult.revenue)}</p>
            <span className="kpi-sub">Q{latestResult.quarterIndex}</span>
          </div>
          <div className="kpi-card">
            <h4>Profit (latest quarter)</h4>
            <p
              className="kpi-main"
              style={{
                color: latestResult.profit >= 0 ? "#22c55e" : "#f97316",
              }}
            >
              £{formatCurrency(latestResult.profit)}
            </p>
            <span className="kpi-sub">
              Market share {formatDecimal(latestResult.marketSharePercent, 1)}%
            </span>
          </div>
          <div className="kpi-card">
            <h4>Cash balance</h4>
            <p className="kpi-main">£{formatCurrency(selectedPlayer.cashBalance)}</p>
            <span className="kpi-sub">
              Status: {selectedPlayer.bankrupt ? "Bankrupt" : "Active"}
            </span>
          </div>
          <div className="kpi-card">
            <h4>Share price</h4>
            <p className="kpi-main">
              £{formatDecimal(computeSharePrice(selectedPlayer), 2)}
            </p>
            <span className="kpi-sub">Based on total profit to date</span>
          </div>
        </div>
      )}

      {/* Economic information for latest quarter */}
      {latestResult && (
        <section className="statement-card">
          <h3>Economic Information</h3>
          <table className="table compact">
            <tbody>
              <tr>
                <td>Gross Domestic Product Last Quarter (deseasonalised)</td>
                <td>{formatCurrency(latestResult.gdpIndex)}</td>
              </tr>
              <tr>
                <td>% Unemployed Rate Last Quarter (deseasonalised)</td>
                <td>{formatCurrency(latestResult.unemploymentRatePct)}</td>
              </tr>
              <tr>
                <td>% Annual Central Bank Rate from Next Quarter</td>
                <td>{formatCurrency(latestResult.centralBankRatePct)}</td>
              </tr>
              <tr>
                <td>Price of Material ordered for Next Quarter (£ per &apos;000)</td>
                <td>{formatCurrency(latestResult.materialPricePerThousand)}</td>
              </tr>
            </tbody>
          </table>
        </section>
      )}

      {/* Charts row: product prices + advertising expenditure */}
      <div className="charts-row">
        <div className="chart-card">
          <h3>Product Prices (£)</h3>
          <BarChart width={360} height={260} data={priceChartData}>
            <CartesianGrid stroke="#2d3748" strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Export" fill="#38bdf8" />
            <Bar dataKey="Home" fill="#e5e7eb" />
          </BarChart>
        </div>

        <div className="chart-card">
          <h3>Advertising Expenditure (£&apos;000)</h3>
          <LineChart width={360} height={260} data={advChartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="product" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="TradePress" name="Trade Press" />
            <Line type="monotone" dataKey="PressTV" name="Press & TV" />
            <Line type="monotone" dataKey="Merch" name="Merchandising" />
          </LineChart>
        </div>
      </div>

      {/* Full table of all results for all companies */}
      <table className="table compact">
        <thead>
          <tr>
            <th>Quarter</th>
            <th>Company</th>
            <th>Revenue (£)</th>
            <th>Revenue Growth %</th>
            <th>Profit (£)</th>
            <th>Profit Growth %</th>
            <th>Adv. Cost (£)</th>
            <th>Sales Cost (£)</th>
            <th>Mgmt Cost (£)</th>
            <th>Market Share %</th>
          </tr>
        </thead>

        <tbody>
          {players.map((ps) =>
            ps.results.map((r, idx) => {
              const prev = ps.results[idx - 1] || null;

              const revenueGrowth =
                prev ? ((r.revenue - prev.revenue) / prev.revenue) * 100 : 0;

              const profitGrowth =
                prev && prev.profit !== 0
                  ? ((r.profit - prev.profit) / prev.profit) * 100
                  : 0;

              return (
                <tr key={`${ps.decisions.id}-${r.quarterIndex}`}>
                  <td>Q{r.quarterIndex}</td>
                  <td>{ps.decisions.name}</td>
                  <td>{formatCurrency(r.revenue)}</td>
                  <td>{formatDecimal(revenueGrowth, 1)}%</td>
                  <td
                    style={{
                      color: r.profit >= 0 ? "#22c55e" : "#f97316",
                    }}
                  >
                    £{formatCurrency(r.profit)}
                  </td>
                  <td>{formatDecimal(profitGrowth, 1)}%</td>
                  <td>{formatCurrency(r.advertisingCost)}</td>
                  <td>{formatCurrency(r.salesCost)}</td>
                  <td>{formatCurrency(r.managementCost)}</td>
                  <td>{formatDecimal(r.marketSharePercent, 1)}%</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* Overall profit chart */}
      {chartData.length > 0 && (
        <div className="chart-container">
          <h3>Profit by Quarter (all companies)</h3>
          <LineChart width={720} height={320} data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            {players.map((p) => (
              <Line
                key={p.decisions.id}
                type="monotone"
                dataKey={`profit_${p.decisions.id}`}
                stroke="#93c5fd"
                strokeWidth={3}
                dot={{ r: 3, fill: "#e2e8f0" }}
                name={p.decisions.name}
              />
            ))}
          </LineChart>
        </div>
      )}

      {latestNews && latestNews.news.length > 0 && (
        <div className="market-news">
          <h3>Latest Market Updates – {latestNews.companyName}</h3>
          <ul>
            {latestNews.news.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
/* ─────────────────── Financial Engine (Option C Hybrid) ─────────────────── */

type Financials = {
  fixedAssets: {
    property: number;
    machines: number;
    vehicles: number;
  };
  currentAssets: {
    productStock: number;
    materialStock: number;
    debtors: number;
    cash: number;
  };
  liabilities: {
    creditors: number;
    overdraft: number;
    loans: number;
  };
  equity: {
    ordinaryCapital: number;
    reserves: number;
  };
  totals: {
    totalFixed: number;
    totalCurrent: number;
    totalAssets: number;
    totalLiabilities: number;
    totalEquity: number;
    netAssets: number;
  };
};

/* STATIC FIXED ASSET VALUES (never change) */
const FIXED_ASSETS = {
  property: 300000,
  machines: 1594818,
  vehicles: 175758,
};

/* EQUITY CAPITAL (constant for all companies) */
const ORDINARY_CAPITAL = 2000000;

/* ---- Compute cumulative financial statements for a company ---- */
function computeFinancials(player: PlayerState): Financials {
  // cumulative sums
  let cumulativeCOGS = 0;
  let cumulativeRevenue = 0;
  let cumulativeProfit = 0;

  player.results.forEach((r) => {
    cumulativeCOGS += r.salesCost;
    cumulativeRevenue += r.revenue;
    cumulativeProfit += r.profit;
  });

  // dynamic current assets
  const productStock = cumulativeCOGS * 0.05;
  const materialStock = cumulativeCOGS * 0.03;
  const debtors = cumulativeRevenue * 0.15;
  const cash = player.cashBalance;

  // liabilities
  const creditors = cumulativeCOGS * 0.20;
  const overdraft = cash < 0 ? Math.abs(cash) : 0;
  const loans = 0;

  // equity
  const reserves = cumulativeProfit;
  const ordinaryCapital = ORDINARY_CAPITAL;

  const totalFixed =
    FIXED_ASSETS.property + FIXED_ASSETS.machines + FIXED_ASSETS.vehicles;

  const totalCurrent = productStock + materialStock + debtors + cash;

  const totalAssets = totalFixed + totalCurrent;

  const totalLiabilities = creditors + overdraft + loans;

  const totalEquity = ordinaryCapital + reserves;

  const netAssets = totalAssets - totalLiabilities;

  return {
    fixedAssets: { ...FIXED_ASSETS },
    currentAssets: { productStock, materialStock, debtors, cash },
    liabilities: { creditors, overdraft, loans },
    equity: { ordinaryCapital, reserves },
    totals: {
      totalFixed,
      totalCurrent,
      totalAssets,
      totalLiabilities,
      totalEquity,
      netAssets,
    },
  };
}


/* ───────────────────────── OLD STYLE MANAGEMENT REPORT ───────────────────────── */

function ManagementReport({
  players,
}: {
  players: PlayerState[];
}) {
  const [selectedCompany, setSelectedCompany] = useState(0);
  const [selectedReport, setSelectedReport] = useState("income");

  const player = players[selectedCompany];
  const financials = computeFinancials(player);

  /* -------- Income Statement Data -------- */
  const totalRevenue = player.results.reduce((acc, r) => acc + r.revenue, 0);
  const totalCOGS = player.results.reduce((acc, r) => acc + r.salesCost, 0);
  const totalAdv = player.results.reduce((acc, r) => acc + r.advertisingCost, 0);
  const totalMgmt = player.results.reduce((acc, r) => acc + r.managementCost, 0);
  const totalProfit = player.results.reduce((acc, r) => acc + r.profit, 0);

  const grossProfit = totalRevenue - totalCOGS;
  const operatingExpenses = totalAdv + totalMgmt;
  const netProfit = totalProfit;

  /* -------- Cash Flow Data -------- */
  const openingCash =
    player.results.length > 0 ? player.results[0].cashAfter : 0;
  const closingCash = player.cashBalance;
  const netCashFlow = closingCash - openingCash;

  const operatingCashFlow = totalProfit;
  const investingCashFlow = -100000; // optional static
  const financingCashFlow = 0;

  /* ---------------- Renderers ---------------- */
  const renderIncomeStatement = () => (
    <table className="table compact">
      <tbody>
        <tr><td>Revenue</td><td>£{formatCurrency(totalRevenue)}</td></tr>
        <tr><td>Cost of Sales</td><td>£{formatCurrency(totalCOGS)}</td></tr>
        <tr><td>Gross Profit</td><td>£{formatCurrency(grossProfit)}</td></tr>
        <tr><td>Operating Expenses</td><td>£{formatCurrency(operatingExpenses)}</td></tr>
        <tr><td>Net Profit</td><td>£{formatCurrency(netProfit)}</td></tr>
      </tbody>
    </table>
  );

  const renderBalanceSheet = () => (
    <table className="table compact">
      <tbody>
        <tr><th colSpan={2}>Assets</th></tr>
        <tr><td>Value of Property</td><td>£{formatCurrency(financials.fixedAssets.property)}</td></tr>
        <tr><td>Value of Machines</td><td>£{formatCurrency(financials.fixedAssets.machines)}</td></tr>
        <tr><td>Value of Vehicles</td><td>£{formatCurrency(financials.fixedAssets.vehicles)}</td></tr>
        <tr><td>Value of Product Stocks</td><td>£{formatCurrency(financials.currentAssets.productStock)}</td></tr>
        <tr><td>Value of Material Stock</td><td>£{formatCurrency(financials.currentAssets.materialStock)}</td></tr>
        <tr><td>Debtors</td><td>£{formatCurrency(financials.currentAssets.debtors)}</td></tr>
        <tr><td>Cash Invested</td><td>£{formatCurrency(financials.currentAssets.cash)}</td></tr>

        <tr><th colSpan={2}>Liabilities</th></tr>
        <tr><td>Creditors</td><td>£{formatCurrency(financials.liabilities.creditors)}</td></tr>
        <tr><td>Overdraft</td><td>£{formatCurrency(financials.liabilities.overdraft)}</td></tr>

        <tr><th colSpan={2}>Equity</th></tr>
        <tr><td>Ordinary Capital</td><td>£{formatCurrency(financials.equity.ordinaryCapital)}</td></tr>
        <tr><td>Reserves</td><td>£{formatCurrency(financials.equity.reserves)}</td></tr>

        <tr><th>Total Assets</th><th>£{formatCurrency(financials.totals.totalAssets)}</th></tr>
        <tr><th>Total Liabilities</th><th>£{formatCurrency(financials.totals.totalLiabilities)}</th></tr>
        <tr><th>Total Equity</th><th>£{formatCurrency(financials.totals.totalEquity)}</th></tr>
        <tr><th>Net Assets</th><th>£{formatCurrency(financials.totals.netAssets)}</th></tr>
      </tbody>
    </table>
  );

  const renderCashFlow = () => (
    <table className="table compact">
      <tbody>
        <tr><td>Operating Cash Flow</td><td>£{formatCurrency(operatingCashFlow)}</td></tr>
        <tr><td>Investing Cash Flow</td><td>£{formatCurrency(investingCashFlow)}</td></tr>
        <tr><td>Financing Cash Flow</td><td>£{formatCurrency(financingCashFlow)}</td></tr>
        <tr><td>Net Cash Flow</td><td>£{formatCurrency(netCashFlow)}</td></tr>
        <tr><td>Opening Cash</td><td>£{formatCurrency(openingCash)}</td></tr>
        <tr><td>Closing Cash</td><td>£{formatCurrency(closingCash)}</td></tr>
      </tbody>
    </table>
  );

  const renderAllReports = () => (
    <>
      {renderIncomeStatement()}
      <br />
      {renderBalanceSheet()}
      <br />
      {renderCashFlow()}
    </>
  );

  return (
    <div className="panel">
      <h2 className="text-xl font-bold mb-3">Management Report – Financial Statements</h2>

      {/* Dropdowns */}
      <div className="flex gap-4 mb-4">
        <div>
          <label>Select company for statements</label>
          <select
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(Number(e.target.value))}
          >
            {players.map((_, i) => (
              <option key={i} value={i}>
                Company {i + 1}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Select report view</label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
          >
            <option value="income">Income Statement</option>
            <option value="balance">Balance Sheet</option>
            <option value="cash">Cash Flow</option>
            <option value="all">All Reports</option>
          </select>
        </div>
      </div>

      {/* Selected Report */}
      {selectedReport === "income" && renderIncomeStatement()}
      {selectedReport === "balance" && renderBalanceSheet()}
      {selectedReport === "cash" && renderCashFlow()}
      {selectedReport === "all" && renderAllReports()}

      {/* ✔ PRINT BUTTON MUST BE INSIDE THIS DIV */}
      <div style={{ marginTop: "20px", textAlign: "right" }}>
        <button
          onClick={() => window.print()}
          style={{
            padding: "10px 18px",
            background: "#2563eb",
            borderRadius: "6px",
            border: "none",
            cursor: "pointer",
            color: "white",
            fontWeight: "bold",
          }}
        >
          Print Report
        </button>
      </div>
    </div>
  );
}


/* ─────────────────── Tiny number input ─────────────────── */

const NumberInput: React.FC<{
  value: number;
  onChange: (v: number) => void;
}> = ({ value, onChange }) => (
  <input
    type="number"
    value={value}
    onChange={(e) => onChange(Number(e.target.value || 0))}
  />
);

export default App;
