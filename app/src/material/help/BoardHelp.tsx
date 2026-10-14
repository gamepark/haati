/** @jsxImportSource @emotion/react */
import { Trans, useTranslation } from 'react-i18next'
import { helpBlock, helpComponents, helpIntro, helpSection, helpTitle } from './helpStyles'

/** The board carries the whole turn: the page of the rulebook that sums it up. */
export const BoardHelp = () => {
  const { t } = useTranslation()
  return (
    <>
      <h2 css={helpTitle}>{t('help.board.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.board.intro" components={helpComponents} />
      </p>
      {['choose', 'duel', 'effects', 'refill'].map((step) => (
        <div key={step}>
          <div css={helpSection}>{t(`help.board.${step}-title`)}</div>
          <div css={helpBlock}>
            <Trans i18nKey={`help.board.${step}`} components={helpComponents} />
          </div>
        </div>
      ))}
      <div css={helpSection}>{t('help.board.end-title')}</div>
      <div css={helpBlock}>
        <Trans i18nKey="help.board.end" components={helpComponents} />
      </div>
    </>
  )
}
