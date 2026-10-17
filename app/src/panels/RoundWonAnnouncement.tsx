/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { useAnimation, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isMoveItem, MaterialMove } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { isRoundWon } from '../animations/VictoryShow'
import { TABLE_HEIGHT, TABLE_WIDTH, VICTORY_HEIGHT, VICTORY_SHOW_SCALE } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'
import { getRound } from './RoundProgress'

/**
 * While the Round victory token of a round won stands in the middle of the table (see roundWonShow),
 * a sand-coloured plate under it names the winner and the round. It fades in once the token has
 * arrived and fades out before the token leaves.
 */
export const RoundWonAnnouncement = () => {
  const { t } = useTranslation()
  const rules = useRules<HaatiRules>()
  const me = usePlayerId<number>()
  const animation = useAnimation<MaterialMove>((animation) => !!rules && isRoundWon(animation.move, { rules }))
  const move = animation?.move
  const winner = move && isMoveItem(move) ? move.location.player : undefined
  const name = usePlayerName(winner)
  if (!rules || !animation || winner === undefined) return null
  const round = getRound(rules)
  const text = winner === me ? t('announce.round-won.you', { round }) : t('announce.round-won.player', { player: name, round })
  return (
    <div css={placeCss}>
      <div css={[plateCss, fadeCss(animation.duration)]}>
        <span css={textCss}>{text}</span>
      </div>
    </div>
  )
}

/** Under the token grown in the middle of the table. */
const placeCss = css`
  position: absolute;
  left: ${TABLE_WIDTH / 2}em;
  top: ${TABLE_HEIGHT / 2 + (VICTORY_HEIGHT * VICTORY_SHOW_SCALE) / 2 + 1}em;
  transform: translate(-50%, 0) translateZ(20em);
  pointer-events: none;
`

/** In step with the token: visible while it shines in the middle. */
const fade = keyframes`
  0%, 25% { opacity: 0; }
  35%, 72% { opacity: 1; }
  80%, 100% { opacity: 0; }
`

const fadeCss = (duration: number) => css`
  animation: ${fade} ${duration}s ease-in-out forwards;
`

/** The plate of the turn announcement. */
const plateCss = css`
  font-size: 0.8em;
  padding: 1em 2.5em;
  white-space: nowrap;
  opacity: 0;
  border-radius: 0.6em;
  background: linear-gradient(160deg, ${colors.parchment} 0%, ${colors.sand} 100%);
  border: 0.15em solid ${colors.gold};
  box-shadow: 0 0.2em 0.6em rgba(0, 0, 0, 0.35);
`

const textCss = css`
  font-family: ${fontDisplay};
  font-size: 3.2em;
  line-height: 1;
  color: ${colors.ink};
`
