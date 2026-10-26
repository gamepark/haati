/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { useMaterialContext, usePlay, usePlayerId, usePlayers } from '@gamepark/react-game'
import { MaterialMove, MaterialMoveBuilder } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'
import { useLastTakenCard } from '../history/lastTakenCard'
import { CARD_HEIGHT, HAND, side, TABLE_HEIGHT, TABLE_WIDTH } from '../locators/TableLayout'
import { itemButtonCss } from '../theme/itemButton'

/** Above the hand, on the edge of its middle card. */
const BUTTON_Y = HAND.y - CARD_HEIGHT / 2 - 1.4

/**
 * A (?) over each hand the viewer cannot see, once its owner took a card from the piles: both players saw
 * that card arrive, and the help of the hand reminds which one it was (see TakenCardHelp).
 */
export const LastTakenCards = () => {
  const players = usePlayers<number>()
  const me = usePlayerId<number>()
  return (
    <>
      {players
        .filter((player) => player.id !== me)
        .map((player) => (
          <LastTakenCardButton key={player.id} player={player.id} />
        ))}
    </>
  )
}

const LastTakenCardButton = ({ player }: { player: number }) => {
  const { t } = useTranslation()
  const context = useMaterialContext()
  const play = usePlay<MaterialMove>()
  if (useLastTakenCard(player) === undefined) return null
  return (
    <button
      css={[itemButtonCss, buttonCss, placeCss(side(player, context) * HAND.x, BUTTON_Y)]}
      onClick={() => play(MaterialMoveBuilder.displayLocationHelp({ type: LocationType.PlayerHand, player }), { local: true })}
      aria-label={t('help.taken.title')}
    >
      <FontAwesomeIcon icon={faQuestion} />
    </button>
  )
}

const placeCss = (x: number, y: number) => css`
  left: ${TABLE_WIDTH / 2 + x}em;
  top: ${TABLE_HEIGHT / 2 + y}em;
`

const buttonCss = css`
  position: absolute;
  transform: translate(-50%, -50%) translateZ(1em);
  font-size: 1em;
  cursor: pointer;
`
