export const BOOK_ROUTES = ["/", "/research", "/cv", "/beyond"] as const;
export type BookRoute = (typeof BOOK_ROUTES)[number];
export type BookDirection = -1 | 0 | 1;

/** Navigation follows the printed order; a fragment within a page is no turn. */
export function getBookDirection(from: string, to: string): BookDirection {
  try {
    const base = new URL(from, "https://book.invalid");
    const destination = new URL(to, base);
    if (destination.origin !== base.origin) return 0;
    const normalize = (path: string) => path.replace(/\/+$/, "") || "/";
    const start = BOOK_ROUTES.indexOf(normalize(base.pathname) as BookRoute);
    const end = BOOK_ROUTES.indexOf(normalize(destination.pathname) as BookRoute);
    if (start < 0 || end < 0 || start === end) return 0;
    return end > start ? 1 : -1;
  } catch {
    return 0;
  }
}
