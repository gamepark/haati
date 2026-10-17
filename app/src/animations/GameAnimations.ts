import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { ItemContext, MaterialContext, MaterialGameAnimations, transformItem } from '@gamepark/react-game'
import { isMoveItem, isShuffle, MaterialMove } from '@gamepark/rules-api'
import { BET_LOST_DURATION, betLost, isBetLost, isWonBetPlayed, wonBetPlayed } from './BetShow'
import { isRowMove, ROW_MOVE_DURATION, rowMove } from './RowMove'
import { isElephantCompleted, isRoundWon, ROUND_WON_SHOW_DURATION, roundWonShow, victoryShow, VICTORY_SHOW_DURATION } from './VictoryShow'
import { DUEL_SHOW_SCALE, DUEL_SHOW_X, DUEL_X, DUEL_Y, side } from '../locators/TableLayout'

/**
 * Most moves keep the framework's pace. Faster are only the housekeeping a player does not need to
 * follow: the Character pile made again from its discard when it runs out, and the Animal cards
 * gathered and laid out in piles between two rounds (the top card of each pile still turns over at
 * the usual pace). The Favor and Honor tokens move at half the usual second, except between two rounds,
 * when the Honor tokens turn into Favor tokens at the usual pace.
 *
 * The reveal of the duel is a show: once the last card turns over, the two Animal cards leave the
 * table for the middle of the screen, clash, then go back to their place, where the players resolve
 * them. The Character cards stay on the table: right after the show, a lost bet turns to ash and goes to
 * the discard (the rules discard it as soon as the duel is decided), a won one shines in gold until it is
 * activated (see BetShow). Each
 * Round victory token is a show too, the last one completing the elephant (see VictoryShow). An Animal card entering or leaving a Palace or
 * a Jungle row moves in two steps: the rows make room, then the card flies to its place (see RowMove).
 */
export const gameAnimations = new MaterialGameAnimations()

const DUEL_SHOW_DURATION = 3750
/** When the card revealed last is a Character card, it turns over at the usual pace: this share of the show. */
const CHARACTER_FLIP_SHARE = 0.12

const isPrestige = (move: MaterialMove) => 'itemType' in move && (move.itemType === MaterialType.Favor || move.itemType === MaterialType.Honor)

const isCharacterPileRemade = (move: MaterialMove) =>
  (isMoveItem(move) && move.itemType === MaterialType.CharacterCard && move.location.type === LocationType.CharacterDeck) ||
  (isShuffle(move) && move.itemType === MaterialType.CharacterCard)

const isAnimalPileLaidOut = (move: MaterialMove) =>
  isMoveItem(move) &&
  move.itemType === MaterialType.AnimalCard &&
  (move.location.type === LocationType.AnimalSetAside || (move.location.type === LocationType.AnimalDeck && !move.location.rotation))

/** The duel cards still face down, before the move is played. */
const hiddenDuelCards = ({ rules }: MaterialContext) =>
  [MaterialType.AnimalCard, MaterialType.CharacterCard].reduce(
    (count, type) =>
      count +
      rules
        .material(type)
        .location(LocationType.PlayerDuel)
        .rotation((rotation) => !rotation).length,
    0
  )

/** The rotation of the last duel card still face down: the one after which the duel is decided. */
const isLastDuelReveal = (move: MaterialMove, context: MaterialContext) =>
  context.rules.game.rule?.id === RuleId.RevealDuel &&
  isMoveItem(move) &&
  move.location.type === LocationType.PlayerDuel &&
  !!move.location.rotation &&
  hiddenDuelCards(context) === 1

/** The table transform of a duel card, face up: the card revealed last is shown face up from the start. */
const faceUp = (context: ItemContext) =>
  transformItem(context)
    .filter((transform) => transform !== 'rotateY(180deg)')
    .join(' ')

/**
 * The path of a duel Animal card during the show, as keyframes of its table transform followed by a
 * shift, a scale and a tilt.
 */
const duelShow = (context: ItemContext) => {
  const item = context.rules.material(context.type).getItem(context.index)
  const s = side(item.location.player, context)
  const base = faceUp(context)
  const centre = { x: s * (DUEL_SHOW_X - DUEL_X), y: -DUEL_Y }
  // Towards the opponent: the Animal cards draw back, strike, bounce off.
  const inward = -s
  const frame = (dx: number, dy: number, z: number, scale: number, tilt: number) =>
    `transform: ${base} translate3d(${dx}em, ${dy}em, ${z}em) scale(${scale}) rotateZ(${tilt}deg);`
  const at = (shift: number, tilt = 0) => frame(centre.x + shift * inward, centre.y, 10, DUEL_SHOW_SCALE, tilt * inward)
  return keyframes`
    0% { ${frame(0, 0, 0, 1, 0)} }
    38% { ${at(0)} }
    48% { ${at(-1.5)} }
    54% { ${at(1.2, 5)} }
    60% { ${at(-0.4, -2)} }
    66%, 86% { ${at(0)} }
    100% { ${frame(0, 0, 0, 1, 0)} }
  `
}

/** A Character card revealed last: it turns over in place at the start of the show, then stays still. */
const characterFlip = (context: ItemContext) => {
  const base = faceUp(context)
  return keyframes`
    0% { transform: ${base} rotateY(180deg); }
    ${CHARACTER_FLIP_SHARE * 100}%, 100% { transform: ${base}; }
  `
}

/** The viewer's own hand, mixed after each draw: the opponent cannot follow it, so there is nothing to show. */
const isOwnHandShuffled = (move: MaterialMove, context: MaterialContext) =>
  isShuffle(move) &&
  move.itemType === MaterialType.AnimalCard &&
  context.rules.material(MaterialType.AnimalCard).getItem(move.indexes[0]).location.player === context.player

gameAnimations
  .configure(isElephantCompleted)
  .duration(VICTORY_SHOW_DURATION)
  .itemAnimation((context, animation) => victoryShow(context, animation.move, animation.duration))
gameAnimations
  .configure(isRoundWon)
  .duration(ROUND_WON_SHOW_DURATION)
  .itemAnimation((context, animation) => roundWonShow(context, animation.move, animation.duration))
gameAnimations.configure(isOwnHandShuffled).skip()
gameAnimations.configure((move, context) => isPrestige(move) && context.rules.game.rule?.id !== RuleId.EndOfRound).duration(500)
gameAnimations.configure((move) => isCharacterPileRemade(move) && !isShuffle(move)).duration(150)
gameAnimations.configure((move) => isCharacterPileRemade(move) && isShuffle(move)).duration(500)
gameAnimations.configure(isAnimalPileLaidOut).duration(150)
gameAnimations.configure(isBetLost).duration(BET_LOST_DURATION).itemAnimation(betLost)
gameAnimations.configure(isWonBetPlayed).itemAnimation(wonBetPlayed)
gameAnimations.configure(isRowMove).duration(ROW_MOVE_DURATION).itemAnimation(rowMove)
gameAnimations
  .configure(isLastDuelReveal)
  .duration(DUEL_SHOW_DURATION)
  .itemAnimation((context, animation) => {
    const item = context.rules.material(context.type).getItem(context.index)
    if (item.location.type !== LocationType.PlayerDuel) return
    if (context.type === MaterialType.AnimalCard) {
      return css`
        > * {
          animation: ${duelShow(context)} ${animation.duration}s ease-in-out forwards;
        }
      `
    }
    // A Character card stays on the table. The one revealed last turns over at the usual pace, not during the whole show,
    // unless the viewer already sees it face up: their own card, which then stays still.
    const move = animation.move
    if (!isMoveItem(move) || move.itemType !== MaterialType.CharacterCard || move.itemIndex !== context.index) return
    if (!transformItem(context).includes('rotateY(180deg)')) return
    return css`
      > * {
        animation: ${characterFlip(context)} ${animation.duration}s ease-in-out forwards;
      }
    `
  })
