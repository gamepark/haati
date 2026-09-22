import { MaterialGameSetup } from '@gamepark/rules-api'
import { HaatiOptions } from './HaatiOptions'
import { HaatiRules } from './HaatiRules'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { PlayerColor } from './PlayerColor'
import { RuleId } from './rules/RuleId'

/**
 * This class creates a new Game based on the game options
 */
export class HaatiSetup extends MaterialGameSetup<PlayerColor, MaterialType, LocationType, HaatiOptions> {
  Rules = HaatiRules

  setupMaterial(_options: HaatiOptions) {
    // TODO
  }

  start() {
    this.startPlayerTurn(RuleId.TheFirstStep, this.players[0])
  }
}
