import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { ScoringDescription } from '@gamepark/react-game'
import { HaatiResultHeader } from './HaatiResultHeader'

/** Only the result text is replaced (see HaatiResultHeader): no scoring table is added to the result dialog. */
export const haatiScoring: ScoringDescription<number, HaatiRules> = {
  getScoringKeys: () => [],
  getScoringHeader: () => '',
  getScoringPlayerData: () => null,
  ResultHeader: HaatiResultHeader
}
