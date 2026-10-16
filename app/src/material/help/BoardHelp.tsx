/** @jsxImportSource @emotion/react */
import { ComponentType } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { ChooseIcon, DuelIcon, EndOfRoundIcon, PalaceIcon, RefillIcon } from './HelpIcons'
import { helpBlock, helpComponents, helpIntro, helpSection, helpTitle } from './helpStyles'

/** The steps of a turn, each with its icon. */
const steps: [string, ComponentType][] = [
  ['choose', ChooseIcon],
  ['duel', DuelIcon],
  ['effects', PalaceIcon],
  ['refill', RefillIcon]
]

/** The board carries the whole turn: the page of the rulebook that sums it up. */
export const BoardHelp = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.board.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.board.intro" components={helpComponents} />
      </p>
      {steps.map(([step, Icon]) => (
        <div key={step}>
          <div css={helpSection}>
            <Icon />
            {t(`help.board.${step}-title`)}
          </div>
          <div css={helpBlock}>
            <Trans i18nKey={`help.board.${step}`} components={helpComponents} />
          </div>
        </div>
      ))}
      <div css={helpSection}>
        <EndOfRoundIcon />
        {t('help.board.end-title')}
      </div>
      <div css={helpBlock}>
        <Trans i18nKey="help.board.end" components={helpComponents} />
      </div>
    </>
  )
}
