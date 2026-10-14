import { MaterialRulesPart } from '@gamepark/rules-api'
import { LocationType } from '../material/LocationType'
import { MaterialSource } from '../material/MaterialSource'
import { MaterialType } from '../material/MaterialType'
import { RuleId } from './RuleId'

/** Both piles, above (1) and below (2) the board. */
export const animalPiles = [1, 2]
const HAND_SIZE = 2
const PILE_SIZE = 8

/**
 * The 24 Animal cards wait shuffled in the set-aside pile. 2 cards are dealt to each player, then 2
 * piles of 8 are formed and their top card is revealed (`rotation: true`). The 4 cards left are out of this round.
 */
export const dealRound = (source: MaterialSource, players: number[]) => {
  const deck = source.material(MaterialType.AnimalCard).location(LocationType.AnimalSetAside).deck()
  return [
    ...players.flatMap((player) => deck.deal({ type: LocationType.PlayerHand, player }, HAND_SIZE)),
    ...animalPiles.flatMap((id) => [
      ...deck.deal({ type: LocationType.AnimalDeck, id }, PILE_SIZE - 1),
      deck.dealOne({ type: LocationType.AnimalDeck, id, rotation: true })
    ])
  ]
}

/** Deals the Animal cards once they are shuffled, then the first duel of the round starts. */
export class NewRoundRule extends MaterialRulesPart {
  onRuleStart() {
    return [...dealRound(this, this.game.players), this.startSimultaneousRule(RuleId.ChooseCards)]
  }
}
