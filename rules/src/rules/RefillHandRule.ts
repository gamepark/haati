import { isMoveItemType, ItemMove, MaterialMove } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { HaatiRule } from './HaatiRule'
import { animalPiles } from './NewRoundRule'
import { RuleId } from './RuleId'

/**
 * 4. The loser of the duel chooses one of the 2 visible cards; the winner receives the other one.
 * Both players saw those cards arrive, but a hand is only seen by its owner: each hand is then mixed,
 * so that the opponent has to remember the cards, without knowing which one is which. Then the top
 * card of each pile is revealed for the next turn.
 */
export class RefillHandRule extends HaatiRule {
  getPlayerMoves() {
    return this.offers.moveItems({ type: LocationType.PlayerHand, player: this.player })
  }

  get offers() {
    return this.material(MaterialType.AnimalCard)
      .location(LocationType.AnimalDeck)
      .filter((item) => !!item.location.rotation)
  }

  afterItemMove(move: ItemMove) {
    if (!isMoveItemType(MaterialType.AnimalCard)(move) || move.location.type !== LocationType.PlayerHand) return []
    if (move.location.player === this.player) {
      return this.offers.moveItems({ type: LocationType.PlayerHand, player: this.opponent })
    }
    const moves: MaterialMove[] = this.game.players.map((player) =>
      this.material(MaterialType.AnimalCard).location(LocationType.PlayerHand).player(player).shuffle()
    )
    for (const id of animalPiles) {
      const pile = this.material(MaterialType.AnimalCard).location(LocationType.AnimalDeck).locationId(id)
      if (pile.length) moves.push(pile.deck().limit(1).rotateItem(true))
    }
    moves.push(this.startSimultaneousRule(RuleId.ChooseCards))
    return moves
  }
}
