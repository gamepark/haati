/** @jsxImportSource @emotion/react */
import { Collection, getCollectionReward } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialHelpProps, usePlayerId, usePlayerName } from '@gamepark/react-game'
import { Trans, useTranslation } from 'react-i18next'
import { FavorIcon, RulesIcon } from './HelpIcons'
import { helpBlock, helpBlockActive, helpComponents, helpIntro, helpLocation, helpSection, helpTitle } from './helpStyles'

/**
 * A Collection token: the reward on its visible face, and what it takes to win it. Only the first
 * player to form the Collection gets it, and it is gone for the rest of the round.
 */
export const CollectionTokenHelp = ({ item }: MaterialHelpProps) => {
  const { t } = useTranslation()
  const me = usePlayerId<number>()
  const name = usePlayerName(item.location?.player)
  const collection = item.id as Collection
  const key = collection === Collection.Palace ? 'palace' : 'jungle'
  const reward = getCollectionReward(collection, item.location?.rotation)
  const won = item.location?.type === LocationType.PlayerCollection
  return (
    <>
      <h2 css={helpTitle}>{t(`help.collection.${key}.title`)}</h2>
      <p css={helpIntro}>
        <Trans i18nKey={`help.collection.${key}.intro`} components={helpComponents} />
      </p>
      <div css={helpSection}>
        <FavorIcon />
        {t('help.collection.reward')}
      </div>
      <div css={[helpBlock, !won && helpBlockActive]}>
        <Trans i18nKey="help.collection.gain" values={reward} components={helpComponents} />
      </div>
      <div css={helpSection}>
        <RulesIcon />
        {t('help.collection.rules')}
      </div>
      <div css={helpBlock}>
        <ul>
          <li>
            <Trans i18nKey="help.collection.rule.check" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.collection.rule.once" components={helpComponents} />
          </li>
          <li>
            <Trans i18nKey="help.collection.rule.faces" components={helpComponents} />
          </li>
        </ul>
      </div>
      <p css={helpLocation}>
        {won ? (
          <Trans i18nKey={item.location?.player === me ? 'help.collection.won.mine' : 'help.collection.won'} values={{ player: name }} components={helpComponents} />
        ) : (
          <Trans i18nKey="help.collection.available" components={helpComponents} />
        )}
      </p>
    </>
  )
}
