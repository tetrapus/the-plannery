interface LoggedInWoolworthsAccount {
  ConfigRequest: {
    ContextExpiryPeriod: number;
    SiteShortName: string;
    CurrentVersion: string;
    RichRelevanceRequestUrl: string;
    RichRelevanceApiKey: string;
    DefaultProductImage: string;
    DefaultProductImageSmall: string;
    JwtsEnabled: boolean;
    JwtExpiryMinutes: number;
  };
  GetDeliveryInfoRequest: {
    DeliveryMethod: string;
    Address: {
      AddressId: number;
      AddressText: string;
      IsPrimary: boolean;
      PostalCode: string;
      Street1: string;
      Street2: string;
      SuburbId: number;
      SuburbName: string;
      IsPartner: boolean;
      PartnerBranchId: null;
      AreaId: number;
      State: string;
    };
    TrolleyTarget: {
      AreaTarget: string;
      TargetId: null;
      AreaIdForNonServiced: null;
      TradingAccount: null;
    };
    CurrentDateAtFulfilmentStore: string;
    ReservedDate: {
      Date: null;
      DateLongText: null;
      DateText: null;
      AbsoluteDateText: null;
    };
    ReservedTime: {
      DeliveryWindowId: number;
      Id: number;
      TimeWindow: null;
      StartDateTime: null;
      EndDateTime: null;
      MinutesToCutOff: number;
    };
    IsDeliveryPlusEligible: boolean;
    DeliveryInstructions: string;
    PickupInstructions: string;
    IsNonServiced: boolean;
    IsExpress: boolean;
    IsSecondary: boolean;
    IsCrowdSourced: boolean;
    CanLeaveUnattended: boolean;
    MarketDeliveryDetails: { ThirdPartyVendorDeliveryInfoList: never[] };
    WindowFeeStructureId: number;
  };
  LatestFulfilledInvoiceRequest: {
    Invoice: {
      InvoiceId: number;
      CollectionDate: string;
      CollectionType: string;
      StoreName: string;
      Address: string;
      Total: number;
    };
  };
  ListSavedListsRequest: {
    Response: {
      ListId: number;
      Name: string;
      ProductsCount: number;
      Timestamp: number;
      IsDefault: boolean;
      IsRewards: boolean;
    }[];
    IsServiceAvailable: boolean;
  };
  ShopperRequest: {
    AllowRestrictedDepartment: boolean;
    OrderCount: number;
    MarketOrderCount: number;
    FirstName: string;
    Email: string;
    Id: number;
    IsGuest: boolean;
    ABN: string;
    RichRelevanceSessionId: string;
    FulfilmentStoreId: number;
    ActiveDeliverySaverExpiryDate: null;
    ShopperStatusId: number;
    MfaRequired: boolean;
    DateCreated: string;
  };
  ShopperDetailsRequest: {
    Age: number;
    AllowRestrictedDepartment: boolean;
    EmailOptIn: boolean;
    SMSOptIn: boolean;
    SamplesOptIn: boolean;
    EmailWidgetOptIn: boolean;
    PaypalDetails: null;
    Location: null;
    ShopperStatusId: number;
    RewardsCardNumber: string;
    ActiveDeliverySaverExpiryDate: null;
    DeliverySaverType: null;
    DeliveryPlus: {
      Status: string;
      EndingDate: string;
      MinimumOrderAmount: number;
      IsFreeTrialEligible: boolean;
      SubscriberType: string;
      IsAnyDay: boolean;
      IsMidweek: boolean;
      BillingFrequencyMonths: number;
    };
    Crn: null;
    EntityName: string;
    IsRegisteredForDirectDebit: boolean;
    IsAgent: boolean;
    RewardsType: string;
    IsExistingShopper: boolean;
    IsEligibleForStaffDiscount: boolean;
    AuthenticationMethod: string;
    Address: {
      AddressId: number;
      AddressText: null;
      IsPrimary: boolean;
      PostalCode: string;
      Street1: null;
      Street2: null;
      SuburbId: number;
      SuburbName: string;
      IsPartner: boolean;
      PartnerBranchId: null;
      AreaId: number;
      State: string;
    };
    IsBusinessAccount: boolean;
    OrganisationId: null;
    BusinessCategoryId: null;
    BusinessPrimaryCategory: null;
    BusinessSecondaryCategory: null;
    AccountManagerId: null;
    FranchiseLinkName: null;
    Id: number;
    FirstName: string;
    IsGuest: boolean;
    LastName: string;
    DateOfBirth: string;
    Email: string;
    Phone: string;
    MobilePhone: string;
    SecondaryPhone: string;
    CompanyName: string;
    ABN: string;
    Title: string;
    TypeOfBusiness: string;
    JobTitle: string;
    DateOfBirthInput: string;
    OrderCount: number;
    MarketOrderCount: number;
    IsOneLogin: null;
    HasOneLoginRewardsEntitlement: boolean;
    HasActivatedRewardsOneLogin: boolean;
    NeedsRewardsActivation: boolean;
  };
  ShopperPreferencesRequest: {
    DefaultAllSubstitutions: boolean;
    AllowAutomaticBannerRotation: boolean;
    EnablePredictiveTextOnSearch: boolean;
    OptInCatalogue: boolean;
    OptInEmail: boolean;
    OptInSms: boolean;
    OptInFreeSamples: boolean;
    ListViewLayout: string;
    ListViewGroupBy: boolean;
    ListViewVisited: boolean;
    ListViewGroupByVisited: boolean;
    DeliveryPlusCancelledNotificationDisabled: boolean;
    HasDoneRewardsOnboarding: boolean;
    HasDoneRewardsActivation: boolean;
    HasDoneCheckoutOnboarding: boolean;
    PastShopPurchaseBy: string;
    PastShopPurchaseByVisited: boolean;
    HasOptInTwoFactorAuthentication: boolean;
    IsSecurityTabVisited: boolean;
    ShouldConfirmTradingAccount: boolean;
    RedeemRewardsCredits: boolean;
    HideScanAndWinMessage: boolean;
    EnableAccessibleMenu: boolean;
    FulfilmentSelectorStepStartShoppingEnabled: boolean;
    HasDoneOnboarding: boolean;
    HasDismissedRegionalNotification: boolean;
    LastViewFulfilmentSelector: string;
  };
  TrolleyRequest: {
    Totals: {
      Total: number;
      SubTotal: number;
      TotalSavings: number;
      WoolworthsTotal: number;
      WoolworthsSubTotal: number;
      WoolworthsDiscountableSubTotal: number;
      MarketTotal: number;
      MarketSubTotal: number;
    };
    AvailableItems: never[];
    UnavailableItems: never[];
    UnavailableByMarketOutOfStockItems: never[];
    RestrictedItems: never[];
    RecentlyAddedItems: never[];
    BundleItems: never[];
    RestrictedByDeliveryMethodItems: never[];
    RestrictedByDeliPlattersItems: never[];
    ExceededSupplyLimitItems: never[];
    DeliveryFee: { Total: number };
    MarketShippingFees: {
      Total: number;
      MarketShippingFee: number;
      MarketShippingFeeBeforeDiscount: number;
      MarketShippingFeeDiscount: number;
      Promotions: never[];
    };
    MarketDeliveryDetails: { ThirdPartyVendorDeliveryInfoList: never[] };
    PotentialOrderPromotions: {
      MinimumOrderValue: number;
      DiscountType: string;
      AwardValue: number;
      Amount: null;
      OfferId: string;
      DiscountSourceId: string;
      Target: string;
    }[];
    Message: null;
    RestrictedByDeliveryMethodMessage: null;
    RestrictedByDeliPlattersMessage: null;
    RestrictedByDeliveryWindowMessage: null;
    ProductGroupSupplyLimitWindowWarningMessage: null;
    TrolleyItemCount: number;
    TotalTrolleyItemQuantity: number;
    MaximumOrderQuantity: number;
    ShopperDeliveryPassPromptResponse: {
      ShowPrompt: string;
      HeaderText: string;
      ContentText: string;
      PromptText: string;
    };
    WowRewardsSummary: {
      WowRewardsToSpend: number;
      WowRewardsEarned: number;
      IsWowRewardsCardRegistered: boolean;
      IsErrorInGettingWowRewardsBalance: boolean;
      HasValidWowRewardsCard: boolean;
      SaveForLaterPreference: string;
      SaveForLaterQffPoints: string;
      IsLessThanMinimumRedemptionBalance: boolean;
      RewardsCredits: null;
      TotalRewardsPointsEarned: number;
    };
    TaxRate: number;
    Boosted: boolean;
  };
}

interface LoggedOutWoolworthsAccount {
  ConfigRequest: {
    ContextExpiryPeriod: number;
    SiteShortName: string;
    CurrentVersion: string;
    RichRelevanceRequestUrl: string;
    RichRelevanceApiKey: string;
    DefaultProductImage: string;
    DefaultProductImageSmall: string;
    JwtsEnabled: boolean;
    JwtExpiryMinutes: number;
  };
  GetDeliveryInfoRequest: {
    DeliveryMethod: null;
    Address: null;
    TrolleyTarget: {
      AreaTarget: string;
      TargetId: null;
      AreaIdForNonServiced: null;
      TradingAccount: null;
    };
    CurrentDateAtFulfilmentStore: string;
    ReservedDate: {
      Date: null;
      DateLongText: null;
      DateText: null;
      AbsoluteDateText: null;
    };
    ReservedTime: {
      DeliveryWindowId: number;
      Id: number;
      TimeWindow: null;
      StartDateTime: null;
      EndDateTime: null;
      MinutesToCutOff: number;
    };
    IsDeliveryPlusEligible: boolean;
    DeliveryInstructions: string;
    PickupInstructions: string;
    IsNonServiced: boolean;
    IsExpress: boolean;
    IsSecondary: boolean;
    IsCrowdSourced: boolean;
    CanLeaveUnattended: boolean;
    MarketDeliveryDetails: { ThirdPartyVendorDeliveryInfoList: never[] };
    WindowFeeStructureId: number;
  };
  LatestFulfilledInvoiceRequest: { Invoice: null };
  ListSavedListsRequest: { Response: never[]; IsServiceAvailable: boolean };
  ShopperRequest: {
    AllowRestrictedDepartment: boolean;
    OrderCount: number;
    MarketOrderCount: number;
    FirstName: null;
    Email: null;
    Id: number;
    IsGuest: boolean;
    ABN: null;
    RichRelevanceSessionId: string;
    FulfilmentStoreId: number;
    ActiveDeliverySaverExpiryDate: null;
    ShopperStatusId: null;
    MfaRequired: boolean;
    DateCreated: null;
  };
  TrolleyRequest: {
    Totals: {
      Total: number;
      SubTotal: number;
      TotalSavings: number;
      WoolworthsTotal: number;
      WoolworthsSubTotal: number;
      WoolworthsDiscountableSubTotal: number;
      MarketTotal: number;
      MarketSubTotal: number;
    };
    AvailableItems: never[];
    UnavailableItems: never[];
    UnavailableByMarketOutOfStockItems: never[];
    RestrictedItems: never[];
    RecentlyAddedItems: never[];
    BundleItems: never[];
    RestrictedByDeliveryMethodItems: never[];
    RestrictedByDeliPlattersItems: never[];
    ExceededSupplyLimitItems: never[];
    DeliveryFee: { Total: number };
    MarketShippingFees: {
      Total: number;
      MarketShippingFee: number;
      MarketShippingFeeBeforeDiscount: number;
      MarketShippingFeeDiscount: number;
      Promotions: never[];
    };
    MarketDeliveryDetails: { ThirdPartyVendorDeliveryInfoList: never[] };
    PotentialOrderPromotions: {
      MinimumOrderValue: number;
      DiscountType: string;
      AwardValue: number;
      Amount: null;
      OfferId: string;
      DiscountSourceId: string;
      Target: string;
    }[];
    Message: null;
    RestrictedByDeliveryMethodMessage: null;
    RestrictedByDeliPlattersMessage: null;
    RestrictedByDeliveryWindowMessage: null;
    ProductGroupSupplyLimitWindowWarningMessage: null;
    TrolleyItemCount: number;
    TotalTrolleyItemQuantity: number;
    MaximumOrderQuantity: number;
    ShopperDeliveryPassPromptResponse: {
      ShowPrompt: string;
      HeaderText: string;
      ContentText: string;
      PromptText: string;
    };
    WowRewardsSummary: {
      WowRewardsToSpend: number;
      WowRewardsEarned: number;
      IsWowRewardsCardRegistered: boolean;
      IsErrorInGettingWowRewardsBalance: boolean;
      HasValidWowRewardsCard: boolean;
      SaveForLaterPreference: string;
      SaveForLaterQffPoints: string;
      IsLessThanMinimumRedemptionBalance: boolean;
      RewardsCredits: null;
      TotalRewardsPointsEarned: number;
    };
    TaxRate: number;
    Boosted: boolean;
  };
}

export interface WoolworthsAccount {
  ShopperDetailsRequest?: LoggedInWoolworthsAccount.ShopperDetailsRequest;
}
