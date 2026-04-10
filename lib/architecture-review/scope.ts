import type {
  ArchitectureConcreteProvider,
  ArchitecturePlatform,
  ArchitectureProvider,
  ArchitectureReviewScope,
} from "@/lib/architecture-review/types";

const CONCRETE_PROVIDER_ORDER: ArchitectureConcreteProvider[] = ["aws", "azure", "gcp"];
const PLATFORM_ORDER: ArchitecturePlatform[] = ["snowflake"];

function uniqueOrdered<T extends string>(values: readonly T[], order: readonly T[]) {
  const set = new Set(values);
  return order.filter((value) => set.has(value));
}

export function resolveArchitectureReviewScope(input: {
  provider: ArchitectureProvider;
  additionalProviders?: ArchitectureConcreteProvider[] | null;
  additionalPlatforms?: ArchitecturePlatform[] | null;
}): ArchitectureReviewScope {
  const additionalProviders = uniqueOrdered(input.additionalProviders ?? [], CONCRETE_PROVIDER_ORDER);
  const additionalPlatforms = uniqueOrdered(input.additionalPlatforms ?? [], PLATFORM_ORDER);

  const providers =
    input.provider === "multi"
      ? additionalProviders
      : uniqueOrdered([input.provider, ...additionalProviders], CONCRETE_PROVIDER_ORDER);

  return {
    primaryProvider: input.provider,
    providers,
    additionalProviders,
    platforms: additionalPlatforms,
    additionalPlatforms,
  };
}

export function reviewScopeLabel(scope: Pick<ArchitectureReviewScope, "primaryProvider" | "providers" | "platforms">) {
  const cloudLabel =
    scope.primaryProvider === "multi"
      ? "Multi-cloud"
      : scope.primaryProvider === "aws"
        ? "AWS"
        : scope.primaryProvider === "azure"
          ? "Azure"
          : "GCP";

  if (scope.platforms.length === 0) {
    return cloudLabel;
  }

  const platformLabels = scope.platforms.map((platform) => (platform === "snowflake" ? "Snowflake" : platform));
  return `${cloudLabel} + ${platformLabels.join(", ")}`;
}

export function isExpandedReviewScope(scope: Pick<ArchitectureReviewScope, "providers" | "platforms">) {
  return scope.providers.length > 1 || scope.platforms.length > 0;
}

export function selectedCatalogCount(scope: Pick<ArchitectureReviewScope, "providers" | "platforms">) {
  return scope.providers.length + scope.platforms.length;
}
