import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { HandLocator, ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { isShuffle, MaterialItem, MaterialMove, Shuffle } from '@gamepark/rules-api'
import { CARD_WIDTH } from '../locators/TableLayout'
import { MoveAnimation } from './RowMove'

/**
 * The opponent's hand, mixed after each draw. The cards never change place on screen (the hand is
 * hidden, the mix happens on the server), so the eye would keep following the card drawn. Instead, the
 * Animal cards gather into one pile in the middle of the fan, one on the other. Twice, the pile parts in
 * two, one card out of two to the right, the others to the left, and closes up again the other way round:
 * the packet that was on top goes under. Then the cards spread out. The Character cards are not mixed and
 * do not move.
 *
 * The cards of a pile are only a few hundredths of an em apart: a card only changes its height in the pile
 * while the two packets are apart, never while it covers another, or the browser would hesitate over which
 * one is in front.
 */
const GATHER = 300
const PART = 200
const HOLD = 50
const CLOSE = 200
const MIXES = 2
const SPREAD = 300
export const HAND_SHUFFLE_DURATION = GATHER + MIXES * (PART + HOLD + CLOSE) + SPREAD
/** Where the two packets go, from the middle of the pile, along the card: a little gap between them. */
const PACKET_X = 0.55 * CARD_WIDTH

const isHandShuffle = (move: MaterialMove): move is Shuffle => isShuffle(move) && move.itemType === MaterialType.AnimalCard

/**
 * The hands mixed with nothing to show: the viewer's own (they see its cards, sorted by value, so the mix
 * moves nothing), and a hand holding a single Animal card.
 */
export const isHandShuffleSkipped = (move: MaterialMove, context: MaterialContext) =>
  isHandShuffle(move) && (move.indexes.length < 2 || context.rules.material(MaterialType.AnimalCard).getItem(move.indexes[0]).location.player === context.player)

export const isOpponentHandShuffled = (move: MaterialMove, context: MaterialContext) => isHandShuffle(move) && !isHandShuffleSkipped(move, context)

/** Where a card is: from the middle of the pile along the card (in em), and its height in the pile (in cards). */
type Spot = { x: number; height: number }

/**
 * The spots of every card at each step, in %, the cards listed in the order of the fan. The pile starts
 * in that order, the last card on top. At each mix, the cards at an even height go to one side, the others to
 * the other side, the top card's packet first to the right then to the left; it comes back under the other.
 */
const mixSteps = (cards: number[]): Map<number, [number, Spot][]> => {
  const steps = new Map(cards.map((card) => [card, [] as [number, Spot][]]))
  let pile = [...cards]
  let time = GATHER
  const at = (spot: (card: number, height: number) => Spot) =>
    pile.forEach((card, height) => steps.get(card)!.push([(time / HAND_SHUFFLE_DURATION) * 100, spot(card, height)]))
  at((_, height) => ({ x: 0, height }))
  for (let mix = 0; mix < MIXES; mix++) {
    const topParity = (pile.length - 1) % 2
    const topSide = mix % 2 === 0 ? 1 : -1
    const sideOf = (height: number) => (height % 2 === topParity ? topSide : -topSide)
    const sides = new Map(pile.map((card, height) => [card, sideOf(height)]))
    time += PART
    at((card, height) => ({ x: sides.get(card)! * PACKET_X, height }))
    // Apart, the top card's packet goes under the other one.
    const top = pile.filter((_, height) => height % 2 === topParity)
    const other = pile.filter((_, height) => height % 2 !== topParity)
    pile = [...top, ...other]
    time += HOLD
    at((card, height) => ({ x: sides.get(card)! * PACKET_X, height }))
    time += CLOSE
    at((_, height) => ({ x: 0, height }))
  }
  return steps
}

export const handShuffle = (context: ItemContext, animation: MoveAnimation) => {
  const move = animation.move as Shuffle
  if (context.type !== MaterialType.AnimalCard || !move.indexes.includes(context.index)) return
  const locator = context.locators[LocationType.PlayerHand]
  if (!(locator instanceof HandLocator)) return
  const item = context.rules.material(MaterialType.AnimalCard).getItem(context.index)
  const player = item.location.player
  // The opponent's Animal cards are fanned in the order of the material, after the Character cards.
  const characters = context.rules.material(MaterialType.CharacterCard).location(LocationType.PlayerHand).player(player).length
  const cards = context.rules.material(MaterialType.AnimalCard).location(LocationType.PlayerHand).player(player).getIndexes()
  const steps = mixSteps(cards).get(context.index)
  if (!steps) return
  const middle = characters + (cards.length - 1) / 2

  const angle = locator.getRotateZ(item.location, context, middle)
  const cos = Math.cos((angle * Math.PI) / 180)
  const sin = Math.sin((angle * Math.PI) / 180)
  const deltaZ = locator.getDeltaZ(item.location, context)
  const description = context.material[context.type]
  // The same locator, with the card placed at the middle of the fan, with the tilt of the middle card, moved
  // along the card, at its height in the pile.
  const inPile = ({ x, height }: Spot) => {
    const pile = Object.create(locator) as HandLocator
    pile.getItemCoordinates = (item: MaterialItem, context: ItemContext) => {
      const middleSpot = locator.getLocationCoordinates(item.location, context, middle)
      return {
        x: (middleSpot.x ?? 0) + x * cos,
        y: (middleSpot.y ?? 0) + x * sin,
        z: (middleSpot.z ?? 0) + (height + 1) * deltaZ
      }
    }
    pile.getItemRotateZ = () => angle
    return (description?.getItemTransform(item, { ...context, locators: { ...context.locators, [LocationType.PlayerHand]: pile } }) ?? []).join(' ')
  }

  // From the fan to the pile, the mixes, then back to the fan.
  const fan = transformItem(context).join(' ')
  const shuffle = keyframes`
    0%, 100% { transform: ${fan}; }
    ${steps.map(([at, spot]) => `${at}% { transform: ${inPile(spot)}; }`).join('\n')}
  `
  return css`
    > * {
      animation: ${shuffle} ${animation.duration}s ease-in-out forwards;
    }
  `
}
