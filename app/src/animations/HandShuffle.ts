import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { HandLocator, ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { isShuffle, MaterialItem, MaterialMove, Shuffle } from '@gamepark/rules-api'
import { CARD_HEIGHT, CARD_WIDTH } from '../locators/TableLayout'
import { MoveAnimation } from './RowMove'

/**
 * The opponent's hand, mixed after each draw. The cards never change place on screen (the hand is
 * hidden, the mix happens on the server), so the eye would keep following the card drawn. Instead, the
 * Animal cards gather into one pile in the middle of the fan, which is what loses the eye. The pile is cut
 * into two packets side by side, one card out of two in each, that swap places twice, one packet going
 * over the other, well above it, then under it. The packets close up into one pile again and the cards
 * spread out. The Character cards are not mixed and do not move.
 *
 * The cards of a pile are only a few hundredths of an em apart: none ever changes its height in a pile
 * while it covers another, or the browser would hesitate over which one is in front.
 */
const GATHER = 250
const CUT = 150
const CROSS = 350
const CROSSES = 2
const CLOSE = 150
const SPREAD = 250
export const HAND_SHUFFLE_DURATION = GATHER + CUT + CROSSES * CROSS + CLOSE + SPREAD
/** Where the two packets lie, from the middle of the pile, along the card: a little gap between them. */
const PACKET_X = 0.55 * CARD_WIDTH
/** How high the packet going over is lifted, in em, and how far apart the two packets pass, along the card. */
const LIFT = 2
const ARC = 0.12 * CARD_HEIGHT

const isHandShuffle = (move: MaterialMove): move is Shuffle => isShuffle(move) && move.itemType === MaterialType.AnimalCard

/**
 * The hands mixed with nothing to show: the viewer's own (they see its cards, sorted by value, so the mix
 * moves nothing), and a hand holding a single Animal card.
 */
export const isHandShuffleSkipped = (move: MaterialMove, context: MaterialContext) =>
  isHandShuffle(move) && (move.indexes.length < 2 || context.rules.material(MaterialType.AnimalCard).getItem(move.indexes[0]).location.player === context.player)

export const isOpponentHandShuffled = (move: MaterialMove, context: MaterialContext) => isHandShuffle(move) && !isHandShuffleSkipped(move, context)

/** Where a card is, from the middle of the pile: along the card and across it (in em), and how high it is lifted (in em). */
type Spot = { x: number; y: number; lift: number }

/**
 * The spots of a card at each step, in %. The card at the given height in the pile goes to the left packet
 * (-1) or to the right one (1), every other card. The left packet goes over first.
 */
const shuffleSteps = (height: number): [number, Spot][] => {
  const packet = height % 2 === 0 ? -1 : 1
  const steps: [number, Spot][] = []
  let time = GATHER
  const at = (spot: Spot) => steps.push([(time / HAND_SHUFFLE_DURATION) * 100, spot])
  at({ x: 0, y: 0, lift: 0 })
  time += CUT
  let x = packet * PACKET_X
  at({ x, y: 0, lift: 0 })
  for (let cross = 0; cross < CROSSES; cross++) {
    const over = (cross % 2 === 0) === (packet === -1)
    time += CROSS / 2
    at({ x: 0, y: over ? -ARC : ARC, lift: over ? LIFT : 0 })
    time += CROSS / 2
    x = -x
    at({ x, y: 0, lift: 0 })
  }
  time += CLOSE
  at({ x: 0, y: 0, lift: 0 })
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
  const height = cards.indexOf(context.index)
  const middle = characters + (cards.length - 1) / 2

  const angle = locator.getRotateZ(item.location, context, middle)
  const cos = Math.cos((angle * Math.PI) / 180)
  const sin = Math.sin((angle * Math.PI) / 180)
  const deltaZ = locator.getDeltaZ(item.location, context)
  const description = context.material[context.type]
  // The same locator, with the card placed at the middle of the fan, with the tilt of the middle card, moved
  // along and across the card, and at its own height in the pile.
  const inPile = ({ x, y, lift }: Spot) => {
    const pile = Object.create(locator) as HandLocator
    pile.getItemCoordinates = (item: MaterialItem, context: ItemContext) => {
      const middleSpot = locator.getLocationCoordinates(item.location, context, middle)
      return {
        x: (middleSpot.x ?? 0) + x * cos - y * sin,
        y: (middleSpot.y ?? 0) + x * sin + y * cos,
        z: (middleSpot.z ?? 0) + (height + 1) * deltaZ + lift
      }
    }
    pile.getItemRotateZ = () => angle
    return (description?.getItemTransform(item, { ...context, locators: { ...context.locators, [LocationType.PlayerHand]: pile } }) ?? []).join(' ')
  }

  // From the fan to the pile, the cut and the crosses, then back to the fan.
  const fan = transformItem(context).join(' ')
  const shuffle = keyframes`
    0%, 100% { transform: ${fan}; }
    ${shuffleSteps(height)
      .map(([at, spot]) => `${at}% { transform: ${inPile(spot)}; }`)
      .join('\n')}
  `
  return css`
    > * {
      animation: ${shuffle} ${animation.duration}s ease-in-out forwards;
    }
  `
}
