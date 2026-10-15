import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { MaterialRules } from '@gamepark/rules-api'

/**
 * The turns left in the round, the current one included. A round lasts 9 turns, and every turn but
 * the last one takes 2 cards from the Animal piles: 16 cards left on the 1st turn, none on the 9th.
 * While the loser takes their card, the count is odd: it only goes down once the other card is gone.
 */
export const turnsLeft = (rules: MaterialRules) =>
  Math.ceil(rules.material(MaterialType.AnimalCard).location(LocationType.AnimalDeck).length / 2) + 1
