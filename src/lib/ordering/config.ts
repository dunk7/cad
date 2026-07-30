import {
  defaultPricingConfig,
  defaultRouteSlots,
  type PricingConfig,
  type RouteSlot,
} from "./defaults";
import { prisma } from "@/lib/prisma";

export async function getAppConfig(): Promise<{
  pricing: PricingConfig;
  routes: RouteSlot[];
}> {
  const row = await prisma.appConfig.findUnique({ where: { id: "default" } });
  if (!row) {
    await prisma.appConfig.create({
      data: {
        id: "default",
        pricingJson: JSON.stringify(defaultPricingConfig),
        routesJson: JSON.stringify(defaultRouteSlots),
      },
    });
    return { pricing: defaultPricingConfig, routes: defaultRouteSlots };
  }
  return {
    pricing: { ...defaultPricingConfig, ...JSON.parse(row.pricingJson) },
    routes: JSON.parse(row.routesJson) as RouteSlot[],
  };
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
