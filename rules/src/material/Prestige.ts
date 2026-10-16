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

/**
 * A player gains an amount, and their tokens are exchanged at once for the fewest tokens worth their new
 * total: three 1 become a 3, two 3 become a 6. The new tokens are taken before the surplus ones are given
 * back: 1+1 gaining 1 takes a 3, then gives back 1+1.
 *
 * The moves are computed from the tokens the player owns now: only one gain of a type can be made in a
 * single list of consequences.
 */
export const gainPrestige = (rules: MaterialSource, type: PrestigeType, player: number, amount: number) =>
  rules.material(type).location(LocationType.PlayerPrestige).player(player).money(prestigeUnits)
    .addMoney(amount, prestigeLocation(player), { consolidate: true })

export const totalPrestige = (rules: MaterialSource, player: number): number =>
  countPrestige(rules, MaterialType.Favor, player) + countPrestige(rules, MaterialType.Honor, player)
