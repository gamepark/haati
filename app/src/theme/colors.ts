import { Animal } from '@gamepark/haati/material/Animal'

/**
 * Sampled from the rulebook and the material: the cream parchment of the board and of the effect
 * reminders, the brown ink every pictogram is drawn with, the plum of the Character card backs and
 * the gold of the Round victory token. The pastel watercolour of the background stays on the table.
 */
export const colors = {
  parchment: '#FCF3D6',
  parchmentDeep: '#EFE3C0',
  sand: '#CCB991',

  ink: '#4A3421',
  inkLight: '#8C7354',

  plum: '#66224B',
  plumDeep: '#3E1230',
  plumLight: '#8E3A6C',

  gold: '#C99A3B',
  goldLight: '#F2D490',
  goldDeep: '#8A6420'
}

/** The colour of each family, as printed on the board and in the corner of the cards. */
export const animalColors: Record<Animal, string> = {
  [Animal.Elephant]: '#4A78C2',
  [Animal.Tiger]: '#B4502C',
  [Animal.Mouse]: '#2E9C8A'
}
