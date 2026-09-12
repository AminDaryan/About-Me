import styles from "./MarginalStudy.module.css";

export type Subject = "history" | "philosophy" | "psychology" | "archery" | "dance" | "chess" | "badminton";

export const descriptions: Record<Subject, string> = {
  history: "History: clothbound volumes beside a ticking mantel clock",
  philosophy: "Philosophy and language: a fountain pen underlines a passage in an open book",
  psychology: "Psychology: an engraved profile with unfolding lines of thought",
  archery: "Archery: an arrow draws with the bowstring, then flies to a target",
  dance: "Dance: two pairs of shoes exchange a forward and backward step",
  chess: "Chess: a knight moves two squares across and one square back",
  badminton: "Badminton: a racket sends a shuttlecock into an upward arc",
};

function History() {
  return (
    <>
      <path className={styles.detail} d="M18 123H181" />
      <g className={styles.paper}>
        <path d="M28 104H110V119H28Q22 112 28 104ZM32 86H100V101H32Q27 93 32 86ZM24 68H102V83H24Q19 75 24 68Z" />
        <path className={styles.detail} d="M33 109H105M33 114H105M37 91H95M37 96H95M29 73H97M29 78H97" />
        <path d="M23 68H105M27 86H103M23 104H113" />
      </g>
      <path className={styles.paper} d="M113 114V60C113 19 173 19 173 60V114M109 115H177V120H109Z" />
      <circle cx="143" cy="64" r="23" />
      <circle className={styles.detail} cx="143" cy="64" r="19" />
      <path d="M143 46V49M161 64H158M143 82V79M125 64H128" />
      <path className={styles.hourHand} d="M143 64L134 60" />
      <path className={styles.minuteHand} d="M143 64V49" />
      <circle cx="143" cy="64" r="2" className={styles.paper} />
      <path className={styles.detail} d="M132 102H154M132 106H154" />
    </>
  );
}

function Philosophy() {
  return (
    <>
      <path className={styles.paper} d="M21 52Q55 42 94 60Q130 43 168 52V116Q129 106 94 123Q57 108 21 116Z" />
      <path d="M94 60V123M16 57V122Q55 115 94 129Q135 114 173 122V57" />
      <path className={styles.detail} d="M31 64Q58 58 82 69M31 74Q58 68 82 79M31 84Q58 78 82 89M31 94Q51 90 69 97M107 70Q133 60 157 65M107 80Q133 71 157 75M107 90Q126 84 143 86" />
      <path className={styles.annotation} pathLength={1} d="M110 102H146" />
      <g className={styles.pen}>
        <path className={styles.paper} d="M146 102L147 90L175 53L182 58L155 95ZM147 90L155 95M175 53L178 49L185 54L182 58" />
        <path className={styles.detail} d="M151 89L176 57M146 102L151 94" />
        <circle cx="151" cy="93" r="1.2" />
      </g>
    </>
  );
}

function Psychology() {
  return (
    <>
      <path d="M61 124L69 100C55 92 49 76 50 57C51 30 69 18 95 20C120 22 133 37 130 61L143 79L131 83V94Q130 104 112 101L110 124" />
      <path className={styles.detail} d="M58 129H117M119 66L125 67M127 90H132M74 93Q87 103 100 100" />
      <path className={styles.detail} d="M70 43C72 32 85 30 92 36C102 29 115 35 116 44C127 49 123 65 114 68C111 78 96 79 90 72C79 79 67 69 69 62C60 57 63 46 70 43Z" />
      <path className={styles.detail} d="M72 44Q86 40 84 53T76 64M96 37Q91 45 100 49T112 44M93 69Q103 60 114 65" />
      <path className={styles.thought} pathLength={1} d="M74 53C77 45 91 48 92 57C92 66 107 64 111 54" />
    </>
  );
}

function Archery() {
  return (
    <>
      <path className={styles.detail} d="M157 126H188M174 100L163 126M177 101L185 126" />
      <ellipse cx="175" cy="72" rx="12" ry="31" />
      <ellipse className={styles.detail} cx="175" cy="72" rx="8" ry="23" />
      <ellipse className={styles.accent} cx="175" cy="72" rx="3" ry="9" />
      <path d="M50 24Q108 72 50 120M52 28Q101 72 52 116" />
      <path strokeWidth="3" d="M78 67V77" />
      {/* Scaling around the limb tips keeps both ends fixed while the nock draws. */}
      <path className={styles.bowstring} vectorEffect="non-scaling-stroke" d="M50 24L26 72L50 120" />
      <g className={styles.arrow}>
        <path d="M50 72H130L123 68M130 72L123 76M51 67L62 72L51 77M58 67L69 72L58 77" />
      </g>
    </>
  );
}

/** A shaped sole and its inset heel read as a shoe even at marginal scale. */
function Shoe() {
  return (
    <>
      <path className={styles.shoeFill} d="M-7 15C-8 9-5 4-6-2C-10-10-8-21-1-23C8-25 12-17 10-9C9-2 5 3 5 9L6 16Q0 20-7 15Z" />
      <path className={styles.detail} d="M-6 9Q0 12 5 9M-5 14Q0 16 4 14" />
    </>
  );
}

function Dance() {
  return (
    <>
      <g transform="translate(52 75) rotate(-8)"><g className={styles.leadStep}><Shoe /></g></g>
      <g transform="translate(79 87) rotate(8)"><g className={styles.leadClose}><Shoe /></g></g>
      <g className={styles.accent} transform="translate(126 57) rotate(172)"><g className={styles.followStep}><Shoe /></g></g>
      <g className={styles.accent} transform="translate(153 69) rotate(188)"><g className={styles.followClose}><Shoe /></g></g>
      <path className={styles.detail} d="M29 86V58M25 62L29 58L33 62M25 82L29 86L33 82M177 58V86M173 82L177 86L181 82M173 62L177 58L181 62" />
    </>
  );
}

function Chess() {
  return (
    <>
      {/* An eight-by-eight board, foreshortened to fit the margin. */}
      <path className={styles.boardFill} d="M20 51H180V123H20Z" />
      <path className={styles.detail} d="M20 51H180V123H20ZM20 60H180M20 69H180M20 78H180M20 87H180M20 96H180M20 105H180M20 114H180M40 51V123M60 51V123M80 51V123M100 51V123M120 51V123M140 51V123M160 51V123" />
      {[0, 1, 2, 3, 4, 5, 6, 7].flatMap(row => [0, 1, 2, 3, 4, 5, 6, 7].filter(col => (row + col) % 2 === 0).map(col => (
        <rect key={`${row}-${col}`} className={styles.square} x={20 + col * 20} y={51 + row * 9} width="20" height="9" />
      )))}
      <path className={styles.route} pathLength={1} d="M50 109.5H90V100.5" />
      <circle className={styles.destination} cx="90" cy="100.5" r="3" />
      <g transform="translate(-7.5 4.5)">
      <g className={styles.knight}>
        <path className={styles.paper} d="M43 105V101L47 97H68L72 101V105ZM48 97C48 85 58 86 59 75L50 80L43 75L54 59L54 50L64 57C79 60 79 74 71 85L68 97Z" />
        <path className={styles.detail} d="M48 72L54 67M62 61H64M47 101H68M68 65Q76 75 65 87" />
      </g>
      </g>
    </>
  );
}

function Badminton() {
  return (
    <>
      <g className={styles.racket}>
        <ellipse className={styles.paper} cx="67" cy="79" rx="19" ry="25" />
        <ellipse className={styles.detail} cx="67" cy="79" rx="15" ry="21" />
        <path className={styles.detail} d="M60 61V97M67 58V100M74 61V97M53 70H81M52 79H82M53 88H81" />
        <path d="M63 104V130H71V104M63 116H71M63 121H71M63 126H71" />
      </g>
      {/* The cork and the traced trajectory share the same cubic curve. */}
      <path className={styles.flight} pathLength={1} d="M75 65C105 28 138 24 166 42" />
      <g className={styles.shuttle}>
        <path className={styles.paper} d="M-5-2L-27-9L-24 14L-4 5ZM-27-9L-4 1L-24 14M-27-9L-24 14M-5-2Q4-4 5 1Q4 7-4 5Z" />
        <path className={styles.detail} d="M-26-3L-5 1M-25 8L-5 3" />
      </g>
    </>
  );
}

export const drawings = { history: History, philosophy: Philosophy, psychology: Psychology, archery: Archery, dance: Dance, chess: Chess, badminton: Badminton };
