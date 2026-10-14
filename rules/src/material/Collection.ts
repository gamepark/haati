import { LocationType } from './LocationType'

export enum Collection {
  Palace = 1,
  Jungle
}

export type Reward = { favor: number; honor: number }

/**
 * Both faces of each Collection token, indexed by the token's rotation (the face drawn at random).
 * Face 0 is image 1, face 1 is image 2.
 */
export const collectionRewards: Record<Collection, [Reward, Reward]> = {
  [Collection.Palace]: [
    { favor: 3, honor: 0 },
    { favor: 1, honor: 1 }
  ],
  [Collection.Jungle]: [
    { favor: 3, honor: 1 },
    { favor: 2, honor: 2 }
  ]
}

export const getCollectionReward = (collection: Collection, face = 0): Reward => collectionRewards[collection][face ? 1 : 0]

export const collectionPlace: Record<Collection, LocationType> = {
  [Collection.Palace]: LocationType.Palace,
  [Collection.Jungle]: LocationType.Jungle
}
