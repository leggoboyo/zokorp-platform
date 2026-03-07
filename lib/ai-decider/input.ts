import { AI_DECIDER_BLOCKED_EMAIL_DOMAINS } from "@/lib/ai-decider/config";
import { getEmailDomain } from "@/lib/security";

const blockedDomains = new Set<string>(AI_DECIDER_BLOCKED_EMAIL_DOMAINS);

export function isAllowedAiDeciderBusinessEmail(email: string) {
  const domain = getEmailDomain(email);
  if (!domain) {
    return false;
  }

  return !blockedDomains.has(domain);
}

export function normalizeAiDeciderWebsite(website: string) {
  const trimmed = website.trim();
  if (!trimmed) {
    return "";
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}
