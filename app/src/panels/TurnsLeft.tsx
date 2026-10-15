/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { useRules } from '@gamepark/react-game'
import { CYCLE_Y, TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import { fontDisplay } from '../theme'
import { turnsLeft } from './turnCount'

/** The turns left in the round, in the middle of the cycle printed on the board. The board help says what it counts. */
export const TurnsLeft = () => {
  const rules = useRules<HaatiRules>()
  if (!rules) return null
  return (
    <div css={placeCss}>
      <span css={turnsCss}>{turnsLeft(rules)}</span>
    </div>
  )
}

const placeCss = css`
  position: absolute;
  left: ${TABLE_WIDTH / 2}em;
  top: ${TABLE_HEIGHT / 2 + CYCLE_Y}em;
  transform: translate(-50%, -50%);
  pointer-events: none;
`

// The box is trimmed to the height of the figure, so that the figure itself is centred, whatever room
// the font leaves above and below it.
const turnsCss = css`
  display: block;
  font-family: ${fontDisplay};
  font-size: 1.3em;
  line-height: 1;
  text-box: trim-both cap alphabetic;
  color: ${colors.plum};
  text-shadow: 0 0 0.15em ${colors.parchment};
`
