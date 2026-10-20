import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { MaterialDescription } from '@gamepark/react-game'
import { animalCardDescription } from './AnimalCardDescription'
import { characterCardDescription } from './CharacterCardDescription'
import {
  boardDescription,
  collectionTokenDescription,
  prestigeDescription,
  roundVictoryTokenDescription
} from './TokenDescriptions'

export const Material: Partial<Record<MaterialType, MaterialDescription>> = {
  [MaterialType.Board]: boardDescription,
  [MaterialType.AnimalCard]: animalCardDescription,
  [MaterialType.CharacterCard]: characterCardDescription,
  [MaterialType.CollectionToken]: collectionTokenDescription,
  [MaterialType.RoundVictoryToken]: roundVictoryTokenDescription,
  [MaterialType.Prestige]: prestigeDescription
}
