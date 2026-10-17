/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Animal, getAnimal, getValue } from '@gamepark/haati/material/Animal'
import { Bet, Character, CharacterCard, getBet, getCharacter } from '@gamepark/haati/material/Character'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { linkButtonCss, usePlay } from '@gamepark/react-game'
import { MaterialMoveBuilder } from '@gamepark/rules-api'
import { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { animalColors } from '../theme/colors'

/**
 * A card named inside an entry, clicked to open its help. Only its id is handed over: the journal is
 * read long after the fact, and the card may have left the place it was in.
 */
const HelpLink = ({ type, id, children }: { type: MaterialType; id: number; children: ReactNode }) => {
  const play = usePlay()
  return (
    <button css={[linkButtonCss, nameCss]} onClick={() => play(MaterialMoveBuilder.displayMaterialHelp(type, { id }), { transient: true })}>
      {children}
    </button>
  )
}

const nameCss = css`
  background: none;
  font: inherit;
  font-weight: bold;
`

const animalKeys: Record<Animal, string> = {
  [Animal.Elephant]: 'elephant',
  [Animal.Tiger]: 'tiger',
  [Animal.Mouse]: 'mouse'
}

/** An Animal card by the title of its help, « Tigre 5 », in the colour of its family. */
export const AnimalName = ({ id }: { id?: number }) => {
  const { t } = useTranslation()
  if (id === undefined) return <>{t('log.hidden-animal')}</>
  const animal = getAnimal(id)
  return (
    <HelpLink type={MaterialType.AnimalCard} id={id}>
      <span css={familyCss(animal)}>{t(`help.animal.${animalKeys[animal]}.title`, { value: getValue(id) })}</span>
    </HelpLink>
  )
}

const familyCss = (animal: Animal) => css`
  color: ${animalColors[animal]};
`

const characterKeys: Record<Character, string> = {
  [Character.Merchant]: 'merchant',
  [Character.Maharaja]: 'maharaja',
  [Character.Thief]: 'thief',
  [Character.Hunter]: 'hunter'
}

/** A Character card by its name inside a sentence, « la Marchande ✓ »: the bet decides everything it does. */
export const CharacterName = ({ id }: { id?: CharacterCard }) => {
  const { t } = useTranslation()
  if (id === undefined) return <>{t('log.hidden-character')}</>
  const name = t(`help.character.${characterKeys[getCharacter(id)]}`)
  return (
    <HelpLink type={MaterialType.CharacterCard} id={id}>
      {name.charAt(0).toLowerCase() + name.slice(1)} {getBet(id) === Bet.Win ? '✓' : '✗'}
    </HelpLink>
  )
}
