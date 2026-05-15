export type CrmProvider = "salesforce";

export type CrmLeadInput = {
  email: string;
  recipientName?: string;
  leadSource?: string;
  productInterest?: string;
  marketingConsent: boolean;
  childAge?: string;
  childHeight?: string;
  bikeType?: string;
  askingPrice?: string;
  location?: string;
  distance?: string;
  dealScore?: string;
  recommendation?: string;
  reportId?: string;
  reportCreatedAt?: string;
  appBaseUrl?: string;
};

export type CrmSyncResult =
  | {
      ok: true;
      status: "skipped";
      provider: "none" | CrmProvider;
      message: string;
    }
  | {
      ok: true;
      status: "synced";
      provider: CrmProvider;
      message: string;
      externalId?: string;
    }
  | {
      ok: false;
      status: "failed";
      provider: CrmProvider;
      message: string;
    };
