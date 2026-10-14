import { Material } from '@gamepark/rules-api'
import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'

/** Anything the material can be read from: the rules, or the setup. */
export type MaterialSource = {
  material(type: MaterialType): Material<number, MaterialType, LocationType>
}
