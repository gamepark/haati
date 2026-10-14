/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { countPrestige } from '@gamepark/haati/material/Prestige'
import { StyledPlayerPanel, usePlayers, useRules } from '@gamepark/react-game'
import { PLAYER_PANEL_WIDTH, PLAYER_PANEL_X, PLAYER_PANEL_Y, TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'
import favor from '../images/tokens/prestige/Favor1.png'
import honor from '../images/tokens/prestige/Honor1.png'
import roundVictory from '../images/tokens/RoundVictory1.png'

/** The width of a StyledPlayerPanel in its own em. */
const PANEL_EM_WIDTH = 28

/**
 * Each panel lies on the table, in the top corner of its owner's side: the viewer on the left, the
 * opponent on the right. Three counters: Favor, Honor, and Round victories.
 */
export const PlayerPanels = () => {
  const players = usePlayers<number>({ sortFromMe: true })
  const rules = useRules<HaatiRules>()
  if (!rules) return null
  return (
    <>
      {players.map((player, index) => (
        <div key={player.id} css={panelPlace(index === 0)}>
          <StyledPlayerPanel
            player={player}
            activeRing
            css={panelCss}
            counters={[
              { image: favor, value: countPrestige(rules, MaterialType.Favor, player.id), imageCss: tokenImage },
              { image: honor, value: countPrestige(rules, MaterialType.Honor, player.id), imageCss: tokenImage },
              { image: roundVictory, value: `${rules.getScore(player.id)}/2`, imageCss: tokenImage }
            ]}
          />
        </div>
      ))}
    </>
  )
}

const panelPlace = (left: boolean) => css`
  position: absolute;
  left: ${(left ? -PLAYER_PANEL_X - PLAYER_PANEL_WIDTH : PLAYER_PANEL_X) + TABLE_WIDTH / 2}em;
  top: ${PLAYER_PANEL_Y + TABLE_HEIGHT / 2}em;
  width: ${PLAYER_PANEL_WIDTH}em;
`

const panelCss = css`
  position: relative;
  font-size: ${PLAYER_PANEL_WIDTH / PANEL_EM_WIDTH}em;
  background: linear-gradient(160deg, ${colors.parchment} 0%, ${colors.sand} 100%);
  border: 0.15em solid ${colors.gold};
  --gp-ring-color-1: ${colors.gold};
  --gp-ring-color-2: ${colors.plumLight};
`

const tokenImage = css`
  object-fit: contain;
`
