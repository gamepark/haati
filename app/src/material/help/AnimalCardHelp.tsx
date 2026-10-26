/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { Animal, getAnimal, getValue } from '@gamepark/haati/material/Animal'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { MaterialHelpProps, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { animalColors } from '../../theme/colors'
import { CardLocation } from './CardLocation'
import { PlayCardButton } from './PlayCardButton'
import { JungleIcon, PalaceIcon } from './HelpIcons'
import { helpBlock, helpBlockActive, helpComponents, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

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
export const AnimalCardHelp = ({ item, itemIndex, closeDialog }: MaterialHelpProps) => {
  const { t } = useTranslation()
  if (item.location?.type === LocationType.AnimalSetAside) return <SetAsideHelp />
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
      <PlayCardButton type={MaterialType.AnimalCard} itemIndex={itemIndex} label="button.play" closeDialog={closeDialog} />
      <p css={helpIntro}>
        <Trans i18nKey={`help.animal.${key}.duel`} components={helpComponents} />
      </p>
      <p css={helpIntro}>
        <Trans i18nKey="help.animal.same-family" components={helpComponents} />
      </p>
      <div css={helpSection}>
        <PalaceIcon />
        {t('help.animal.palace')}
      </div>
      <div css={[helpBlock, place === LocationType.Palace && helpBlockActive]}>
        <Trans i18nKey={`help.animal.${key}.palace`} components={helpComponents} />
      </div>
      <div css={helpSection}>
        <JungleIcon />
        {t('help.animal.jungle')}
      </div>
      <div css={[helpBlock, place === LocationType.Jungle && helpBlockActive]}>
        <Trans i18nKey={`help.animal.${key}.jungle`} components={helpComponents} />
      </div>
      <p css={helpIntro}>
        <Trans i18nKey="help.animal.collection" components={helpComponents} />
      </p>
      {/* Only the help of a hidden hand names a card of that hand, with no index: the one its owner took last (see TakenCardHelp). */}
      {itemIndex === undefined && item.location?.type === LocationType.PlayerHand ? <TakenCard player={item.location.player} /> : <CardLocation location={item.location} />}
    </>
  )
}

/** The card the opponent took at the last turn, which they still hide in their hand. */
const TakenCard = ({ player }: { player?: number }) => {
  const name = usePlayerName(player)
  return (
    <p css={helpLocation}>
      <Trans i18nKey="help.taken.location" values={{ player: name }} components={helpComponents} />
    </p>
  )
}

/** The 4 cards removed face down at the start of the round: what they are, and why they are removed. */
const SetAsideHelp = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.animal.set-aside.title')}</h2>
      {['intro', 'why', 'next-round'].map((key) => (
        <p key={key} css={helpIntro}>
          <Trans i18nKey={`help.animal.set-aside.${key}`} components={helpComponents} />
        </p>
      ))}
    </>
  )
}

const familyColor = (animal: Animal) => css`
  color: ${animalColors[animal]} !important;
`
