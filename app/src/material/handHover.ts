import { css } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { ItemContext } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'

/**
 * A card of the hand, hovered, is straightened, lifted a little and enlarged a little. The enlargement is
 * greater than the lift, so that the card stays under the pointer: it never slips away from it.
 */
export const HAND_HOVER_LIFT = 0.6
export const HAND_HOVER_SCALE = 1.25
export const HAND_HOVER_TIME = '0.15s'

/** The label emotion adds to the class names of the cards in hand, which the hover styles look for. */
export const HAND_CARD_LABEL = 'haati-hand-card'

/**
 * The tilt of a card in the fanned hand, or undefined if the card is not in a hand or is seen from its back
 * (the hand of the opponent): there is nothing to look closer at on a back, so it is not hovered.
 */
export const handCardAngle = (item: MaterialItem, context: ItemContext<number, MaterialType, LocationType>): number | undefined =>
  item.location.type === LocationType.PlayerHand && item.id !== undefined ? context.locators[LocationType.PlayerHand]?.getItemRotateZ(item, context) : undefined

/** Marks a card of the hand for the hover styles, and gives them its tilt. */
export const handCardCss = (angle: number) => css`
  label: ${HAND_CARD_LABEL};
  --hand-angle: ${angle}deg;
`
