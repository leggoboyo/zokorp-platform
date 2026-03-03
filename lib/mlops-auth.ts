import { OrganizationRole, OnboardingMode, WorkspacePersona, type User } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";

const ORG_ROLE_PRIORITY: Record<OrganizationRole, number> = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function reserveUniqueOrgSlug(base: string) {
  const sanitized = slugify(base) || "zokorp-org";

  for (let suffix = 0; suffix < 50; suffix += 1) {
    const candidate = suffix === 0 ? sanitized : `${sanitized}-${suffix + 1}`;

    const existing = await db.organization.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });

    if (!existing) {
      return candidate;
    }
  }

  const rand = Math.random().toString(36).slice(2, 8);
  return `${sanitized}-${rand}`;
}

function defaultOrgNameForUser(user: Pick<User, "email" | "name">) {
  if (user.name?.trim()) {
    return `${user.name.trim()} Workspace`;
  }

  if (user.email?.includes("@")) {
    const left = user.email.split("@")[0]?.replace(/[._-]/g, " ").trim();
    if (left) {
      const title = left
        .split(" ")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(" ");
      return `${title} Workspace`;
    }
  }

  return "ZoKorp Workspace";
}

export function hasOrgRole(actual: OrganizationRole, minimum: OrganizationRole) {
  return ORG_ROLE_PRIORITY[actual] >= ORG_ROLE_PRIORITY[minimum];
}

export async function ensureMlopsOrganizationForUser(user: User) {
  const membership = await db.organizationMember.findFirst({
    where: { userId: user.id },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (membership) {
    return membership;
  }

  const name = defaultOrgNameForUser(user);
  const slug = await reserveUniqueOrgSlug(name);

  const createdMembership = await db.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name,
        slug,
        onboardingMode: OnboardingMode.SELF_SERVE,
        workspacePersona: WorkspacePersona.TECH_LEAD,
        createdByUserId: user.id,
      },
    });

    const newMembership = await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: OrganizationRole.OWNER,
        workspacePersona: WorkspacePersona.TECH_LEAD,
      },
      include: {
        organization: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: user.id,
        organizationId: organization.id,
        action: "mlops.organization_created",
        metadataJson: {
          organizationSlug: organization.slug,
          onboardingMode: organization.onboardingMode,
        },
      },
    });

    return newMembership;
  });

  return createdMembership;
}

export async function requireMlopsContext(options?: {
  organizationSlug?: string;
  minimumRole?: OrganizationRole;
}) {
  const user = await requireUser();

  await ensureMlopsOrganizationForUser(user);

  const memberships = await db.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  if (memberships.length === 0) {
    throw new Error("FORBIDDEN");
  }

  let activeMembership = memberships[0];
  if (options?.organizationSlug) {
    const found = memberships.find((item) => item.organization.slug === options.organizationSlug);
    if (!found) {
      throw new Error("FORBIDDEN");
    }
    activeMembership = found;
  }

  if (options?.minimumRole && !hasOrgRole(activeMembership.role, options.minimumRole)) {
    throw new Error("FORBIDDEN");
  }

  return {
    user,
    memberships,
    membership: activeMembership,
    organization: activeMembership.organization,
  };
}

export async function listOrganizationsForUser() {
  const user = await requireUser();
  await ensureMlopsOrganizationForUser(user);

  return db.organizationMember.findMany({
    where: {
      userId: user.id,
    },
    include: {
      organization: true,
    },
    orderBy: {
      createdAt: "asc",
    },
  });
}

export async function createOrganizationForUser(input: {
  user: User;
  name: string;
  onboardingMode?: OnboardingMode;
  workspacePersona?: WorkspacePersona;
}) {
  const slug = await reserveUniqueOrgSlug(input.name);

  return db.$transaction(async (tx) => {
    const organization = await tx.organization.create({
      data: {
        name: input.name,
        slug,
        onboardingMode: input.onboardingMode ?? OnboardingMode.SELF_SERVE,
        workspacePersona: input.workspacePersona ?? WorkspacePersona.TECH_LEAD,
        createdByUserId: input.user.id,
      },
    });

    const membership = await tx.organizationMember.create({
      data: {
        organizationId: organization.id,
        userId: input.user.id,
        role: OrganizationRole.OWNER,
        workspacePersona: input.workspacePersona ?? WorkspacePersona.TECH_LEAD,
      },
      include: {
        organization: true,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: input.user.id,
        organizationId: organization.id,
        action: "mlops.organization_created",
        metadataJson: {
          organizationSlug: organization.slug,
          onboardingMode: organization.onboardingMode,
        },
      },
    });

    return membership;
  });
}
