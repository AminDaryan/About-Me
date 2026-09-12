"use client";

import { useState } from "react";
import { useSettle } from "@/components/Settle";
import styles from "./MarginalStudy.module.css";

type Subject = "history" | "philosophy" | "psychology" | "archery" | "dance" | "chess" | "badminton";

const titles: Record<Subject, string> = {
  history: "History: an archive clock turns above a row of books",
  philosophy: "Philosophy and language: a pen annotates an open book",
  psychology: "Psychology: a thought travels through a network inside a profile",
  archery: "Archery: a bow draws and releases an arrow",
  dance: "Dance: two partners trace a shared step",
  chess: "Chess: a knight considers an L-shaped move",
  badminton: "Badminton: a shuttlecock arcs over a racket",
};

/** Small, finite studies: visible without JavaScript, replayable by touch or keyboard. */
export default function MarginalStudy({ subject }: { subject: Subject }) {
  const ref = useSettle<HTMLDivElement>();
  const [edition, setEdition] = useState(0);

  return (
    <div ref={ref} className={styles.figure}>
      <svg key={edition} className={styles[subject]} viewBox="0 0 180 128" role="img" aria-label={titles[subject]} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
        {subject === "history" && <>
          <path className={styles.faint} d="M16 111H165M27 105V57H47V105M51 105V49H72V105M76 105V61H92V105M99 57L119 53L129 103L109 107ZM31 64H43M31 96H43M56 57H67M56 96H67M80 69H88M104 65L119 62" />
          <circle cx="130" cy="32" r="22" /><circle className={styles.faint} cx="130" cy="32" r="18" />
          <path d="M130 13V16M149 32H146M130 51V48M111 32H114" />
          <g className={styles.clock}><path d="M130 19V32L141 38" /><circle cx="130" cy="32" r="2" fill="var(--color-paper)" /></g>
          <path className={styles.trace} d="M23 116C56 112 77 119 99 115S143 113 160 115" />
        </>}
        {subject === "philosophy" && <>
          <path d="M20 43Q50 32 87 48Q120 33 155 43V101Q119 91 87 107Q53 93 20 101ZM87 48V107M15 49V107Q52 100 87 113Q122 99 160 107V49" />
          <path className={styles.faint} d="M29 53Q55 47 77 56M29 63Q53 57 77 66M29 73Q53 67 77 76M29 83Q48 78 65 82M98 56Q123 47 145 53M98 66Q121 58 145 63M98 76Q122 68 138 72" />
          <path className={styles.trace} d="M99 84Q120 78 143 82M38 88Q57 85 75 90" />
          <g className={styles.pen}><path d="M107 46L135 11L142 16L113 50L105 54ZM109 45L114 49M135 11L138 7L145 12L142 16" /><path className={styles.faint} d="M120 33L135 15" /></g>
        </>}
        {subject === "psychology" && <>
          <path d="M61 113L66 91C53 83 47 68 49 48C51 24 71 13 95 17C116 20 126 36 124 54L135 71L123 75V87Q122 95 108 94L107 113M57 114H116" />
          <path className={styles.faint} d="M70 42L91 32L109 47L98 65L76 67ZM70 42L98 65M91 32L76 67M98 65L93 83M110 57H115" />
          {[ [70,42], [91,32], [109,47], [98,65], [76,67], [93,83] ].map(([cx,cy]) => <circle key={cx} cx={cx} cy={cy} r="3" fill="var(--color-paper)" />)}
          <path className={styles.trace} d="M70 42L91 32L109 47L98 65L93 83" />
          <circle className={styles.thought} cx="91" cy="32" r="9" />
        </>}
        {subject === "archery" && <>
          <path d="M65 14Q116 64 65 114M91 59V69" />
          <path className={styles.string} d="M65 14L48 64L65 114" />
          <g className={styles.arrow}><path d="M34 64H143L132 59M143 64L132 69M36 58L46 64L36 70M43 58L53 64L43 70" /></g>
          <path className={styles.faint} d="M29 116H150" />
        </>}
        {subject === "dance" && <>
          <path className={styles.trace} d="M37 101C12 65 53 30 91 44S167 88 144 107S76 119 77 89" />
          <g className={styles.partner}><ellipse cx="63" cy="44" rx="7" ry="13" transform="rotate(-25 63 44)" /><path d="M65 61L71 70L78 67L73 57Z" /><ellipse cx="53" cy="84" rx="7" ry="13" transform="rotate(14 53 84)" /><path d="M47 100L45 108L54 110L57 102Z" /></g>
          <g className={styles.partnerOther}><ellipse cx="111" cy="61" rx="7" ry="13" transform="rotate(155 111 61)" /><path d="M101 46L97 38L105 34L110 42Z" /><ellipse cx="124" cy="96" rx="7" ry="13" transform="rotate(-166 124 96)" /><path d="M122 79L120 71L129 69L132 77Z" /></g>
        </>}
        {subject === "chess" && <>
          <path className={styles.faint} d="M22 81H156V117H22ZM22 93H156M22 105H156M44 81V117M66 81V117M88 81V117M110 81V117M132 81V117" />
          <path className={styles.trace} d="M55 105H99V93M95 97L99 93L103 97" />
          <g className={styles.knight} fill="var(--color-paper)"><path d="M45 79H80L77 72H49ZM51 72C51 58 65 59 65 46L54 52L46 47L59 29L59 20L69 27C86 29 87 46 78 59L75 72Z" /><path d="M53 42L61 36M67 32H69M48 83H80" /></g>
        </>}
        {subject === "badminton" && <>
          <g transform="rotate(28 69 67)"><ellipse cx="69" cy="45" rx="20" ry="27" /><ellipse className={styles.faint} cx="69" cy="45" rx="16" ry="23" /><path className={styles.faint} d="M59 25V65M69 22V68M79 25V65M53 35H85M53 45H85M53 55H85" /><path d="M65 72V111H73V72M65 92H73M65 98H73M65 104H73" /></g>
          <path className={styles.trace} d="M92 88Q166 73 137 22" />
          <g className={styles.shuttle}><path d="M120 48L111 25L135 29L124 49ZM115 26L122 47L125 28M120 48Q115 56 120 58Q126 60 126 50Z" /></g>
        </>}
      </svg>
      <button type="button" className={styles.replay} onClick={() => setEdition(value => value + 1)} aria-label={`Replay ${subject} animation`}>Replay <span aria-hidden="true">↺</span></button>
    </div>
  );
}
