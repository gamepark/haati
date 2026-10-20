import { LocationType } from './LocationType'
import { MaterialType } from './MaterialType'
import { MaterialSource } from './MaterialSource'

/**
 * Favor and Honor tokens are money: the supply is unlimited, so a player's tokens are only an amount
 * split into denominations 6, 3 and 1. Highest first, so that MaterialMoney makes change by itself.
 */
export const prestigeUnits = [6, 3, 1]

/**
 * A Prestige token is double-sided: Favor (white) on its front, Honor (black) on its back. Both sides are
 * one MaterialType.Prestige, the Honor side being turned over (location.rotation), so that the Honor of a
 * round is turned over into the Favor of the next one, as on the table.
 */
export enum PrestigeSide {
  Favor = 1,
  Honor
}

/**
 * Where a player's tokens of a side lie. The Favor side carries no rotation at all, not even false: the
 * money of a place is the items whose location is equal to this one.
 */
export const prestigeLocation = (player: number, side = PrestigeSide.Favor) =>
  side === PrestigeSide.Honor ? { type: LocationType.PlayerPrestige, player, rotation: true } : { type: LocationType.PlayerPrestige, player }

export const getPrestigeSide = (rotation?: boolean) => (rotation ? PrestigeSide.Honor : PrestigeSide.Favor)

/** The tokens of a player on a side. */
export const prestigeTokens = (rules: MaterialSource, side: PrestigeSide, player: number) =>
  rules
    .material(MaterialType.Prestige)
    .location(LocationType.PlayerPrestige)
    .player(player)
    .rotation((rotation?: boolean) => getPrestigeSide(rotation) === side)

export const countPrestige = (rules: MaterialSource, side: PrestigeSide, player: number): number =>
  prestigeTokens(rules, side, player).money(prestigeUnits).count

/**
 * A player gains an amount, and their tokens are exchanged at once for the fewest tokens worth their new
 * total: three 1 become a 3, two 3 become a 6. The new tokens are taken before the surplus ones are given
 * back: 1+1 gaining 1 takes a 3, then gives back 1+1.
 *
 * The moves are computed from the tokens the player owns now: only one gain of a side can be made in a
 * single list of consequences.
 */
export const gainPrestige = (rules: MaterialSource, side: PrestigeSide, player: number, amount: number) =>
  prestigeTokens(rules, side, player).money(prestigeUnits).addMoney(amount, prestigeLocation(player, side), { consolidate: true })

export const totalPrestige = (rules: MaterialSource, player: number): number =>
  countPrestige(rules, PrestigeSide.Favor, player) + countPrestige(rules, PrestigeSide.Honor, player)
