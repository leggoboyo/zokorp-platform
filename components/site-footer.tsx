export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-slate-300 bg-white/72 backdrop-blur">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 md:grid-cols-3 md:px-6">
        <section>
          <p className="font-display text-xl font-semibold text-slate-900">ZoKorp</p>
          <p className="mt-2 max-w-xs text-sm text-slate-600">
            AWS-focused AI/ML delivery plus productized validation software for teams that need
            measurable outcomes.
          </p>
          <p className="mt-4 text-xs uppercase tracking-[0.12em] text-slate-500">Houston-based · Serving U.S. teams</p>
        </section>

        <section className="md:justify-self-center">
          <p className="font-semibold text-slate-900">Office</p>
          <p className="mt-2">Houston, TX 77479</p>
          <p>United States</p>
        </section>

        <section className="md:justify-self-end">
          <p className="font-semibold text-slate-900">Contact</p>
          <p className="mt-2">zkhawaja@zokorp.com</p>
          <p className="mt-3 text-xs text-slate-500">
            Terms, Privacy, and support workflows will be published before production launch.
          </p>
        </section>
      </div>
      <div className="section-divider mx-auto w-full max-w-7xl" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-slate-500 md:flex-row md:items-center md:justify-between md:px-6">
        <p>ZoKorp Platform MVP</p>
        <p>© {new Date().getFullYear()} ZoKorp. All rights reserved.</p>
      </div>
    </footer>
  );
}
