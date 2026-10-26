/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/haati/material/LocationType'
import { usePlayerId, usePlayerName } from '@gamepark/react-game'
import { Location } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { helpComponents, helpLocation } from './helpStyles'

/**
 * Where a card stands, at the foot of its help dialog: "in your Palace", "in the hand of Ada"...
 * The key is the location, with a ".mine" variant for the viewer's own material.
 */
export const CardLocation = ({ location }: { location?: Partial<Location> }) => {
  const me = usePlayerId<number>()
  const name = usePlayerName(location?.player)
  if (location?.type === undefined) return null
  // The revealed top card of an Animal pile is the card offered to the loser of the duel.
  const key = location.type === LocationType.AnimalDeck && location.rotation ? 'animal-offer' : locationKeys[location.type as LocationType]
  if (!key) return null
  const mine = location.player !== undefined && location.player === me
  return (
    <p css={helpLocation}>
      <Trans i18nKey={`help.location.${key}${mine ? '.mine' : ''}`} values={{ player: name }} components={helpComponents} />
    </p>
  )
}

const locationKeys: Partial<Record<LocationType, string>> = {
  [LocationType.AnimalDeck]: 'animal-deck',
  [LocationType.AnimalDiscard]: 'animal-discard',
  [LocationType.CharacterDeck]: 'character-deck',
  [LocationType.CharacterDiscard]: 'character-discard',
  [LocationType.PlayerHand]: 'hand',
  [LocationType.PlayerDuel]: 'duel',
  [LocationType.Palace]: 'palace',
  [LocationType.Jungle]: 'jungle'
}
