import { MaterialMove, PlayerTurnRule } from '@gamepark/rules-api'
import { CHARACTER_HAND_LIMIT } from '../material/Character'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from './RuleId'

/** What every step of a duel resolution needs to know. */
export abstract class HaatiRule extends PlayerTurnRule {
  get duelWinner(): number {
    return this.remind<number>(Memory.DuelWinner)
  }

  get isDuelWinner(): boolean {
    return this.player === this.duelWinner
  }

  get opponent(): number {
    return this.game.players.find((player) => player !== this.player)!
  }

  /** Back to the resolution of the player's duel cards, once an effect is over. */
  resume(): MaterialMove[] {
    return [this.startPlayerTurn(RuleId.ResolveDuel, this.player)]
  }

  /**
   * Draw 1 Character card, then go back to the resolution of the duel. An empty pile is formed again
   * from the shuffled discard: the card drawn is picked by index among the discarded cards, which the
   * shuffle placed at random.
   *
   * A player drawing a 3rd card must first discard one of their three.
   */
  drawCharacter(): MaterialMove[] {
    const hand = { type: LocationType.PlayerHand, player: this.player }
    const deck = this.material(MaterialType.CharacterCard).location(LocationType.CharacterDeck)
    const moves: MaterialMove[] = []
    if (deck.length) {
      moves.push(deck.deck().dealOne(hand))
    } else {
      const discard = this.material(MaterialType.CharacterCard).location(LocationType.CharacterDiscard)
      if (!discard.length) return this.resume()
      moves.push(...discard.moveItems({ type: LocationType.CharacterDeck }), discard.shuffle(), discard.limit(1).moveItem(hand))
    }
    const handSize = this.material(MaterialType.CharacterCard).location(LocationType.PlayerHand).player(this.player).length + 1
    if (handSize > CHARACTER_HAND_LIMIT) {
      moves.push(this.startPlayerTurn(RuleId.DiscardCharacter, this.player))
    } else {
      moves.push(...this.resume())
    }
    return moves
  }
}
