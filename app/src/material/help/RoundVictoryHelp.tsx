/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialHelpProps, usePlayerId, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { helpBlock, helpComponents, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/** Haati is played in 2 winning rounds: the Round victory tokens are the score. */
export const RoundVictoryHelp = ({ item }: MaterialHelpProps) => {
  const { t } = useTranslation()
  const me = usePlayerId<number>()
  const owner = item.location?.type === LocationType.PlayerRoundVictory ? item.location.player : undefined
  const name = usePlayerName(owner)
  return (
    <>
      <h2 css={helpTitle}>{t('help.round-victory.title')}</h2>
      <p css={helpIntro}>
        <Trans i18nKey="help.round-victory.intro" components={helpComponents} />
      </p>
      <div css={helpSection}>{t('help.round-victory.winning')}</div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.round-victory.rule.round" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.round-victory.rule.two" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.round-victory.rule.third" components={helpComponents} />
          </li>
        </ul>
      </div>
      <p css={helpLocation}>
        {owner === undefined ? (
          <Trans i18nKey="help.round-victory.reserve" components={helpComponents} />
        ) : (
          <Trans i18nKey={owner === me ? 'help.round-victory.owned.mine' : 'help.round-victory.owned'} values={{ player: name }} components={helpComponents} />
        )}
      </p>
    </>
  )
}
