/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';
type GeneratedMutation<InputType, OutputType> = string & {
	__generatedMutationInput: InputType;
	__generatedMutationOutput: OutputType;
};

export const createProfile = /* GraphQL */ `mutation CreateProfile(
  $condition: ModelProfileConditionInput
  $input: CreateProfileInput!
) {
  createProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<APITypes.CreateProfileMutationVariables, APITypes.CreateProfileMutation>;
export const createPuzzle = /* GraphQL */ `mutation CreatePuzzle(
  $condition: ModelPuzzleConditionInput
  $input: CreatePuzzleInput!
) {
  createPuzzle(condition: $condition, input: $input) {
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
` as GeneratedMutation<APITypes.CreatePuzzleMutationVariables, APITypes.CreatePuzzleMutation>;
export const createUserPuzzle = /* GraphQL */ `mutation CreateUserPuzzle(
  $condition: ModelUserPuzzleConditionInput
  $input: CreateUserPuzzleInput!
) {
  createUserPuzzle(condition: $condition, input: $input) {
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
` as GeneratedMutation<
	APITypes.CreateUserPuzzleMutationVariables,
	APITypes.CreateUserPuzzleMutation
>;
export const deleteProfile = /* GraphQL */ `mutation DeleteProfile(
  $condition: ModelProfileConditionInput
  $input: DeleteProfileInput!
) {
  deleteProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<APITypes.DeleteProfileMutationVariables, APITypes.DeleteProfileMutation>;
export const deletePuzzle = /* GraphQL */ `mutation DeletePuzzle(
  $condition: ModelPuzzleConditionInput
  $input: DeletePuzzleInput!
) {
  deletePuzzle(condition: $condition, input: $input) {
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
` as GeneratedMutation<APITypes.DeletePuzzleMutationVariables, APITypes.DeletePuzzleMutation>;
export const deleteUserPuzzle = /* GraphQL */ `mutation DeleteUserPuzzle(
  $condition: ModelUserPuzzleConditionInput
  $input: DeleteUserPuzzleInput!
) {
  deleteUserPuzzle(condition: $condition, input: $input) {
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
` as GeneratedMutation<
	APITypes.DeleteUserPuzzleMutationVariables,
	APITypes.DeleteUserPuzzleMutation
>;
export const updateProfile = /* GraphQL */ `mutation UpdateProfile(
  $condition: ModelProfileConditionInput
  $input: UpdateProfileInput!
) {
  updateProfile(condition: $condition, input: $input) {
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
` as GeneratedMutation<APITypes.UpdateProfileMutationVariables, APITypes.UpdateProfileMutation>;
export const updatePuzzle = /* GraphQL */ `mutation UpdatePuzzle(
  $condition: ModelPuzzleConditionInput
  $input: UpdatePuzzleInput!
) {
  updatePuzzle(condition: $condition, input: $input) {
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
` as GeneratedMutation<APITypes.UpdatePuzzleMutationVariables, APITypes.UpdatePuzzleMutation>;
export const updateUserPuzzle = /* GraphQL */ `mutation UpdateUserPuzzle(
  $condition: ModelUserPuzzleConditionInput
  $input: UpdateUserPuzzleInput!
) {
  updateUserPuzzle(condition: $condition, input: $input) {
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
` as GeneratedMutation<
	APITypes.UpdateUserPuzzleMutationVariables,
	APITypes.UpdateUserPuzzleMutation
>;
