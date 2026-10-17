import { css, keyframes } from '@emotion/react'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { ROUNDS_TO_WIN } from '@gamepark/haati/rules/EndOfRoundRule'
import { ItemContext, MaterialContext, transformItem } from '@gamepark/react-game'
import { isMoveItem, MaterialMove } from '@gamepark/rules-api'
import { victoryHalf } from '../locators/Locators'
import { PLAYER_VICTORY, side, VICTORY_SHOW_SCALE, VICTORY_WIDTH } from '../locators/TableLayout'
import { colors } from '../theme/colors'

export const VICTORY_SHOW_DURATION = 6000
export const ROUND_WON_SHOW_DURATION = 3500

/** A move that gives a player a Round victory token. */
const isRoundVictoryWon = (move: MaterialMove) =>
  isMoveItem(move) && move.itemType === MaterialType.RoundVictoryToken && move.location.type === LocationType.PlayerRoundVictory

/** How many Round victory tokens the player who receives the token will hold. */
const victoriesAfter = (move: MaterialMove, { rules }: Pick<MaterialContext, 'rules'>) =>
  isMoveItem(move)
    ? rules.material(MaterialType.RoundVictoryToken).location(LocationType.PlayerRoundVictory).player(move.location.player).getQuantity() + 1
    : 0

/** The move that gives a player their last Round victory token: the elephant is complete and the game is won. */
export const isElephantCompleted = (move: MaterialMove, context: Pick<MaterialContext, 'rules'>) =>
  isRoundVictoryWon(move) && victoriesAfter(move, context) >= ROUNDS_TO_WIN

/** The move that gives a player a Round victory token without winning the game. */
export const isRoundWon = (move: MaterialMove, context: Pick<MaterialContext, 'rules'>) =>
  isRoundVictoryWon(move) && victoriesAfter(move, context) < ROUNDS_TO_WIN

/**
 * A round won, not the game: the token leaves the reserve for the middle of the table, growing and
 * turning to the half of the elephant it will be, shines while the message names the winner (see
 * RoundWonAnnouncement), then goes to the winner's place.
 */
export const roundWonShow = (context: ItemContext, move: MaterialMove, duration: number) => {
  if (!isMoveItem(move) || context.type !== MaterialType.RoundVictoryToken) return
  const item = context.rules.material(MaterialType.RoundVictoryToken).getItem(context.index)
  const locator = context.locators[item.location.type]!
  if (!locator.isItemToAnimate(item, context, move)) return

  const winner = move.location.player
  const coordinates = locator.getItemCoordinates(item, context)
  const from = { x: coordinates.x ?? 0, y: coordinates.y ?? 0 }
  // A player's first token is the half of the elephant on their own side of the table.
  const half = side(winner, context)
  const place = { x: half * PLAYER_VICTORY.x + (half * VICTORY_WIDTH) / 2, y: PLAYER_VICTORY.y }

  const transforms = transformItem(context)
  const turnedFrom = transforms.includes('rotateY(180deg)') ? 180 : 0
  const turnedTo = half > 0 ? 180 : 0
  const base = transforms.filter((transform) => transform !== 'rotateY(180deg)').join(' ')
  const frame = (to: { x: number; y: number }, z: number, scale: number, turn: number, glow: number) =>
    `transform: ${base} translate3d(${to.x - from.x}em, ${to.y - from.y}em, ${z}em) scale(${scale}) rotateY(${turn}deg);
     filter: drop-shadow(0 0 ${glow}em ${colors.goldLight});`
  const centre = { x: 0, y: 0 }
  const animation = keyframes`
    0% { ${frame(from, 0, 1, turnedFrom, 0)} }
    25% { ${frame(centre, 20, VICTORY_SHOW_SCALE, turnedTo, 0)} }
    35%, 75% { ${frame(centre, 20, VICTORY_SHOW_SCALE, turnedTo, 0.4)} }
    100% { ${frame(place, 0, 1, turnedTo, 0)} }
  `
  return css`
    > * {
      animation: ${animation} ${duration}s ease-in-out forwards;
    }
  `
}

/**
 * The winner's elephant comes together in the middle of the table. The half they already held rises
 * there first, growing; then the last half joins it, from the reserve or from the opponent; the whole
 * elephant shines, and both halves go to the winner's place.
 */
export const victoryShow = (context: ItemContext, move: MaterialMove, duration: number) => {
  if (!isMoveItem(move) || context.type !== MaterialType.RoundVictoryToken) return
  const item = context.rules.material(MaterialType.RoundVictoryToken).getItem(context.index)
  const winner = move.location.player
  const moved = context.index === move.itemIndex
  const held = item.location.type === LocationType.PlayerRoundVictory && item.location.player === winner
  if (!moved && !held) return

  const coordinates = context.locators[item.location.type]!.getItemCoordinates(item, context)
  const from = { x: coordinates.x ?? 0, y: coordinates.y ?? 0 }
  const half = held ? victoryHalf(item, context) : -side(winner, context)
  const centre = { x: (half * VICTORY_WIDTH * VICTORY_SHOW_SCALE) / 2, y: 0 }
  const place = { x: side(winner, context) * PLAYER_VICTORY.x + (half * VICTORY_WIDTH) / 2, y: PLAYER_VICTORY.y }

  // The shift and the scale come before the turn over of a token showing its back face, so that they are not mirrored.
  const transforms = transformItem(context)
  const flipped = transforms.includes('rotateY(180deg)')
  const base = transforms.filter((transform) => transform !== 'rotateY(180deg)').join(' ')
  const frame = (to: { x: number; y: number }, z: number, scale: number, glow: number) =>
    `transform: ${base} translate3d(${to.x - from.x}em, ${to.y - from.y}em, ${z}em) scale(${scale})${flipped ? ' rotateY(180deg)' : ''};
     filter: drop-shadow(0 0 ${glow}em ${colors.goldLight});`
  const still = frame(from, 0, 1, 0)
  const shown = frame(centre, 20, VICTORY_SHOW_SCALE, 0)
  const shining = frame(centre, 20, VICTORY_SHOW_SCALE, 0.4)
  const animation = held
    ? keyframes`
        0% { ${still} }
        25%, 50% { ${shown} }
        65%, 82% { ${shining} }
        100% { ${frame(place, 0, 1, 0)} }
      `
    : keyframes`
        0%, 25% { ${still} }
        50% { ${shown} }
        65%, 82% { ${shining} }
        100% { ${frame(place, 0, 1, 0)} }
      `
  return css`
    > * {
      animation: ${animation} ${duration}s ease-in-out forwards;
    }
  `
}
