import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { BoardDescription, MaterialContext, MoneyDescription, RoundTokenDescription, TokenDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { BOARD_HEIGHT, BOARD_WIDTH } from '../locators/TableLayout'
import { BoardHelp } from './help/BoardHelp'
import { CollectionTokenHelp } from './help/CollectionTokenHelp'
import { PrestigeHelp } from './help/PrestigeHelp'
import { RoundVictoryHelp } from './help/RoundVictoryHelp'
import board from '../images/boards/Board.jpg'
import jungle1 from '../images/tokens/collection/Jungle1.png'
import jungle2 from '../images/tokens/collection/Jungle2.png'
import palace1 from '../images/tokens/collection/Palace1.png'
import palace2 from '../images/tokens/collection/Palace2.png'
import favor1 from '../images/tokens/prestige/Favor1.png'
import favor3 from '../images/tokens/prestige/Favor3.png'
import favor6 from '../images/tokens/prestige/Favor6.png'
import honor1 from '../images/tokens/prestige/Honor1.png'
import honor3 from '../images/tokens/prestige/Honor3.png'
import honor6 from '../images/tokens/prestige/Honor6.png'
import roundVictory1 from '../images/tokens/RoundVictory1.png'
import roundVictory2 from '../images/tokens/RoundVictory2.png'

/** The portrait board: the Palace at the top, the Jungle at the bottom, the reminders at both ends. */
class HaatiBoardDescription extends BoardDescription {
  width = BOARD_WIDTH
  height = BOARD_HEIGHT
  borderRadius = 0.8
  image = board
  help = BoardHelp
  staticItem = { location: { type: LocationType.Board } }
}

/** The face drawn at random is the rotation of the token: 0 shows image 1, 1 shows image 2. */
class CollectionTokenDescription extends RoundTokenDescription<number, MaterialType, LocationType, Collection> {
  diameter = 4.97
  transparency = true
  help = CollectionTokenHelp

  images = {
    [Collection.Palace]: palace1,
    [Collection.Jungle]: jungle1
  }
  backImages = {
    [Collection.Palace]: palace2,
    [Collection.Jungle]: jungle2
  }

  isFlippedOnTable(item: Partial<MaterialItem<number, LocationType>>, _context: MaterialContext) {
    return !!item.location?.rotation
  }

  isFlippedInDialog(item: Partial<MaterialItem<number, LocationType>>, context: MaterialContext) {
    return this.isFlippedOnTable(item, context)
  }
}

/** The 2 Round victory tokens are identical: the two files are their two faces. */
class RoundVictoryTokenDescription extends TokenDescription {
  width = 2.57
  height = 6.56
  transparency = true
  image = roundVictory1
  backImage = roundVictory2
  help = RoundVictoryHelp
}

/**
 * Favor and Honor are money: one item per denomination (the id) and place, carrying a quantity. The
 * supply is unlimited, drawn as a static heap in the reserve.
 */
class PrestigeDescription extends MoneyDescription<number, MaterialType, LocationType, number> {
  width = 1.63
  height = 5.76
  borderRadius = 0.8
  help = PrestigeHelp
  stockLocation = { type: LocationType.Reserve }

  constructor(readonly images: Record<number, string>) {
    super()
    this.staticItems = [6, 3, 1].map((id) => ({ id, quantity: 3, location: this.stockLocation }))
  }
}

export const boardDescription = new HaatiBoardDescription()
export const collectionTokenDescription = new CollectionTokenDescription()
export const roundVictoryTokenDescription = new RoundVictoryTokenDescription()
export const favorDescription = new PrestigeDescription({ 1: favor1, 3: favor3, 6: favor6 })
export const honorDescription = new PrestigeDescription({ 1: honor1, 3: honor3, 6: honor6 })
