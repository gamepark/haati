import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { prestigeUnits } from '@gamepark/haati/material/Prestige'
import { css } from '@emotion/react'
import { BoardDescription, ItemContext, MaterialContext, MoneyDescription, RoundTokenDescription, TokenDescription } from '@gamepark/react-game'
import { MaterialItem } from '@gamepark/rules-api'
import { victoryHalf } from '../locators/Locators'
import { BOARD_HEIGHT, BOARD_WIDTH, COLLECTION_DIAMETER, PRESTIGE_HEIGHT, VICTORY_HEIGHT, VICTORY_WIDTH } from '../locators/TableLayout'
import { getTutorialEffect } from '../tutorial/Tutorial'
import { TutorialEffect } from '../tutorial/TutorialEffect'
import { tutorialShineCss } from '../tutorial/TutorialShine'
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

  /** In the tutorial, the board can be lit in a circle on its cycle of the animals only, a little wider than the drawn circle. */
  getItemExtraCss(item: MaterialItem, context: ItemContext) {
    if (getTutorialEffect(context) !== TutorialEffect.AnimalCycle) return super.getItemExtraCss(item, context)
    return css`
      &::after {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: radial-gradient(circle at 50% 50%, transparent ${CYCLE_LIT_RADIUS}em, rgba(0, 0, 0, 0.55) ${CYCLE_LIT_RADIUS + 0.15}em);
        pointer-events: none;
      }
    `
  }
}

/** The radius lit in the tutorial around the cycle of the animals, drawn in the middle of the board (radius 2.5). */
const CYCLE_LIT_RADIUS = 2.8

/** The face drawn at random is the rotation of the token: 0 shows image 1, 1 shows image 2. */
class CollectionTokenDescription extends RoundTokenDescription<number, MaterialType, LocationType, Collection> {
  diameter = COLLECTION_DIAMETER
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

/**
 * The 2 Round victory tokens are identical: the two files are their two faces, the left and the
 * right half of one elephant. Each token shows the half that its place on the table calls for.
 */
class RoundVictoryTokenDescription extends TokenDescription {
  width = VICTORY_WIDTH
  height = VICTORY_HEIGHT
  transparency = true
  image = roundVictory1
  backImage = roundVictory2
  help = RoundVictoryHelp

  isFlippedOnTable(item: Partial<MaterialItem<number, LocationType>>, context: MaterialContext) {
    return victoryHalf(item as MaterialItem, context as ItemContext) > 0
  }
}

/**
 * Favor and Honor are money: one item per denomination (the id) and place, carrying a quantity. The
 * supply is unlimited, so it is drawn as a static pile of 3 tokens of each value in the reserve.
 */
class PrestigeDescription extends MoneyDescription<number, MaterialType, LocationType, number> {
  width = 1.63
  height = PRESTIGE_HEIGHT
  borderRadius = 0.8
  help = PrestigeHelp
  stockLocation = { type: LocationType.Reserve }

  constructor(readonly images: Record<number, string>) {
    super()
    this.staticItems = prestigeUnits.map((id) => ({ id, quantity: 3, location: this.stockLocation }))
  }

  /** In the tutorial, the Honor tokens of a player shine while they come in front of the Favor tokens (see PlayerPrestigeLocator). */
  getItemExtraCss(item: MaterialItem, context: ItemContext) {
    const extraCss = super.getItemExtraCss(item, context)
    const shines = context.type === MaterialType.Honor && item.location.type === LocationType.PlayerPrestige && getTutorialEffect(context) === TutorialEffect.Honor
    return shines ? [extraCss, tutorialShineCss] : extraCss
  }
}

export const boardDescription = new HaatiBoardDescription()
export const collectionTokenDescription = new CollectionTokenDescription()
export const roundVictoryTokenDescription = new RoundVictoryTokenDescription()
export const favorDescription = new PrestigeDescription({ 1: favor1, 3: favor3, 6: favor6 })
export const honorDescription = new PrestigeDescription({ 1: honor1, 3: honor3, 6: honor6 })
