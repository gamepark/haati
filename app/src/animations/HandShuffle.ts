import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { HandLocator, ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { isShuffle, MaterialItem, MaterialMove, Shuffle } from '@gamepark/rules-api'
import { MoveAnimation } from './RowMove'

/**
 * The opponent's hand, mixed after each draw. The cards never change place on screen (the hand is
 * hidden, the mix happens on the server), so the eye would keep following the card drawn. Instead, the
 * Animal cards gather into one pile in the middle of the fan, then spread out again: once piled up,
 * nobody can tell which one goes where. The Character cards are not mixed and do not move.
 */
export const HAND_SHUFFLE_DURATION = 900
/** The share of the animation spent gathering, the same spent spreading out again. */
const GATHER_SHARE = 0.39

/** The viewer's own hand is skipped: they see its cards, sorted by value, so the mix moves nothing. */
export const isOpponentHandShuffled = (move: MaterialMove, context: MaterialContext) =>
  isShuffle(move) &&
  move.itemType === MaterialType.AnimalCard &&
  context.rules.material(MaterialType.AnimalCard).getItem(move.indexes[0]).location.player !== context.player

export const handShuffle = (context: ItemContext, animation: MoveAnimation) => {
  const move = animation.move as Shuffle
  if (context.type !== MaterialType.AnimalCard || !move.indexes.includes(context.index)) return
  const locator = context.locators[LocationType.PlayerHand]
  if (!(locator instanceof HandLocator)) return
  const item = context.rules.material(MaterialType.AnimalCard).getItem(context.index)
  // The middle of the Animal cards, which come after the Character cards in the fan.
  const characters = context.rules.material(MaterialType.CharacterCard).location(LocationType.PlayerHand).player(item.location.player).length
  const middle = characters + (move.indexes.length - 1) / 2
  // The same locator, every card placed at the middle; each keeps its own height so that the pile does not flicker.
  const gathered = Object.create(locator) as HandLocator
  gathered.getItemCoordinates = (item: MaterialItem, context: ItemContext) => ({
    ...locator.getLocationCoordinates(item.location, context, middle),
    z: locator.getItemCoordinates(item, context).z
  })
  gathered.getItemRotateZ = (item: MaterialItem, context: ItemContext) => locator.getRotateZ(item.location, context, middle)

  const description = context.material[context.type]
  const current = transformItem(context).join(' ')
  const pile = (description?.getItemTransform(item, { ...context, locators: { ...context.locators, [LocationType.PlayerHand]: gathered } }) ?? []).join(' ')
  const gather = keyframes`
    0%, 100% { transform: ${current}; }
    ${GATHER_SHARE * 100}%, ${(1 - GATHER_SHARE) * 100}% { transform: ${pile}; }
  `
  return css`
    > * {
      animation: ${gather} ${animation.duration}s ease-in-out forwards;
    }
  `
}
