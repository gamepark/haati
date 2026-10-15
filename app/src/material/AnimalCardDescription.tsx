/** @jsxImportSource @emotion/react */
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan'
import { faHand } from '@fortawesome/free-solid-svg-icons/faHand'
import { faHandPointUp } from '@fortawesome/free-solid-svg-icons/faHandPointUp'
import { faLandmarkDome } from '@fortawesome/free-solid-svg-icons/faLandmarkDome'
import { faTree } from '@fortawesome/free-solid-svg-icons/faTree'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { CARD_HEIGHT, CARD_WIDTH, HAND_BUTTON_Y, side } from '../locators/TableLayout'
import { ItemAction, ItemActions } from '../theme/ItemActions'
import { handCardAngle, handCardCss } from './handHover'
import { AnimalCardHelp } from './help/AnimalCardHelp'
import animalBack from '../images/cards/AnimalBack.jpg'
import elephant1 from '../images/cards/animals/Elephant1.jpg'
import elephant2 from '../images/cards/animals/Elephant2.jpg'
import elephant3 from '../images/cards/animals/Elephant3.jpg'
import elephant4 from '../images/cards/animals/Elephant4.jpg'
import elephant5 from '../images/cards/animals/Elephant5.jpg'
import elephant6 from '../images/cards/animals/Elephant6.jpg'
import elephant7 from '../images/cards/animals/Elephant7.jpg'
import elephant8 from '../images/cards/animals/Elephant8.jpg'
import tiger1 from '../images/cards/animals/Tiger1.jpg'
import tiger2 from '../images/cards/animals/Tiger2.jpg'
import tiger3 from '../images/cards/animals/Tiger3.jpg'
import tiger4 from '../images/cards/animals/Tiger4.jpg'
import tiger5 from '../images/cards/animals/Tiger5.jpg'
import tiger6 from '../images/cards/animals/Tiger6.jpg'
import tiger7 from '../images/cards/animals/Tiger7.jpg'
import tiger8 from '../images/cards/animals/Tiger8.jpg'
import mouse1 from '../images/cards/animals/Mouse1.jpg'
import mouse2 from '../images/cards/animals/Mouse2.jpg'
import mouse3 from '../images/cards/animals/Mouse3.jpg'
import mouse4 from '../images/cards/animals/Mouse4.jpg'
import mouse5 from '../images/cards/animals/Mouse5.jpg'
import mouse6 from '../images/cards/animals/Mouse6.jpg'
import mouse7 from '../images/cards/animals/Mouse7.jpg'
import mouse8 from '../images/cards/animals/Mouse8.jpg'

const destinations: Partial<Record<LocationType, Omit<ItemAction, 'move'>>> = {
  [LocationType.PlayerDuel]: { icon: faHandPointUp, title: 'button.play' },
  [LocationType.Palace]: { icon: faLandmarkDome, title: 'button.to-palace' },
  [LocationType.Jungle]: { icon: faTree, title: 'button.to-jungle' },
  [LocationType.AnimalDiscard]: { icon: faBan, title: 'button.eliminate' },
  [LocationType.PlayerHand]: { icon: faHand, title: 'button.take' }
}

/** Animal cards: 3 families, each numbered from 1 to 8. The id is the family times 10 plus the value. */
class AnimalCardDescription extends CardDescription<number, MaterialType, LocationType, number> {
  width = CARD_WIDTH
  height = CARD_HEIGHT
  borderRadius = 0.4
  help = AnimalCardHelp
  menuAlwaysVisible = true

  backImage = animalBack
  images = {
    11: elephant1,
    12: elephant2,
    13: elephant3,
    14: elephant4,
    15: elephant5,
    16: elephant6,
    17: elephant7,
    18: elephant8,
    21: tiger1,
    22: tiger2,
    23: tiger3,
    24: tiger4,
    25: tiger5,
    26: tiger6,
    27: tiger7,
    28: tiger8,
    31: mouse1,
    32: mouse2,
    33: mouse3,
    34: mouse4,
    35: mouse5,
    36: mouse6,
    37: mouse7,
    38: mouse8
  }

  getItemMenu(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>, legalMoves: MaterialMove[]) {
    const actions = legalMoves
      .filter(isMoveItemType(MaterialType.AnimalCard))
      .filter((move) => move.itemIndex === context.index && destinations[move.location.type as LocationType])
      .map((move) => ({ move, ...destinations[move.location.type as LocationType]! }))
    if (!actions.length) return null
    // In a row, only the edge of the card towards the board is uncovered: the button goes there, below
    // the family and the value printed in the corner. In hand, it goes at the bottom, off the picture.
    const inRow = item.location.type === LocationType.Palace || item.location.type === LocationType.Jungle
    const inHand = item.location.type === LocationType.PlayerHand
    return (
      <ItemActions
        actions={actions}
        x={inRow ? -side(item.location.player, context) * 1.9 : 0}
        y={inHand ? HAND_BUTTON_Y : 0}
        angle={handCardAngle(item, context)}
      />
    )
  }

  getItemExtraCss(item: MaterialItem<number, LocationType>, context: ItemContext<number, MaterialType, LocationType>) {
    const angle = handCardAngle(item, context)
    return angle === undefined ? undefined : handCardCss(angle)
  }
}

export const animalCardDescription = new AnimalCardDescription()
