/** @jsxImportSource @emotion/react */
import { HaatiRules } from '@gamepark/haati/HaatiRules'
import { beats } from '@gamepark/haati/material/Animal'
import { Bet, CharacterCard, getBet } from '@gamepark/haati/material/Character'
import { Collection } from '@gamepark/haati/material/Collection'
import { LocationType } from '@gamepark/haati/material/LocationType'
import { MaterialType } from '@gamepark/haati/material/MaterialType'
import { countPrestige, PrestigeSide, totalPrestige } from '@gamepark/haati/material/Prestige'
import { MaterialLogProps, usePlayerName } from '@gamepark/react-game'
import { Location, MoveItem, StartPlayerTurn } from '@gamepark/rules-api'
import { ReactElement } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import { AnimalName, CharacterName } from './LogNames'
import { prestigeGain, revealedInAction, revealedItem } from './moveRuns'

/** One sentence of the journal: the cards it names are handed in as `components`, each a link to its help. */
const LogText = ({ code, values, components }: { code: string; values?: Record<string, unknown>; components?: Record<string, ReactElement> }) => (
  <Trans i18nKey={code} values={values} components={components} />
)

const opponentOf = (props: MaterialLogProps, player?: number) => props.context.game.players.find((p) => p !== player)

/**
 * The duel revealed, one entry per player, on their Animal card: their Character card, turned face up in
 * the same action, is named with it, and a bet lost is said there, since the card goes without a word.
 */
export const RevealLog = (props: MaterialLogProps<MoveItem>) => {
  const { move, context } = props
  const animal = revealedItem(context.game, move)
  const owner = animal.location.player
  const player = usePlayerName(owner)
  const character = revealedInAction(context, MaterialType.CharacterCard, owner!)
  const components = { animal: <AnimalName id={animal.id} />, character: <CharacterName id={character?.id} /> }
  if (!character) return <LogText code="log.reveal" values={{ player }} components={components} />
  const opponentAnimal = revealedInAction(context, MaterialType.AnimalCard, opponentOf(props, owner)!)
  const won = animal.id !== undefined && opponentAnimal?.id !== undefined && beats(animal.id, opponentAnimal.id)
  const betWon = (getBet(character.id as CharacterCard) === Bet.Win) === won
  return <LogText code={betWon ? 'log.reveal-bet' : 'log.reveal-bet-lost'} values={{ player }} components={components} />
}

export const DuelWonLog = ({ move }: MaterialLogProps<StartPlayerTurn>) => {
  const player = usePlayerName(move.player)
  return <LogText code="log.duel-won" values={{ player }} />
}

/** The duel card goes to the Palace of the winner, to the Jungle of the loser: its effect is written down under it. */
export const PlaceAnimalLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  const code = move.location.type === LocationType.Palace ? 'log.place.palace' : 'log.place.jungle'
  return <LogText code={code} values={{ player }} components={{ animal: <AnimalName id={revealedItem(context.game, move).id} /> }} />
}

export const ActivateCharacterLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.activate" values={{ player }} components={{ character: <CharacterName id={revealedItem(context.game, move).id} /> }} />
}

/** Whose card is drawn is no secret, which card it is is one. */
export const DrawCharacterLog = ({ move }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  return <LogText code="log.draw-character" values={{ player }} />
}

export const DiscardCharacterLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.discard-character" values={{ player }} components={{ character: <CharacterName id={revealedItem(context.game, move).id} /> }} />
}

/** « de son Palais », « vers la Jungle de Romain »: the effects move the animals of both camps. */
const usePlace = (direction: 'from' | 'to', location: Partial<Location>, actor?: number) => {
  const { t } = useTranslation()
  const owner = usePlayerName(location.player)
  const place = location.type === LocationType.Palace ? 'palace' : 'jungle'
  return t(`log.${direction}.${place}${location.player === actor ? '' : '.other'}`, { owner })
}

/** An animal moved by an effect, or eliminated by the Hunter. */
export const MoveAnimalLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const actor = context.game.rule?.player
  const player = usePlayerName(actor)
  const animal = revealedItem(context.game, move)
  const from = usePlace('from', animal.location, actor)
  const to = usePlace('to', move.location, actor)
  const code = move.location.type === LocationType.AnimalDiscard ? 'log.hunt' : 'log.move'
  return <LogText code={code} values={{ player, from, to }} components={{ animal: <AnimalName id={animal.id} /> }} />
}

export const PassLog = ({ context }: MaterialLogProps) => {
  const player = usePlayerName(context.game.rule?.player)
  return <LogText code="log.pass" values={{ player }} />
}

export const CollectionLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  const collection = context.game.items[move.itemType]![move.itemIndex].id as Collection
  return <LogText code={collection === Collection.Palace ? 'log.collection.palace' : 'log.collection.jungle'} values={{ player }} />
}

/** The Favors and the Honors a gain adds up to, in one entry (see {@link prestigeGain}). */
export const GainLog = ({ context }: MaterialLogProps) => {
  const { t } = useTranslation()
  const { player: owner, favor, honor } = prestigeGain(context)
  const player = usePlayerName(owner)
  const parts = []
  if (favor) parts.push(t('log.favor', { count: favor }))
  if (honor) parts.push(t('log.honor', { count: honor }))
  return <LogText code="log.gain" values={{ player, gain: parts.join(t('log.and')) }} />
}

/** The loser of the duel picks one of the 2 visible cards, the winner receives the other. */
export const RefillLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  const code = move.location.player === context.game.rule?.player ? 'log.choose' : 'log.receive'
  return <LogText code={code} values={{ player }} components={{ animal: <AnimalName id={revealedItem(context.game, move).id} /> }} />
}

/** Both last cards revealed, when the Prestige and the Honor were a tie. */
export const LastCardLog = ({ move, context }: MaterialLogProps<MoveItem>) => {
  const player = usePlayerName(move.location.player)
  return <LogText code="log.last-card" values={{ player }} components={{ animal: <AnimalName id={revealedItem(context.game, move).id} /> }} />
}

/** The round victory token won, with what decided it: the Prestige, the Honor on a tie, or the last duel. */
export const RoundWonLog = (props: MaterialLogProps<MoveItem>) => {
  const { move, context } = props
  const winner = move.location.player!
  const loser = opponentOf(props, winner)!
  const player = usePlayerName(winner)
  const rules = new HaatiRules(context.game)
  const prestige = [totalPrestige(rules, winner), totalPrestige(rules, loser)]
  if (prestige[0] !== prestige[1]) return <LogText code="log.round-won" values={{ player, winner: prestige[0], loser: prestige[1] }} />
  const honor = [countPrestige(rules, PrestigeSide.Honor, winner), countPrestige(rules, PrestigeSide.Honor, loser)]
  if (honor[0] !== honor[1]) return <LogText code="log.round-won.honor" values={{ player, prestige: prestige[0], winner: honor[0], loser: honor[1] }} />
  return <LogText code="log.round-won.duel" values={{ player }} />
}

export const HonorToFavorLog = () => <LogText code="log.honor-to-favor" />
