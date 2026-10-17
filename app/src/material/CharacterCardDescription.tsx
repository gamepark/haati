/** @jsxImportSource @emotion/react */
import { faBolt } from '@fortawesome/free-solid-svg-icons/faBolt'
import { faHandPointUp } from '@fortawesome/free-solid-svg-icons/faHandPointUp'
import { faTrashCan } from '@fortawesome/free-solid-svg-icons/faTrashCan'
import { CharacterCard } from '@gamepark/haati/material/Character'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { CardDescription, ItemContext } from '@gamepark/react-game'
import { isMoveItemType, MaterialItem, MaterialMove } from '@gamepark/rules-api'
import { isWonBet, wonBetCss } from '../animations/BetShow'
import { CARD_HEIGHT, CARD_WIDTH, HAND_BUTTON_Y } from '../locators/TableLayout'
import { ItemAction, ItemActions } from '../theme/ItemActions'
import { handCardAngle, handCardCss } from './handHover'
import { CharacterCardHelp } from './help/CharacterCardHelp'
import characterBack from '../images/cards/CharacterBack.jpg'
import hunterLose from '../images/cards/characters/HunterLose.jpg'
import hunterWin from '../images/cards/characters/HunterWin.jpg'
import maharajaLose from '../images/cards/characters/MaharajaLose.jpg'
import maharajaWin from '../images/cards/characters/MaharajaWin.jpg'
import merchantLose from '../images/cards/characters/MerchantLose.jpg'
import merchantWin from '../images/cards/characters/MerchantWin.jpg'
import thiefLose from '../images/cards/characters/ThiefLose.jpg'
import thiefWin from '../images/cards/characters/ThiefWin.jpg'

class CharacterCardDescription extends CardDescription<number, MaterialType, LocationType, CharacterCard> {
  width = CARD_WIDTH
  height = CARD_HEIGHT
  borderRadius = 0.4
  help = CharacterCardHelp
  menuAlwaysVisible = true

  backImage = characterBack
  images = {
    [CharacterCard.MerchantWin]: merchantWin,
    [CharacterCard.MerchantLose]: merchantLose,
    [CharacterCard.MaharajaWin]: maharajaWin,
    [CharacterCard.MaharajaLose]: maharajaLose,
    [CharacterCard.ThiefWin]: thiefWin,
    [CharacterCard.ThiefLose]: thiefLose,
    [CharacterCard.HunterWin]: hunterWin,
    [CharacterCard.HunterLose]: hunterLose
  }

  getItemMenu(item: MaterialItem, context: ItemContext<number, MaterialType, LocationType>, legalMoves: MaterialMove[]) {
    const actions: ItemAction[] = legalMoves
      .filter(isMoveItemType(MaterialType.CharacterCard))
      .filter((move) => move.itemIndex === context.index)
      .map((move) => {
        if (move.location.type === LocationType.PlayerDuel) return { move, icon: faHandPointUp, title: 'button.bet' }
        if (context.rules.game.rule?.id === RuleId.DiscardCharacter) return { move, icon: faTrashCan, title: 'button.discard' }
        return { move, icon: faBolt, title: 'button.activate' }
      })
    // In hand and in the duel, where the whole card shows, the button goes at its bottom, off the picture.
    const atBottom = item.location.type === LocationType.PlayerHand || item.location.type === LocationType.PlayerDuel
    return actions.length ? <ItemActions actions={actions} y={atBottom ? HAND_BUTTON_Y : 0} angle={handCardAngle(item, context)} /> : null
  }

  /** A won bet shines in gold instead (see BetShow). */
  highlight(item: MaterialItem, context: ItemContext<number, MaterialType, LocationType>) {
    return isWonBet(item, context.rules) ? false : undefined
  }

  getItemExtraCss(item: MaterialItem, context: ItemContext<number, MaterialType, LocationType>) {
    if (isWonBet(item, context.rules)) return wonBetCss
    const angle = handCardAngle(item, context)
    return angle === undefined ? undefined : handCardCss(angle)
  }
}

export const characterCardDescription = new CharacterCardDescription()
