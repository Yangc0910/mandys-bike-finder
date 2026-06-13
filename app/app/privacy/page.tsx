import type { Metadata } from "next";

import PrivacyContent from "./PrivacyContent";

export const metadata: Metadata = {
  title: "Privacy Policy | Mandy's Bike Finder",
  description: "Privacy policy for Mandy's Bike Finder App Store MVP.",
};

export default function PrivacyPage() {
  return <PrivacyContent />;
}
