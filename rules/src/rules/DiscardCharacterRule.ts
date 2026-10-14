import { LocationType } from '../material/LocationType'
import { MaterialType } from '../material/MaterialType'
import { HaatiRule } from './HaatiRule'

/** A player who drew a 3rd Character card keeps 2 of them and discards the other. */
export class DiscardCharacterRule extends HaatiRule {
  getPlayerMoves() {
    return this.material(MaterialType.CharacterCard)
      .location(LocationType.PlayerHand)
      .player(this.player)
      .moveItems({ type: LocationType.CharacterDiscard })
  }

  afterItemMove() {
    return this.resume()
  }
}
