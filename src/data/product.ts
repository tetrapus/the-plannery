import firebase from "firebase";
import Ingredient, { normaliseIngredient } from "./ingredients";

export interface RichProduct {
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
  IsMarketProduct: boolean;
  ThirdPartyProductInfo: null;
  MarketFeatures: null;
  MarketSpecifications: null;
}

export interface BaseProduct {
  Unit: string;
  MinimumQuantity: number;
  SupplyLimit: number;
  Stockcode: number;
  PackageSize?: string;
}
export interface Product extends BaseProduct {
  Barcode: string;
  CupMeasure: string;
  CupPrice: number;
  CupString: string;
  HasCupPrice: boolean;
  IsAvailable: boolean;
  IsForCollection: boolean;
  IsForDelivery: boolean;
  IsForExpress: boolean;
  IsInStock: boolean;
  IsInTrolley: boolean;
  IsPmDelivery: boolean;
  IsPurchasable: boolean;
  IsRestrictedByDeliveryMethod: boolean;
  LargeImageFile: string;
  MediumImageFile: string;
  MinimumQuantity: number;
  Name: string;
  PackageSize: string;
  Price: number;
  QuantityInTrolley: number;
  SmallImageFile: string;
  Stockcode: number;
  SupplyLimit: number;
  Unit: string;
  UnitWeightInGrams: number;
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

export function normaliseProduct(product: BaseProduct, ingredient: Ingredient) {
  const [qty, unit] =
    product.Unit === "Each"
      ? product?.PackageSize?.match(/^(\d+)(.+)$/)?.slice(1, 3) || ["1", "each"]
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
    ref?: firebase.firestore.DocumentReference;
    id: string;
    conversions: { [unit: string]: number };
  };
}

export function convertIngredientToProduct(
  ingredient: Ingredient,
  product: BaseProduct, //Product,
  conversions: ProductConversions
) {
  const normalisedIngredient = normaliseIngredient(ingredient);
  const normalisedProduct = normaliseProduct(product, ingredient);
  const orderStep = product.Unit === "Each" ? 1 : 100;
  const getDefaultQty = (value?: number) =>
    Math.min(
      Math.max(
        Math.ceil((value || 0) * orderStep) / orderStep,
        product.MinimumQuantity
      ),
      product.SupplyLimit
    );
  let ratio =
    conversions[product.Stockcode]?.conversions[
      normalisedIngredient?.unit || "unit"
    ];
  const sameUnit = isConvertible(normalisedProduct, normalisedIngredient);
  if (!ratio && sameUnit) {
    ratio = normalisedProduct?.qty || 1;
  }

  const estimatedAmount = ratio
    ? (normalisedIngredient?.qty || 0) / ratio
    : ["ml", "g"].includes(normalisedIngredient?.unit || "")
    ? 1
    : normalisedIngredient?.qty || 1;

  const requiredAmount = getDefaultQty(estimatedAmount);

  return { requiredAmount, ratio };
}

export function trimProduct(product: Product): Product {
  const {
    Stockcode,
    Barcode,
    CupPrice,
    CupMeasure,
    CupString,
    HasCupPrice,
    Price,
    Name,
    SmallImageFile,
    MediumImageFile,
    LargeImageFile,
    QuantityInTrolley,
    Unit,
    MinimumQuantity,
    IsInTrolley,
    SupplyLimit,
    IsInStock,
    PackageSize,
    IsPmDelivery,
    IsForCollection,
    IsForDelivery,
    IsForExpress,
    UnitWeightInGrams,

    IsAvailable,
    IsPurchasable,

    IsRestrictedByDeliveryMethod,
  } = product;
  return {
    Stockcode,
    Barcode,
    CupPrice,
    CupMeasure,
    CupString,
    HasCupPrice,
    Price,
    Name,
    SmallImageFile,
    MediumImageFile,
    LargeImageFile,
    QuantityInTrolley,
    Unit,
    MinimumQuantity,
    IsInTrolley,
    SupplyLimit,
    IsInStock,
    PackageSize,
    IsPmDelivery,
    IsForCollection,
    IsForDelivery,
    IsForExpress,
    UnitWeightInGrams,

    IsAvailable,
    IsPurchasable,

    IsRestrictedByDeliveryMethod,
  };
}

export function compact<T extends object>(
  obj: T
): Partial<{ [Prop in keyof T]: Partial<T[Prop]> | T[Prop] }> {
  return Object.fromEntries(
    Object.entries(obj)
      .filter(([key, value]) => value !== null)
      .map(([key, value]) => [
        key,
        value instanceof Object ? compact(value) : value,
      ])
  ) as any;
}
