export interface MealPlanItem {
  ref: firebase.firestore.DocumentReference;
  slug: string;
  by: string;
}
export interface MealPlan {
  recipes: MealPlanItem[];
}
