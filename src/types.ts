export type GradeType = 'A+' | 'A' | 'B' | 'C' | 'D' | 'E';

export type RiskLevelType =
  | 'Very Healthy'
  | 'Healthy'
  | 'Moderate'
  | 'Unhealthy'
  | 'Avoid Frequently';

export type ScanMode = 'photo' | 'upload';

export interface PopulationSuitability {
  forChildren: boolean;
  childrenNotes: string;
  forDiabetics: boolean;
  diabeticNotes: string;
  forPregnant: boolean;
  pregnantNotes: string;
  forElderly: boolean;
  elderlyNotes: string;
  forGym: boolean;
  gymNotes: string;
}

export interface FoodAlternative {
  name: string;
  reason: string;
}

export interface FoodScan {
  id?: string;
  userId: string;
  productName: string;
  brand: string;
  barcode?: string;
  healthScore: number;
  grade: GradeType;
  riskLevel: RiskLevelType;
  calories: string;
  protein: string;
  fat: string;
  sugar: string;
  salt: string;
  fiber: string;
  carbohydrates: string;
  servingSize: string;
  ingredients: string[];
  artificialColors: string[];
  preservatives: string[];
  artificialSweeteners: string[];
  additives: string[];
  allergens: string[];
  suitability: PopulationSuitability;
  goodPoints: string[];
  badPoints: string[];
  warnings: string[];
  benefits: string[];
  dailyAdvice: string;
  alternatives: FoodAlternative[];
  summary: string;
  imageUrl?: string;
  createdAt: string;
  isFavorite: boolean;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
}

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  totalScans: number;
  healthyScansCount: number;
  unhealthyScansCount: number;
  dietaryPreferences?: string[];
  achievements?: Achievement[];
  createdAt: string;
}