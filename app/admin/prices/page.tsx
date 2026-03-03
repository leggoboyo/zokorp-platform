import { PriceKind } from "@prisma/client";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createPriceAction, togglePriceActiveAction } from "@/app/admin/actions";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

function isRealStripePriceId(value: string) {
  return value.startsWith("price_");
}

export default async function AdminPricesPage() {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      redirect("/login?callbackUrl=/admin/prices");
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

  const [prices, products] = await Promise.all([
    db.price.findMany({
      include: { product: true },
      orderBy: { createdAt: "desc" },
    }),
    db.product.findMany({
      where: { active: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-semibold text-slate-900">Admin: Prices</h1>
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
        <h2 className="text-lg font-semibold">Create Price</h2>
        <p className="mt-2 text-sm text-slate-600">
          Use the real Stripe <span className="font-mono">price_...</span> identifier from test mode.
        </p>
        <form action={createPriceAction} className="mt-4 grid gap-3 md:grid-cols-2">
          <select
            name="productSlug"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
            required
          >
            {products.map((product) => (
              <option key={product.id} value={product.slug}>
                {product.name} ({product.slug})
              </option>
            ))}
          </select>
          <input
            name="stripePriceId"
            required
            placeholder="price_123..."
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            name="kind"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
            defaultValue={PriceKind.CREDIT_PACK}
          >
            {Object.values(PriceKind).map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </select>
          <input
            name="amount"
            type="number"
            required
            min={1}
            placeholder="amount in cents (e.g. 5000)"
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            name="creditsGranted"
            type="number"
            required
            min={0}
            defaultValue={1}
            className="focus-ring rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
          <button
            type="submit"
            className="focus-ring rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
          >
            Create
          </button>
        </form>
      </section>

      <section className="surface rounded-2xl p-5">
        <h2 className="text-lg font-semibold">Existing Prices</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {prices.map((price) => (
            <li
              key={price.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-slate-200 px-3 py-3"
            >
              <div>
                <span className="font-medium">{price.product.name}</span>
                <span className="ml-2 rounded bg-slate-100 px-2 py-0.5 text-xs">{price.kind}</span>
                <span className="ml-2 text-slate-700">${(price.amount / 100).toFixed(2)}</span>
                <span className="ml-2 text-slate-500">{price.stripePriceId}</span>
                {!isRealStripePriceId(price.stripePriceId) ? (
                  <span className="ml-2 rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800">
                    Placeholder ID
                  </span>
                ) : null}
              </div>
              <form action={togglePriceActiveAction}>
                <input type="hidden" name="priceId" value={price.id} />
                <button
                  type="submit"
                  className={`focus-ring rounded-md px-3 py-1.5 text-xs font-semibold ${
                    price.active
                      ? "border border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100"
                      : "border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  {price.active ? "Deactivate" : "Activate"}
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
