import { ExternalCollectionFactory } from "./CollectionFactory";

export const PricesCollection = ExternalCollectionFactory<any[] | undefined>(
  "https://firebasestorage.googleapis.com/v0/b/the-plannery.appspot.com/o/products.json?alt=media&token=46c23aeb-0318-4640-981e-33d1b41f9387",
  undefined
);
