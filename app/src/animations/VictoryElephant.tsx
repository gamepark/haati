/** @jsxImportSource @emotion/react */
import { css, keyframes } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { ROUNDS_TO_WIN } from '@gamepark/haati/rules/EndOfRoundRule'
import { usePlayerId, useRules } from '@gamepark/react-game'
import { useEffect, useRef, useState } from 'react'
import { BOTTOM_ROW_Y, PLAYER_VICTORY_X, TABLE_HEIGHT, TABLE_WIDTH, VICTORY_HEIGHT, VICTORY_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import roundVictory1 from '../images/tokens/RoundVictory1.png'
import roundVictory2 from '../images/tokens/RoundVictory2.png'

const SCALE = 3
const DURATION = 6000

/**
 * When the game ends before the player's eyes, the winner's two halves of the elephant rise to the
 * middle of the table, grow and shine, then go back to their place, before the result dialog opens.
 * A game already over when it is displayed is not celebrated again.
 */
export const VictoryElephant = () => {
  const rules = useRules<HaatiRules>()
  const me = usePlayerId<number>()
  const over = rules?.isOver() ?? false
  const wasOver = useRef(over)
  const [winner, setWinner] = useState<number>()

  useEffect(() => {
    if (over && !wasOver.current && rules) {
      setWinner(rules.players.find((player) => rules.getScore(player) >= ROUNDS_TO_WIN))
    }
    wasOver.current = over
  }, [over, rules])

  if (winner === undefined || !rules) return null
  const x = (winner === (me ?? rules.players[0]) ? -1 : 1) * PLAYER_VICTORY_X
  return (
    <div css={[placeCss(x, BOTTOM_ROW_Y), riseCss(x, BOTTOM_ROW_Y)]} onAnimationEnd={() => setWinner(undefined)}>
      <img src={roundVictory1} css={halfCss} alt="" />
      <img src={roundVictory2} css={halfCss} alt="" />
      <div css={shineCss} />
    </div>
  )
}

const placeCss = (x: number, y: number) => css`
  position: absolute;
  left: ${TABLE_WIDTH / 2 + x - VICTORY_WIDTH}em;
  top: ${TABLE_HEIGHT / 2 + y - VICTORY_HEIGHT / 2}em;
  width: ${2 * VICTORY_WIDTH}em;
  height: ${VICTORY_HEIGHT}em;
  display: flex;
  overflow: hidden;
  border-radius: 0.3em;
  transform: translateZ(20em);
  pointer-events: none;
`

/** Hidden while the last token travels, then up to the middle, a pause, and back. */
const rise = (x: number, y: number) => keyframes`
  0%, 18% { opacity: 0; transform: translateZ(20em); }
  20% { opacity: 1; transform: translateZ(20em); filter: drop-shadow(0 0 0 ${colors.goldLight}); }
  38%, 78% { opacity: 1; transform: translateZ(20em) translate(${-x}em, ${-y}em) scale(${SCALE}); filter: drop-shadow(0 0 0.4em ${colors.goldLight}); }
  96% { opacity: 1; transform: translateZ(20em); filter: drop-shadow(0 0 0 ${colors.goldLight}); }
  100% { opacity: 0; transform: translateZ(20em); }
`

const riseCss = (x: number, y: number) => css`
  animation: ${rise(x, y)} ${DURATION}ms ease-in-out both;
`

const halfCss = css`
  width: ${VICTORY_WIDTH}em;
  height: ${VICTORY_HEIGHT}em;
`

/** A glint sweeping across the elephant while it stands in the middle. */
const sweep = keyframes`
  0%, 40% { transform: translateX(-150%) skewX(-20deg); }
  70%, 100% { transform: translateX(250%) skewX(-20deg); }
`

const shineCss = css`
  position: absolute;
  inset: 0;
  width: 50%;
  background: linear-gradient(90deg, transparent, rgba(255, 250, 225, 0.75), transparent);
  mix-blend-mode: screen;
  animation: ${sweep} ${DURATION}ms ease-in-out both;
`
