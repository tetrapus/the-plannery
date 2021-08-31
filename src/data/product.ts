import firebase from "firebase";
import Ingredient, { normaliseIngredient } from "./ingredients";

export interface Product {
  TileID: number;
  Stockcode: number;
  Barcode: string;
  GtinFormat: number;
  CupPrice: number;
  InstoreCupPrice: string;
  CupMeasure: string;
  CupString: string;
  InstoreCupString: string;
  HasCupPrice: boolean;
  InstoreHasCupPrice: boolean;
  Price: number;
  InstorePrice: number;
  Name: string;
  DisplayName: null | string;
  UrlFriendlyName: string;
  Description: string;
  SmallImageFile: string;
  MediumImageFile: string;
  LargeImageFile: string;
  IsNew: boolean;
  IsOnSpecial: boolean;
  InstoreIsOnSpecial: boolean;
  IsEdrSpecial: boolean;
  SavingsAmount: number;
  InstoreSavingsAmount: number;
  WasPrice: number;
  InstoreWasPrice: number;
  QuantityInTrolley: number;
  Unit: string;
  MinimumQuantity: number;
  HasBeenBoughtBefore: boolean;
  IsInTrolley: boolean;
  Source: string;
  SupplyLimit: number;
  MaxSupplyLimitMessage: null | string;
  IsRanged: boolean;
  IsInStock: boolean;
  PackageSize: string;
  IsPmDelivery: boolean;
  IsForCollection: boolean;
  IsForDelivery: boolean;
  IsForExpress: boolean;
  ProductRestrictionMessage: null | string;
  ProductWarningMessage: null | string;
  IsCentreTag: boolean;
  HeaderTag: null;
  HasHeaderTag: boolean;
  UnitWeightInGrams: number;
  SupplyLimitMessage: string;
  SmallFormatDescription: string;
  FullDescription: string;
  IsAvailable: boolean;
  InstoreIsAvailable: boolean;
  IsPurchasable: boolean;
  InstoreIsPurchasable: boolean;
  AgeRestricted: boolean;
  DisplayQuantity: number | null;
  RichDescription: string;
  IsDeliveryPass: boolean;
  HideWasSavedPrice: boolean;
  SapCategories: null;
  Brand: string | null;
  IsRestrictedByDeliveryMethod: boolean;
  IsBundle: boolean;
  IsInFamily: boolean;
  UrlOverride: null;
  AdditionalAttributes: { [key: string]: any };
  DetailsImagePaths: string[];
  Variety: null;
  Rating: {
    ReviewCount: number;
    RatingCount: number;
    RatingSum: number;
    OneStarCount: number;
    TwoStarCount: number;
    ThreeStarCount: number;
    FourStarCount: number;
    FiveStarCount: number;
    Average: number;
    OneStarPercentage: number;
    TwoStarPercentage: number;
    ThreeStarPercentage: number;
    FourStarPercentage: number;
    FiveStarPercentage: number;
  };
  HasProductSubs: boolean;
  IsSponsoredAd: boolean;
  AdID: null;
  AdIndex: null;
  IsMarketProduct: boolean;
  ThirdPartyProductInfo: null;
  MarketFeatures: null;
  MarketSpecifications: null;
}

export type TrolleyItem = Product & {
  Quantity: number;
  ListPrice: number;
  SalePrice: number;
  UnitSalePrice: number;
  Updated: string;
  MatchedPromotions: any[];
  MissedPromotions: any[];
  IsRestricted: boolean;
  Discount: number;
  DeferredDiscount: number;
  IsFrozen: boolean;
  IsBundleProduct: boolean;
  BundleProductQuantity: number;
};

export function normaliseProduct(product: Product, ingredient: Ingredient) {
  const [qty, unit] =
    product.Unit === "Each"
      ? product.PackageSize.match(/^(\d+)(.+)$/)?.slice(1, 3) || ["1", "each"]
      : ["1", product.Unit.toLowerCase()];
  return normaliseIngredient({
    ...ingredient,
    qty: parseInt(qty),
    unit: unit.toLowerCase(),
  });
}

export function isConvertible(
  product: Ingredient | undefined,
  ingredient: Ingredient | undefined
) {
  return (
    product !== undefined &&
    ingredient !== undefined &&
    product?.unit === ingredient?.unit
  );
}

export interface ProductConversions {
  [stockcode: string]: {
    ref: firebase.firestore.DocumentReference;
    id: string;
    conversions: { [unit: string]: number };
  };
}
