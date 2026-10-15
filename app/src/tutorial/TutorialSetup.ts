import { HaatiSetup } from '@gamepark/haati/HaatiSetup'
import { HaatiOptions } from '@gamepark/haati/HaatiOptions'
import { Animal, animalCards } from '@gamepark/haati/material/Animal'
import { CharacterCard, characterCards } from '@gamepark/haati/material/Character'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { shuffle } from 'es-toolkit'

/** The player follows the tutorial; the opponent plays the moves the script imposes. */
export const me = 1
export const opponent = 2

export const card = (animal: Animal, value: number) => animal * 10 + value

const myHand = [card(Animal.Elephant, 2), card(Animal.Tiger, 3)]
const opponentHand = [card(Animal.Tiger, 7), card(Animal.Elephant, 3)]

/**
 * The cards revealed on top of each Animal pile, turn after turn: the first one is visible from the
 * start, the next ones are revealed after each duel. Turn 1: Tiger 5 / Mouse 1; turn 2: Elephant 4 /
 * Mouse 6; turn 3: Elephant 6 / Mouse 7. The rest of each pile is drawn at random.
 */
const pileTops = [
  [card(Animal.Tiger, 5), card(Animal.Elephant, 4), card(Animal.Elephant, 6)],
  [card(Animal.Mouse, 1), card(Animal.Mouse, 6), card(Animal.Mouse, 7)]
]
const PILE_SIZE = 8

/** The Character pile, from the top: the Hunter ✗ for the opponent, then the Merchant ✓ for the player. */
const characterTops = [CharacterCard.HunterLose, CharacterCard.MerchantWin]

/**
 * The deal of the tutorial (see the "Donne de départ" table of the script in Notion). Unlike the game,
 * nothing is left to chance until the end of the scripted duels.
 */
export class TutorialSetup extends HaatiSetup {
  setupMaterial(_options: HaatiOptions) {
    // The Jungle Collection token shows its 3 Favors + 1 Honor face, the one the script announces.
    this.material(MaterialType.CollectionToken).createItems([
      { id: Collection.Palace, location: { type: LocationType.CollectionSpot, id: Collection.Palace, rotation: Math.floor(Math.random() * 2) } },
      { id: Collection.Jungle, location: { type: LocationType.CollectionSpot, id: Collection.Jungle, rotation: 0 } }
    ])
    this.material(MaterialType.RoundVictoryToken).createItem({ location: { type: LocationType.Reserve }, quantity: 2 })

    // A pile is drawn from its last card: the cards drawn first are created last.
    const otherCharacters = shuffle(characterCards.filter((id) => !characterTops.includes(id)))
    this.material(MaterialType.CharacterCard).createItems(
      [...otherCharacters, ...[...characterTops].reverse()].map((id) => ({ id, location: { type: LocationType.CharacterDeck } }))
    )

    const imposed = [...myHand, ...opponentHand, ...pileTops.flat()]
    const others = shuffle(animalCards.filter((id) => !imposed.includes(id)))
    this.material(MaterialType.AnimalCard).createItems(myHand.map((id) => ({ id, location: { type: LocationType.PlayerHand, player: me } })))
    this.material(MaterialType.AnimalCard).createItems(opponentHand.map((id) => ({ id, location: { type: LocationType.PlayerHand, player: opponent } })))
    pileTops.forEach((tops, index) => {
      const pile = index + 1
      const filler = others.splice(0, PILE_SIZE - tops.length)
      const [visible, ...next] = tops
      this.material(MaterialType.AnimalCard).createItems([
        ...[...filler, ...[...next].reverse()].map((id) => ({ id, location: { type: LocationType.AnimalDeck, id: pile } })),
        { id: visible, location: { type: LocationType.AnimalDeck, id: pile, rotation: true } }
      ])
    })
    // The 4 cards left are out of this round.
    this.material(MaterialType.AnimalCard).createItems(others.map((id) => ({ id, location: { type: LocationType.AnimalSetAside } })))
  }
}
