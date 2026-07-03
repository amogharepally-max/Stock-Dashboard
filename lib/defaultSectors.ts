import { Sector } from "./types";

export const DEFAULT_SECTORS: Sector[] = [
  {
    id: "tech-ai",
    label: "Tech & AI",
    subsections: [
      { label: "Growth", tickers: ["NVDA", "MSFT", "AVGO"] },
      { label: "Value", tickers: ["AAPL", "CSCO", "IBM"] },
      { label: "Dividend", tickers: ["TXN", "QCOM", "INTC"] },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    subsections: [
      { label: "Growth", tickers: ["ISRG", "DXCM", "VEEV"] },
      { label: "Value", tickers: ["JNJ", "ABT", "MDT"] },
      { label: "Dividend", tickers: ["PFE", "MRK", "ABBV"] },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    subsections: [
      { label: "Growth", tickers: ["V", "MA", "PYPL"] },
      { label: "Value", tickers: ["BAC", "JPM", "WFC"] },
      { label: "Dividend", tickers: ["T", "VZ", "O"] },
    ],
  },
  {
    id: "consumer-retail",
    label: "Consumer/Retail",
    subsections: [
      { label: "Growth", tickers: ["AMZN", "COST", "ULTA"] },
      { label: "Value", tickers: ["WMT", "TGT", "KR"] },
      { label: "Dividend", tickers: ["PG", "KO", "PEP"] },
    ],
  },
  {
    id: "space",
    label: "Space",
    subsections: [
      // SpaceX is private; publicly traded pure-plays and close prox
      { label: "Launch & Infrastructure", tickers: ["RKLB", "ASTS", "MNTS"] },
      // Satellite comms & Earth observation
      { label: "Satellite & Data", tickers: ["SPIR", "PL", "GSAT"] },
      // Defense/aerospace with major space programs
      { label: "Aerospace & Defense", tickers: ["LMT", "NOC", "BA"] },
    ],
  },
  {
    id: "quantum",
    label: "Quantum",
    subsections: [
      // Pure-play quantum computing companies
      { label: "Pure-Play Quantum", tickers: ["IONQ", "RGTI", "QUBT"] },
      // Big tech with quantum research divisions
      { label: "Tech with Quantum R&D", tickers: ["GOOGL", "IBM", "MSFT"] },
      // Quantum-adjacent: photonics, cryogenics, materials
      { label: "Enabling Technologies", tickers: ["COHU", "MKSI", "ONTO"] },
    ],
  },
  {
    id: "ai-hardware",
    label: "AI Hardware",
    subsections: [
      // GPU / accelerator makers
      { label: "Accelerators & GPUs", tickers: ["NVDA", "AMD", "INTC"] },
      // Cloud AI infrastructure & data centers
      { label: "Cloud & Data Centers", tickers: ["CRWV", "SMCI", "VRT"] },
      // Networking, memory & HBM for AI clusters
      { label: "Networking & Memory", tickers: ["AVGO", "MRVL", "MU"] },
    ],
  },
];
