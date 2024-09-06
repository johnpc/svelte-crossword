/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from './API';
type GeneratedQuery<InputType, OutputType> = string & {
	__generatedQueryInput: InputType;
	__generatedQueryOutput: OutputType;
};

export const getProfile = /* GraphQL */ `query GetProfile($id: String!) {
  getProfile(id: $id) {
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
` as GeneratedQuery<APITypes.GetProfileQueryVariables, APITypes.GetProfileQuery>;
export const getPuzzle = /* GraphQL */ `query GetPuzzle($id: ID!) {
  getPuzzle(id: $id) {
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
` as GeneratedQuery<APITypes.GetPuzzleQueryVariables, APITypes.GetPuzzleQuery>;
export const getUserPuzzle = /* GraphQL */ `query GetUserPuzzle($id: ID!) {
  getUserPuzzle(id: $id) {
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
` as GeneratedQuery<APITypes.GetUserPuzzleQueryVariables, APITypes.GetUserPuzzleQuery>;
export const listProfiles = /* GraphQL */ `query ListProfiles(
  $filter: ModelProfileFilterInput
  $id: String
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listProfiles(
    filter: $filter
    id: $id
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      createdAt
      email
      id
      name
      owner
      updatedAt
      userId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListProfilesQueryVariables, APITypes.ListProfilesQuery>;
export const listPuzzles = /* GraphQL */ `query ListPuzzles(
  $filter: ModelPuzzleFilterInput
  $limit: Int
  $nextToken: String
) {
  listPuzzles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      id
      puzJson
      puzKey
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListPuzzlesQueryVariables, APITypes.ListPuzzlesQuery>;
export const listUserPuzzles = /* GraphQL */ `query ListUserPuzzles(
  $filter: ModelUserPuzzleFilterInput
  $limit: Int
  $nextToken: String
) {
  listUserPuzzles(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      createdAt
      id
      owner
      profileCompletedPuzzlesId
      timeInSeconds
      updatedAt
      usedCheck
      usedClear
      usedReveal
      userPuzzlePuzzleId
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUserPuzzlesQueryVariables, APITypes.ListUserPuzzlesQuery>;
