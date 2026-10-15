import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialContext } from '@gamepark/react-game'

/**
 * The board stands upright in the middle of the table, the Palace at the top and the Jungle at the
 * bottom. Each player sits on one side of it — the viewer on the left — and lays their two columns
 * of animals out from the board towards their own edge: the Palace row facing the Palace, the Jungle
 * row facing the Jungle, and between them the duel and the hand.
 *
 * Above and below the board, the two piles of Animal cards with their revealed card on top, lying
 * sideways to keep the table low, flanked by the other piles of cards and by the shared supplies. The
 * player panels and the material each player wins fill the corners. Every measure is in centimetres.
 */
export const CARD_WIDTH = 6.35
export const CARD_HEIGHT = 8.89

/** The publisher's file is 1595 × 4608 px at 177.17 px/cm (450 dpi). Cards and tokens are drawn at the same density. */
export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 26

/** Centres of the Palace and Jungle circles printed on the board, where the Collection tokens wait. */
export const PALACE_SPOT_Y = -6
export const JUNGLE_SPOT_Y = 5.85

/** Centre of the Elephant, Tiger, Mouse cycle printed on the board, where the turns left are shown. */
export const CYCLE_Y = 0

/** The Palace and Jungle rows of each player, as close to the duel as the cards lying sideways allow. */
export const ROW_Y = 9.1
export const ROW_X = 8.3
export const ROW_STEP = 2.5

/** The duel, face to face across the board, then the hand. */
export const DUEL_X = 8.3
export const DUEL_CHARACTER_X = 15.1
export const HAND_X = 22.8
export const HAND_STEP = 5
/** The buttons of a card in hand, at its bottom, off the picture. */
export const HAND_BUTTON_Y = CARD_HEIGHT / 2 - 1.6

/**
 * The rows of shared material at both ends of the board. The cards there lie sideways (rotated by a
 * quarter turn), so the rows are only a card width high, and they stand a little away from the Palace
 * and Jungle rows: the same gap separates them from the board at both ends.
 */
export const SHARED_ROW_Y = 17.4
export const SHARED_ROTATE_Z = 90
export const CHARACTER_DECK = { x: -10, y: -SHARED_ROW_Y }
export const CHARACTER_DISCARD = { x: 10, y: -SHARED_ROW_Y }
export const ANIMAL_SET_ASIDE = { x: -10, y: SHARED_ROW_Y }
export const ANIMAL_DISCARD = { x: 10, y: SHARED_ROW_Y }
/**
 * The unlimited supplies of Favor and Honor: one token of each value, fanned out from a point below
 * them, 6 at the back, then 3, then 1. They stand in the outer top corners, beside the player panels
 * and below the zoom buttons of the screen.
 */
export const FAVOR_BANK = { x: -38.5, y: -15.8 }
export const HONOR_BANK = { x: 38.5, y: -15.8 }
export const BANK_FAN_RADIUS = 4.5
export const BANK_FAN_ANGLE = 16

/** The 2 Round victory tokens are the two halves of one elephant: they are laid side by side, upright. */
export const VICTORY_WIDTH = 2.57
export const VICTORY_HEIGHT = 6.56

/**
 * What a player wins lies along the bottom edge of their side, from the outer edge inwards: the Round
 * victory tokens, the Prestige in two rows, then the Collection tokens beside the pile under the board.
 */
export const BOTTOM_ROW_Y = 17.45
export const PLAYER_VICTORY_X = 41.6

/**
 * The Prestige: Honor in the upper row, Favor in the lower one, which covers the Honor tokens all but
 * their value, printed at the top. Highest values first, from the outer edge inwards.
 */
export const PRESTIGE_ROW_X = 37.4
export const PRESTIGE_ROW_STEP = 1.9
export const PRESTIGE_ROW_LENGTH = 12
export const PLAYER_HONOR_Y = BOTTOM_ROW_Y - 0.85
export const PLAYER_FAVOR_Y = BOTTOM_ROW_Y + 0.85
export const PLAYER_COLLECTION_X = 18.6
export const PLAYER_COLLECTION_GAP = 3.6

export const TABLE_WIDTH = 88.6
export const TABLE_HEIGHT = 2 * 21.3

/** The player panels, against the top edge of each side, above the longest Palace rows. */
export const PLAYER_PANEL_X = 23
export const PLAYER_PANEL_WIDTH = 10.5
export const PLAYER_PANEL_Y = -TABLE_HEIGHT / 2 + 0.15

/** -1 for the viewer's side, on the left; 1 for the opponent's side. Spectators see the first player on the left. */
export const side = (player: number | undefined, context: MaterialContext): number => {
  const me = context.player ?? context.rules.players[0]
  return player === me ? -1 : 1
}

export const placeY = (type: LocationType) => (type === LocationType.Palace ? -ROW_Y : ROW_Y)
