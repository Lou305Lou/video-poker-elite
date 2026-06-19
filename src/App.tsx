import { useEffect, useMemo, useState } from 'react'

type Suit = 'S' | 'H' | 'D' | 'C'
type Rank = 'A' | 'K' | 'Q' | 'J' | 'T' | '9' | '8' | '7' | '6' | '5' | '4' | '3' | '2'

type Card = {
  rank: Rank
  suit: Suit
}

type Result = {
  holdCards: Card[]
  title: string
  explanation: string
  ruleTag: string
}

const ranks: Rank[] = ['A', 'K', 'Q', 'J', 'T', '9', '8', '7', '6', '5', '4', '3', '2']
const suits: Suit[] = ['S', 'H', 'D', 'C']

const variants = [
  'Jacks or Better',
  'Bonus Poker',
  'Bonus Deluxe',
  'Double Bonus Poker',
  'Double Double Bonus Poker',
  'Deuces Wild',
]

const suitSymbols: Record<Suit, string> = {
  S: '♠',
  H: '♥',
  D: '♦',
  C: '♣',
}
const ruleLabels: Record<string, string> = {
  deuces_wild_hold_deuces: 'Hold Deuces',

  made_four_kind: 'Four of a Kind',
  made_full_house: 'Full House',
  made_straight_flush: 'Straight Flush',
  made_flush: 'Flush',
  made_straight: 'Straight',
  made_trips: 'Three of a Kind',
  made_two_pair: 'Two Pair',
  made_high_pair: 'High Pair',
  made_low_pair_bonus: 'Low Pair in Bonus Game',
  made_low_pair: 'Low Pair',

  draw_four_to_royal: 'Four to Royal',
  draw_three_to_royal: 'Three to Royal',
  draw_four_to_flush: 'Four to Flush',
  draw_four_to_outside_straight: 'Four to Outside Straight',
  draw_four_to_inside_straight: 'Four to Inside Straight',
  draw_three_to_straight_flush: 'Three to Straight Flush',

  draw_three_suited_high_cards: 'Three Suited High Cards',
  draw_two_suited_high_cards: 'Two Suited High Cards',
  draw_two_high_cards: 'Two High Cards',

  draw_exact_tjqk: 'Ten Jack Queen King',
  draw_exact_kqj: 'King Queen Jack',
  draw_exact_akq: 'Ace King Queen',
  draw_exact_ak: 'Ace King',
  draw_exact_aq: 'Ace Queen',
  draw_exact_aj: 'Ace Jack',
  draw_exact_kq: 'King Queen',
  draw_exact_kj: 'King Jack',
  draw_exact_qj: 'Queen Jack',

  draw_suited_qj: 'Suited Queen Jack',
  draw_suited_kq: 'Suited King Queen',
  draw_suited_kj: 'Suited King Jack',

  draw_single_ace: 'Single Ace',
  draw_single_king: 'Single King',
  draw_single_queen: 'Single Queen',
  draw_single_jack: 'Single Jack',

  draw_five: 'Draw Five',
}
function ruleDifficulty(ruleTag: string) {
  if (
    [
      'made_four_kind',
      'made_full_house',
      'made_straight_flush',
      'made_flush',
      'made_straight',
      'made_trips',
      'made_two_pair',
      'made_high_pair',
      'deuces_wild_hold_deuces',
    ].includes(ruleTag)
  ) {
    return 'Easy'
  }

  if (
    [
      'made_low_pair',
      'made_low_pair_bonus',
      'draw_four_to_royal',
      'draw_four_to_flush',
      'draw_four_to_outside_straight',
      'draw_single_ace',
      'draw_single_king',
      'draw_single_queen',
      'draw_single_jack',
    ].includes(ruleTag)
  ) {
    return 'Medium'
  }

  if (
    [
      'draw_exact_ak',
      'draw_exact_aq',
      'draw_exact_aj',
      'draw_exact_kq',
      'draw_exact_kj',
      'draw_exact_qj',
      'draw_exact_akq',
      'draw_exact_kqj',
      'draw_exact_tjqk',
      'draw_suited_qj',
      'draw_suited_kq',
      'draw_suited_kj',
      'draw_three_suited_high_cards',
      'draw_two_suited_high_cards',
      'draw_three_to_royal',
      'draw_three_to_straight_flush',
    ].includes(ruleTag)
  ) {
    return 'Sharp'
  }

  if (
    [
      'draw_four_to_inside_straight',
      'draw_four_to_straight_flush',
    ].includes(ruleTag)
  ) {
    return 'Expert'
  }

  return 'Medium'
}
function cardCode(card: Card) {
  return `${card.rank}${card.suit}`
}

function cardDisplay(card: Card) {
  return `${card.rank}${suitSymbols[card.suit]}`
}

function cardColor(card: Card) {
  return card.suit === 'H' || card.suit === 'D' ? '#dc2626' : '#020617'
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function buildDeck() {
  const deck: Card[] = []
  for (const suit of suits) {
    for (const rank of ranks) {
      deck.push({ rank, suit })
    }
  }
  return deck
}

function dealHand() {
  return shuffle(buildDeck()).slice(0, 5)
}

function sameHold(a: Card[], b: Card[]) {
  return a.map(cardCode).sort().join('|') === b.map(cardCode).sort().join('|')
}

function byRank(cards: Card[]) {
  const groups: Record<string, Card[]> = {}
  for (const card of cards) {
    groups[card.rank] = groups[card.rank] || []
    groups[card.rank].push(card)
  }
  return groups
}

function bySuit(cards: Card[]) {
  const groups: Record<string, Card[]> = {}
  for (const card of cards) {
    groups[card.suit] = groups[card.suit] || []
    groups[card.suit].push(card)
  }
  return groups
}
const rankValue: Record<Rank, number> = {
  A: 14,
  K: 13,
  Q: 12,
  J: 11,
  T: 10,
  '9': 9,
  '8': 8,
  '7': 7,
  '6': 6,
  '5': 5,
  '4': 4,
  '3': 3,
  '2': 2,
}

const straightPatterns = [
  [14, 2, 3, 4, 5],
  [2, 3, 4, 5, 6],
  [3, 4, 5, 6, 7],
  [4, 5, 6, 7, 8],
  [5, 6, 7, 8, 9],
  [6, 7, 8, 9, 10],
  [7, 8, 9, 10, 11],
  [8, 9, 10, 11, 12],
  [9, 10, 11, 12, 13],
  [10, 11, 12, 13, 14],
]

function cardValues(cards: Card[]) {
  return [...new Set(cards.map((card) => rankValue[card.rank]))]
}

function isStraight(cards: Card[]) {
  const values = cardValues(cards)
  if (values.length !== 5) return false

  return straightPatterns.some((pattern) =>
    pattern.every((value) => values.includes(value))
  )
}

function fourToOutsideStraight(cards: Card[]) {
  for (const pattern of straightPatterns) {
    const matches = cards.filter((card) => pattern.includes(rankValue[card.rank]))
    const missing = pattern.filter(
      (value) => !cards.some((card) => rankValue[card.rank] === value)
    )

    if (matches.length === 4 && missing.length === 1) {
      const min = Math.min(...pattern)
      const max = Math.max(...pattern)
      const missingValue = missing[0]

      if (missingValue === min || missingValue === max) {
        return matches
      }
    }
  }

  return []
}

function fourToInsideStraight(cards: Card[]) {
  for (const pattern of straightPatterns) {
    const matches = cards.filter((card) => pattern.includes(rankValue[card.rank]))
    const missing = pattern.filter(
      (value) => !cards.some((card) => rankValue[card.rank] === value)
    )

    if (matches.length === 4 && missing.length === 1) {
      const min = Math.min(...pattern)
      const max = Math.max(...pattern)
      const missingValue = missing[0]

      if (missingValue !== min && missingValue !== max) {
        return matches
      }
    }
  }

  return []
}

function fourToStraightFlush(cards: Card[]) {
  const suitGroups = Object.values(bySuit(cards))

  for (const group of suitGroups) {
    if (group.length < 4) continue

    const outside = fourToOutsideStraight(group)
    if (outside.length === 4) return outside

    const inside = fourToInsideStraight(group)
    if (inside.length === 4) return inside
  }

  return []
}

function threeToStraightFlush(cards: Card[]) {
  const suitGroups = Object.values(bySuit(cards))

  for (const group of suitGroups) {
    if (group.length < 3) continue

    for (const pattern of straightPatterns) {
      const matches = group.filter((card) =>
        pattern.includes(rankValue[card.rank])
      )

      if (matches.length >= 3) {
        return matches.slice(0, 3)
      }
    }
  }

  return []
}

function isHighCard(card: Card) {
  return ['A', 'K', 'Q', 'J'].includes(card.rank)
}

function suitedHighCards(cards: Card[], count: number) {
  const suitGroups = Object.values(bySuit(cards))

  for (const group of suitGroups) {
    const highs = group.filter(isHighCard)

    if (highs.length >= count) {
      return highs.slice(0, count)
    }
  }

  return []
}

function exactHighRanks(cards: Card[], wanted: Rank[]) {
  return wanted
    .map((rank) => cards.find((card) => card.rank === rank))
    .filter(Boolean) as Card[]
}
function makeResult(
  holdCards: Card[],
  title: string,
  explanation: string,
  ruleTag: string
): Result {
  return {
    holdCards,
    title,
    explanation,
    ruleTag,
  }
}

function evaluateHand(cards: Card[], variant: string): Result {
  const rankGroups = Object.values(byRank(cards)).sort((a, b) => b.length - a.length)
  const suitGroups = Object.values(bySuit(cards)).sort((a, b) => b.length - a.length)

  const bestRankGroup = rankGroups[0]
  const bestSuitGroup = suitGroups[0]

  const highPair = rankGroups.find(
    (group) => group.length === 2 && ['A', 'K', 'Q', 'J'].includes(group[0].rank)
  )

  const lowPair = rankGroups.find(
    (group) => group.length === 2 && !['A', 'K', 'Q', 'J'].includes(group[0].rank)
  )

  const fourToRoyal = suitGroups
    .map((group) => group.filter((card) => ['A', 'K', 'Q', 'J', 'T'].includes(card.rank)))
    .find((group) => group.length >= 4)

  const threeToRoyal = suitGroups
    .map((group) => group.filter((card) => ['A', 'K', 'Q', 'J', 'T'].includes(card.rank)))
    .find((group) => group.length >= 3)

  const highCards = cards.filter((card) => ['A', 'K', 'Q', 'J'].includes(card.rank))
  const deuces = cards.filter((card) => card.rank === '2')
  const straightFlushDraw = fourToStraightFlush(cards)
  const threeStraightFlushDraw = threeToStraightFlush(cards)
  const outsideStraight = fourToOutsideStraight(cards)
  const insideStraight = fourToInsideStraight(cards)

  if (variant === 'Deuces Wild' && deuces.length > 0) {
    return makeResult(
      deuces,
      `Hold ${deuces.length} deuce${deuces.length > 1 ? 's' : ''}`,
      'Deuces are wild and normally your highest-value holds.',
      'deuces_wild_hold_deuces'
    )
  }

  if (bestRankGroup?.length === 4) {
    return makeResult(bestRankGroup, 'Hold four of a kind', 'Four of a kind is already a premium made hand.', 'made_four_kind')
  }

  if (bestRankGroup?.length === 3 && rankGroups.some((group) => group.length === 2)) {
    return makeResult(cards, 'Hold full house', 'A full house is a strong made hand.', 'made_full_house')
  }

  if (bestSuitGroup?.length === 5 && isStraight(cards)) {
    return makeResult(cards, 'Hold straight flush', 'A straight flush is a premium made hand.', 'made_straight_flush')
  }

  if (bestSuitGroup?.length === 5) {
    return makeResult(cards, 'Hold flush', 'A flush is already a paying made hand.', 'made_flush')
  }

  if (isStraight(cards)) {
    return makeResult(cards, 'Hold straight', 'A straight is already a paying made hand.', 'made_straight')
  }

  if (bestRankGroup?.length === 3) {
    return makeResult(bestRankGroup, 'Hold three of a kind', 'Trips should be preserved.', 'made_trips')
  }

  if (rankGroups.filter((group) => group.length === 2).length >= 2) {
    return makeResult(
      rankGroups.filter((group) => group.length === 2).flat(),
      'Hold two pair',
      'Two pair is typically held.',
      'made_two_pair'
    )
  }

  if (fourToRoyal) {
    return makeResult(fourToRoyal.slice(0, 4), 'Hold four to a royal flush', 'One of the highest-EV drawing hands.', 'draw_four_to_royal')
  }

  if (straightFlushDraw.length === 4) {
    return makeResult(straightFlushDraw, 'Hold four to a straight flush', 'Four to a straight flush has strong upside.', 'draw_four_to_straight_flush')
  }

  if (highPair) {
    return makeResult(highPair, 'Hold high pair', 'A paying made hand in Jacks-or-Better style games.', 'made_high_pair')
  }

  if (
    lowPair &&
    ['Bonus Poker', 'Bonus Deluxe', 'Double Bonus Poker', 'Double Double Bonus Poker'].includes(variant)
  ) {
    return makeResult(lowPair, 'Hold low pair', 'Bonus games increase low-pair value.', 'made_low_pair_bonus')
  }

  if (threeToRoyal) {
    return makeResult(threeToRoyal.slice(0, 3), 'Hold three to a royal flush', 'Strong premium drawing hand.', 'draw_three_to_royal')
  }

  if (bestSuitGroup?.length >= 4) {
    return makeResult(bestSuitGroup.slice(0, 4), 'Hold four to a flush', 'Strong flush draw.', 'draw_four_to_flush')
  }

  if (lowPair) {
    return makeResult(lowPair, 'Hold low pair', 'A pair usually beats drawing five.', 'made_low_pair')
  }
if (threeStraightFlushDraw.length === 3) {
  return makeResult(
    threeStraightFlushDraw,
    'Hold three to a straight flush',
    'Three suited connected cards can improve into straight flush, flush, straight, or pair outcomes.',
    'draw_three_to_straight_flush'
  )
}
  if (outsideStraight.length === 4) {
    return makeResult(outsideStraight, 'Hold four to an outside straight', 'An outside straight can be completed on either end.', 'draw_four_to_outside_straight')
  }

  const suitedThreeHighCards = suitedHighCards(cards, 3)

if (suitedThreeHighCards.length === 3) {
  return makeResult(
    suitedThreeHighCards,
    'Hold three suited high cards',
    'Three suited high cards have royal-flush and high-pair upside.',
    'draw_three_suited_high_cards'
  )
}

const suitedTwoHighCards = suitedHighCards(cards, 2)

if (suitedTwoHighCards.length === 2) {
  return makeResult(
    suitedTwoHighCards,
    'Hold two suited high cards',
    'Two suited high cards have extra value because of royal-flush potential.',
    'draw_two_suited_high_cards'
  )
}
const exactTJQK = exactHighRanks(cards, ['T', 'J', 'Q', 'K'])

if (exactTJQK.length === 4) {
  return makeResult(
    exactTJQK,
    'Hold Ten Jack Queen King',
    'Ten-Jack-Queen-King is a strong open-ended royal/straight draw.',
    'draw_exact_tjqk'
  )
}

const exactKQJ = exactHighRanks(cards, ['K', 'Q', 'J'])

if (exactKQJ.length === 3) {
  return makeResult(
    exactKQJ,
    'Hold King Queen Jack',
    'King-Queen-Jack gives strong high-pair and straight/royal improvement potential.',
    'draw_exact_kqj'
  )
}

const exactAKQ = exactHighRanks(cards, ['A', 'K', 'Q'])

if (exactAKQ.length === 3) {
  return makeResult(
    exactAKQ,
    'Hold Ace King Queen',
    'Ace-King-Queen has strong high-card and royal improvement potential.',
    'draw_exact_akq'
  )
}

const exactAK = exactHighRanks(cards, ['A', 'K'])

if (exactAK.length === 2) {
  return makeResult(
    exactAK,
    'Hold Ace King',
    'Ace-King is the strongest unsuited two-high-card hold.',
    'draw_exact_ak'
  )
}

const exactAQ = exactHighRanks(cards, ['A', 'Q'])

if (exactAQ.length === 2) {
  return makeResult(
    exactAQ,
    'Hold Ace Queen',
    'Ace-Queen is a strong two-high-card hold.',
    'draw_exact_aq'
  )
}

const exactAJ = exactHighRanks(cards, ['A', 'J'])

if (exactAJ.length === 2) {
  return makeResult(
    exactAJ,
    'Hold Ace Jack',
    'Ace-Jack remains a profitable two-high-card hold.',
    'draw_exact_aj'
  )
}

const suitedQJ = suitedHighCards(cards, 2).filter((card) =>
  ['Q', 'J'].includes(card.rank)
)

if (suitedQJ.length === 2) {
  return makeResult(
    suitedQJ,
    'Hold suited Queen Jack',
    'Suited Q-J has added royal-flush value compared with unsuited high cards.',
    'draw_suited_qj'
  )
}

const suitedKQ = suitedHighCards(cards, 2).filter((card) =>
  ['K', 'Q'].includes(card.rank)
)

if (suitedKQ.length === 2) {
  return makeResult(
    suitedKQ,
    'Hold suited King Queen',
    'Suited K-Q has high-card and royal-flush improvement potential.',
    'draw_suited_kq'
  )
}

const suitedKJ = suitedHighCards(cards, 2).filter((card) =>
  ['K', 'J'].includes(card.rank)
)

if (suitedKJ.length === 2) {
  return makeResult(
    suitedKJ,
    'Hold suited King Jack',
    'Suited K-J gives both high-pair and royal-flush upside.',
    'draw_suited_kj'
  )
}

const exactKQ = exactHighRanks(cards, ['K', 'Q'])

if (exactKQ.length === 2) {
  return makeResult(
    exactKQ,
    'Hold King Queen',
    'King-Queen is a viable two-high-card hold.',
    'draw_exact_kq'
  )
}

const exactKJ = exactHighRanks(cards, ['K', 'J'])

if (exactKJ.length === 2) {
  return makeResult(
    exactKJ,
    'Hold King Jack',
    'King-Jack is a playable two-high-card hold.',
    'draw_exact_kj'
  )
}

const exactQJ = exactHighRanks(cards, ['Q', 'J'])

if (exactQJ.length === 2) {
  return makeResult(
    exactQJ,
    'Hold Queen Jack',
    'Queen-Jack is the lowest two-high-card hold.',
    'draw_exact_qj'
  )
}

if (highCards.length >= 2) {
  return makeResult(
    highCards.slice(0, 2),
    'Hold two high cards',
    'Good improvement potential.',
    'draw_two_high_cards'
  )
}
 
if (insideStraight.length === 4) {
  return makeResult(
    insideStraight,
    'Hold four to an inside straight',
    'An inside straight is weaker, but sometimes worth keeping.',
    'draw_four_to_inside_straight'
  )
}

const exactAce = exactHighRanks(cards, ['A'])

if (exactAce.length === 1) {
  return makeResult(
    exactAce,
    'Hold Ace',
    'Ace is the strongest single high card.',
    'draw_single_ace'
  )
}

const exactKing = exactHighRanks(cards, ['K'])

if (exactKing.length === 1) {
  return makeResult(
    exactKing,
    'Hold King',
    'King is the next best single high card after Ace.',
    'draw_single_king'
  )
}

const exactQueen = exactHighRanks(cards, ['Q'])

if (exactQueen.length === 1) {
  return makeResult(
    exactQueen,
    'Hold Queen',
    'Queen is a playable single high card.',
    'draw_single_queen'
  )
}

const exactJack = exactHighRanks(cards, ['J'])

if (exactJack.length === 1) {
  return makeResult(
    exactJack,
    'Hold Jack',
    'Jack is the lowest single high-card hold in Jacks or Better.',
    'draw_single_jack'
  )
}

return makeResult([], 'Draw five', 'No strong hold available.', 'draw_five')
}
function DashboardPanel({
  title,
  children,
  className = '',
}: {
  title?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`panel ${className}`}>
      {title && <h3 className="panel-title">★ {title}</h3>}
      {children}
    </section>
  )
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string
  value: string | number
  icon?: string
}) {
  return (
    <div className="stat-card">
      <div className="stat-label">{icon ? `${icon} ${label}` : label}</div>
      <div className="stat-value">{value}</div>
    </div>
  )
}

function VegasHeader() {
  const royalCards = ['A♥', 'K♥', 'Q♥', 'J♥', '10♥']
  const neonSuits = ['♠', '♥', '♦', '♣']
  const chips = ['100', '25', '500']

  return (
    <header className="elite-header">
      <div className="header-promo-card">
        <div className="promo-trophy">🏆</div>
        <div>
          <strong>Master Every Hand.</strong>
          <span>Beat the Game.</span>
        </div>
        <div className="promo-suits" aria-hidden="true">
          {neonSuits.map((suit) => (
            <span key={suit}>{suit}</span>
          ))}
        </div>
      </div>

      <div className="header-copy">
        <h1 className="elite-title">VIDEO POKER</h1>
        <h2 className="elite-subtitle">TUTORIAL</h2>
        <div className="elite-tagline">Practice • Learn • Master • Win</div>
      </div>

      <div className="royal-art" aria-label="Royal flush artwork placeholder">
        <div className="royal-art-label">Royal Flush</div>
        <div className="neon-suit-strip" aria-hidden="true">
          {neonSuits.map((suit) => (
            <span key={suit}>{suit}</span>
          ))}
        </div>
        <div className="chip-stack" aria-hidden="true">
          {chips.map((chip, index) => (
            <span key={chip} style={{ '--chip-index': index } as React.CSSProperties}>
              {chip}
            </span>
          ))}
        </div>
        <div className="royal-card-fan">
          {royalCards.map((card, index) => (
            <div key={card} className="royal-card" style={{ '--card-index': index } as React.CSSProperties}>
              {card}
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}

function JackpotMachineCard() {
  return (
    <section className="jackpot-machine-card">
      <div className="machine-top">Jackpot Drill</div>
      <div className="machine-reels" aria-hidden="true">
        <span>7</span>
        <span>7</span>
        <span>7</span>
      </div>
      <div className="machine-lights" aria-hidden="true">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p>Turn misses into high-value reps.</p>
    </section>
  )
}

function SidebarPanel({
  icon,
  title,
  children,
  className = '',
}: {
  icon: string
  title: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={`sidebar-panel ${className}`}>
      <div className="sidebar-icon">{icon}</div>
      <div>
        <h3>{title}</h3>
        <div className="sidebar-copy">{children}</div>
      </div>
    </section>
  )
}

function App() {
  const [variant, setVariant] = useState('Jacks or Better')
  const [hand, setHand] = useState<Card[]>(dealHand)
  const [selectedHold, setSelectedHold] = useState<Card[]>([])
  const [result, setResult] = useState<Result | null>(null)
  const [graded, setGraded] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [correctAnswers, setCorrectAnswers] = useState(0)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [currentStreakTimes, setCurrentStreakTimes] = useState<number[]>([])
  const [difficultyStats, setDifficultyStats] = useState<
  Record<
    string,
    {
      attempts: number
      correct: number
      totalSeconds: number
      bestCorrectSeconds: number | null
    }
  >
>({})
  const [handStartTime, setHandStartTime] = useState(Date.now())
  const [lastBrokenStreakSummary, setLastBrokenStreakSummary] = useState('')
  const [lastHandSeconds, setLastHandSeconds] = useState<number | null>(null)
  const [weaknessMessage, setWeaknessMessage] = useState('')
  const [autoWeaknessMode, setAutoWeaknessMode] = useState(false)
  const [weaknessFocusLevel, setWeaknessFocusLevel] = useState('All')
  const [focusCycleMode, setFocusCycleMode] = useState(false)
  const [focusCycleIndex, setFocusCycleIndex] = useState(0)
  const [weaknessDrillCount, setWeaknessDrillCount] = useState(0)
  const [mistakes, setMistakes] = useState<Record<string, number>>({})

  const correct = useMemo(() => {
    if (!graded || !result) return false
    return sameHold(selectedHold, result.holdCards)
  }, [graded, result, selectedHold])

  const accuracy = attempts > 0 ? ((correctAnswers / attempts) * 100).toFixed(1) : '0.0'
  useEffect(() => {
  const saved = localStorage.getItem('videoPokerTutorialSession')
  if (!saved) return

  try {
    const snapshot = JSON.parse(saved)

    setAttempts(snapshot.attempts || 0)
    setCorrectAnswers(snapshot.correctAnswers || 0)
    setCurrentStreak(snapshot.currentStreak || 0)
    setBestStreak(snapshot.bestStreak || 0)
    setCurrentStreakTimes(snapshot.currentStreakTimes || [])
    setLastBrokenStreakSummary(snapshot.lastBrokenStreakSummary || '')
    setLastHandSeconds(snapshot.lastHandSeconds ?? null)
    setMistakes(snapshot.mistakes || {})
    setDifficultyStats(snapshot.difficultyStats || {})
    setWeaknessDrillCount(snapshot.weaknessDrillCount || 0)
    setWeaknessFocusLevel(snapshot.weaknessFocusLevel || 'All')
    setFocusCycleIndex(snapshot.focusCycleIndex || 0)
  } catch {
    localStorage.removeItem('videoPokerTutorialSession')
  }
}, [])

  function toggleCard(card: Card) {
    const exists = selectedHold.some((held) => cardCode(held) === cardCode(card))

    if (exists) {
      setSelectedHold(selectedHold.filter((held) => cardCode(held) !== cardCode(card)))
    } else {
      setSelectedHold([...selectedHold, card])
    }
  }

 function grade() {
  const evaluated = evaluateHand(hand, variant)
  const isCorrect = sameHold(selectedHold, evaluated.holdCards)
  const difficulty = ruleDifficulty(evaluated.ruleTag)
  const handSeconds = Math.max(0.1, (Date.now() - handStartTime) / 1000)
  setLastHandSeconds(handSeconds)

  setResult(evaluated)
  setGraded(true)
  setShowAnswer(isCorrect)
  setAttempts((n) => n + 1)
  setDifficultyStats((prev) => {
  const current = prev[difficulty] || {
    attempts: 0,
    correct: 0,
    totalSeconds: 0,
    bestCorrectSeconds: null,
  }

  const nextBest =
    isCorrect &&
    (current.bestCorrectSeconds === null ||
      handSeconds < current.bestCorrectSeconds)
      ? handSeconds
      : current.bestCorrectSeconds

  return {
    ...prev,
    [difficulty]: {
      attempts: current.attempts + 1,
      correct: current.correct + (isCorrect ? 1 : 0),
      totalSeconds: current.totalSeconds + handSeconds,
      bestCorrectSeconds: nextBest,
    },
  }
})

 if (isCorrect) {
  setWeaknessMessage('')
  setCorrectAnswers((n) => n + 1)

  setCurrentStreakTimes((times) => [...times, handSeconds])

  setCurrentStreak((n) => {
    const next = n + 1
    setBestStreak((best) => Math.max(best, next))
    return next
    })
  } else {
    if (currentStreak > 0 && currentStreakTimes.length > 0) {
      const total = currentStreakTimes.reduce((sum, value) => sum + value, 0)
      const average = total / currentStreakTimes.length

      setLastBrokenStreakSummary(
        `Last streak: ${currentStreak} hand${currentStreak === 1 ? '' : 's'} | Total time: ${total.toFixed(
          1
        )}s | Avg: ${average.toFixed(1)}s/hand`
      )
    }

    setCurrentStreak(0)
    setCurrentStreakTimes([])
    setMistakes((prev) => ({
      ...prev,
      [evaluated.ruleTag]: (prev[evaluated.ruleTag] || 0) + 1,
    }))
    if (autoWeaknessMode) {
  setWeaknessMessage('Auto Weakness Training: loading your next weakness drill...')

  setTimeout(() => {
    if (focusCycleMode) {
      trainNextFocusCycle()
    } else {
      loadWeaknessHand()
    }
  }, 700)
}

saveSessionSnapshot()
}
}

function nextHand() {
  setHand(dealHand())
  setSelectedHold([])
  setResult(null)
  setGraded(false)
  setShowAnswer(false)
  setHandStartTime(Date.now())
  setWeaknessMessage('')
}
function randomHandFromLibrary(library: Card[][]) {
  return library[Math.floor(Math.random() * library.length)]
}
function trainFocusLevel(level: string) {
  setWeaknessFocusLevel(level)

  setTimeout(() => {
    loadWeaknessHand()
  }, 50)
}
function exportTrainingStats() {
  const snapshot = {
    exportedAt: new Date().toISOString(),
    attempts,
    correctAnswers,
    accuracy,
    currentStreak,
    bestStreak,
    lastBrokenStreakSummary,
    lastHandSeconds,
    mistakes,
    difficultyStats,
    weaknessDrillCount,
    weaknessFocusLevel,
  }

  const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
    type: 'application/json',
  })

  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `video-poker-training-stats-${Date.now()}.json`
  link.click()

  URL.revokeObjectURL(url)
}

function exportTrainingStatsCsv() {
  const rows = [
    ['Metric', 'Value'],
    ['Exported At', new Date().toISOString()],
    ['Attempts', String(attempts)],
    ['Correct Answers', String(correctAnswers)],
    ['Accuracy', String(accuracy)],
    ['Current Streak', String(currentStreak)],
    ['Best Streak', String(bestStreak)],
    ['Weakness Drills Loaded', String(weaknessDrillCount)],
    ['Weakness Focus Level', weaknessFocusLevel],
    ['Last Broken Streak Summary', lastBrokenStreakSummary],
    ['Last Hand Seconds', lastHandSeconds === null ? '' : String(lastHandSeconds)],
  ]

  const difficultyRows = Object.entries(difficultyStats).map(([level, stats]) => [
    `Difficulty ${level}`,
    `${stats.correct}/${stats.attempts} | Avg ${
      stats.attempts > 0 ? (stats.totalSeconds / stats.attempts).toFixed(1) : '0.0'
    }s | Best ${stats.bestCorrectSeconds === null ? '--' : stats.bestCorrectSeconds.toFixed(1)}s`,
  ])

  const mistakeRows = Object.entries(mistakes).map(([rule, count]) => [
    `Mistake ${ruleLabels[rule] || rule}`,
    `${count} | SR Score ${spacedRepetitionScore(rule)} | ${ruleMasteryLabel(rule)}`,
  ])

  const csv = [...rows, ...difficultyRows, ...mistakeRows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\n')

  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = `video-poker-training-stats-${Date.now()}.csv`
  link.click()

  URL.revokeObjectURL(url)
}

function saveSessionSnapshot() {
  const snapshot = {
    attempts,
    correctAnswers,
    currentStreak,
    bestStreak,
    currentStreakTimes,
    lastBrokenStreakSummary,
    lastHandSeconds,
    mistakes,
    difficultyStats,
    weaknessDrillCount,
    weaknessFocusLevel,
    focusCycleIndex,
  }

  localStorage.setItem('videoPokerTutorialSession', JSON.stringify(snapshot))
}

function nextFocusCycleLabel() {
  const cycle = ['Medium', 'Sharp', 'Expert']
  return cycle[focusCycleIndex % cycle.length]
}

function trainNextFocusCycle() {
  const cycle = ['Medium', 'Sharp', 'Expert']
  const nextLevel = cycle[focusCycleIndex % cycle.length]

  setFocusCycleIndex((n) => n + 1)
  trainFocusLevel(nextLevel)
}

function spacedRepetitionScore(rule: string) {
  const misses = mistakes[rule] || 0
  const difficulty = ruleDifficulty(rule)

  const difficultyWeight =
    difficulty === 'Expert'
      ? 4
      : difficulty === 'Sharp'
        ? 3
        : difficulty === 'Medium'
          ? 2
          : 1

  return misses * difficultyWeight
}

function ruleMasteryLabel(rule: string) {
  const difficulty = ruleDifficulty(rule)
  const misses = mistakes[rule] || 0
  const score = spacedRepetitionScore(rule)

  if (misses === 0) return 'Unseen'
  if (score <= 2 && difficulty !== 'Expert') return 'Mastered ✅'
  if (score <= 5) return 'Improving ⚠️'
  return 'Needs Work ❌'
}


function loadWeaknessHand() {
  const filteredMistakes = Object.entries(mistakes).filter(([rule]) => {
    if (weaknessFocusLevel === 'All') return true
    return ruleDifficulty(rule) === weaknessFocusLevel
  })

  const mostMissedRule = filteredMistakes.sort(
    ([ruleA], [ruleB]) => spacedRepetitionScore(ruleB) - spacedRepetitionScore(ruleA)
  )[0]?.[0]

  setWeaknessDrillCount((n) => n + 1)

  setWeaknessMessage(
    mostMissedRule
      ? `Training weakness: ${ruleLabels[mostMissedRule] || mostMissedRule}`
      : 'No weakness found yet. Loading random hand.'
  )

  if (!mostMissedRule) {
    setWeaknessDrillCount(0)
    nextHand()
    return
  }
  if (mostMissedRule === 'made_high_pair') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'J', suit: 'S' },
        { rank: 'J', suit: 'D' },
        { rank: 'A', suit: 'C' },
        { rank: '9', suit: 'H' },
        { rank: '4', suit: 'C' },
      ],
      [
        { rank: 'Q', suit: 'S' },
        { rank: 'Q', suit: 'H' },
        { rank: 'T', suit: 'D' },
        { rank: '6', suit: 'C' },
        { rank: '3', suit: 'S' },
      ],
      [
        { rank: 'K', suit: 'D' },
        { rank: 'K', suit: 'C' },
        { rank: '8', suit: 'H' },
        { rank: '5', suit: 'S' },
        { rank: '2', suit: 'D' },
      ],
    ])
  )
} else if (mostMissedRule === 'draw_exact_ak') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'A', suit: 'S' },
        { rank: 'K', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: '5', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'A', suit: 'H' },
        { rank: 'K', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: '6', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: 'A', suit: 'D' },
        { rank: 'K', suit: 'H' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '4', suit: 'D' },
      ],
    ])
  )
  } else if (mostMissedRule === 'draw_exact_aq') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'A', suit: 'S' },
        { rank: 'Q', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: '5', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'A', suit: 'H' },
        { rank: 'Q', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: '6', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: 'A', suit: 'D' },
        { rank: 'Q', suit: 'H' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '4', suit: 'D' },
      ],
    ])
  )
} else if (mostMissedRule === 'draw_exact_aj') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'A', suit: 'S' },
        { rank: 'J', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: '5', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'A', suit: 'H' },
        { rank: 'J', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: '6', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: 'A', suit: 'D' },
        { rank: 'J', suit: 'H' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '4', suit: 'D' },
      ],
    ])
  )
} else if (mostMissedRule === 'draw_exact_kq') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'K', suit: 'S' },
        { rank: 'Q', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: '5', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'K', suit: 'H' },
        { rank: 'Q', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: '6', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: 'K', suit: 'D' },
        { rank: 'Q', suit: 'H' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '4', suit: 'D' },
      ],
    ])
  )
} else if (mostMissedRule === 'draw_exact_kj') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'K', suit: 'S' },
        { rank: 'J', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: '5', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'K', suit: 'H' },
        { rank: 'J', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: '6', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: 'K', suit: 'D' },
        { rank: 'J', suit: 'H' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '4', suit: 'D' },
      ],
    ])
  )
} else if (mostMissedRule === 'draw_exact_qj') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'Q', suit: 'S' },
        { rank: 'J', suit: 'D' },
        { rank: '8', suit: 'C' },
        { rank: '5', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'Q', suit: 'H' },
        { rank: 'J', suit: 'C' },
        { rank: '9', suit: 'D' },
        { rank: '6', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: 'Q', suit: 'D' },
        { rank: 'J', suit: 'H' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'S' },
        { rank: '4', suit: 'D' },
      ],
    ])
  )
  } else if (mostMissedRule === 'draw_four_to_royal') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'A', suit: 'S' },
        { rank: 'K', suit: 'S' },
        { rank: 'Q', suit: 'S' },
        { rank: 'J', suit: 'S' },
        { rank: '3', suit: 'D' },
      ],
      [
        { rank: 'A', suit: 'H' },
        { rank: 'K', suit: 'H' },
        { rank: 'Q', suit: 'H' },
        { rank: 'T', suit: 'H' },
        { rank: '5', suit: 'C' },
      ],
      [
        { rank: 'K', suit: 'D' },
        { rank: 'Q', suit: 'D' },
        { rank: 'J', suit: 'D' },
        { rank: 'T', suit: 'D' },
        { rank: '2', suit: 'S' },
      ],
    ])
  )
} else if (mostMissedRule === 'made_low_pair') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: '7', suit: 'S' },
        { rank: '7', suit: 'D' },
        { rank: 'A', suit: 'C' },
        { rank: '9', suit: 'H' },
        { rank: '4', suit: 'C' },
      ],
      [
        { rank: '6', suit: 'H' },
        { rank: '6', suit: 'C' },
        { rank: 'K', suit: 'D' },
        { rank: '8', suit: 'S' },
        { rank: '3', suit: 'H' },
      ],
      [
        { rank: '5', suit: 'D' },
        { rank: '5', suit: 'H' },
        { rank: 'Q', suit: 'C' },
        { rank: '9', suit: 'S' },
        { rank: '2', suit: 'D' },
      ],
    ])
  )
} else if (mostMissedRule === 'draw_single_ace') {
  setHand(
    randomHandFromLibrary([
      [
        { rank: 'A', suit: 'S' },
        { rank: '9', suit: 'D' },
        { rank: '7', suit: 'C' },
        { rank: '4', suit: 'H' },
        { rank: '2', suit: 'C' },
      ],
      [
        { rank: 'A', suit: 'H' },
        { rank: '8', suit: 'C' },
        { rank: '6', suit: 'D' },
        { rank: '3', suit: 'S' },
        { rank: '2', suit: 'H' },
      ],
      [
        { rank: 'A', suit: 'D' },
        { rank: 'T', suit: 'C' },
        { rank: '7', suit: 'H' },
        { rank: '5', suit: 'S' },
        { rank: '3', suit: 'D' },
      ],
    ])
  )
  } else {
    nextHand()
    return
  }

  setSelectedHold([])
  setResult(null)
  setGraded(false)
  setShowAnswer(false)
  setHandStartTime(Date.now())
}
function changeVariant(next: string) {
  setVariant(next)
  setHand(dealHand())
  setSelectedHold([])
  setResult(null)
  setGraded(false)
  setShowAnswer(false)
}

const topMistakes = Object.entries(mistakes).sort((a, b) => b[1] - a[1]).slice(0, 5)
const totalRules = Object.keys(mistakes).length
const needsWork = Object.keys(mistakes).filter((rule) =>
  ruleMasteryLabel(rule).includes('Needs Work')
).length
const improving = Object.keys(mistakes).filter((rule) =>
  ruleMasteryLabel(rule).includes('Improving')
).length
const mastered = Object.keys(mistakes).filter((rule) =>
  ruleMasteryLabel(rule).includes('Mastered')
).length
const masteredPct = totalRules > 0 ? Math.round((mastered / totalRules) * 100) : 0
const improvingPct = totalRules > 0 ? Math.round((improving / totalRules) * 100) : 0
const needsWorkPct = totalRules > 0 ? Math.round((needsWork / totalRules) * 100) : 0
const highestSrRule = topMistakes
  .map(([rule]) => rule)
  .sort((ruleA, ruleB) => spacedRepetitionScore(ruleB) - spacedRepetitionScore(ruleA))[0]
const focusCycleLevels = ['Medium', 'Sharp', 'Expert']
const currentCycleLabel =
  focusCycleIndex === 0 ? 'Ready' : focusCycleLevels[(focusCycleIndex - 1) % focusCycleLevels.length]
const upcomingCycleLabel = nextFocusCycleLabel()
const totalDifficultySeconds = Object.values(difficultyStats).reduce(
  (sum, stats) => sum + stats.totalSeconds,
  0
)
const totalDifficultyAttempts = Object.values(difficultyStats).reduce(
  (sum, stats) => sum + stats.attempts,
  0
)
const averageHandTime =
  totalDifficultyAttempts > 0 ? `${(totalDifficultySeconds / totalDifficultyAttempts).toFixed(1)}s` : '--'

return (
  <div className="app-shell">
    <div className="elite-container">
      <VegasHeader />

      <div className="stat-row">
        <StatCard icon="🎯" label="Attempts" value={attempts} />
        <StatCard icon="✅" label="Correct" value={correctAnswers} />
        <StatCard icon="📈" label="Accuracy" value={`${accuracy}%`} />
        <StatCard icon="🔥" label="Streak" value={currentStreak} />
        <StatCard icon="🏆" label="Best" value={bestStreak} />
        <StatCard icon="⏱" label="Avg Time" value={averageHandTime} />
      </div>

      <div className="dashboard-grid">
        <aside className="left-sidebar">
          <DashboardPanel title="Video Poker Variant" className="variant-panel">
            <select value={variant} onChange={(e) => changeVariant(e.target.value)} className="neon-select">
              {variants.map((game) => (
                <option key={game}>{game}</option>
              ))}
            </select>
          </DashboardPanel>

          <JackpotMachineCard />

          <SidebarPanel icon="🎯" title="Train Smarter">
            <div className="trainer-list">
              <p><strong>Adaptive Drills</strong><span>Focus on your weaknesses</span></p>
              <p><strong>Spaced Repetition</strong><span>Smarter review over time</span></p>
              <p><strong>Performance Tracking</strong><span>See your progress</span></p>
              <p><strong>Timed Challenges</strong><span>Improve your speed</span></p>
              <p><strong>Export Stats</strong><span>JSON / CSV</span></p>
            </div>
          </SidebarPanel>

          <SidebarPanel icon="🧠" title="Weakness Trainer" className="hot-panel">
            <p>{weaknessMessage || 'Miss a rule, then drill it until it sticks.'}</p>
            <button onClick={loadWeaknessHand} className="neon-button purple">Train My Weakness</button>
          </SidebarPanel>

          <SidebarPanel icon="📊" title="Feature Icons">
            <div className="feature-icon-grid">
              <span><strong>♠</strong> Speed</span>
              <span><strong>♥</strong> Focus</span>
              <span><strong>♦</strong> Recall</span>
              <span><strong>♣</strong> Mastery</span>
            </div>
          </SidebarPanel>
        </aside>

        <main className="center-stage">
          <DashboardPanel title="Current Hand" className="current-hand-panel">
            <p className="panel-subtitle center-text">Tap the cards you would hold</p>

            <div className="card-row">
              {hand.map((card) => {
                const selected = selectedHold.some((held) => cardCode(held) === cardCode(card))
                const correctHold =
                  graded &&
                  showAnswer &&
                  result?.holdCards.some((held) => cardCode(held) === cardCode(card))

                return (
                  <button
                    key={cardCode(card)}
                    onClick={() => toggleCard(card)}
                    className={`card-button ${selected ? 'selected' : ''} ${correctHold ? 'correct-hold' : ''}`}
                    style={{ color: cardColor(card) }}
                  >
                    {cardDisplay(card)}
                  </button>
                )
              })}
            </div>

            <div className="button-row">
              <button onClick={grade} disabled={graded && !!correct} className="neon-button green">
                Grade My Hold
              </button>
              <button onClick={nextHand} className="neon-button">Next Hand</button>
              <button onClick={() => trainFocusLevel('Medium')} className="neon-button">Train Medium</button>
              <button onClick={() => trainFocusLevel('Sharp')} className="neon-button">Train Sharp</button>
              <button onClick={() => trainFocusLevel('Expert')} className="neon-button">Train Expert</button>
              <button onClick={trainNextFocusCycle} className="neon-button orange">Train Focus Cycle</button>
            </div>
          </DashboardPanel>

          {graded && result && (
            <DashboardPanel className={correct ? 'answer-correct' : 'answer-wrong'} title={correct ? 'Correct' : 'Not Quite'}>
              <h2>{correct ? '✅ Correct!' : '❌ Not quite. Try again.'}</h2>

              {!correct && !showAnswer && (
                <>
                  <p>You selected the wrong hold. Try tapping a different hold, then press Grade My Hold again.</p>
                  <button onClick={() => setShowAnswer(true)} className="neon-button orange">
                    Show Answer
                  </button>
                </>
              )}

              {showAnswer && (
                <>
                  <p><strong>Best Play:</strong> {result.title}</p>
                  <p>
                    <strong>Correct Hold:</strong>{' '}
                    {result.holdCards.length === 0 ? 'Draw 5' : result.holdCards.map(cardDisplay).join(' ')}
                  </p>
                  <p><strong>Why:</strong> {result.explanation}</p>
                  <p><strong>Rule:</strong> {ruleLabels[result.ruleTag] || result.ruleTag}</p>
                  <p><strong>Difficulty:</strong> {ruleDifficulty(result.ruleTag)}</p>
                </>
              )}
            </DashboardPanel>
          )}

          <div className="center-panel-grid">
            <DashboardPanel title="Mastery Dashboard">
              <div className="mastery-bars">
                <div className="progress-row">
                  <div className="progress-label">
                    <span>Mastered</span>
                    <strong>{masteredPct}%</strong>
                  </div>
                  <div className="mastery-bar-wrap">
                    <div className="mastery-bar mastery-green" style={{ width: `${masteredPct}%` }} />
                  </div>
                </div>
                <div className="progress-row">
                  <div className="progress-label">
                    <span>Improving</span>
                    <strong>{improvingPct}%</strong>
                  </div>
                  <div className="mastery-bar-wrap">
                    <div className="mastery-bar mastery-yellow" style={{ width: `${improvingPct}%` }} />
                  </div>
                </div>
                <div className="progress-row">
                  <div className="progress-label">
                    <span>Needs Work</span>
                    <strong>{needsWorkPct}%</strong>
                  </div>
                  <div className="mastery-bar-wrap">
                    <div className="mastery-bar mastery-red" style={{ width: `${needsWorkPct}%` }} />
                  </div>
                </div>
              </div>
              <div className="mini-stat-grid">
                <StatCard label="Mastered" value={mastered} />
                <StatCard label="Improving" value={improving} />
                <StatCard label="Needs Work" value={needsWork} />
              </div>
            </DashboardPanel>

            <DashboardPanel title="Top Mistakes">
              {topMistakes.length === 0 ? (
                <p>No mistakes tracked yet.</p>
              ) : (
                topMistakes.map(([rule, count]) => (
                  <p key={rule} className="mistake-row">
                    <strong>{ruleLabels[rule] || rule}</strong>
                    <span>{count} miss{count === 1 ? '' : 'es'}</span>
                    <b>{spacedRepetitionScore(rule)}</b>
                  </p>
                ))
              )}
            </DashboardPanel>
          </div>
        </main>

        <aside className="right-sidebar">
          <DashboardPanel title="Last Broken Streak">
            <div className="streak-summary-grid">
              <span>Streak</span>
              <strong>{currentStreak}</strong>
              <span>Avg Time</span>
              <strong>{averageHandTime}</strong>
              <span>Last Hand</span>
              <strong>{lastHandSeconds === null ? '--' : `${lastHandSeconds.toFixed(1)}s`}</strong>
              <span>Mistakes</span>
              <strong>{topMistakes.length > 0 ? topMistakes.map(([rule]) => ruleLabels[rule] || rule).slice(0, 2).join(', ') : '--'}</strong>
            </div>
            {lastBrokenStreakSummary && <p className="streak-note">{lastBrokenStreakSummary}</p>}
          </DashboardPanel>

          <DashboardPanel title="Export Panel">
            <div className="button-row vertical-buttons">
              <button onClick={exportTrainingStats} className="neon-button">Export JSON</button>
              <button onClick={exportTrainingStatsCsv} className="neon-button green">Export CSV</button>
              <button
                onClick={() => {
                  setAttempts(0)
                  setCorrectAnswers(0)
                  setCurrentStreak(0)
                  setBestStreak(0)
                  setDifficultyStats({})
                  setCurrentStreakTimes([])
                  setLastBrokenStreakSummary('')
                  setLastHandSeconds(null)
                  setWeaknessMessage('')
                  setWeaknessDrillCount(0)
                  setAutoWeaknessMode(false)
                  setFocusCycleMode(false)
                  setFocusCycleIndex(0)
                  setMistakes({})
                  localStorage.removeItem('videoPokerTutorialSession')
                }}
                className="neon-button orange"
              >
                Reset Stats
              </button>
            </div>
          </DashboardPanel>

          <SidebarPanel icon="💬" title="Practice Edge" className="quote-panel">
            <span className="quote-mark">“</span>
            The more you practice, the sharper you play.
          </SidebarPanel>

          <SidebarPanel icon="🏆" title="Built For Winners" className="winner-panel">
            Confidence. Consistency. Smarter hands.
          </SidebarPanel>
        </aside>
      </div>

      <div className="lower-dashboard-grid">
        <DashboardPanel title="Difficulty Performance">
          {Object.keys(difficultyStats).length === 0 ? (
            <p>No difficulty stats yet.</p>
          ) : (
            ['Easy', 'Medium', 'Sharp', 'Expert'].map((level) => {
              const stats = difficultyStats[level]
              if (!stats) return null
              const pct = stats.attempts > 0 ? ((stats.correct / stats.attempts) * 100).toFixed(1) : '0.0'
              const avgTime = stats.attempts > 0 ? (stats.totalSeconds / stats.attempts).toFixed(1) : '0.0'
              const bestTime = stats.bestCorrectSeconds !== null ? stats.bestCorrectSeconds.toFixed(1) : '--'

              return (
                <div key={level} className="difficulty-row">
                  <div className="progress-label">
                    <span>{level}</span>
                    <strong>{pct}%</strong>
                  </div>
                  <div className="mastery-bar-wrap">
                    <div className={`mastery-bar difficulty-${level.toLowerCase()}`} style={{ width: `${pct}%` }} />
                  </div>
                  <p>{stats.correct}/{stats.attempts} | Avg: {avgTime}s | Best: {bestTime}s</p>
                </div>
              )
            })
          )}
        </DashboardPanel>

        <DashboardPanel title="Focus Cycle">
          <div className="cycle-grid">
            <div>
              <span>Current Cycle</span>
              <strong>{currentCycleLabel}</strong>
            </div>
            <div>
              <span>Next Cycle</span>
              <strong>{upcomingCycleLabel}</strong>
            </div>
          </div>

          <label className="toggle-row">
            <input type="checkbox" checked={autoWeaknessMode} onChange={(e) => setAutoWeaknessMode(e.target.checked)} /> Auto Weakness Training
          </label>

          <label className="field-label">
            Weakness Focus
            <select value={weaknessFocusLevel} onChange={(e) => setWeaknessFocusLevel(e.target.value)} className="neon-select">
              <option>All</option>
              <option>Easy</option>
              <option>Medium</option>
              <option>Sharp</option>
              <option>Expert</option>
            </select>
          </label>

          <label className="toggle-row">
            <input type="checkbox" checked={focusCycleMode} onChange={(e) => setFocusCycleMode(e.target.checked)} /> Smart Focus Cycling Mode
          </label>
          <button onClick={trainNextFocusCycle} className="neon-button orange">Train Next Cycle</button>
        </DashboardPanel>

        <DashboardPanel title="Spaced Repetition Score">
          {highestSrRule ? (
            <>
              <p><strong>Priority Rule:</strong> {ruleLabels[highestSrRule] || highestSrRule}</p>
              <p><strong>SR Score:</strong> {spacedRepetitionScore(highestSrRule)}</p>
              <p><strong>Mastery:</strong> {ruleMasteryLabel(highestSrRule)}</p>
            </>
          ) : (
            <p>No spaced repetition score yet.</p>
          )}
        </DashboardPanel>
      </div>

      <div className="bottom-benefit-strip">
        <div><span>🎯</span><strong>Adaptive Training</strong><p>Focus where it matters most.</p></div>
        <div><span>🧠</span><strong>Master Strategy</strong><p>Learn. Review. Retain.</p></div>
        <div><span>📊</span><strong>Track Everything</strong><p>Data-driven improvement.</p></div>
        <div><span>⚡</span><strong>Improve Faster</strong><p>Smarter reps. Better results.</p></div>
        <div><span>🏆</span><strong>Win More Hands</strong><p>Confidence through practice.</p></div>
      </div>
    </div>
  </div>
)
}


export default App
