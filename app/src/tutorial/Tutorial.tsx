/** @jsxImportSource @emotion/react */
import { Animal } from '@gamepark/haati/material/Animal'
import { CharacterCard } from '@gamepark/haati/material/Character'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { CustomMoveType } from '@gamepark/haati/rules/CustomMoveType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isStartPlayerTurn, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { PLAYER_PANEL_AREA, PLAYER_PRESTIGE_AREA } from '../locators/Locators'
import { card, me, opponent, TutorialSetup } from './TutorialSetup'
import { Elephant, Favor, Honor, Lose, Win } from './TutorialPictures'

/** A tutorial step, with what the Haati tutorial adds: zooming out before zooming in on its focus. */
export type HaatiTutorialStep = TutorialStep & { zoomOutFirst?: boolean }

/** What the texts of the popups may contain besides bold and italics: the Prestige tokens, the Character bets, the elephant. */
const components = { b: <strong />, i: <em />, favor: <Favor />, honor: <Honor />, win: <Win />, lose: <Lose />, elephant: <Elephant /> }

const text = (key: string) => () => <Trans i18nKey={`tuto.${key}`} components={components} />

/** The area of a player's panel (Favor, Honor and Prestige totals), which the interface draws. */
const panel = (player: number) => ({ type: LocationType.PlayerPrestige, player, id: PLAYER_PANEL_AREA })

/** The Prestige band at the bottom of a player's panel. */
const prestigeBand = (player: number) => ({ type: LocationType.PlayerPrestige, player, id: PLAYER_PRESTIGE_AREA })

/** The board, cut to its Elephant, Tiger, Mouse cycle: the margins crop the board and leave room below it for the popup. */
const boardCycle = {
  staticItems: { [MaterialType.Board]: [{ location: { type: LocationType.Board } }] },
  margin: { top: -10, bottom: -4 }
}

/** A move of an Animal card, the one with this id, to this place. */
const moveAnimal = (id: number, type: LocationType, player?: number) => (move: MaterialMove, game: MaterialGame) =>
  isMoveItemType(MaterialType.AnimalCard)(move) &&
  game.items[MaterialType.AnimalCard]![move.itemIndex].id === id &&
  move.location.type === type &&
  (player === undefined || move.location.player === player)

const moveMerchant = (type: LocationType) => (move: MaterialMove, game: MaterialGame) =>
  isMoveItemType(MaterialType.CharacterCard)(move) &&
  game.items[MaterialType.CharacterCard]![move.itemIndex].id === CharacterCard.MerchantWin &&
  move.location.type === type

/**
 * Where the chain of automatic moves stops for a popup: when the resolution of the duel starts, once
 * the duel cards are revealed (any player), or when a given player starts resolving their cards.
 */
const resolutionOf = (player?: number) => (move: MaterialMove) =>
  isStartPlayerTurn(move) && move.id === RuleId.ResolveDuel && (player === undefined || move.player === player)

/**
 * The tutorial follows the script written in Notion ("Script du tutoriel"): 4 scripted duels, then the
 * player finishes the round alone. Each step is a popup, a move of the player, or a move of the
 * opponent. A step with `interrupt` pauses the moves the game chains automatically, so that a popup
 * can explain them before they go on (the next step with `move: {}` resumes them).
 */
export class Tutorial extends MaterialTutorial<number, MaterialType, LocationType> {
  version = 1
  options = { players: 2 }
  setup = new TutorialSetup()
  /** The opponent is named after one of the two authors (Johannes Goupy and Joachim Thôme). */
  players = [
    { id: me },
    {
      id: opponent,
      name: 'Johannes',
      avatar: {
        topType: 'ShortHairShortFlat',
        facialHairType: 'BeardLight',
        clotheType: 'CollarSweater',
        eyeType: 'Happy',
        eyebrowType: 'DefaultNatural',
        mouthType: 'Smile'
      }
    }
  ]

  steps: HaatiTutorialStep[] = [
    // 1. Introduction
    { popup: { text: text('welcome') } },
    { popup: { text: text('universe') } },
    { popup: { text: text('favor-honor'), position: { y: 20 } }, focus: () => ({ locations: [panel(me)], margin: { bottom: 12 } }) },
    { popup: { text: text('prestige'), position: { x: -40, y: -11 } }, focus: () => ({ locations: [prestigeBand(me)], margin: { bottom: 12 } }) },
    {
      popup: { text: text('end-of-game'), position: { x: 10 } },
      focus: () => ({
        locations: [-1, 1].map((x) => ({ type: LocationType.PlayerRoundVictory, player: me, x })),
        margin: { right: 20, bottom: 10 }
      })
    },

    // 2. The first duel
    {
      popup: { text: text('turns'), position: { y: -15 } },
      zoomOutFirst: true,
      focus: (game) => ({ materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.AnimalDeck).locationId(2)], margin: { top: 15 } })
    },
    {
      popup: { text: text('hand'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerHand).player(me)],
        margin: { top: 10, right: 20 }
      })
    },
    {
      popup: { text: text('play'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Elephant, 2))],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveAnimal(card(Animal.Elephant, 2), LocationType.PlayerDuel) }
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Tiger, 7), LocationType.PlayerDuel), interrupt: resolutionOf() } },
    {
      popup: { text: text('cycle'), position: { y: 25 } },
      focus: () => boardCycle,
      move: { interrupt: resolutionOf(opponent) }
    },
    {
      popup: { text: text('palace'), position: { y: 25 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard).location(LocationType.Palace).player(me),
          this.material(game, MaterialType.Favor).location(LocationType.PlayerPrestige).player(me)
        ],
        margin: { bottom: 14 }
      }),
      move: {}
    },
    {
      popup: { text: text('jungle'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.Jungle).player(opponent)], margin: { top: 10 } })
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Elephant, 2), LocationType.Jungle, me) } },
    {
      popup: { text: text('change-place'), position: { x: -56 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Elephant, 2))],
        locations: [{ type: LocationType.Palace, player: me }],
        margin: { left: 8, right: 8 }
      })
    },
    {
      popup: { text: text('refill') },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard)
            .location(LocationType.AnimalDeck)
            .rotation((rotation) => !!rotation)
        ],
        margin: { left: 5, right: 5 }
      })
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Tiger, 5), LocationType.PlayerHand) } },

    // 3. Losing can pay off
    {
      popup: { text: text('play-mouse'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Mouse, 1))],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveAnimal(card(Animal.Mouse, 1), LocationType.PlayerDuel) }
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Tiger, 5), LocationType.PlayerDuel), interrupt: resolutionOf() } },
    {
      popup: { text: text('tiger-beats-mouse'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel)], margin: { top: 10 } }),
      move: { interrupt: resolutionOf(me) }
    },
    {
      popup: { text: text('mouse-jungle'), position: { y: -20 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel).player(me),
          this.material(game, MaterialType.AnimalCard).location(LocationType.Jungle).player(me)
        ],
        margin: { top: 10 }
      }),
      move: {}
    },
    {
      popup: { text: text('character-piles'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.CharacterDeck)],
        locations: [{ type: LocationType.CharacterDiscard }],
        margin: { top: 12, left: 4, right: 4 }
      })
    },
    {
      popup: { text: text('character'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerHand).player(me)],
        margin: { top: 10, right: 20 }
      })
    },
    {
      popup: { text: text('choose-card'), position: { y: 25 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Elephant, 4))], margin: { bottom: 14 } }),
      move: { filter: moveAnimal(card(Animal.Elephant, 4), LocationType.PlayerHand) }
    },

    // 4. Betting with a Character
    {
      popup: { text: text('bet'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerHand).player(me)],
        margin: { top: 10, right: 20 }
      })
    },
    {
      popup: { text: text('play-elephant'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Elephant, 4))],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveAnimal(card(Animal.Elephant, 4), LocationType.PlayerDuel) }
    },
    {
      popup: { text: text('play-merchant'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerHand).player(me)],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveMerchant(LocationType.PlayerDuel) }
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Elephant, 3), LocationType.PlayerDuel) } },
    { move: { player: opponent, filter: isCustomMoveType(CustomMoveType.Validate), interrupt: resolutionOf() } },
    {
      popup: { text: text('same-family'), position: { y: -20 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel),
          this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerDuel)
        ],
        margin: { top: 10 }
      }),
      move: {}
    },
    {
      popup: { text: text('resolution-order'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel).player(me)],
        locations: [{ type: LocationType.Palace, player: me }],
        margin: { top: 10 }
      }),
      move: { filter: moveAnimal(card(Animal.Elephant, 4), LocationType.Palace) }
    },
    {
      popup: { text: text('activate-merchant'), position: { y: -20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerDuel).player(me)], margin: { top: 10 } }),
      move: { filter: moveMerchant(LocationType.CharacterDiscard) }
    },
    { move: { player: opponent, filter: isCustomMoveType(CustomMoveType.Pass) } },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Elephant, 6), LocationType.PlayerHand) } },

    // 5. Winning a Collection
    {
      popup: { text: text('collections'), position: { y: -15 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard).location(LocationType.Jungle).player(me),
          this.material(game, MaterialType.CollectionToken).id(Collection.Jungle)
        ],
        margin: { top: 15 }
      })
    },
    {
      popup: { text: text('play-tiger'), position: { x: 15, y: -10 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Tiger, 3))],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveAnimal(card(Animal.Tiger, 3), LocationType.PlayerDuel) }
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Elephant, 6), LocationType.PlayerDuel) } },
    { move: { player: opponent, filter: isCustomMoveType(CustomMoveType.Validate), interrupt: resolutionOf() } },
    {
      popup: { text: text('lose-to-win'), position: { y: -20 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel),
          this.material(game, MaterialType.AnimalCard).location(LocationType.Jungle).player(me)
        ],
        margin: { top: 10 }
      }),
      move: {}
    },
    {
      popup: { text: text('tiger-effect'), position: { y: -28 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Elephant, 4))],
        locations: [{ type: LocationType.Jungle, player: me }],
        margin: { top: 10 }
      }),
      move: { filter: moveAnimal(card(Animal.Elephant, 4), LocationType.Jungle, me) }
    },
    {
      popup: { text: text('collection-won'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.CollectionToken).location(LocationType.PlayerCollection)], margin: { bottom: 14 } })
    },
    {
      popup: { text: text('honor'), position: { y: 20 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.Honor).location(LocationType.PlayerPrestige).player(me)], margin: { bottom: 14 } })
    },

    // 6. Your turn to play
    { popup: { text: text('prestige-total') }, focus: () => ({ locations: [prestigeBand(me), prestigeBand(opponent)], margin: { top: 5, bottom: 5 } }) },
    { popup: { text: text('your-turn') } }
  ]
}

/** The tutorial of the game, shared by the game provider and the tutorial display adjustments. */
export const haatiTutorial = new Tutorial()
