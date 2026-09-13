import type { ComponentProps, ReactNode } from "react";

/* Shared presentational pieces. None of them holds state or runs an effect, so
   each renders on the server or inside a client figure alike. (Entry lives in
   its own file: it settles itself, so it must be a client component, and
   keeping it separate stops that cost spreading to these.)

   A page is built from these and nothing hand-rolled in their place: one
   PageHeader, then Sections, with Plates for its figures. The pages used to
   set each of these by hand, and four copies of a page head had drifted into
   four different spacings under four different titles. */

export function Wrap({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    /* 53.5rem: the gutters plus exactly the leaf — a 10.5rem margin column, a
       3.5rem gap and the 36rem measure. At 58rem the page was eight rem wider
       than anything in it, so a text column capped at the measure sat hard
       against the left of a half-empty sheet. Tighter gutters on phones: at
       28px a side the measure fell to 37 characters, under the comfortable
       range. */
    <div className={`mx-auto w-full max-w-[53.5rem] px-5 sm:px-7 ${className}`}>
      {children}
    </div>
  );
}

/**
 * The head of a page: which page it is, its title, and the few lines under the
 * title that say what the page is for.
 */
export function PageHeader({
  kicker,
  title,
  display = false,
  pageName = false,
  aside,
  id,
  rail,
  children,
}: {
  /** The letterspaced caps above the title, naming the page. */
  kicker?: string;
  title: ReactNode;
  /** Set at display size — the front page's greeting, which is not a title. */
  display?: boolean;
  /** The title is Amin's name, so the masthead holds its own copy back while
      this one is on screen. */
  pageName?: boolean;
  /** Set beside the heading where there is room for it: the portrait. */
  aside?: ReactNode;
  id?: string;
  /** Names the head in the margin rail, on a page whose first heading comes
      some way down. Needs `id`. */
  rail?: string;
  children?: ReactNode;
}) {
  const text = (
    <div>
      {kicker && <p className="label text-ink-faint">{kicker}</p>}
      <h1
        data-page-name={pageName || undefined}
        className={`${kicker ? "mt-2 " : ""}${
          display ? "text-display tracking-[-0.028em]" : "text-title"
        }`}
      >
        {title}
      </h1>
      {children && <div className="mt-8 max-w-measure">{children}</div>}
    </div>
  );

  return (
    <header id={id} data-rail={rail} className="page-head">
      <Wrap>
        {aside ? (
          <div className="grid items-start gap-[clamp(2.5rem,6vw,4rem)] md:grid-cols-[minmax(0,1fr)_15.5rem] md:gap-18">
            {text}
            {aside}
          </div>
        ) : (
          text
        )}
      </Wrap>
    </header>
  );
}

/** "Selected projects" → "selected-projects". */
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

/**
 * One part of a page, and the only thing that spaces one part from the next.
 *
 * A section with a title opens on the section rule, and that rule is the whole
 * of the boundary: no fleuron before it and no entry rule under it. The pages
 * used to stack all three — a fleuron, the numeral's rule and the first entry's
 * rule inside a hundred and fifty pixels, with three hundred pixels of padding
 * around them — and a reader could no longer tell which of the lines meant a
 * new section.
 */
export function Section({
  id,
  num,
  title,
  rail,
  children,
}: {
  /** Overrides the id taken from the title (/research#current-work), or names
      a section that has no title. */
  id?: string;
  num?: string;
  title?: string;
  /** Names an untitled section in the margin rail. Needs `id`. */
  rail?: string;
  children: ReactNode;
}) {
  /* Every titled section is a link target whether or not anyone asked for one:
     the margin rail points at these headings, and a section that cannot be
     linked to cannot be pointed at either. */
  const named = id ?? (title ? slug(title) : undefined);

  return (
    <section
      id={title ? undefined : named}
      data-rail={title ? undefined : rail}
      className="py-section"
    >
      <Wrap>
        {title && (
          /* The numeral stands on the rule that opens the section; a section
             without one still opens on the rule, so every section on every
             page begins with the same mark. */
          <h2 id={named} className="section-title">
            <span className="section-num">{num}</span>
            <span>{title}</span>
          </h2>
        )}
        {children}
      </Wrap>
    </section>
  );
}

/**
 * A figure, set as a plate in a monograph: the drawing and its instruments,
 * then the caption behind its own FIG. n. Every figure on the site is one of
 * these; see .plate in globals.css for what goes inside.
 */
export function Plate({
  fig,
  caption,
  children,
  ...figure
}: Omit<ComponentProps<"figure">, "className"> & {
  fig: number;
  caption: ReactNode;
}) {
  return (
    <figure {...figure} className="plate">
      {children}
      <figcaption className="plate-caption">
        <span className="plate-mark">Fig. {fig}</span>
        {caption}
      </figcaption>
    </figure>
  );
}

/**
 * A link to somewhere off this site.
 *
 * It opens in a new tab, always: these pages are reference documents, and a
 * reader who follows a DOI or a university's mark out of the middle of a CV has
 * lost their place in it. The one place that decides this, so that no link on
 * the site can quietly disagree.
 *
 * A visitor who cannot see the new tab appear is the one who most needs telling
 * it happened, so the accessible name says so — in the label where the link has
 * one, and otherwise appended to the words themselves.
 */
export function ExternalLink({
  href,
  /** Names the link where its content cannot — an institution's mark, say. */
  label,
  /** Added before `noopener noreferrer`; `me` marks a profile as Amin's own. */
  rel,
  /** The hover and focus caption an icon link carries in place of words. */
  tip,
  className = "link",
  children,
}: {
  href: string;
  label?: string;
  rel?: string;
  tip?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <a
      className={className}
      href={href}
      target="_blank"
      rel={rel ? `${rel} noopener noreferrer` : "noopener noreferrer"}
      aria-label={label && `${label} (opens in a new tab)`}
      data-tip={tip}
    >
      {children}
      {!label && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}

/**
 * Holds a run of blocks alongside their marginal glosses. A gloss is any child
 * carrying `.note` — in practice `<Settle className="note">` — which the CSS
 * lifts into the left margin on wide screens and folds inline on narrow ones.
 */
export function Leaf({ children }: { children: ReactNode }) {
  return <div className="leaf">{children}</div>;
}

export function Entries({ children }: { children: ReactNode }) {
  return <ul className="m-0 list-none p-0">{children}</ul>;
}

export function Footer() {
  return (
    <footer className="no-print mt-[clamp(3rem,8vw,5.5rem)] border-t border-rule">
      <div className="label mx-auto flex max-w-[53.5rem] flex-wrap justify-between gap-x-8 gap-y-2 px-5 pt-[1.9rem] pb-[2.6rem] text-ink-faint sm:px-7">
        <span>Kaiserslautern, Germany</span>
        <span>Updated September 2026</span>
      </div>
    </footer>
  );
}
