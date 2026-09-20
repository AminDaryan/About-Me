/* The people the ink line on /beyond passes, in the order the page reaches
   them. Each hangs beside the paragraph carrying the matching data-ink-anchor.
   Where each photograph came from, and on what terms, is recorded in
   docs/sources/beyond-portraits/MANIFEST.md.

   `focus` is where the face is in the photograph, so the crop to the plate's
   four-by-five frame keeps it; `tilt` is the few degrees each print is laid
   askew, the way cuttings pinned beside a manuscript never sit square. */

export type PortraitId = "wittgenstein" | "camus" | "jung" | "dostoevsky" | "fischer";

export type Portrait = {
  id: PortraitId;
  name: string;
  src: string;
  width: number;
  height: number;
  focus: string;
  tilt: number;
  alt: string;
};

export const PORTRAITS: Portrait[] = [
  {
    id: "wittgenstein",
    name: "Ludwig Wittgenstein",
    src: "/beyond/wittgenstein-1930.jpg",
    width: 326,
    height: 500,
    focus: "62% 22%",
    tilt: -1.6,
    alt: "Ludwig Wittgenstein, photographed by Moritz Nähr in 1930",
  },
  {
    id: "camus",
    name: "Albert Camus",
    src: "/beyond/camus-1945.jpg",
    width: 433,
    height: 649,
    focus: "50% 30%",
    tilt: 1.4,
    // The studio is named here because French law keeps the author's right to
    // be named after the photograph has passed into the public domain.
    alt: "Albert Camus, photographed by Studio Harcourt in 1945",
  },
  {
    id: "jung",
    name: "Carl Gustav Jung",
    src: "/beyond/jung-1935.jpg",
    width: 500,
    height: 617,
    focus: "46% 34%",
    tilt: -1.2,
    alt: "Carl Gustav Jung with his pipe, around 1935",
  },
  {
    id: "dostoevsky",
    name: "Fyodor Dostoevsky",
    src: "/beyond/dostoevsky-1880.jpg",
    width: 500,
    height: 666,
    focus: "50% 26%",
    tilt: 1.7,
    alt: "Fyodor Dostoevsky, photographed by Constantin Shapiro in 1880",
  },
  {
    id: "fischer",
    name: "Bobby Fischer",
    src: "/beyond/fischer-1971.jpg",
    width: 500,
    height: 628,
    focus: "50% 40%",
    tilt: 1,
    // Anefo published it in 1971 as an archive photograph; when it was taken
    // is not recorded, so the year is not given.
    alt: "Bobby Fischer at the chessboard",
  },
];
