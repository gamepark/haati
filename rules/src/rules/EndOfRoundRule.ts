import { isMoveItem, ItemMove, MaterialMove, MaterialRulesPart } from '@gamepark/rules-api'
import { beats } from '../material/Animal'
import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { countPrestige, gainPrestige, totalPrestige } from '../material/Prestige'
import { Memory } from '../Memory'
import { RuleId } from './RuleId'

/** Haati is played in 2 winning rounds. */
export const ROUNDS_TO_WIN = 2

/**
 * The player with the most Prestige (Favor + Honor) wins the round; on a tie, the one with the most
 * Honor; if the tie persists, both reveal their last Animal card and the winner of that last duel
 * wins the round.
 *
 * Then "Les Faveurs passent, mais l'Honneur demeure !": Favors are discarded and Honors are turned
 * into Favors for the next round.
 */
export class EndOfRoundRule extends MaterialRulesPart {
  onRuleStart() {
    const [player1, player2] = this.game.players
    const prestige1 = totalPrestige(this, player1)
    const prestige2 = totalPrestige(this, player2)
    if (prestige1 !== prestige2) return this.endRound(prestige1 > prestige2 ? player1 : player2)
    const honor1 = countPrestige(this, MaterialType.Honor, player1)
    const honor2 = countPrestige(this, MaterialType.Honor, player2)
    if (honor1 !== honor2) return this.endRound(honor1 > honor2 ? player1 : player2)
    return this.lastCards.moveItems((item) => ({ type: LocationType.PlayerDuel, player: item.location.player, rotation: true }))
  }

  get lastCards() {
    return this.material(MaterialType.AnimalCard).location(LocationType.PlayerHand)
  }

  /** The tie-breaking duel is decided once both last cards are revealed. */
  afterItemMove(move: ItemMove) {
    if (!isMoveItem(move) || move.location.type !== LocationType.PlayerDuel || this.lastCards.length) return []
    const [player1, player2] = this.game.players
    const duel = this.material(MaterialType.AnimalCard).location(LocationType.PlayerDuel)
    const card1 = duel.player(player1).getItem<number>()!.id
    const card2 = duel.player(player2).getItem<number>()!.id
    return this.endRound(beats(card1, card2) ? player1 : player2)
  }

  endRound(winner: number): MaterialMove[] {
    this.memorize(Memory.RoundWinner, winner)
    const moves: MaterialMove[] = [this.winRoundVictoryToken(winner)]
    const victories = this.material(MaterialType.RoundVictoryToken).location(LocationType.PlayerRoundVictory).player(winner).getQuantity() + 1
    if (victories >= ROUNDS_TO_WIN) {
      moves.push(this.endGame())
      return moves
    }
    for (const player of this.game.players) {
      const honor = countPrestige(this, MaterialType.Honor, player)
      moves.push(
        ...this.material(MaterialType.Favor).location(LocationType.PlayerPrestige).player(player).deleteItems(),
        ...this.material(MaterialType.Honor).location(LocationType.PlayerPrestige).player(player).deleteItems(),
        ...gainPrestige(this, MaterialType.Favor, player, honor)
      )
    }
    moves.push(...this.prepareNextRound(), this.startRule(RuleId.NewRound))
    return moves
  }

  /** From the supply, or in the 3rd round, from the opponent. */
  winRoundVictoryToken(winner: number): MaterialMove {
    const tokens = this.material(MaterialType.RoundVictoryToken)
    const reserve = tokens.location(LocationType.Reserve)
    const source = reserve.length ? reserve : tokens.location(LocationType.PlayerRoundVictory).player((player) => player !== winner)
    return source.moveItem({ type: LocationType.PlayerRoundVictory, player: winner }, 1)
  }

  /**
   * Unplayed Character cards stay in hand, the others are shuffled into a new pile. Both Collection
   * tokens are flipped again, and all 24 Animal cards are shuffled, including the 4 set aside.
   */
  prepareNextRound(): MaterialMove[] {
    const characters = this.material(MaterialType.CharacterCard)
    const animals = this.material(MaterialType.AnimalCard)
    return [
      ...characters.location(LocationType.CharacterDiscard).moveItems({ type: LocationType.CharacterDeck }),
      characters.location((location) => location.type === LocationType.CharacterDeck || location.type === LocationType.CharacterDiscard).shuffle(),
      ...this.material(MaterialType.CollectionToken).rollItems((item) => ({ type: LocationType.CollectionSpot, id: item.id })),
      ...animals.location((location) => location.type !== LocationType.AnimalSetAside).moveItems({ type: LocationType.AnimalSetAside }),
      animals.shuffle()
    ]
  }
}
