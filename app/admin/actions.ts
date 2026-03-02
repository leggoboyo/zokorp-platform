"use server";

import { AccessModel, PriceKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

const createProductSchema = z.object({
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  name: z.string().min(3),
  description: z.string().min(10),
  accessModel: z.nativeEnum(AccessModel),
});

const createPriceSchema = z.object({
  productSlug: z.string().min(3),
  stripePriceId: z.string().min(3),
  kind: z.nativeEnum(PriceKind),
  amount: z.coerce.number().int().positive(),
  creditsGranted: z.coerce.number().int().nonnegative().default(1),
});

function revalidateAdminViews() {
  revalidatePath("/");
  revalidatePath("/software");
  revalidatePath("/software/[slug]", "page");
  revalidatePath("/admin/products");
  revalidatePath("/admin/prices");
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const parsed = createProductSchema.safeParse({
    slug: formData.get("slug"),
    name: formData.get("name"),
    description: formData.get("description"),
    accessModel: formData.get("accessModel"),
  });

  if (!parsed.success) {
    throw new Error("Invalid product form values");
  }

  await db.product.create({
    data: {
      slug: parsed.data.slug,
      name: parsed.data.name,
      description: parsed.data.description,
      accessModel: parsed.data.accessModel,
      active: true,
    },
  });

  revalidateAdminViews();
}

export async function createPriceAction(formData: FormData) {
  await requireAdmin();

  const parsed = createPriceSchema.safeParse({
    productSlug: formData.get("productSlug"),
    stripePriceId: formData.get("stripePriceId"),
    kind: formData.get("kind"),
    amount: formData.get("amount"),
    creditsGranted: formData.get("creditsGranted"),
  });

  if (!parsed.success) {
    throw new Error("Invalid price form values");
  }

  const product = await db.product.findUnique({
    where: { slug: parsed.data.productSlug },
    select: { id: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await db.price.create({
    data: {
      productId: product.id,
      stripePriceId: parsed.data.stripePriceId,
      kind: parsed.data.kind,
      amount: parsed.data.amount,
      creditsGranted: parsed.data.creditsGranted,
      currency: "usd",
      active: true,
    },
  });

  revalidateAdminViews();
}

export async function toggleProductActiveAction(formData: FormData) {
  await requireAdmin();

  const productId = String(formData.get("productId") ?? "");
  if (!productId) {
    throw new Error("Missing product id");
  }

  const product = await db.product.findUnique({
    where: { id: productId },
    select: { active: true },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  await db.product.update({
    where: { id: productId },
    data: { active: !product.active },
  });

  revalidateAdminViews();
}

export async function togglePriceActiveAction(formData: FormData) {
  await requireAdmin();

  const priceId = String(formData.get("priceId") ?? "");
  if (!priceId) {
    throw new Error("Missing price id");
  }

  const price = await db.price.findUnique({
    where: { id: priceId },
    select: { active: true },
  });

  if (!price) {
    throw new Error("Price not found");
  }

  await db.price.update({
    where: { id: priceId },
    data: { active: !price.active },
  });

  revalidateAdminViews();
}
