
import { restaurantApi } from "@/api/restaurant";
import { monitoringApi } from "@/api/monitoring";
import { performFullValidation, findPotentialDuplicates } from "./restaurantDataQuality";
import { Restaurant } from "@/api/types";

export interface DataQualityReport {
  timestamp: string;
  totalRestaurants: number;
  averageScore: number;
  lowQualityRestaurants: Array<{id: string, name: string, score: number}>;
  potentialDuplicates: Array<{a: string, b: string, reason: string}>;
}

/**
 * Runs a full system scan for data quality
 */
export const runDailyDataQualityScan = async (): Promise<DataQualityReport> => {
  const restaurants = await restaurantApi.getAll();
  const reports: any[] = [];
  let totalScore = 0;
  
  const lowQualityRestaurants: Array<{id: string, name: string, score: number}> = [];

  for (const restaurant of restaurants) {
    // For a real daily scan, we might want to fetch locations and menu too
    // but for now we use what's in the restaurant object
    const validation = performFullValidation(restaurant, (restaurant as any).locations || []);
    totalScore += validation.overallScore;
    
    if (validation.overallScore < 70) {
      lowQualityRestaurants.push({
        id: restaurant.id,
        name: restaurant.name,
        score: validation.overallScore
      });
      
      // Log validation failure for monitoring
      await monitoringApi.logAction({
        target_id: restaurant.id,
        target_type: 'restaurant',
        action: 'validation_fail',
        performed_by: 'system_scanner',
        severity: 'warning',
        new_data: validation.core.issues
      });
    }
  }

  const duplicates = findPotentialDuplicates(restaurants);
  const potentialDuplicates = duplicates.map(d => ({
    a: d.a.name,
    b: d.b.name,
    reason: d.reason
  }));

  const report: DataQualityReport = {
    timestamp: new Date().toISOString(),
    totalRestaurants: restaurants.length,
    averageScore: restaurants.length > 0 ? Math.round(totalScore / restaurants.length) : 0,
    lowQualityRestaurants,
    potentialDuplicates
  };

  // In a real app, we would save this report to a database table 'data_quality_reports'
  console.log("Data Quality Report Generated:", report);
  
  return report;
};

/**
 * Verifies restaurant data against external API (Mock implementation)
 */
export const verifyWithExternalSource = async (restaurantId: string): Promise<{
  matches: boolean;
  diffs: string[];
}> => {
  const restaurant = await restaurantApi.getById(restaurantId);
  if (!restaurant) return { matches: false, diffs: ['Restaurant not found'] };

  // Mocking external API (e.g. Google Places)
  // In reality, this would call a real API
  const externalData = {
    name: restaurant.name,
    address: restaurant.locations?.[0]?.address || '',
    phone: (restaurant.locations?.[0]?.contact_info as any)?.phone || ''
  };

  const diffs: string[] = [];
  // Randomly simulate some differences for demonstration
  if (Math.random() > 0.8) diffs.push('Address mismatch with Google Places');
  if (Math.random() > 0.9) diffs.push('Phone number mismatch with official records');

  return {
    matches: diffs.length === 0,
    diffs
  };
};
