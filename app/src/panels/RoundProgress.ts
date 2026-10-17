import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'

/**
 * A round has 9 turns: the 2 piles of 8 Animal cards lose 2 cards at each turn (the loser takes one, the
 * winner gets the other), and the 9th turn is played with both piles empty.
 */
export const ROUND_TURNS = 9

/** The turn in progress. While the loser has taken a card and the winner not yet, the turn is not over: round up. */
export const getTurn = (rules: HaatiRules) =>
  ROUND_TURNS - Math.ceil(rules.material(MaterialType.AnimalCard).location(LocationType.AnimalDeck).length / 2)

/** The round in progress: one more than the Round victory tokens already won. */
export const getRound = (rules: HaatiRules) =>
  rules.material(MaterialType.RoundVictoryToken).location(LocationType.PlayerRoundVictory).getQuantity() + 1
