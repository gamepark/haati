import { OptionsSpecV2 } from '@gamepark/rules-api'

/**
 * Haati has no variant and no player identity: nothing in the box tells the two players apart.
 */
export type HaatiOptions = object

/**
 * Haati is a duel: exactly 2 players. Labels live in `app/public/options/<locale>.json`.
 */
export const HaatiOptionsSpecV2: OptionsSpecV2 = {
  specVersion: 2,
  players: { min: 2, max: 2 }
}
