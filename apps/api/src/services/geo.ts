import { prisma } from "../prisma/client";

/**
 * Geo-spatial service helpers.
 * Uses raw SQL with PostGIS functions because Prisma doesn't natively support
 * PostGIS operators like ST_DWithin.
 *
 * Falls back gracefully if PostGIS is not available (returns empty arrays).
 */

interface NearbyUser {
  id: string;
  fcmToken: string;
}

/**
 * Find users within `radiusMeters` of a given point who have a registered FCM token.
 * Used to send push notifications for emergency alerts.
 */
export async function findUsersWithinRadius(
  lng: number,
  lat: number,
  radiusMeters: number = 3000
): Promise<NearbyUser[]> {
  try {
    const users = await prisma.$queryRaw<NearbyUser[]>`
      SELECT id, "fcmToken" FROM "User"
      WHERE "fcmToken" IS NOT NULL
        AND ward IS NOT NULL
        AND ST_DWithin(
          ST_MakePoint(${lng}, ${lat})::geography,
          ST_MakePoint(${lng}, ${lat})::geography,
          ${radiusMeters}
        )
    `;
    return users;
  } catch {
    // PostGIS may not be installed — degrade gracefully.
    console.warn("[geo] PostGIS query failed — FCM push skipped.");
    return [];
  }
}
