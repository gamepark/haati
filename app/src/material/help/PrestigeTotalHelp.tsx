/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { countPrestige } from '@gamepark/haati/material/Prestige'
import { LocationHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import favorImage from '../../images/tokens/prestige/Favor1.png'
import honorImage from '../../images/tokens/prestige/Honor1.png'
import roundVictory1 from '../../images/tokens/RoundVictory1.png'
import roundVictory2 from '../../images/tokens/RoundVictory2.png'
import { helpBlock, helpComponents, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * A player's Prestige, the sum of their Favor and Honor: what it is, where it comes from, how it wins
 * a round, and how 2 rounds won complete the elephant that wins the game. A Favor and an Honor token head
 * the help; the two halves of the elephant illustrate the section about winning the game.
 */
export const PrestigeTotalHelp = ({ location }: LocationHelpProps) => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()
  const me = usePlayerId<number>()
  const name = usePlayerName(location.player)
  const favor = rules && location.player !== undefined ? countPrestige(rules, MaterialType.Favor, location.player) : 0
  const honor = rules && location.player !== undefined ? countPrestige(rules, MaterialType.Honor, location.player) : 0
  return (
    <>
      <h2 css={helpTitle}>{t('help.prestige-total.title')}</h2>
      <div css={tokensCss}>
        <img src={favorImage} alt="" />
        <img src={honorImage} alt="" />
      </div>
      <p css={helpIntro}>
        <Trans i18nKey="help.prestige-total.intro" components={helpComponents} />
      </p>
      <div css={helpSection}>{t('help.prestige-total.gain-title')}</div>
      <div css={helpBlock}>
        <ul>
          {['palace', 'characters', 'collections'].map((source) => (
            <li key={source}>
              <Trans i18nKey={`help.prestige-total.gain.${source}`} components={helpComponents} />
            </li>
          ))}
        </ul>
      </div>
      <div css={helpSection}>{t('help.prestige-total.round-title')}</div>
      <div css={helpBlock}>
        <ul>
          {['win', 'tie', 'after'].map((rule) => (
            <li key={rule}>
              <Trans i18nKey={`help.prestige-total.round.${rule}`} components={helpComponents} />
            </li>
          ))}
        </ul>
      </div>
      <div css={helpSection}>{t('help.prestige-total.game-title')}</div>
      <div css={helpBlock}>
        <div css={elephantCss}>
          <img src={roundVictory1} alt="" />
          <img src={roundVictory2} alt="" />
        </div>
        <Trans i18nKey="help.prestige-total.game" components={helpComponents} />
      </div>
      {location.player !== undefined && (
        <p css={helpLocation}>
          <Trans
            i18nKey={location.player === me ? 'help.prestige-total.owned.mine' : 'help.prestige-total.owned'}
            values={{ player: name, total: favor + honor, favor, honor }}
            components={helpComponents}
          />
        </p>
      )}
    </>
  )
}

/** A Favor token and an Honor token, the two parts of the Prestige. */
const tokensCss = css`
  display: flex;
  justify-content: center;
  gap: 1em;
  margin: 0 0 0.8em 0;

  img {
    height: 4.5em;
    filter: drop-shadow(0 0.1em 0.2em rgba(0, 0, 0, 0.4));
  }
`

/** The two halves of the elephant side by side, as a player who wins 2 rounds gathers them. */
const elephantCss = css`
  display: flex;
  justify-content: center;
  margin: 0 0 0.6em 0;

  img {
    height: 5em;
  }
`
