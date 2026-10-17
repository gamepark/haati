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

const DURATION = 2

/**
 * At the start of each turn, a sand-coloured plate fades in and out in the middle of the table to
 * announce it: the round on its first turn, then the turns left, then the last turn. Remounted at each
 * turn by its key, it plays once and stays invisible until the turn is over.
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
      <div css={plateCss}>
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

/** Fades in, stays a moment, fades out. */
const fade = keyframes`
  0% { opacity: 0; }
  20% { opacity: 1; }
  75% { opacity: 1; }
  100% { opacity: 0; }
`

/** A sand-coloured plate with the gold rim of the player panels. */
const plateCss = css`
  font-size: 0.8em;
  padding: 1em 2.5em;
  white-space: nowrap;
  opacity: 0;
  border-radius: 0.6em;
  background: linear-gradient(160deg, ${colors.parchment} 0%, ${colors.sand} 100%);
  border: 0.15em solid ${colors.gold};
  box-shadow: 0 0.2em 0.6em rgba(0, 0, 0, 0.35);
  animation: ${fade} ${DURATION}s ease-in-out forwards;
`

const textCss = css`
  font-family: ${fontDisplay};
  font-size: 3.2em;
  line-height: 1;
  color: ${colors.ink};
`
