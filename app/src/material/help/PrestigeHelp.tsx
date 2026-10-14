/** @jsxImportSource @emotion/react */
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { countPrestige } from '@gamepark/haati/material/Prestige'
import { MaterialHelpProps, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { MaterialRules } from '@gamepark/rules-api'
import { Trans, useTranslation } from 'react-i18next'
import { helpBlock, helpComponents, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * Favor (white) and Honor (black) both count as Prestige, which wins the round. What sets them
 * apart is what happens after it: "Les Faveurs passent, mais l'Honneur demeure !"
 */
export const PrestigeHelp = ({ item, itemType }: MaterialHelpProps) => {
  const { t } = useTranslation()
  const rules = useRules<MaterialRules>()
  const me = usePlayerId<number>()
  const owner = item.location?.type === LocationType.PlayerPrestige ? item.location.player : undefined
  const name = usePlayerName(owner)
  const key = itemType === MaterialType.Favor ? 'favor' : 'honor'
  return (
    <>
      <h2 css={helpTitle}>{t(`help.prestige.${key}.title`)}</h2>
      <p css={helpIntro}>
        <Trans i18nKey={`help.prestige.${key}.intro`} components={helpComponents} />
      </p>
      <div css={helpSection}>{t('help.prestige.end-of-round')}</div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.prestige.rule.total" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.prestige.rule.tie" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.prestige.rule.after" components={helpComponents} />
          </li>
        </ul>
      </div>
      <p css={helpIntro}>
        <Trans i18nKey="help.prestige.change" components={helpComponents} />
      </p>
      {rules && owner !== undefined && (
        <p css={helpLocation}>
          <Trans
            i18nKey={owner === me ? 'help.prestige.owned.mine' : 'help.prestige.owned'}
            values={{
              player: name,
              favor: countPrestige(rules, MaterialType.Favor, owner),
              honor: countPrestige(rules, MaterialType.Honor, owner)
            }}
            components={helpComponents}
          />
        </p>
      )}
    </>
  )
}
