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

export const gainPrestige = (rules: MaterialSource, type: PrestigeType, player: number, amount: number) =>
  amount > 0 ? rules.material(type).money(prestigeUnits).addMoney(amount, prestigeLocation(player)) : []

export const totalPrestige = (rules: MaterialSource, player: number): number =>
  countPrestige(rules, MaterialType.Favor, player) + countPrestige(rules, MaterialType.Honor, player)
