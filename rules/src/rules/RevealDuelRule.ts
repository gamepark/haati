import { isMoveItem, ItemMove, MaterialRulesPart } from '@gamepark/rules-api'
import { beats } from '../material/Animal'
import { Bet, CharacterCard, getBet } from '../material/Character'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { Memory } from '../Memory'
import { RuleId } from './RuleId'

/**
 * 2. Both players reveal their cards and the duel is decided. A Character whose bet is lost is
 * discarded without effect; a winning one stays in the duel until its owner resolves it.
 *
 * The outcome is only computed once every card is revealed (after the last rotation), so that it is
 * never computed from a view where the opponent's cards are still hidden.
 */
export class RevealDuelRule extends MaterialRulesPart {
  onRuleStart() {
    return [this.hiddenCards(MaterialType.AnimalCard), this.hiddenCards(MaterialType.CharacterCard)].flatMap((cards) => cards.rotateItems(true))
  }

  afterItemMove(move: ItemMove) {
    if (!isMoveItem(move) || move.location.type !== LocationType.PlayerDuel) return []
    if (this.hiddenCards(MaterialType.AnimalCard).length || this.hiddenCards(MaterialType.CharacterCard).length) return []
    const [player1, player2] = this.game.players
    const card1 = this.duelAnimal(player1)
    const card2 = this.duelAnimal(player2)
    const winner = beats(card1, card2) ? player1 : player2
    this.memorize(Memory.DuelWinner, winner)
    const lostBets = this.material(MaterialType.CharacterCard)
      .location(LocationType.PlayerDuel)
      .filter<CharacterCard>((item) => (getBet(item.id) === Bet.Win) !== (item.location.player === winner))
    return [...lostBets.moveItems({ type: LocationType.CharacterDiscard }), this.startPlayerTurn(RuleId.ResolveDuel, winner)]
  }

  hiddenCards(type: MaterialType) {
    return this.material(type)
      .location(LocationType.PlayerDuel)
      .rotation((rotation) => !rotation)
  }

  duelAnimal(player: number): number {
    return this.material(MaterialType.AnimalCard).location(LocationType.PlayerDuel).player(player).getItem()!.id
  }
}
