/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Animal, getAnimal, getValue } from '@gamepark/haati/material/Animal'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { animalColors } from '../../theme/colors'
import { CardLocation } from './CardLocation'
import { helpBlock, helpBlockActive, helpComponents, helpIntro, helpSection, helpTitle } from './helpStyles'

const animalKeys: Record<Animal, string> = {
  [Animal.Elephant]: 'elephant',
  [Animal.Tiger]: 'tiger',
  [Animal.Mouse]: 'mouse'
}

/**
 * An Animal card: which family it beats and which one beats it, then what it does in each of the
 * two places it can land — the Palace for the winner of the duel, the Jungle for the loser. A card
 * already in a place has its block picked out.
 */
export const AnimalCardHelp = ({ item }: MaterialHelpProps) => {
  const { t } = useTranslation()
  if (item.id === undefined) {
    return (
      <>
        <h2 css={helpTitle}>{t('help.animal.hidden.title')}</h2>
        <p css={helpIntro}>
          <Trans i18nKey="help.animal.hidden.intro" components={helpComponents} />
        </p>
        <CardLocation location={item.location} />
      </>
    )
  }
  const animal = getAnimal(item.id)
  const key = animalKeys[animal]
  const place = item.location?.type
  return (
    <>
      <h2 css={[helpTitle, familyColor(animal)]}>{t(`help.animal.${key}.title`, { value: getValue(item.id) })}</h2>
      <p css={helpIntro}>
        <Trans i18nKey={`help.animal.${key}.duel`} components={helpComponents} />
      </p>
      <p css={helpIntro}>
        <Trans i18nKey="help.animal.same-family" components={helpComponents} />
      </p>
      <div css={helpSection}>{t('help.animal.palace')}</div>
      <div css={[helpBlock, place === LocationType.Palace && helpBlockActive]}>
        <Trans i18nKey={`help.animal.${key}.palace`} components={helpComponents} />
      </div>
      <div css={helpSection}>{t('help.animal.jungle')}</div>
      <div css={[helpBlock, place === LocationType.Jungle && helpBlockActive]}>
        <Trans i18nKey={`help.animal.${key}.jungle`} components={helpComponents} />
      </div>
      <p css={helpIntro}>
        <Trans i18nKey="help.animal.collection" components={helpComponents} />
      </p>
      <CardLocation location={item.location} />
    </>
  )
}

const familyColor = (animal: Animal) => css`
  color: ${animalColors[animal]} !important;
`
