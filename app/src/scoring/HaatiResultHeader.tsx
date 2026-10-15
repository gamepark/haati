import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { usePlayerId, usePlayerIds, usePlayerName, useRules } from '@gamepark/react-game'
import { maxBy } from 'es-toolkit'
import { useTranslation } from 'react-i18next'

/**
 * The score of a player is the number of rounds they won: it decides the winner, but saying "with 2
 * points" at the end of the game makes no sense. The result only names the winner, in the header and
 * in the result dialog.
 */
export const HaatiResultHeader = () => {
  const { t } = useTranslation('common')
  const rules = useRules<HaatiRules>()
  const me = usePlayerId<number>()
  const players = usePlayerIds<number>()
  const winner = rules ? maxBy(players, (player) => rules.getScore(player)) : undefined
  const winnerName = usePlayerName(winner)
  if (winner === undefined) return null
  return <>{winner === me ? t('result.comp.victory') : t('result.comp.winner', { player: winnerName })}</>
}
