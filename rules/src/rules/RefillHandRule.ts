import { isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { HaatiRule } from './HaatiRule'
import { animalPiles } from './NewRoundRule'
import { RuleId } from './RuleId'

/**
 * 4. The loser of the duel chooses one of the 2 visible cards; the winner receives the other one.
 * Both players saw those cards, so they stay visible in hand. Then the top card of each pile is
 * revealed for the next turn.
 */
export class RefillHandRule extends HaatiRule {
  getPlayerMoves() {
    return this.offers.moveItems({ type: LocationType.PlayerHand, player: this.player, rotation: true })
  }

  get offers() {
    return this.material(MaterialType.AnimalCard)
      .location(LocationType.AnimalDeck)
      .filter((item) => !!item.location.rotation)
  }

  afterItemMove(move: ItemMove) {
    if (!isMoveItemType(MaterialType.AnimalCard)(move) || move.location.type !== LocationType.PlayerHand || move.location.player !== this.player) {
      return []
    }
    const moves: MaterialMove[] = this.offers.moveItems({ type: LocationType.PlayerHand, player: this.opponent, rotation: true })
    for (const id of animalPiles) {
      // The other offer is still on its pile until the move above is played: it is not the next card.
      const pile = this.material(MaterialType.AnimalCard)
        .location(LocationType.AnimalDeck)
        .locationId(id)
        .filter((item) => !item.location.rotation)
      if (pile.length) moves.push(pile.deck().limit(1).rotateItem(true))
    }
    moves.push(this.startSimultaneousRule(RuleId.ChooseCards))
    return moves
  }
}
