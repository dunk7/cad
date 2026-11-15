import {
  defaultPricingConfig,
  defaultRouteSlots,
  type PricingConfig,
  type RouteSlot,
} from "./defaults";
import { prisma } from "@/lib/prisma";

const fallbackConfig = {
  pricing: defaultPricingConfig,
  routes: defaultRouteSlots,
};

export async function getAppConfig(): Promise<{
  pricing: PricingConfig;
  routes: RouteSlot[];
}> {
  try {
    const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
    if (!row) {
      try {
        await prisma.appConfig.create({
          data: {
            id: "default",
            pricingJson: JSON.stringify(defaultPricingConfig),
            routesJson: JSON.stringify(defaultRouteSlots),
          },
        });
      } catch {
        // Read-only / missing DB (e.g. Netlify without DATABASE_URL) — use defaults.
      }
      return fallbackConfig;
    }
    return {
      pricing: { ...defaultPricingConfig, ...JSON.parse(row.pricingJson) },
      routes: JSON.parse(row.routesJson) as RouteSlot[],
    };
  } catch {
    // Prisma/SQLite unavailable in this environment.
    return fallbackConfig;
  }
}

export async function savePricingConfig(pricing: PricingConfig) {
  await prisma.appConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      pricingJson: JSON.stringify(pricing),
      routesJson: JSON.stringify(defaultRouteSlots),
    },
    update: { pricingJson: JSON.stringify(pricing) },
  });
}

export async function saveRouteSlots(routes: RouteSlot[]) {
  await prisma.appConfig.upsert({
    where: { id: "default" },
    create: {
      id: "default",
      pricingJson: JSON.stringify(defaultPricingConfig),
      routesJson: JSON.stringify(routes),
    },
    update: { routesJson: JSON.stringify(routes) },
  });
}
