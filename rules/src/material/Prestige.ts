import { ItemMove } from '@gamepark/rules-api'
import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'
import { MaterialSource } from './MaterialSource'

/**
 * Favor and Honor tokens are money: the supply is unlimited, so a player's tokens are only an amount
 * split into denominations 6, 3 and 1. Highest first, so that MaterialMoney makes change by itself.
 */
export const prestigeUnits = [6, 3, 1]

export type PrestigeType = MaterialType.Favor | MaterialType.Honor

export const prestigeLocation = (player: number) => ({ type: LocationType.PlayerPrestige, player })

export const countPrestige = (rules: MaterialSource, type: PrestigeType, player: number): number =>
  rules.material(type).location(LocationType.PlayerPrestige).player(player).money(prestigeUnits).count

/** The fewest tokens worth an amount: as many 6 as possible, then 3, then 1. */
const fewestTokens = (amount: number): Record<number, number> => {
  const tokens: Record<number, number> = {}
  for (const unit of prestigeUnits) {
    tokens[unit] = Math.floor(amount / unit)
    amount -= tokens[unit] * unit
  }
  return tokens
}

/**
 * A player gains an amount, and their tokens are exchanged at once for the fewest tokens worth their new
 * total: three 1 become a 3, two 3 become a 6. Only the smallest tokens change, so the row of the player,
 * sorted from the highest value, only changes at its end.
 *
 * The moves are computed from the tokens the player owns now: only one gain of a type can be made in a
 * single list of consequences.
 */
export const gainPrestige = (rules: MaterialSource, type: PrestigeType, player: number, amount: number) => {
  if (amount <= 0) return []
  const owned = rules.material(type).location(LocationType.PlayerPrestige).player(player)
  const target = fewestTokens(owned.money(prestigeUnits).count + amount)
  const moves: ItemMove[] = []
  for (const unit of prestigeUnits) {
    const surplus = owned.id(unit).getQuantity() - target[unit]
    if (surplus > 0) moves.push(owned.id(unit).deleteItem(surplus))
  }
  for (const unit of prestigeUnits) {
    const missing = target[unit] - owned.id(unit).getQuantity()
    if (missing > 0) moves.push(rules.material(type).createItem({ id: unit, location: prestigeLocation(player), quantity: missing }))
  }
  return moves
}

export const totalPrestige = (rules: MaterialSource, player: number): number =>
  countPrestige(rules, MaterialType.Favor, player) + countPrestige(rules, MaterialType.Honor, player)
