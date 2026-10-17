/** @jsxImportSource @emotion/react */
import { Animal } from '@gamepark/haati/material/Animal'
import { CharacterCard } from '@gamepark/haati/material/Character'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { CustomMoveType } from '@gamepark/haati/rules/CustomMoveType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { MaterialContext, MaterialTutorial, TutorialStep } from '@gamepark/react-game'
import { isCustomMoveType, isMoveItemType, isStartPlayerTurn, MaterialGame, MaterialMove } from '@gamepark/rules-api'
import { Trans } from 'react-i18next'
import { PanelArea } from '../locators/TableLayout'
import { TutorialEffect } from './TutorialEffect'
import { card, me, opponent, TutorialSetup } from './TutorialSetup'
import { Elephant, Favor, Honor, Lose, Win } from './TutorialPictures'

/**
 * A tutorial step, with what the Haati tutorial adds: showing its popup only once the view has reached its
 * focus, and an effect of the display lasting as long as the step.
 */
export type HaatiTutorialStep = TutorialStep & { focusFirst?: boolean; effect?: TutorialEffect }

/** What the texts of the popups may contain besides bold and italics: the Prestige tokens, the Character bets, the elephant. */
const components = { b: <strong />, i: <em />, favor: <Favor />, honor: <Honor />, win: <Win />, lose: <Lose />, elephant: <Elephant /> }

const text = (key: string) => () => <Trans i18nKey={`tuto.${key}`} components={components} />

/** An area of a player's panel, which the interface draws (see PanelArea). */
const panel = (player: number, area: PanelArea) => ({ type: LocationType.PlayerPrestige, player, id: area })

/** The board, cut to its Elephant, Tiger, Mouse cycle, lit in a circle: the margins crop the board and leave room below it for the popup. */
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
  version = 2
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
    { popup: { text: text('favor-honor'), position: { x: -50, y: 5 } }, focus: () => ({ locations: [panel(me, PanelArea.Tiles)], margin: { bottom: 12 } }) },
    { popup: { text: text('prestige'), position: { x: -50, y: 3 } }, focus: () => ({ locations: [panel(me, PanelArea.Prestige)], margin: { bottom: 12 } }) },
    {
      popup: { text: text('end-of-game'), position: { x: -17, y: -27 } },
      focus: () => ({
        locations: [-1, 1].map((x) => ({ type: LocationType.PlayerRoundVictory, player: me, x })),
        margin: { right: 30, bottom: 2 }
      }),
      effect: TutorialEffect.RoundVictory
    },

    // 2. The first duel
    {
      popup: { text: text('turns') },
      focusFirst: true,
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.AnimalDeck).locationId(2)],
        locations: [panel(me, PanelArea.Turn)]
      })
    },
    {
      popup: { text: text('hand'), position: { x: -34, y: -12 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerHand).player(me)],
        margin: { top: 10, right: 20 }
      })
    },
    {
      popup: { text: text('play'), position: { x: -11, y: -5 } },
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
      move: { interrupt: resolutionOf(opponent) },
      effect: TutorialEffect.AnimalCycle
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
      popup: { text: text('change-place'), position: { y: -12 } },
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
      popup: { text: text('play-mouse'), position: { x: -11, y: -5 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Mouse, 1))],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveAnimal(card(Animal.Mouse, 1), LocationType.PlayerDuel) }
    },
    { move: { player: opponent, filter: moveAnimal(card(Animal.Tiger, 5), LocationType.PlayerDuel), interrupt: resolutionOf() } },
    {
      popup: { text: text('tiger-beats-mouse'), position: { y: 24 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel)], margin: { bottom: 12 } }),
      move: { interrupt: resolutionOf(me) },
      effect: TutorialEffect.DuelShow
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
      move: {},
      effect: TutorialEffect.DuelShow
    },
    {
      popup: { text: text('character-piles'), position: { x: 11, y: -7 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.CharacterDeck)],
        locations: [{ type: LocationType.CharacterDiscard }],
        margin: { top: 12, left: 4, right: 4 }
      })
    },
    {
      popup: { text: text('character'), position: { x: -28, y: -14 } },
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
      popup: { text: text('bet'), position: { x: -40, y: -17 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerHand).player(me)],
        margin: { top: 10, right: 20 }
      })
    },
    {
      popup: { text: text('play-elephant'), position: { x: -11, y: -5 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).id(card(Animal.Elephant, 4))],
        locations: [{ type: LocationType.PlayerDuel, player: me }],
        margin: { top: 10, right: 20 }
      }),
      move: { filter: moveAnimal(card(Animal.Elephant, 4), LocationType.PlayerDuel) }
    },
    {
      popup: { text: text('play-merchant'), position: { x: -11, y: -5 } },
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
      popup: { text: text('same-family'), position: { y: 24 } },
      focus: (game) => ({ materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel)], margin: { bottom: 12 } }),
      move: {},
      effect: TutorialEffect.DuelShow
    },
    {
      popup: { text: text('bet-won'), position: { x: -50, y: 0 } },
      focus: (game) => ({
        materials: [
          this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel).player(me),
          this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerDuel).player(me)
        ],
        margin: { top: 10 }
      })
    },
    {
      popup: { text: text('resolution-order'), position: { x: -27, y: -2 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.AnimalCard).location(LocationType.PlayerDuel).player(me)],
        locations: [{ type: LocationType.Palace, player: me }],
        margin: { top: 10 }
      }),
      move: { filter: moveAnimal(card(Animal.Elephant, 4), LocationType.Palace) }
    },
    {
      popup: { text: text('activate-merchant'), position: { y: -20 } },
      focus: (game) => ({
        materials: [this.material(game, MaterialType.CharacterCard).location(LocationType.PlayerDuel).player(me)],
        locations: [{ type: LocationType.CharacterDiscard }],
        margin: { top: 10 }
      }),
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
      popup: { text: text('play-tiger'), position: { x: -11, y: -5 } },
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
      focus: (game) => ({ materials: [this.material(game, MaterialType.Honor).location(LocationType.PlayerPrestige).player(me)], margin: { bottom: 14 } }),
      effect: TutorialEffect.Honor
    },

    // 6. Your turn to play
    {
      popup: { text: text('prestige-total'), position: { x: -50, y: 4 } },
      focus: () => ({ locations: [panel(me, PanelArea.Tiles), panel(me, PanelArea.Prestige)], margin: { bottom: 12 } })
    },
    { popup: { text: text('your-turn') } }
  ]
}

/** The tutorial of the game, shared by the game provider and the tutorial display adjustments. */
export const haatiTutorial = new Tutorial()

/**
 * The effect of the display during the current step of the tutorial, if any. The step starts as soon as the move
 * before it is played, while the reveal of the duel it brings may still be shown: the duel is only kept in the
 * middle of the screen once all its cards are face up, right where the show of the reveal leaves them.
 */
export const getTutorialEffect = ({ rules }: MaterialContext) => {
  const tutorial = rules.game.tutorial
  const effect = tutorial ? haatiTutorial.steps[tutorial.step]?.effect : undefined
  if (effect === TutorialEffect.DuelShow && hasHiddenDuelCards(rules.game)) return
  return effect
}

const hasHiddenDuelCards = (game: MaterialGame) =>
  [MaterialType.AnimalCard, MaterialType.CharacterCard].some(
    (type) =>
      haatiTutorial
        .material(game, type)
        .location(LocationType.PlayerDuel)
        .rotation((rotation) => !rotation).length > 0
  )

/** Whether the tutorial pauses on the duel being revealed, keeping its Animal cards in the middle of the screen: the show of the duel then ends there. */
export const isDuelShowNext = ({ rules }: MaterialContext) => {
  const tutorial = rules.game.tutorial
  return !!tutorial && haatiTutorial.steps[tutorial.step]?.effect === TutorialEffect.DuelShow
}

/** Whether the current step of the tutorial waits for a move of the viewer, which the popup asks for: its "OK" button is then hidden. */
export const isPlayerMoveExpected = (game: MaterialGame) => {
  const step = game.tutorial ? haatiTutorial.steps[game.tutorial.step] : undefined
  return !!step?.popup && !!step.move?.filter && step.move.player === undefined
}
