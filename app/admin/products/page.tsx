import { AccessModel } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createProductAction, toggleProductActiveAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login?callbackUrl=/admin/products");
    }

    return (
      <section className="surface rounded-2xl p-6">
        <h1 className="font-display text-3xl font-semibold text-slate-900">Admin access required</h1>
        <p className="mt-3 text-sm text-slate-600">
          This page is restricted to ZoKorp admin accounts listed in{" "}
          <span className="font-mono">ZOKORP_ADMIN_EMAILS</span>.
        </p>
      </section>
    );
  }

  const products = await db.product.findMany({
    include: {
      _count: {
        select: { prices: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold text-slate-900">Admin: Products</h1>
      <nav className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
        <Link href="/admin/products" className="rounded-full border border-slate-300 bg-white px-3 py-1">
          Products
        </Link>
        <Link href="/admin/prices" className="rounded-full border border-slate-300 bg-white px-3 py-1">
          Prices
        </Link>
        <Link href="/admin/service-requests" className="rounded-full border border-slate-300 bg-white px-3 py-1">
          Service Requests
        </Link>
      </nav>

      <section className="surface rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Create Product</h2>
        <form action={createProductAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <input
            name="slug"
            required
            placeholder="slug (e.g. zokorp-validator)"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="name"
            required
            placeholder="Product name"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <textarea
            name="description"
            required
            placeholder="Description"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm md:col-span-2"
          />
          <select
            name="accessModel"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={AccessModel.FREE}
          >
            {Object.values(AccessModel).map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="focus-ring rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create
          </button>
        </form>
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Existing Products</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {products.map((product) => (
            <li
              key={product.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-3"
            >
              <div>
                <span className="font-medium">{product.name}</span>
                <span className="ml-2 text-slate-500">/{product.slug}</span>
                <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{product.accessModel}</span>
                <span className="ml-2 text-xs text-slate-500">{product._count.prices} prices</span>
              </div>
              <form action={toggleProductActiveAction}>
                <input type="hidden" name="productId" value={product.id} />
                <button
                  type="submit"
                  className={`focus-ring rounded-md px-3 py-1.5 text-xs font-semibold ${
                    product.active
                      ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {product.active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
