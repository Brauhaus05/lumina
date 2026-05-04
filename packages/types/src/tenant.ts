export interface ThemeConfig {
  colors: {
    primary: string;
    background: string;
    text: string;
    accent?: string;
  };
  typography: {
    fontFamily: string;
    fontSize: string;
  };
  logoUrl?: string;
}

export interface SeoMetadata {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: 'summary' | 'summary_large_image';
  canonicalUrl?: string;
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
  api_key: string;
}

export interface TenantSettings {
  tenant_id: string;
  theme_config: ThemeConfig;
  seo_metadata: SeoMetadata;
}
