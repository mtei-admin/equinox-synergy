export const CMS_ASSETS_BUCKET = "cms-assets";

export const CMS_ASSET_CATEGORIES = [
  "manual",
  "marketing",
  "label",
  "other",
] as const;

export type CmsAssetCategory = (typeof CMS_ASSET_CATEGORIES)[number];

export const SIGNED_URL_TTL_SECONDS = 60 * 60;
