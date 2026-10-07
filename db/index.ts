import { env } from "cloudflare:workers";
import { drizzle } from "drizzle-orm/d1";
import * as schema from "./schema";

export function getDb() {
  if (!env.DB) {
    throw new Error(
      "Cloudflare D1 binding `DB` is unavailable. Configure CLOUDFLARE_D1_BINDING=DB and a real deployment binding before using the optional database scaffold."
    );
  }

  return drizzle(env.DB, { schema });
}
