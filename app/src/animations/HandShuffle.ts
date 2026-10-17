import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { HandLocator, ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { isShuffle, MaterialItem, MaterialMove, Shuffle } from '@gamepark/rules-api'
import { CARD_WIDTH, side } from '../locators/TableLayout'
import { MoveAnimation } from './RowMove'

/**
 * The opponent's hand, mixed after each draw. The cards never change place on screen (the hand is
 * hidden, the mix happens on the server), so the eye would keep following the card drawn. Instead, the
 * Animal cards gather into one pile in the middle of the fan, the top card slides right out of the pile
 * towards the edge of the screen and goes back in under it, four times in a row, then the cards spread out
 * again. The Character cards are not mixed and do not move.
 */
const GATHER = 300
const PASS = 150
const PASSES = 4
export const HAND_SHUFFLE_DURATION = 2 * GATHER + PASSES * PASS
/** Within a pass, when the card is fully out of the pile, then when it starts going back in under it. */
const OUT_SHARE = 0.45
const BACK_SHARE = 0.55
/** How far the card slides out, as a ratio of its width: a little more than its width, so it leaves the pile entirely. */
const OUT_DISTANCE = 1.1

const isHandShuffle = (move: MaterialMove): move is Shuffle => isShuffle(move) && move.itemType === MaterialType.AnimalCard

/**
 * The hands mixed with nothing to show: the viewer's own (they see its cards, sorted by value, so the mix
 * moves nothing), and a hand holding a single Animal card.
 */
export const isHandShuffleSkipped = (move: MaterialMove, context: MaterialContext) =>
  isHandShuffle(move) && (move.indexes.length < 2 || context.rules.material(MaterialType.AnimalCard).getItem(move.indexes[0]).location.player === context.player)

export const isOpponentHandShuffled = (move: MaterialMove, context: MaterialContext) => isHandShuffle(move) && !isHandShuffleSkipped(move, context)

/** A step of the animation: how far the card is out of the pile (in em, along the card) and its height in the pile (in cards). */
type Step = { at: number; out: number; height: number }

/**
 * The steps of every card, the cards listed in the order of the fan. The pile starts in that order, the
 * last card on top; each pass takes the top card out and puts it at the bottom.
 */
const passSteps = (cards: number[], outward: number): Map<number, Step[]> => {
  const total = HAND_SHUFFLE_DURATION
  const steps = new Map(cards.map((card) => [card, [] as Step[]]))
  const pile = [...cards]
  const heights = () => new Map(pile.map((card, height) => [card, height]))
  for (let pass = 0; pass < PASSES; pass++) {
    const start = GATHER + pass * PASS
    const at = (share: number) => ((start + share * PASS) / total) * 100
    const before = heights()
    const moved = pile.pop()!
    pile.unshift(moved)
    const after = heights()
    for (const card of cards) {
      const list = steps.get(card)!
      if (card === moved) {
        // Out on top, then back in under the whole pile while the others rise by one card.
        list.push({ at: at(0), out: 0, height: before.get(card)! })
        list.push({ at: at(OUT_SHARE), out: outward, height: before.get(card)! })
        list.push({ at: at(BACK_SHARE), out: outward, height: -1 })
        list.push({ at: at(1), out: 0, height: after.get(card)! })
      } else {
        list.push({ at: at(0), out: 0, height: before.get(card)! })
        list.push({ at: at(BACK_SHARE), out: 0, height: before.get(card)! })
        list.push({ at: at(1), out: 0, height: after.get(card)! })
      }
    }
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
  const middle = characters + (cards.length - 1) / 2
  const outward = side(player, context) * OUT_DISTANCE * CARD_WIDTH
  const steps = passSteps(cards, outward).get(context.index)
  if (!steps) return

  const angle = locator.getRotateZ(item.location, context, middle)
  const radians = (angle * Math.PI) / 180
  const deltaZ = locator.getDeltaZ(item.location, context)
  const description = context.material[context.type]
  // The same locator, with the card placed in the pile at the middle of the fan: the place and the tilt of the
  // middle card, shifted along the card, at its height in the pile.
  const inPile = ({ out, height }: Step) => {
    const pile = Object.create(locator) as HandLocator
    pile.getItemCoordinates = (item: MaterialItem, context: ItemContext) => {
      const { x = 0, y = 0, z = 0 } = locator.getLocationCoordinates(item.location, context, middle)
      return { x: x + out * Math.cos(radians), y: y + out * Math.sin(radians), z: z + (height + 1) * deltaZ }
    }
    pile.getItemRotateZ = () => angle
    return (description?.getItemTransform(item, { ...context, locators: { ...context.locators, [LocationType.PlayerHand]: pile } }) ?? []).join(' ')
  }

  // From the fan to the pile, the passes, then back to the fan: the first and the last steps are the pile gathered.
  const fan = transformItem(context).join(' ')
  const shuffle = keyframes`
    0%, 100% { transform: ${fan}; }
    ${steps.map((step) => `${step.at}% { transform: ${inPile(step)}; }`).join('\n')}
  `
  return css`
    > * {
      animation: ${shuffle} ${animation.duration}s ease-in-out forwards;
    }
  `
}
