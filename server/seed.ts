import { storage } from "./storage";

export async function seedDatabase() {
  const existingPlans = await storage.listPlans(5);
  if (existingPlans.length > 0) {
    console.log("Database already has data, skipping seed.");
    return;
  }

  console.log("Seeding database with sample plans...");

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const twoDaysAgo = new Date(today);
  twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
  const threeDaysAgo = new Date(today);
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  const formatDate = (d: Date) => d.toISOString().split('T')[0];

  const samplePlans = [
    {
      date: formatDate(yesterday),
      symbol: "ES",
      contract: "ESH25",
      dynamicZoneTop: 6125.50,
      dynamicZoneBottom: 6098.25,
      magnet: 6112.00,
      r1: 6130.00,
      r2: 6145.75,
      r3: 6160.50,
      r4: 6175.00,
      s1: 6092.50,
      s2: 6078.00,
      s3: 6062.25,
      s4: 6045.00,
      bias: "Bullish",
      setup1: "Long on pullback to DZ bottom with momentum confirmation",
      setup2: "Fade R2 if price stalls with bearish divergence",
      notes: "Fed minutes release at 2pm ET. Expect increased volatility.",
      status: "published" as const,
      publishedAt: new Date().toISOString(),
      telegramMessageId: null,
      telegramMessage: null
    },
    {
      date: formatDate(yesterday),
      symbol: "NQ",
      contract: "NQH25",
      dynamicZoneTop: 21850.00,
      dynamicZoneBottom: 21720.50,
      magnet: 21785.25,
      r1: 21875.00,
      r2: 21945.50,
      r3: 22015.00,
      r4: 22100.00,
      s1: 21695.00,
      s2: 21625.50,
      s3: 21560.00,
      s4: 21475.00,
      bias: "Neutral",
      setup1: "Range play between S1 and R1 until breakout confirmation",
      setup2: "Short from R2 if tech sector shows relative weakness",
      notes: "NVDA earnings after close. Watch for sympathy moves.",
      status: "published" as const,
      publishedAt: new Date().toISOString(),
      telegramMessageId: null,
      telegramMessage: null
    },
    {
      date: formatDate(twoDaysAgo),
      symbol: "ES",
      contract: "ESH25",
      dynamicZoneTop: 6095.00,
      dynamicZoneBottom: 6068.50,
      magnet: 6082.75,
      r1: 6102.50,
      r2: 6118.00,
      r3: 6135.25,
      r4: 6150.00,
      s1: 6060.00,
      s2: 6045.50,
      s3: 6028.00,
      s4: 6010.00,
      bias: "Bearish",
      setup1: "Short rejection at DZ top with volume confirmation",
      setup2: "Long only at S3 with clear reversal pattern",
      notes: "CPI data released at 8:30am. High impact expected.",
      status: "published" as const,
      publishedAt: new Date().toISOString(),
      telegramMessageId: null,
      telegramMessage: null
    },
    {
      date: formatDate(threeDaysAgo),
      symbol: "NQ",
      contract: "NQH25",
      dynamicZoneTop: 21580.00,
      dynamicZoneBottom: 21450.25,
      magnet: 21515.50,
      r1: 21610.00,
      r2: 21680.50,
      r3: 21750.00,
      r4: 21825.00,
      s1: 21420.00,
      s2: 21355.00,
      s3: 21285.50,
      s4: 21200.00,
      bias: "Bullish",
      setup1: "Long on break above DZ top with continuation pattern",
      setup2: "Dip buy at magnet level with proper risk management",
      notes: null,
      status: "draft" as const,
      publishedAt: null,
      telegramMessageId: null,
      telegramMessage: null
    }
  ];

  for (const plan of samplePlans) {
    await storage.upsertPlan(plan);
  }

  console.log(`Seeded ${samplePlans.length} sample plans.`);
}
