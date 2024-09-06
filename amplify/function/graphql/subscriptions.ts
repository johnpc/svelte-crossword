/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';
type GeneratedSubscription<InputType, OutputType> = string & {
	__generatedSubscriptionInput: InputType;
	__generatedSubscriptionOutput: OutputType;
};

export const onCreateProfile = /* GraphQL */ `subscription OnCreateProfile(
  $filter: ModelSubscriptionProfileFilterInput
  $owner: String
) {
  onCreateProfile(filter: $filter, owner: $owner) {
    completedPuzzles {
      nextToken
      __typename
    }
    createdAt
    email
    id
    name
    owner
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnCreateProfileSubscriptionVariables,
	APITypes.OnCreateProfileSubscription
>;
export const onCreatePuzzle =
	/* GraphQL */ `subscription OnCreatePuzzle($filter: ModelSubscriptionPuzzleFilterInput) {
  onCreatePuzzle(filter: $filter) {
    createdAt
    id
    puzJson
    puzKey
    updatedAt
    userPuzzles {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedSubscription<
		APITypes.OnCreatePuzzleSubscriptionVariables,
		APITypes.OnCreatePuzzleSubscription
	>;
export const onCreateUserPuzzle = /* GraphQL */ `subscription OnCreateUserPuzzle(
  $filter: ModelSubscriptionUserPuzzleFilterInput
  $owner: String
) {
  onCreateUserPuzzle(filter: $filter, owner: $owner) {
    createdAt
    id
    owner
    profile {
      createdAt
      email
      id
      name
      owner
      updatedAt
      userId
      __typename
    }
    profileCompletedPuzzlesId
    puzzle {
      createdAt
      id
      puzJson
      puzKey
      updatedAt
      __typename
    }
    timeInSeconds
    updatedAt
    usedCheck
    usedClear
    usedReveal
    userPuzzlePuzzleId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnCreateUserPuzzleSubscriptionVariables,
	APITypes.OnCreateUserPuzzleSubscription
>;
export const onDeleteProfile = /* GraphQL */ `subscription OnDeleteProfile(
  $filter: ModelSubscriptionProfileFilterInput
  $owner: String
) {
  onDeleteProfile(filter: $filter, owner: $owner) {
    completedPuzzles {
      nextToken
      __typename
    }
    createdAt
    email
    id
    name
    owner
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnDeleteProfileSubscriptionVariables,
	APITypes.OnDeleteProfileSubscription
>;
export const onDeletePuzzle =
	/* GraphQL */ `subscription OnDeletePuzzle($filter: ModelSubscriptionPuzzleFilterInput) {
  onDeletePuzzle(filter: $filter) {
    createdAt
    id
    puzJson
    puzKey
    updatedAt
    userPuzzles {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedSubscription<
		APITypes.OnDeletePuzzleSubscriptionVariables,
		APITypes.OnDeletePuzzleSubscription
	>;
export const onDeleteUserPuzzle = /* GraphQL */ `subscription OnDeleteUserPuzzle(
  $filter: ModelSubscriptionUserPuzzleFilterInput
  $owner: String
) {
  onDeleteUserPuzzle(filter: $filter, owner: $owner) {
    createdAt
    id
    owner
    profile {
      createdAt
      email
      id
      name
      owner
      updatedAt
      userId
      __typename
    }
    profileCompletedPuzzlesId
    puzzle {
      createdAt
      id
      puzJson
      puzKey
      updatedAt
      __typename
    }
    timeInSeconds
    updatedAt
    usedCheck
    usedClear
    usedReveal
    userPuzzlePuzzleId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnDeleteUserPuzzleSubscriptionVariables,
	APITypes.OnDeleteUserPuzzleSubscription
>;
export const onUpdateProfile = /* GraphQL */ `subscription OnUpdateProfile(
  $filter: ModelSubscriptionProfileFilterInput
  $owner: String
) {
  onUpdateProfile(filter: $filter, owner: $owner) {
    completedPuzzles {
      nextToken
      __typename
    }
    createdAt
    email
    id
    name
    owner
    updatedAt
    userId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnUpdateProfileSubscriptionVariables,
	APITypes.OnUpdateProfileSubscription
>;
export const onUpdatePuzzle =
	/* GraphQL */ `subscription OnUpdatePuzzle($filter: ModelSubscriptionPuzzleFilterInput) {
  onUpdatePuzzle(filter: $filter) {
    createdAt
    id
    puzJson
    puzKey
    updatedAt
    userPuzzles {
      nextToken
      __typename
    }
    __typename
  }
}
` as GeneratedSubscription<
		APITypes.OnUpdatePuzzleSubscriptionVariables,
		APITypes.OnUpdatePuzzleSubscription
	>;
export const onUpdateUserPuzzle = /* GraphQL */ `subscription OnUpdateUserPuzzle(
  $filter: ModelSubscriptionUserPuzzleFilterInput
  $owner: String
) {
  onUpdateUserPuzzle(filter: $filter, owner: $owner) {
    createdAt
    id
    owner
    profile {
      createdAt
      email
      id
      name
      owner
      updatedAt
      userId
      __typename
    }
    profileCompletedPuzzlesId
    puzzle {
      createdAt
      id
      puzJson
      puzKey
      updatedAt
      __typename
    }
    timeInSeconds
    updatedAt
    usedCheck
    usedClear
    usedReveal
    userPuzzlePuzzleId
    __typename
  }
}
` as GeneratedSubscription<
	APITypes.OnUpdateUserPuzzleSubscriptionVariables,
	APITypes.OnUpdateUserPuzzleSubscription
>;
