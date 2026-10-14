import { getEnumValues } from '@gamepark/rules-api'

export enum Animal {
  Elephant = 1,
  Tiger,
  Mouse
}

export const animals = getEnumValues(Animal)

/** An Animal card id is its family times 10 plus its value: 11 to 18, 21 to 28 and 31 to 38. */
export type AnimalCard = number

export const animalCards: AnimalCard[] = animals.flatMap((animal) => Array.from({ length: 8 }, (_, i) => animal * 10 + i + 1))

export const getAnimal = (card: AnimalCard): Animal => Math.floor(card / 10)
export const getValue = (card: AnimalCard): number => card % 10

/** The Elephant beats the Tiger, the Tiger beats the Mouse, the Mouse beats the Elephant. */
const prey: Record<Animal, Animal> = {
  [Animal.Elephant]: Animal.Tiger,
  [Animal.Tiger]: Animal.Mouse,
  [Animal.Mouse]: Animal.Elephant
}

/** Whether card a wins the duel against card b. Within the same family, the higher value wins. */
export const beats = (a: AnimalCard, b: AnimalCard): boolean =>
  getAnimal(a) === getAnimal(b) ? getValue(a) > getValue(b) : prey[getAnimal(a)] === getAnimal(b)

/** A Collection is 4 consecutive values in the same place, whatever the families and the order. */
export const hasCollection = (cards: AnimalCard[]): boolean => {
  const values = new Set(cards.map(getValue))
  return [...values].some((value) => [1, 2, 3].every((i) => values.has(value + i)))
}
