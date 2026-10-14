import { MaterialGameSetup } from '@gamepark/rules-api'
import { shuffle } from 'es-toolkit'
import { HaatiOptions } from './HaatiOptions'
import { HaatiRules } from './HaatiRules'
import { animalCards } from './material/Animal'
import { characterCards } from './material/Character'
import { Collection } from './material/Collection'
import { LocationType } from './material/LocationType'
import { MaterialType } from './material/MaterialType'
import { dealRound } from './rules/NewRoundRule'
import { RuleId } from './rules/RuleId'

export class HaatiSetup extends MaterialGameSetup<number, MaterialType, LocationType, HaatiOptions> {
  Rules = HaatiRules

  setupMaterial(_options: HaatiOptions) {
    // B: each Collection token shows a face drawn at random
    this.material(MaterialType.CollectionToken).createItems(
      [Collection.Palace, Collection.Jungle].map((id) => ({
        id,
        location: { type: LocationType.CollectionSpot, id, rotation: Math.floor(Math.random() * 2) }
      }))
    )
    // F: the 2 Round victory tokens
    this.material(MaterialType.RoundVictoryToken).createItem({ location: { type: LocationType.Reserve }, quantity: 2 })
    // H: the 8 Character cards, shuffled
    this.material(MaterialType.CharacterCard).createItems(shuffle(characterCards).map((id) => ({ id, location: { type: LocationType.CharacterDeck } })))
    // C, D, E: the 24 Animal cards, shuffled, then dealt
    this.material(MaterialType.AnimalCard).createItems(shuffle(animalCards).map((id) => ({ id, location: { type: LocationType.AnimalSetAside } })))
    dealRound(this, this.players)
  }

  start() {
    this.startSimultaneousRule(RuleId.ChooseCards)
  }
}
