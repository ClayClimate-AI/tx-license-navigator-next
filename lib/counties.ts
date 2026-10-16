// label is what the visitor sees; value is the exact all caps business_county string
// the API stores. Values checked against the live dataset on Oct 7, 2026 (Week 4).
// Loving is kept on purpose: it has no A/C Technician holders, so it shows the empty state.
export const COUNTIES = [
  { label: "Harris", value: "HARRIS" },
  { label: "Dallas", value: "DALLAS" },
  { label: "Tarrant", value: "TARRANT" },
  { label: "Bexar", value: "BEXAR" },
  { label: "Travis", value: "TRAVIS" },
  { label: "Collin", value: "COLLIN" },
  { label: "Denton", value: "DENTON" },
  { label: "Fort Bend", value: "FORT BEND" },
  { label: "El Paso", value: "EL PASO" },
  { label: "Hidalgo", value: "HIDALGO" },
  { label: "Lubbock", value: "LUBBOCK" },
  { label: "Jefferson", value: "JEFFERSON" },
  { label: "Loving", value: "LOVING" },
] as const;

// "HARRIS" | "DALLAS" | ... : lets TypeScript and Zod (B2.8) accept only these 13 values.
export type CountyValue = (typeof COUNTIES)[number]["value"];
