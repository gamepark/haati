/** @jsxImportSource @emotion/react */
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { useRules } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { turnsLeft } from '../../panels/turnCount'
import { helpBlock, helpComponents, helpIntro, helpSection, helpTitle } from './helpStyles'

/** The board carries the whole turn: the page of the rulebook that sums it up, and the turns left in the round. */
export const BoardHelp = () => {
  const { t } = useTranslation()
  const rules = useRules<HaatiRules>()
  const turns = rules ? turnsLeft(rules) : 9
  return (
    <>
      <h2 css={helpTitle}>{t('help.board.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.board.intro" values={{ turns: t('help.board.turns-left', { count: turns }) }} components={helpComponents} />
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
