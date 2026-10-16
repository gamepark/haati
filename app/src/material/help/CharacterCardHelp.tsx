/** @jsxImportSource @emotion/react */
import { Bet, Character, CharacterCard, getBet, getCharacter } from '@gamepark/haati/material/Character'
import { MaterialHelpProps } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { Lose, Win } from '../../tutorial/TutorialPictures'
import { CardLocation } from './CardLocation'
import { RulesIcon } from './HelpIcons'
import { helpBlock, helpBlockActive, helpComponents, helpIntro, helpSection, helpTitle } from './helpStyles'

const characterKeys: Record<Character, string> = {
  [Character.Merchant]: 'merchant',
  [Character.Maharaja]: 'maharaja',
  [Character.Thief]: 'thief',
  [Character.Hunter]: 'hunter'
}

/**
 * A Character card is a bet on the outcome of the duel: the ✓ cards pay if their owner wins it, the
 * ✗ cards if they lose it. The dialog says the bet first, because it decides everything else.
 */
export const CharacterCardHelp = ({ item }: MaterialHelpProps<number, number, number>) => {
  const { t } = useTranslation()
  const card = item.id as CharacterCard | undefined
  return (
    <>
      <h2 css={helpTitle}>{card === undefined ? t('help.character.hidden') : t(`help.character.${characterKeys[getCharacter(card)]}`)}</h2>
      {card !== undefined && (
        <>
          <div css={helpSection}>
            {getBet(card) === Bet.Win ? <Win /> : <Lose />}
            {t(getBet(card) === Bet.Win ? 'help.character.bet.win' : 'help.character.bet.lose')}
          </div>
          <div css={[helpBlock, helpBlockActive]}>
            <Trans i18nKey={`help.character.effect.${card}`} components={helpComponents} />
          </div>
        </>
      )}
      <div css={helpSection}>
        <RulesIcon />
        {t('help.character.rules')}
      </div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.character.rule.play" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.character.rule.reveal" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.character.rule.limit" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.character.rule.draw" components={helpComponents} />
          </li>
        </ul>
      </div>
      {card === undefined && (
        <p css={helpIntro}>
          <Trans i18nKey="help.character.hidden.intro" components={helpComponents} />
        </p>
      )}
      <CardLocation location={item.location} />
    </>
  )
}
