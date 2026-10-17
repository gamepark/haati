/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { useRules } from '@gamepark/react-game'
import { useTranslation } from 'react-i18next'
import { TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'
import { getRound, getTurn, ROUND_TURNS } from './RoundProgress'

const DURATION = 1.6

/**
 * At the start of each turn, a gust of sand crosses the middle of the table from left to right and
 * stops for a moment to announce it: the round on its first turn, then the turns left, then the last
 * turn. Remounted at each turn by its key, it plays once and stays invisible until the turn is over.
 */
export const TurnAnnouncement = () => {
  const { t } = useTranslation()
  const rules = useRules<HaatiRules>()
  if (!rules || rules.isOver() || rules.game.rule?.id !== RuleId.ChooseCards) return null
  const turn = getTurn(rules)
  const round = getRound(rules)
  const text =
    turn === 1 ? t('announce.round', { round }) : turn === ROUND_TURNS ? t('announce.last-turn') : t('announce.turns-left', { count: ROUND_TURNS + 1 - turn })
  return (
    <div key={`${round}-${turn}`} css={placeCss}>
      <div css={gustCss}>
        <span css={textCss}>{text}</span>
      </div>
    </div>
  )
}

const placeCss = css`
  position: absolute;
  left: ${TABLE_WIDTH / 2}em;
  top: ${TABLE_HEIGHT / 2}em;
  transform: translate(-50%, -50%) translateZ(10em);
  pointer-events: none;
`

/** In from the left, blurred and leaning with the wind; still in the middle; out to the right. */
const gust = keyframes`
  0% { transform: translateX(-40em) skewX(-25deg); opacity: 0; filter: blur(0.5em); }
  25% { transform: translateX(0) skewX(0); opacity: 1; filter: blur(0); }
  70% { transform: translateX(0) skewX(0); opacity: 1; filter: blur(0); }
  100% { transform: translateX(40em) skewX(25deg); opacity: 0; filter: blur(0.5em); }
`

/** Brown grains of sand scattered at random, from a noise filter. */
const sandGrains = `url("data:image/svg+xml,${encodeURIComponent(
  `<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.54 0 0 0 0 0.39 0 0 0 0 0.13 0 0 0 2.2 -1'/></filter><rect width='100%' height='100%' filter='url(#n)'/></svg>`
)}")`

/** The grains blow on through the band while it stands still: the fine grains, and the streaks of the wind, faster. */
const grains = keyframes`
  from { background-position: 0 0, 0 0, 0 0; }
  to { background-position: 8em 0, 30em 0, 0 0; }
`

const gustCss = css`
  padding: 1.4em 9em;
  white-space: nowrap;
  opacity: 0;
  background:
    ${sandGrains} 0 0 / 5em 5em,
    ${sandGrains} 0 0 / 30em 0.5em,
    linear-gradient(90deg, transparent, ${colors.sand} 22%, ${colors.parchmentDeep} 50%, ${colors.sand} 78%, transparent);
  mask-image: linear-gradient(transparent, black 25%, black 75%, transparent);
  animation:
    ${gust} ${DURATION}s cubic-bezier(0.3, 0, 0.7, 1) forwards,
    ${grains} ${DURATION}s linear;
`

const textCss = css`
  font-family: ${fontDisplay};
  font-size: 3.2em;
  line-height: 1;
  color: ${colors.ink};
  text-shadow:
    0 0 0.15em ${colors.parchment},
    0 0.05em 0.1em rgba(0, 0, 0, 0.3);
`
