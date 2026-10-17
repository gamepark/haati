import { css, keyframes } from '@emotion/react'
import { Bet, CharacterCard, getBet } from '@gamepark/haati/material/Character'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { Memory } from '@gamepark/haati/Memory'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { ItemContext, MaterialAnimations, MaterialContext, transformItem } from '@gamepark/react-game'
import { GridBoundaries, isMoveItemType, MaterialItem, MaterialMove, MaterialRules, MoveItem } from '@gamepark/rules-api'
import { futureRules, MoveAnimation } from './RowMove'

/**
 * The verdict on the Character bets, once the Animal cards are back from the duel show. A won bet grows a
 * little under a golden shine, and keeps the shine as long as it waits to be activated. A lost bet turns to
 * ash where it is, then goes to the discard. Either way, the card is back to normal by the time it lands
 * in the discard: the verdict belongs to the duel, not to the card. Both verdicts last as long, so that
 * both players are ready to go on at the same time.
 */
export const BET_VERDICT_DURATION = 1000
/** The share of the lost bet's animation in which it turns to ash in place, before it flies to the discard. */
const ASH_SHARE = 0.4
/** The share of the lost bet's animation after which the ash fades: only when the card is close to the discard. */
const ASH_FADE_SHARE = 0.85

/** The duel is decided once no duel card is face down any more: the winner is then the one of this duel. */
const isDuelDecided = (rules: MaterialRules) =>
  [MaterialType.AnimalCard, MaterialType.CharacterCard].every(
    (type) =>
      !rules
        .material(type)
        .location(LocationType.PlayerDuel)
        .rotation((rotation) => !rotation).length
  )

/** A Character card left in the duel with its bet won, waiting to be activated. */
export const isWonBet = (item: MaterialItem, rules: MaterialRules) =>
  item.location.type === LocationType.PlayerDuel &&
  isDuelDecided(rules) &&
  (getBet(item.id as CharacterCard) === Bet.Win) === (item.location.player === rules.remind<number>(Memory.DuelWinner))

/** The framework's shine on the cards one can play, in gold. */
export const goldSlide = keyframes`
  0% { transform: translate(-33%, -33%); }
  50%, 100% { transform: translate(33%, 33%); }
`

const goldPulse = keyframes`
  0%, 100% { scale: 1; }
  40% { scale: 1.1; }
`

/**
 * On the item: its front face grows once, then keeps a golden shine. The shine is drawn before the face's
 * content, so that the veil the framework draws after it, out of a focus of the tutorial, still darkens the card.
 */
export const wonBetCss = css`
  > * > :first-child {
    overflow: hidden;
    animation: ${goldPulse} ${BET_VERDICT_DURATION / 1000}s ease-in-out;

    &:before {
      content: '';
      position: absolute;
      pointer-events: none;
      inset: -100%;
      z-index: 1;
      transform-style: preserve-3d;
      background: linear-gradient(
        to bottom right,
        rgba(255, 196, 64, 0) 34%,
        rgba(255, 196, 64, 0.8) 50%,
        rgba(255, 196, 64, 0) 66%
      );
      animation: ${goldSlide} 2s linear infinite;
    }
  }
`

/** A Character card leaving the duel for the discard. */
const isDuelCharacterDiscarded = (move: MaterialMove, { rules }: MaterialContext) =>
  isMoveItemType(MaterialType.CharacterCard)(move) &&
  move.location.type === LocationType.CharacterDiscard &&
  rules.material(MaterialType.CharacterCard).getItem(move.itemIndex).location.type === LocationType.PlayerDuel

/** A lost bet: the rules discard it as soon as the duel is decided. */
export const isBetLost = (move: MaterialMove, context: MaterialContext) =>
  isDuelCharacterDiscarded(move, context) && context.rules.game.rule?.id === RuleId.RevealDuel

/** A won bet activated by its owner. */
export const isWonBetPlayed = (move: MaterialMove, context: MaterialContext) =>
  isDuelCharacterDiscarded(move, context) && context.rules.game.rule?.id !== RuleId.RevealDuel

const ashes = keyframes`
  0% { filter: none; }
  ${ASH_SHARE * 75}%, ${ASH_FADE_SHARE * 100}% { filter: grayscale(1) brightness(0.3); }
  100% { filter: none; }
`

/** The lost bet turns to ash in place, then flies to the discard, the ash fading as it gets there. */
export const betLost = (context: ItemContext, animation: MoveAnimation) => {
  const move = animation.move as MoveItem
  if (context.type !== MaterialType.CharacterCard || context.index !== move.itemIndex) return
  const future = futureRules(context, move)
  const description = context.material[context.type]
  const current = transformItem(context).join(' ')
  const target = (description?.getItemTransform(future.material(MaterialType.CharacterCard).getItem(context.index), { ...context, rules: future }) ?? []).join(' ')
  const flight = keyframes`
    0%, ${ASH_SHARE * 100}% { transform: ${current}; }
    100% { transform: ${target}; }
  `
  return [
    description?.getAnimationCss(flight, animation.duration),
    css`
      && > * > * > :first-child {
        animation: ${ashes} ${animation.duration}s ease-in-out forwards;
      }
    `
  ]
}

const goldFade = keyframes`
  to { opacity: 0; }
`

const frameworkAnimations = new MaterialAnimations()

/** The won bet flies to the discard as any card, its golden shine fading on the way. */
export const wonBetPlayed = (context: ItemContext, animation: MoveAnimation, boundaries: GridBoundaries) => {
  const move = animation.move as MoveItem
  if (context.type !== MaterialType.CharacterCard || context.index !== move.itemIndex) return
  return [
    frameworkAnimations.getItemAnimation(context, animation, boundaries),
    css`
      && > * > * > :first-child:before {
        animation:
          ${goldSlide} 2s linear infinite,
          ${goldFade} ${animation.duration}s ease-in forwards;
      }
    `
  ]
}
