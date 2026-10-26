import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { useActions, useRules } from '@gamepark/react-game'
import { isMoveItemType, isStartRule, MaterialMove, MoveItem } from '@gamepark/rules-api'

/** The actions of the game, as the client shows them. */
type Actions = NonNullable<ReturnType<typeof useActions<MaterialMove, number>>>

/**
 * The Animal card a player took at the last turn of the round, while it is still hidden in their hand: as
 * soon as it shows again on the table, face up, it has left the hand. Undefined on the first turn of a
 * round, before anyone took a card.
 */
export const useLastTakenCard = (player?: number): number | undefined => {
  const rules = useRules<HaatiRules>()
  const actions = useActions<MaterialMove, number>()
  if (!rules || !actions || player === undefined) return undefined
  const id = lastTakenCard(actions, player)
  return id === undefined || rules.material(MaterialType.AnimalCard).id(id).length ? undefined : id
}

/**
 * The id of the Animal card a player took to complete their hand at the last turn of the round, read off
 * the actions: the rules keep nothing about it. Each turn, the loser of the duel chooses one of the 2 cards
 * offered, and the winner receives the other one. Those 2 moves are the only Animal cards a player brings
 * to a hand: the deal of a round is a consequence of the rules. The card was face up on top of its pile:
 * the move that revealed it tells its id, while the move that takes it, into a hidden hand, does not.
 */
const lastTakenCard = (actions: Actions, player: number): number | undefined => {
  const played = actions.filter((action) => !action.cancelled)
  for (let index = played.length - 1; index >= 0; index--) {
    const moves = [played[index].move, ...played[index].consequences]
    if (moves.some((move) => isStartRule(move) && move.id === RuleId.NewRound)) return undefined
    if (!isAnimalToHand(played[index].move)) continue
    const taken = moves.find((move) => isAnimalToHand(move) && move.location.player === player) as MoveItem | undefined
    return taken && revealedId(played.slice(0, index), taken.itemIndex)
  }
  return undefined
}

const isAnimalToHand = (move: MaterialMove): move is MoveItem =>
  isMoveItemType(MaterialType.AnimalCard)(move) && move.location.type === LocationType.PlayerHand

/** The id the last move to show this Animal card face up gave it. */
const revealedId = (actions: Actions, itemIndex: number): number | undefined => {
  for (const action of [...actions].reverse()) {
    const reveal = [action.move, ...action.consequences]
      .reverse()
      .find((move): move is MoveItem => isMoveItemType(MaterialType.AnimalCard)(move) && move.itemIndex === itemIndex && move.reveal?.id !== undefined)
    if (reveal) return reveal.reveal!.id as number
  }
  return undefined
}
