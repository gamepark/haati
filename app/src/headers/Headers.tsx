/** @jsxImportSource @emotion/react */
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { Memory } from '@gamepark/haati/Memory'
import { CustomMoveType } from '@gamepark/haati/rules/CustomMoveType'
import { RuleId } from '@gamepark/haati/rules/RuleId'
import { HeaderText, usePlayerId, usePlayerName, useRules } from '@gamepark/react-game'
import { isCustomMoveType } from '@gamepark/rules-api'
import { ComponentType } from 'react'
import { useTranslation } from 'react-i18next'

const pass = { pass: isCustomMoveType(CustomMoveType.Pass) }

/** 1. Both players choose at once: the header says what is still expected from me. */
const ChooseCardsHeader = () => {
  const rules = useRules<HaatiRules>()!
  const me = usePlayerId<number>()
  const active = me !== undefined && rules.isTurnToPlay(me)
  if (!active) return <HeaderText code="choose-cards" />
  const duel = (type: MaterialType) => rules.material(type).location(LocationType.PlayerDuel).player(me).length
  if (!duel(MaterialType.AnimalCard)) return <HeaderText code="choose-cards" />
  return <HeaderText code="add-character" moves={{ validate: isCustomMoveType(CustomMoveType.Validate) }} />
}

const RevealDuelHeader = () => {
  const { t } = useTranslation()
  return <>{t('header.reveal-duel')}</>
}

/** 3. The winner resolves first, in their Palace, then the loser, in their Jungle. */
const ResolveDuelHeader = () => {
  const rules = useRules<HaatiRules>()!
  const player = rules.getActivePlayer()
  const winner = rules.remind<number>(Memory.DuelWinner)
  return <HeaderText code={player === winner ? 'resolve-palace' : 'resolve-jungle'} />
}

const ThiefHeader = () => {
  const rules = useRules<HaatiRules>()!
  const winner = rules.remind<number>(Memory.DuelWinner)
  return <HeaderText code={rules.getActivePlayer() === winner ? 'thief-win' : 'thief-lose'} moves={pass} />
}

const EndOfRoundHeader = () => {
  const { t } = useTranslation()
  const rules = useRules<HaatiRules>()!
  const me = usePlayerId<number>()
  const winner = rules.remind<number | undefined>(Memory.RoundWinner)
  const name = usePlayerName(winner)
  if (winner === undefined) return <>{t('header.end-of-round')}</>
  return <>{t(winner === me ? 'header.round-won.you' : 'header.round-won.player', { player: name })}</>
}

const withPass = (code: string) => {
  const Header = () => <HeaderText code={code} moves={pass} />
  return Header
}

const simple = (code: string) => {
  const Header = () => <HeaderText code={code} />
  return Header
}

export const Headers: Partial<Record<RuleId, ComponentType>> = {
  [RuleId.ChooseCards]: ChooseCardsHeader,
  [RuleId.RevealDuel]: RevealDuelHeader,
  [RuleId.ResolveDuel]: ResolveDuelHeader,
  [RuleId.JungleElephant]: withPass('jungle-elephant'),
  [RuleId.JungleTiger]: withPass('jungle-tiger'),
  [RuleId.Maharaja]: withPass('maharaja'),
  [RuleId.Thief]: ThiefHeader,
  [RuleId.Hunter]: withPass('hunter'),
  [RuleId.DiscardCharacter]: simple('discard-character'),
  [RuleId.RefillHand]: simple('refill-hand'),
  [RuleId.EndOfRound]: EndOfRoundHeader,
  [RuleId.NewRound]: EndOfRoundHeader
}
