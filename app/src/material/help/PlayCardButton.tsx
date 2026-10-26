/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { PlayMoveButton, useLegalMove } from '@gamepark/react-game'
import { isMoveItemType, MoveItem } from '@gamepark/rules-api'
import { useTranslation } from 'react-i18next'

/**
 * Plays the card of the help dialog into the duel, as its arrow button on the table does, then closes the
 * dialog. Nothing is shown when the card cannot be played.
 */
export const PlayCardButton = ({ type, itemIndex, label, closeDialog }: { type: MaterialType; itemIndex?: number; label: string; closeDialog?: () => void }) => {
  const { t } = useTranslation()
  const move = useLegalMove<MoveItem>(
    (move) => isMoveItemType(type)(move) && move.itemIndex === itemIndex && move.location.type === LocationType.PlayerDuel
  )
  if (!move) return null
  return (
    <p>
      <PlayMoveButton move={move} onPlay={closeDialog}>
        <FontAwesomeIcon icon={faArrowUp} css={iconCss} />
        {t(label)}
      </PlayMoveButton>
    </p>
  )
}

const iconCss = css`
  margin-right: 0.4em;
`
