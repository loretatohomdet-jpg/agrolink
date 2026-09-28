import { sql } from './db';

// Proximity matrix for Plateau State LGAs (rough distance/logistics heuristics)
const LGA_PROXIMITY: Record<string, Record<string, number>> = {
  'Jos South': { 'Jos South': 100, 'Jos North': 90, 'Barkin Ladi': 85, 'Riyom': 85, 'Bassa': 80, 'Mangu': 70, 'Bokkos': 60 },
  'Jos North': { 'Jos North': 100, 'Jos South': 90, 'Bassa': 85, 'Barkin Ladi': 75, 'Riyom': 75, 'Mangu': 60, 'Bokkos': 50 },
  'Barkin Ladi': { 'Barkin Ladi': 100, 'Jos South': 85, 'Riyom': 85, 'Mangu': 85, 'Jos North': 75, 'Bokkos': 75, 'Bassa': 70 },
  'Riyom': { 'Riyom': 100, 'Jos South': 85, 'Barkin Ladi': 85, 'Bokkos': 80, 'Jos North': 75, 'Bassa': 70, 'Mangu': 70 },
  'Bassa': { 'Bassa': 100, 'Jos North': 85, 'Jos South': 80, 'Barkin Ladi': 70, 'Riyom': 70, 'Mangu': 55, 'Bokkos': 50 },
  'Mangu': { 'Mangu': 100, 'Bokkos': 90, 'Barkin Ladi': 85, 'Jos South': 70, 'Riyom': 70, 'Jos North': 60, 'Bassa': 55 },
  'Bokkos': { 'Bokkos': 100, 'Mangu': 90, 'Riyom': 80, 'Barkin Ladi': 75, 'Jos South': 60, 'Jos North': 50, 'Bassa': 50 },
};

export interface MatchingWeights {
  quantity: number;    // 0.30
  quality: number;     // 0.25
  timing: number;      // 0.20
  location: number;    // 0.15
  reliability: number; // 0.10
}

export const DEFAULT_WEIGHTS: MatchingWeights = {
  quantity: 0.30,
  quality: 0.25,
  timing: 0.20,
  location: 0.15,
  reliability: 0.10,
};

/**
 * Calculates Quantity Fit Score (0 to 100)
 */
export function calculateQuantityScore(available: number, required: number): number {
  if (available >= required) return 100;
  if (required <= 0) return 0;
  // Linear drop-off for smaller quantities
  return Math.round((available / required) * 100);
}

/**
 * Calculates Quality Fit Score (0 to 100)
 */
export function calculateQualityScore(availableGrade: string, requiredGrade: string): number {
  const grades = ['Grade A', 'Grade B', 'Grade C'];
  const availIdx = grades.indexOf(availableGrade);
  const reqIdx = grades.indexOf(requiredGrade);

  if (availIdx === -1 || reqIdx === -1) return 0;

  // If available is equal to or better (lower index) than required, it's a perfect match
  if (availIdx <= reqIdx) return 100;

  // Otherwise, penalize based on difference
  const diff = availIdx - reqIdx;
  if (diff === 1) return 70; // e.g. req A, avail B
  if (diff === 2) return 40; // e.g. req A, avail C
  return 0;
}

/**
 * Calculates Timing Fit Score (0 to 100)
 */
export function calculateTimingScore(harvestDate: Date, requiredDate: Date): number {
  const harvest = new Date(harvestDate).getTime();
  const required = new Date(requiredDate).getTime();
  const diffDays = (harvest - required) / (1000 * 60 * 60 * 24);

  // If harvested on or before the required date, it's perfect
  if (diffDays <= 0) return 100;

  // Penalize by 5% for every day late
  const score = 100 - diffDays * 5;
  return Math.max(0, Math.round(score));
}

/**
 * Calculates Location/Logistics Fit Score (0 to 100)
 */
export function calculateLocationScore(
  supplierLGA: string,
  supplierState: string,
  deliveryLGA: string,
  deliveryState: string
): number {
  if (supplierState.toLowerCase() !== deliveryState.toLowerCase()) {
    return 30; // low score for interstate delivery
  }

  // Same State (Plateau)
  const supLgaNorm = supplierLGA.trim();
  const delLgaNorm = deliveryLGA.trim();

  // Direct match
  if (supLgaNorm.toLowerCase() === delLgaNorm.toLowerCase()) {
    return 100;
  }

  // Check proximity matrix
  const proximity = LGA_PROXIMITY[supLgaNorm]?.[delLgaNorm];
  if (proximity !== undefined) {
    return proximity;
  }

  // Fallback for same state, but unknown/unlisted LGA
  return 60;
}

/**
 * Calculates Supplier Reliability Score (0 to 100)
 */
export function calculateReliabilityScore(
  avgRating: number | null,
  completedTx: number,
  cancelledTx: number
): number {
  // If no transaction history, give a friendly starting default (85%) so new farmers are not hidden
  if (completedTx === 0 && cancelledTx === 0 && avgRating === null) {
    return 85;
  }

  const ratingWeight = 0.7;
  const txWeight = 0.3;

  // Map 1-5 rating to 0-100
  const ratingScore = avgRating ? (avgRating / 5.0) * 100 : 80;

  // Completed ratio
  const totalTx = completedTx + cancelledTx;
  const txScore = totalTx > 0 ? (completedTx / totalTx) * 100 : 100;

  return Math.round(ratingScore * ratingWeight + txScore * txWeight);
}

/**
 * Match a demand request against all verified supplier listings
 */
export async function matchDemandWithSuppliers(
  demandId: string,
  weights: MatchingWeights = DEFAULT_WEIGHTS
) {
  // 1. Fetch Demand Request
  const [demand] = await sql`
    SELECT * FROM demand_requests WHERE id = ${demandId}
  `;
  if (!demand) throw new Error('Demand request not found');

  // 2. Fetch all verified farmers and active listings
  // Categories must match
  const listings = await sql`
    SELECT 
      pl.*,
      fl.lga as farm_lga,
      fl.state as farm_state,
      u.name as farmer_name,
      fp.verification_status as farmer_verification,
      COALESCE(r.avg_rating, 0) as avg_rating,
      COALESCE(t.completed_count, 0) as completed_tx,
      COALESCE(t.cancelled_count, 0) as cancelled_tx
    FROM produce_listings pl
    JOIN users u ON pl.farmer_id = u.id
    JOIN farmer_profiles fp ON u.id = fp.id
    LEFT JOIN farm_locations fl ON u.id = fl.user_id
    -- Average rating subquery
    LEFT JOIN (
      SELECT recipient_id, AVG(rating) as avg_rating
      FROM ratings
      GROUP BY recipient_id
    ) r ON u.id = r.recipient_id
    -- Completed/cancelled transaction counts
    LEFT JOIN (
      SELECT 
        supplier_id,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_count
      FROM transactions
      GROUP BY supplier_id
    ) t ON u.id = t.supplier_id
    WHERE pl.is_active = true 
      AND fp.verification_status = 'verified'
      AND LOWER(pl.category) = LOWER(${demand.product})
  `;

  const results = [];

  for (const list of listings) {
    // 3. Compute scores
    const qtyScore = calculateQuantityScore(Number(list.quantity), Number(demand.quantity));
    const qualScore = calculateQualityScore(list.quality_grade, demand.quality_grade);
    const timeScore = calculateTimingScore(list.harvest_date, demand.required_date);
    const locScore = calculateLocationScore(
      list.farm_lga,
      list.farm_state,
      demand.delivery_location_lga,
      demand.delivery_location_state
    );
    const relScore = calculateReliabilityScore(
      list.avg_rating > 0 ? Number(list.avg_rating) : null,
      Number(list.completed_tx),
      Number(list.cancelled_tx)
    );

    // Calculate final weighted score
    const finalScore = Math.round(
      qtyScore * weights.quantity +
      qualScore * weights.quality +
      timeScore * weights.timing +
      locScore * weights.location +
      relScore * weights.reliability
    );

    results.push({
      demand_id: demand.id,
      listing_id: list.id,
      score: finalScore,
      quantity_score: qtyScore,
      quality_score: qualScore,
      timing_score: timeScore,
      location_score: locScore,
      reliability_score: relScore,
      // Metadata for display
      listing: {
        id: list.id,
        farmer_id: list.farmer_id,
        farmer_name: list.farmer_name,
        category: list.category,
        variety: list.variety,
        quantity: list.quantity,
        unit: list.unit,
        price_per_unit: list.price_per_unit,
        price_type: list.price_type,
        quality_grade: list.quality_grade,
        harvest_date: list.harvest_date,
        available_date: list.available_date,
        farm_lga: list.farm_lga,
        farm_state: list.farm_state,
        avg_rating: list.avg_rating,
        completed_tx: list.completed_tx,
      }
    });
  }

  // 4. Sort results by highest score
  results.sort((a, b) => b.score - a.score);

  // 5. Upsert matches in the database
  for (const res of results) {
    await sql`
      INSERT INTO matches (
        demand_id, listing_id, score, quantity_score, quality_score, timing_score, location_score, reliability_score
      )
      VALUES (
        ${res.demand_id}, ${res.listing_id}, ${res.score}, ${res.quantity_score}, ${res.quality_score}, ${res.timing_score}, ${res.location_score}, ${res.reliability_score}
      )
      ON CONFLICT (demand_id, listing_id) DO UPDATE SET
        score = EXCLUDED.score,
        quantity_score = EXCLUDED.quantity_score,
        quality_score = EXCLUDED.quality_score,
        timing_score = EXCLUDED.timing_score,
        location_score = EXCLUDED.location_score,
        reliability_score = EXCLUDED.reliability_score
    `;
  }

  return results;
}
