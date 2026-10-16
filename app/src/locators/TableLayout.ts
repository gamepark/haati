import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialContext } from '@gamepark/react-game'

/**
 * The board stands upright in the middle of the table, the Palace at the top and the Jungle at the
 * bottom. Each player sits on one side of it — the viewer on the left — and lays their Palace and
 * Jungle rows out from the board towards their own edge, level with the Palace and Jungle printed on
 * the board.
 *
 * Along the top edge, each player's information: their panel in the outer corner, then the Favor and
 * Honor tokens they hold, their Collection tokens and the places of their Round victory tokens. Along
 * the bottom edge, their hand in the outer corner. The duel cards wait at the outer edge, between the
 * rows and the hand, and come to the middle of the table, enlarged, once revealed.
 *
 * Above and below the board, the two piles of Animal cards, lying sideways, flanked by the other piles
 * of cards and by the supplies of Favor and Honor. Every measure is in centimetres.
 */
export const CARD_WIDTH = 6.35
export const CARD_HEIGHT = 8.89

/** The publisher's file is 1595 × 4608 px at 177.17 px/cm (450 dpi). Cards and tokens are drawn at the same density. */
export const BOARD_WIDTH = 9
export const BOARD_HEIGHT = 26

/** Centres of the Palace and Jungle circles printed on the board, where the Collection tokens wait. */
export const PALACE_SPOT_Y = -6
export const JUNGLE_SPOT_Y = 5.85

/** The Palace and Jungle tabs printed along both edges of the board, a card high: the rows stand level with them. */
export const PALACE_ROW_Y = -4.65
export const JUNGLE_ROW_Y = 4.65

/** The Palace and Jungle rows of each player, from the board outwards. */
export const ROW_X = 8.3
export const ROW_STEP = 2.5

/** The cards a player commits to the duel, at the outer edge of their side: the Animal card, then the Character card. */
export const DUEL_Y = 3
export const DUEL_X = 33.5
export const DUEL_CHARACTER_X = 40.5

/**
 * When the duel is revealed, the two Animal cards leave the table for the middle of the screen, enlarged,
 * and clash. The Character cards stay on the table.
 */
export const DUEL_SHOW_SCALE = 1.5
export const DUEL_SHOW_X = 5.6

/** The hand, fanned out in the bottom outer corner. */
export const HAND = { x: 33, y: 15.6 }
export const HAND_RADIUS = 40
export const HAND_GAP_ANGLE = 7
/** The buttons of a card in hand, at its bottom, off the picture. */
export const HAND_BUTTON_Y = CARD_HEIGHT / 2 - 1.6

/** The two piles of Animal cards, lying sideways (rotated by a quarter turn) above and below the board. */
export const ANIMAL_DECK_Y = 17.4
export const ANIMAL_DECK_ROTATE_Z = 90

/** The other piles of cards, upright: the Animal cards set aside and eliminated above, the Character cards below. */
export const ANIMAL_SET_ASIDE = { x: -8.5, y: -16.5 }
export const ANIMAL_DISCARD = { x: 8.5, y: -16.5 }
export const CHARACTER_DECK = { x: 8.5, y: 16.5 }
export const CHARACTER_DISCARD = { x: 15.5, y: 16.5 }

/** The unlimited supply of Favor and Honor, below the board on the viewer's side: one heap of white and black tokens. */
export const PRESTIGE_BANK = { x: -15.5, y: 17 }
export const BANK_RADIUS = 1.2

/** The 2 Round victory tokens are the two halves of one elephant: they are laid side by side, upright. */
export const VICTORY_WIDTH = 2.57
export const VICTORY_HEIGHT = 6.56

/** The Round victory tokens not won yet, beside the pile of Animal cards below the board. */
export const VICTORY_RESERVE = { x: -7.6, y: ANIMAL_DECK_Y }

/** At the end of the game, the elephant completed by the winner stands in the middle of the table, this many times bigger. */
export const VICTORY_SHOW_SCALE = 3

/**
 * What a player holds lies along the top edge of their side, from the outer edge inwards: the panel,
 * the Prestige in two rows, then the Collection tokens one above the other. The panel stands clear of
 * the zoom buttons in the top left corner of the screen. All of them end on one line: the bottom of the
 * panel, of the Favor tokens and of the second Collection token are level with the bottom of the piles
 * of Animal cards set aside and eliminated, and the top of the panel and of the Honor tokens with their top. The Round victory tokens stand just below that line, under
 * the panel.
 */
export const PLAYER_BAND_BOTTOM = ANIMAL_SET_ASIDE.y + CARD_HEIGHT / 2
export const PLAYER_VICTORY = { x: 33.5, y: PLAYER_BAND_BOTTOM + 0.4 + VICTORY_HEIGHT / 2 }

/**
 * The Prestige: Honor in the upper row, Favor in the lower one, which covers the Honor tokens all but
 * their value, printed at the top. Highest values first, from the outer edge inwards.
 */
export const PRESTIGE_ROW_X = 26.7
export const PRESTIGE_ROW_STEP = 2.3
export const PRESTIGE_ROW_LENGTH = 6.9
export const PRESTIGE_HEIGHT = 5.76
export const PLAYER_FAVOR_Y = PLAYER_BAND_BOTTOM - PRESTIGE_HEIGHT / 2
export const PLAYER_HONOR_Y = PLAYER_BAND_BOTTOM - CARD_HEIGHT + PRESTIGE_HEIGHT / 2
export const COLLECTION_DIAMETER = 4.97
export const PLAYER_COLLECTION_X = 15.6
export const PLAYER_COLLECTION_GAP = 4.2
export const PLAYER_COLLECTION_Y = PLAYER_BAND_BOTTOM - COLLECTION_DIAMETER / 2 - PLAYER_COLLECTION_GAP

export const TABLE_WIDTH = 88.6
export const TABLE_HEIGHT = 2 * 21.3

/** The player panels, near the top outer corner of each side, clear of the zoom buttons, their bottom on the band line. */
export const PLAYER_PANEL_X = 28.25
export const PLAYER_PANEL_WIDTH = 10.5
export const PLAYER_PANEL_HEIGHT = CARD_HEIGHT

/** -1 for the viewer's side, on the left; 1 for the opponent's side. Spectators see the first player on the left. */
export const side = (player: number | undefined, context: MaterialContext): number => {
  const me = context.player ?? context.rules.players[0]
  return player === me ? -1 : 1
}

export const placeY = (type: LocationType) => (type === LocationType.Palace ? PALACE_ROW_Y : JUNGLE_ROW_Y)
