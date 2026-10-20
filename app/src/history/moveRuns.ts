import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { getPrestigeSide, PrestigeSide } from '@gamepark/haati/material/Prestige'
import { MoveComponentContext } from '@gamepark/react-game'
import {
  CreateItem,
  DeleteItem,
  DeleteItemsAtOnce,
  isCreateItem,
  isDeleteItem,
  isDeleteItemsAtOnce,
  isMoveItemsAtOnce,
  isMoveItemType,
  MaterialGame,
  MaterialItem,
  MaterialMove,
  MoveItem,
  MoveItemsAtOnce
} from '@gamepark/rules-api'

export type HaatiContext = MoveComponentContext<MaterialMove, number, MaterialGame>

/**
 * The consequences of a move are played depth first, so the moves a single gesture of the rules is made
 * of are always next to each other in the action. The journal reads them there.
 */

/** Every move of the action, the player's own first. */
export const actionMoves = (context: HaatiContext): MaterialMove[] => [context.action.move, ...context.action.consequences]

/** Where this move stands among {@link actionMoves}. */
export const moveIndex = (context: HaatiContext): number => (context.consequenceIndex === undefined ? 0 : context.consequenceIndex + 1)

/** The move played right before this one in the same action, if there is one. */
export const previousMove = (context: HaatiContext): MaterialMove | undefined => actionMoves(context)[moveIndex(context) - 1]

/**
 * An item as the reader may see it: a card turned face up, or arriving where everybody sees it, carries
 * its face in the move (`reveal`), while the state it was played on still hides it from the opponent.
 */
export const revealedItem = (game: MaterialGame, move: MoveItem): MaterialItem => {
  const item = game.items[move.itemType]![move.itemIndex]
  return move.reveal ? { ...item, ...move.reveal } : item
}

/**
 * The card a player turns face up in the same action as this move: their Character card next to their
 * Animal card in the duel.
 */
export const revealedInAction = (context: HaatiContext, type: MaterialType, player: number): MaterialItem | undefined => {
  for (const move of actionMoves(context)) {
    if (!isMoveItemType(type)(move) || move.location.type !== LocationType.PlayerDuel || !move.location.rotation) continue
    const item = revealedItem(context.game, move)
    if (item.location.player === player) return item
  }
  return undefined
}

/** Whether a move creates or deletes a Favor or an Honor token. */
export const isPrestigeMove = (move: MaterialMove): move is CreateItem | DeleteItem => (isCreateItem(move) || isDeleteItem(move)) && move.itemType === MaterialType.Prestige

/** Whether a move gives back the Favor tokens of a player, or turns their Honor tokens over, between two rounds. */
export const isPrestigeTurnover = (move: MaterialMove): move is DeleteItemsAtOnce | MoveItemsAtOnce =>
  (isDeleteItemsAtOnce(move) || isMoveItemsAtOnce(move)) && move.itemType === MaterialType.Prestige

/** Whose tokens a Prestige move creates or deletes. A deleted token keeps its index, so it is still in the state it was deleted from. */
export const prestigeOwner = (move: MaterialMove, game: MaterialGame): number | undefined => {
  if (isCreateItem(move)) return move.item.location.player
  if (isDeleteItem(move)) return game.items[move.itemType]?.[move.itemIndex]?.location.player
  return undefined
}

export type PrestigeGain = { player?: number; favor: number; honor: number; first: boolean }

/**
 * Tokens are money (see `Prestige.ts`): a single gain takes the new tokens, then gives back the change,
 * in several moves. The journal writes it down once, on the first of them, as the amount it adds up to.
 * The tokens deleted were all owned before the gain, so their value is read in the state the first move
 * was played on.
 */
export const prestigeGain = (context: HaatiContext): PrestigeGain => {
  const moves = actionMoves(context)
  const index = moveIndex(context)
  const game = context.game
  const player = prestigeOwner(moves[index], game)
  const previous = moves[index - 1]
  const first = previous === undefined || !isPrestigeMove(previous) || prestigeOwner(previous, game) !== player
  const gain = { player, favor: 0, honor: 0, first }
  for (const move of moves.slice(index)) {
    if (!isPrestigeMove(move) || prestigeOwner(move, game) !== player) break
    const value = isCreateItem(move) ? move.item.id * (move.item.quantity ?? 1) : -deletedValue(move, game)
    if (getPrestigeSide(prestigeItem(move, game)?.location.rotation) === PrestigeSide.Favor) gain.favor += value
    else gain.honor += value
  }
  return gain
}

/** The token a Prestige move creates, or the one it deletes, as it was before. */
const prestigeItem = (move: CreateItem | DeleteItem, game: MaterialGame): MaterialItem | undefined =>
  isCreateItem(move) ? move.item : game.items[move.itemType]?.[move.itemIndex]

const deletedValue = (move: MaterialMove, game: MaterialGame): number => {
  if (!isDeleteItem(move)) return 0
  const item = game.items[move.itemType]?.[move.itemIndex]
  if (!item) return 0
  return item.id * (move.quantity ?? item.quantity ?? 1)
}
