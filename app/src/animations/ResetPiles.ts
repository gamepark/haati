import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { GridBoundaries, isMoveItemType, isShuffle, MaterialMove, MoveItem, Shuffle } from '@gamepark/rules-api'
import { isAnimalPileReset, SET_ASIDE_SIZE } from '../locators/Locators'
import { CHARACTER_DECK, CHARACTER_RESET } from '../locators/TableLayout'
import { HAND_SHUFFLE_DURATION, MIX_DURATION, mixSteps, PILE_GAP, Spot } from './HandShuffle'
import { frameworkAnimations, MoveAnimation } from './RowMove'

/**
 * Between two rounds, the cards are gathered and mixed in the middle of the screen, the way the opponent's
 * hand is (see HandShuffle). The Animal cards gather in a pile on the left (see isAnimalPileReset): the 4
 * cards set aside, not shown during the round, fade in there with the first card gathered, the pile is
 * mixed, the cards are dealt from it, and the 4 cards left fade out with the last card dealt. The Character pile is gathered in its
 * place below the board, as the rules make it again first; it then rises to the right of the middle, is mixed
 * and goes back.
 */
/** The Character pile rising to the middle, then going back, in ms. */
const PILE_LIFT = 500
export const CHARACTER_PILE_SHUFFLE_DURATION = PILE_LIFT + MIX_DURATION + PILE_LIFT
/** The 4 Animal cards set aside fading in, in the middle, with the first card gathered, in ms. */
export const PILE_FADE_DURATION = 600

const animalSetAside = ({ rules }: MaterialContext) => rules.material(MaterialType.AnimalCard).location(LocationType.AnimalSetAside)

const isShuffleAt = (type: MaterialType, location: LocationType, move: MaterialMove, { rules }: MaterialContext): move is Shuffle =>
  isShuffle(move) && move.itemType === type && rules.material(type).getItem(move.indexes[0])?.location.type === location

/** The Animal cards mixed in the middle, between two rounds. */
export const isAnimalPileShuffled = (move: MaterialMove, context: MaterialContext) =>
  isShuffleAt(MaterialType.AnimalCard, LocationType.AnimalSetAside, move, context)

/** The Character cards mixed between two rounds, not when their pile is made again during a round. */
export const isCharacterPileShuffled = (move: MaterialMove, context: MaterialContext) =>
  context.rules.game.rule?.id === RuleId.EndOfRound && isShuffleAt(MaterialType.CharacterCard, LocationType.CharacterDeck, move, context)

/** The first Animal card gathered between two rounds: the 4 cards set aside fade in with it. */
export const isAnimalGatheringStarted = (move: MaterialMove, context: MaterialContext) =>
  context.rules.game.rule?.id === RuleId.EndOfRound &&
  isMoveItemType(MaterialType.AnimalCard)(move) &&
  move.location.type === LocationType.AnimalSetAside &&
  animalSetAside(context).length === SET_ASIDE_SIZE

/** The last Animal card dealt for a new round: the 4 cards left fade out with it. */
export const isAnimalDealEnded = (move: MaterialMove, context: MaterialContext) =>
  context.rules.game.rule?.id === RuleId.NewRound &&
  isMoveItemType(MaterialType.AnimalCard)(move) &&
  move.location.type !== LocationType.AnimalSetAside &&
  context.rules.material(MaterialType.AnimalCard).getItem(move.itemIndex).location.type === LocationType.AnimalSetAside &&
  animalSetAside(context).length === SET_ASIDE_SIZE + 1

/**
 * The card moved flies as usual; the other cards set aside fade in the middle, in when the pile is about to
 * show (still the 4 cards out of the round), out when it is about to hide.
 */
export const animalPileFade = (context: ItemContext, animation: MoveAnimation, boundaries: GridBoundaries) => {
  if (context.type !== MaterialType.AnimalCard) return
  const move = animation.move as MoveItem
  if (context.index === move.itemIndex) return frameworkAnimations.getItemAnimation(context, animation, boundaries)
  const item = context.rules.material(MaterialType.AnimalCard).getItem(context.index)
  if (item.location.type !== LocationType.AnimalSetAside) return
  const appearing = !isAnimalPileReset(context)
  const transform = transformItem(context).join(' ')
  const fade = keyframes`
    from { transform: ${transform}; opacity: ${appearing ? 0 : 1}; }
    to { transform: ${transform}; opacity: ${appearing ? 1 : 0}; }
  `
  return css`
    > * {
      animation: ${fade} ${animation.duration}s ease-in-out forwards;
    }
  `
}

/**
 * A pile mixed like the opponent's hand: the cards spread a little in height, the pile parts in two packets
 * and closes up again, twice, then the cards settle back. The Character pile rises to the middle first and
 * goes back to its place after.
 */
export const pileShuffle = (context: ItemContext, animation: MoveAnimation) => {
  const move = animation.move as Shuffle
  if (context.type !== move.itemType || !move.indexes.includes(context.index)) return
  const item = context.rules.material(context.type).getItem(context.index)
  // From the bottom of the pile to its top.
  const cards = context.rules.material(context.type).location(item.location.type).getIndexes()
  const lifted = context.type === MaterialType.CharacterCard
  const steps = lifted ? mixSteps(cards, PILE_LIFT, CHARACTER_PILE_SHUFFLE_DURATION).get(context.index) : mixSteps(cards).get(context.index)
  if (!steps) return
  const lift = lifted ? { x: CHARACTER_RESET.x - CHARACTER_DECK.x, y: CHARACTER_RESET.y - CHARACTER_DECK.y } : { x: 0, y: 0 }

  // Shifted on the table, before the card's own transform.
  const base = transformItem(context).join(' ')
  const inPile = ({ x, height }: Spot) => `translate3d(${lift.x + x}em, ${lift.y}em, ${(height + 1) * PILE_GAP}em) ${base}`
  const shuffle = keyframes`
    0%, 100% { transform: translate3d(0em, 0em, 0em) ${base}; }
    ${steps.map(([at, spot]) => `${at}% { transform: ${inPile(spot)}; }`).join('\n')}
  `
  return css`
    > * {
      animation: ${shuffle} ${animation.duration}s ease-in-out forwards;
    }
  `
}

/** The Animal pile is mixed in the time of the opponent's hand. */
export const ANIMAL_PILE_SHUFFLE_DURATION = HAND_SHUFFLE_DURATION
