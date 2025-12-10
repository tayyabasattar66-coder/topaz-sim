// src/sampleHistory.ts

export const sampleHistory = {
  year: 2005,
  quarter: 3,
  code: "GM05Y06Q3",
  companyName: "Company 1",
  groupName: "Group A",

  companyHistoryText:
    "Replace this string with the scenario / company history text from the web page.",
  businessReportText:
    "Replace this string with the business report text about regulations, etc.",

  economicIndicators: [
    { region: "Europe", gdp: 4074, unemploymentRate: 7.1, tradeBalance: 1767 },
    { region: "Nafta", gdp: 4277, unemploymentRate: 5.1, tradeBalance: 1840 },
  ],
  economyNextQuarter: {
    baseRate: 4.4,
    exchangeRate: 1.03,
    buildingCostPerSqm: 500,
    materialSpotPrice: 34718,
    material3Month: 34388,
    material6Month: 33409,
  },
  componentCostRanges: [
    { productName: "Product 1", minCost: 9, maxCost: 113 },
    { productName: "Product 2", minCost: 146, maxCost: 182 },
    { productName: "Product 3", minCost: 227, maxCost: 280 },
  ],

  physicalResources: {
    landOwnedSqm: 9000,
    accessParkingSqm: 1800,
    unusedLandSqm: 6300,
    factorySizeNextQuarterSqm: 900,
    websitePorts: 1,
    visits: 49677,
    failedVisitsPct: 0,
    internetComplaints: 118,
  },

  humanResources: {
    productionPersonnelAssembly: 2398,
    productionPersonnelMachining: 1426,
    recruited: 8,
    trained: 0,
    dismissed: 0,
  },

  products: [
    {
      name: "Product 1",
      scheduled: 2398,
      produced: 2472,
      rejected: 75,
      lostOrDestroyed: 0,
      closingStock: 0,
      factoryHeatingCO2: 8.55,
      energyCO2: 29.14,
    },
    // add more products if you like
  ],

  financials: {
    income: {
      salesRevenue: 2509810,
      costOfSales: 970025,
      administrativeExpenses: 1138847,
      operatingProfit: 358726,
      financeIncome: 0,
      financeExpense: 0,
      profitBeforeTax: 358726,
      tax: 0,
      profitForPeriod: 358726,
    },
    balanceSheet: {
      nonCurrentAssets: 2606707,
      currentAssets: 3242546,
      equity: 5168945,
      currentLiabilities: 680308,
      termLoans: 0,
      cashAndEquivalents: 2093304,
    },
    cashFlow: {
      cashFromOperations: 92599,
      cashFromInvesting: 0,
      cashFromFinancing: 0,
      netCashFlow: 92599,
      openingCashBalance: 2000705,
      closingCashBalance: 2093304,
    },
  },

  stockMarketData: [
    { name: "Company 1", sharePriceCents: 135.52 },
    { name: "Company 2", sharePriceCents: 135.52 },
  ],
};