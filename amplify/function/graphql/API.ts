/* tslint:disable */
/* eslint-disable */
//  This file was automatically generated and should not be edited.

export type Profile = {
	__typename: 'Profile';
	completedPuzzles?: ModelUserPuzzleConnection | null;
	createdAt: string;
	email: string;
	id: string;
	name: string;
	owner?: string | null;
	updatedAt: string;
	userId: string;
};

export type ModelUserPuzzleConnection = {
	__typename: 'ModelUserPuzzleConnection';
	items: Array<UserPuzzle | null>;
	nextToken?: string | null;
};

export type UserPuzzle = {
	__typename: 'UserPuzzle';
	createdAt: string;
	id: string;
	owner?: string | null;
	profile?: Profile | null;
	profileCompletedPuzzlesId: string;
	puzzle?: Puzzle | null;
	timeInSeconds: number;
	updatedAt: string;
	usedCheck: boolean;
	usedClear: boolean;
	usedReveal: boolean;
	userPuzzlePuzzleId: string;
};

export type Puzzle = {
	__typename: 'Puzzle';
	createdAt: string;
	id: string;
	puzJson?: string | null;
	puzKey?: string | null;
	updatedAt: string;
	userPuzzles?: ModelUserPuzzleConnection | null;
};

export type ModelProfileFilterInput = {
	and?: Array<ModelProfileFilterInput | null> | null;
	createdAt?: ModelStringInput | null;
	email?: ModelStringInput | null;
	id?: ModelStringInput | null;
	name?: ModelStringInput | null;
	not?: ModelProfileFilterInput | null;
	or?: Array<ModelProfileFilterInput | null> | null;
	owner?: ModelStringInput | null;
	updatedAt?: ModelStringInput | null;
	userId?: ModelStringInput | null;
};

export type ModelStringInput = {
	attributeExists?: boolean | null;
	attributeType?: ModelAttributeTypes | null;
	beginsWith?: string | null;
	between?: Array<string | null> | null;
	contains?: string | null;
	eq?: string | null;
	ge?: string | null;
	gt?: string | null;
	le?: string | null;
	lt?: string | null;
	ne?: string | null;
	notContains?: string | null;
	size?: ModelSizeInput | null;
};

export enum ModelAttributeTypes {
	_null = '_null',
	binary = 'binary',
	binarySet = 'binarySet',
	bool = 'bool',
	list = 'list',
	map = 'map',
	number = 'number',
	numberSet = 'numberSet',
	string = 'string',
	stringSet = 'stringSet'
}

export type ModelSizeInput = {
	between?: Array<number | null> | null;
	eq?: number | null;
	ge?: number | null;
	gt?: number | null;
	le?: number | null;
	lt?: number | null;
	ne?: number | null;
};

export enum ModelSortDirection {
	ASC = 'ASC',
	DESC = 'DESC'
}

export type ModelProfileConnection = {
	__typename: 'ModelProfileConnection';
	items: Array<Profile | null>;
	nextToken?: string | null;
};

export type ModelPuzzleFilterInput = {
	and?: Array<ModelPuzzleFilterInput | null> | null;
	createdAt?: ModelStringInput | null;
	id?: ModelIDInput | null;
	not?: ModelPuzzleFilterInput | null;
	or?: Array<ModelPuzzleFilterInput | null> | null;
	puzJson?: ModelStringInput | null;
	puzKey?: ModelStringInput | null;
	updatedAt?: ModelStringInput | null;
};

export type ModelIDInput = {
	attributeExists?: boolean | null;
	attributeType?: ModelAttributeTypes | null;
	beginsWith?: string | null;
	between?: Array<string | null> | null;
	contains?: string | null;
	eq?: string | null;
	ge?: string | null;
	gt?: string | null;
	le?: string | null;
	lt?: string | null;
	ne?: string | null;
	notContains?: string | null;
	size?: ModelSizeInput | null;
};

export type ModelPuzzleConnection = {
	__typename: 'ModelPuzzleConnection';
	items: Array<Puzzle | null>;
	nextToken?: string | null;
};

export type ModelUserPuzzleFilterInput = {
	and?: Array<ModelUserPuzzleFilterInput | null> | null;
	createdAt?: ModelStringInput | null;
	id?: ModelIDInput | null;
	not?: ModelUserPuzzleFilterInput | null;
	or?: Array<ModelUserPuzzleFilterInput | null> | null;
	owner?: ModelStringInput | null;
	profileCompletedPuzzlesId?: ModelStringInput | null;
	timeInSeconds?: ModelIntInput | null;
	updatedAt?: ModelStringInput | null;
	usedCheck?: ModelBooleanInput | null;
	usedClear?: ModelBooleanInput | null;
	usedReveal?: ModelBooleanInput | null;
	userPuzzlePuzzleId?: ModelStringInput | null;
};

export type ModelIntInput = {
	attributeExists?: boolean | null;
	attributeType?: ModelAttributeTypes | null;
	between?: Array<number | null> | null;
	eq?: number | null;
	ge?: number | null;
	gt?: number | null;
	le?: number | null;
	lt?: number | null;
	ne?: number | null;
};

export type ModelBooleanInput = {
	attributeExists?: boolean | null;
	attributeType?: ModelAttributeTypes | null;
	eq?: boolean | null;
	ne?: boolean | null;
};

export type ModelProfileConditionInput = {
	and?: Array<ModelProfileConditionInput | null> | null;
	createdAt?: ModelStringInput | null;
	email?: ModelStringInput | null;
	name?: ModelStringInput | null;
	not?: ModelProfileConditionInput | null;
	or?: Array<ModelProfileConditionInput | null> | null;
	owner?: ModelStringInput | null;
	updatedAt?: ModelStringInput | null;
	userId?: ModelStringInput | null;
};

export type CreateProfileInput = {
	email: string;
	id?: string | null;
	name: string;
	userId: string;
};

export type ModelPuzzleConditionInput = {
	and?: Array<ModelPuzzleConditionInput | null> | null;
	createdAt?: ModelStringInput | null;
	not?: ModelPuzzleConditionInput | null;
	or?: Array<ModelPuzzleConditionInput | null> | null;
	puzJson?: ModelStringInput | null;
	puzKey?: ModelStringInput | null;
	updatedAt?: ModelStringInput | null;
};

export type CreatePuzzleInput = {
	id?: string | null;
	puzJson?: string | null;
	puzKey?: string | null;
};

export type ModelUserPuzzleConditionInput = {
	and?: Array<ModelUserPuzzleConditionInput | null> | null;
	createdAt?: ModelStringInput | null;
	not?: ModelUserPuzzleConditionInput | null;
	or?: Array<ModelUserPuzzleConditionInput | null> | null;
	owner?: ModelStringInput | null;
	profileCompletedPuzzlesId?: ModelStringInput | null;
	timeInSeconds?: ModelIntInput | null;
	updatedAt?: ModelStringInput | null;
	usedCheck?: ModelBooleanInput | null;
	usedClear?: ModelBooleanInput | null;
	usedReveal?: ModelBooleanInput | null;
	userPuzzlePuzzleId?: ModelStringInput | null;
};

export type CreateUserPuzzleInput = {
	id?: string | null;
	profileCompletedPuzzlesId: string;
	timeInSeconds: number;
	usedCheck: boolean;
	usedClear: boolean;
	usedReveal: boolean;
	userPuzzlePuzzleId: string;
};

export type DeleteProfileInput = {
	id: string;
};

export type DeletePuzzleInput = {
	id: string;
};

export type DeleteUserPuzzleInput = {
	id: string;
};

export type UpdateProfileInput = {
	email?: string | null;
	id: string;
	name?: string | null;
	userId?: string | null;
};

export type UpdatePuzzleInput = {
	id: string;
	puzJson?: string | null;
	puzKey?: string | null;
};

export type UpdateUserPuzzleInput = {
	id: string;
	profileCompletedPuzzlesId?: string | null;
	timeInSeconds?: number | null;
	usedCheck?: boolean | null;
	usedClear?: boolean | null;
	usedReveal?: boolean | null;
	userPuzzlePuzzleId?: string | null;
};

export type ModelSubscriptionProfileFilterInput = {
	and?: Array<ModelSubscriptionProfileFilterInput | null> | null;
	createdAt?: ModelSubscriptionStringInput | null;
	email?: ModelSubscriptionStringInput | null;
	id?: ModelSubscriptionStringInput | null;
	name?: ModelSubscriptionStringInput | null;
	or?: Array<ModelSubscriptionProfileFilterInput | null> | null;
	owner?: ModelStringInput | null;
	updatedAt?: ModelSubscriptionStringInput | null;
	userId?: ModelSubscriptionStringInput | null;
};

export type ModelSubscriptionStringInput = {
	beginsWith?: string | null;
	between?: Array<string | null> | null;
	contains?: string | null;
	eq?: string | null;
	ge?: string | null;
	gt?: string | null;
	in?: Array<string | null> | null;
	le?: string | null;
	lt?: string | null;
	ne?: string | null;
	notContains?: string | null;
	notIn?: Array<string | null> | null;
};

export type ModelSubscriptionPuzzleFilterInput = {
	and?: Array<ModelSubscriptionPuzzleFilterInput | null> | null;
	createdAt?: ModelSubscriptionStringInput | null;
	id?: ModelSubscriptionIDInput | null;
	or?: Array<ModelSubscriptionPuzzleFilterInput | null> | null;
	puzJson?: ModelSubscriptionStringInput | null;
	puzKey?: ModelSubscriptionStringInput | null;
	updatedAt?: ModelSubscriptionStringInput | null;
};

export type ModelSubscriptionIDInput = {
	beginsWith?: string | null;
	between?: Array<string | null> | null;
	contains?: string | null;
	eq?: string | null;
	ge?: string | null;
	gt?: string | null;
	in?: Array<string | null> | null;
	le?: string | null;
	lt?: string | null;
	ne?: string | null;
	notContains?: string | null;
	notIn?: Array<string | null> | null;
};

export type ModelSubscriptionUserPuzzleFilterInput = {
	and?: Array<ModelSubscriptionUserPuzzleFilterInput | null> | null;
	createdAt?: ModelSubscriptionStringInput | null;
	id?: ModelSubscriptionIDInput | null;
	or?: Array<ModelSubscriptionUserPuzzleFilterInput | null> | null;
	owner?: ModelStringInput | null;
	profileCompletedPuzzlesId?: ModelSubscriptionStringInput | null;
	timeInSeconds?: ModelSubscriptionIntInput | null;
	updatedAt?: ModelSubscriptionStringInput | null;
	usedCheck?: ModelSubscriptionBooleanInput | null;
	usedClear?: ModelSubscriptionBooleanInput | null;
	usedReveal?: ModelSubscriptionBooleanInput | null;
	userPuzzlePuzzleId?: ModelSubscriptionStringInput | null;
};

export type ModelSubscriptionIntInput = {
	between?: Array<number | null> | null;
	eq?: number | null;
	ge?: number | null;
	gt?: number | null;
	in?: Array<number | null> | null;
	le?: number | null;
	lt?: number | null;
	ne?: number | null;
	notIn?: Array<number | null> | null;
};

export type ModelSubscriptionBooleanInput = {
	eq?: boolean | null;
	ne?: boolean | null;
};

export type GetProfileQueryVariables = {
	id: string;
};

export type GetProfileQuery = {
	getProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type GetPuzzleQueryVariables = {
	id: string;
};

export type GetPuzzleQuery = {
	getPuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type GetUserPuzzleQueryVariables = {
	id: string;
};

export type GetUserPuzzleQuery = {
	getUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};

export type ListProfilesQueryVariables = {
	filter?: ModelProfileFilterInput | null;
	id?: string | null;
	limit?: number | null;
	nextToken?: string | null;
	sortDirection?: ModelSortDirection | null;
};

export type ListProfilesQuery = {
	listProfiles?: {
		__typename: 'ModelProfileConnection';
		items: Array<{
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null>;
		nextToken?: string | null;
	} | null;
};

export type ListPuzzlesQueryVariables = {
	filter?: ModelPuzzleFilterInput | null;
	limit?: number | null;
	nextToken?: string | null;
};

export type ListPuzzlesQuery = {
	listPuzzles?: {
		__typename: 'ModelPuzzleConnection';
		items: Array<{
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null>;
		nextToken?: string | null;
	} | null;
};

export type ListUserPuzzlesQueryVariables = {
	filter?: ModelUserPuzzleFilterInput | null;
	limit?: number | null;
	nextToken?: string | null;
};

export type ListUserPuzzlesQuery = {
	listUserPuzzles?: {
		__typename: 'ModelUserPuzzleConnection';
		items: Array<{
			__typename: 'UserPuzzle';
			createdAt: string;
			id: string;
			owner?: string | null;
			profileCompletedPuzzlesId: string;
			timeInSeconds: number;
			updatedAt: string;
			usedCheck: boolean;
			usedClear: boolean;
			usedReveal: boolean;
			userPuzzlePuzzleId: string;
		} | null>;
		nextToken?: string | null;
	} | null;
};

export type CreateProfileMutationVariables = {
	condition?: ModelProfileConditionInput | null;
	input: CreateProfileInput;
};

export type CreateProfileMutation = {
	createProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type CreatePuzzleMutationVariables = {
	condition?: ModelPuzzleConditionInput | null;
	input: CreatePuzzleInput;
};

export type CreatePuzzleMutation = {
	createPuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type CreateUserPuzzleMutationVariables = {
	condition?: ModelUserPuzzleConditionInput | null;
	input: CreateUserPuzzleInput;
};

export type CreateUserPuzzleMutation = {
	createUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};

export type DeleteProfileMutationVariables = {
	condition?: ModelProfileConditionInput | null;
	input: DeleteProfileInput;
};

export type DeleteProfileMutation = {
	deleteProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type DeletePuzzleMutationVariables = {
	condition?: ModelPuzzleConditionInput | null;
	input: DeletePuzzleInput;
};

export type DeletePuzzleMutation = {
	deletePuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type DeleteUserPuzzleMutationVariables = {
	condition?: ModelUserPuzzleConditionInput | null;
	input: DeleteUserPuzzleInput;
};

export type DeleteUserPuzzleMutation = {
	deleteUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};

export type UpdateProfileMutationVariables = {
	condition?: ModelProfileConditionInput | null;
	input: UpdateProfileInput;
};

export type UpdateProfileMutation = {
	updateProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type UpdatePuzzleMutationVariables = {
	condition?: ModelPuzzleConditionInput | null;
	input: UpdatePuzzleInput;
};

export type UpdatePuzzleMutation = {
	updatePuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type UpdateUserPuzzleMutationVariables = {
	condition?: ModelUserPuzzleConditionInput | null;
	input: UpdateUserPuzzleInput;
};

export type UpdateUserPuzzleMutation = {
	updateUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};

export type OnCreateProfileSubscriptionVariables = {
	filter?: ModelSubscriptionProfileFilterInput | null;
	owner?: string | null;
};

export type OnCreateProfileSubscription = {
	onCreateProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type OnCreatePuzzleSubscriptionVariables = {
	filter?: ModelSubscriptionPuzzleFilterInput | null;
};

export type OnCreatePuzzleSubscription = {
	onCreatePuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type OnCreateUserPuzzleSubscriptionVariables = {
	filter?: ModelSubscriptionUserPuzzleFilterInput | null;
	owner?: string | null;
};

export type OnCreateUserPuzzleSubscription = {
	onCreateUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};

export type OnDeleteProfileSubscriptionVariables = {
	filter?: ModelSubscriptionProfileFilterInput | null;
	owner?: string | null;
};

export type OnDeleteProfileSubscription = {
	onDeleteProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type OnDeletePuzzleSubscriptionVariables = {
	filter?: ModelSubscriptionPuzzleFilterInput | null;
};

export type OnDeletePuzzleSubscription = {
	onDeletePuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type OnDeleteUserPuzzleSubscriptionVariables = {
	filter?: ModelSubscriptionUserPuzzleFilterInput | null;
	owner?: string | null;
};

export type OnDeleteUserPuzzleSubscription = {
	onDeleteUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};

export type OnUpdateProfileSubscriptionVariables = {
	filter?: ModelSubscriptionProfileFilterInput | null;
	owner?: string | null;
};

export type OnUpdateProfileSubscription = {
	onUpdateProfile?: {
		__typename: 'Profile';
		completedPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
		createdAt: string;
		email: string;
		id: string;
		name: string;
		owner?: string | null;
		updatedAt: string;
		userId: string;
	} | null;
};

export type OnUpdatePuzzleSubscriptionVariables = {
	filter?: ModelSubscriptionPuzzleFilterInput | null;
};

export type OnUpdatePuzzleSubscription = {
	onUpdatePuzzle?: {
		__typename: 'Puzzle';
		createdAt: string;
		id: string;
		puzJson?: string | null;
		puzKey?: string | null;
		updatedAt: string;
		userPuzzles?: {
			__typename: 'ModelUserPuzzleConnection';
			nextToken?: string | null;
		} | null;
	} | null;
};

export type OnUpdateUserPuzzleSubscriptionVariables = {
	filter?: ModelSubscriptionUserPuzzleFilterInput | null;
	owner?: string | null;
};

export type OnUpdateUserPuzzleSubscription = {
	onUpdateUserPuzzle?: {
		__typename: 'UserPuzzle';
		createdAt: string;
		id: string;
		owner?: string | null;
		profile?: {
			__typename: 'Profile';
			createdAt: string;
			email: string;
			id: string;
			name: string;
			owner?: string | null;
			updatedAt: string;
			userId: string;
		} | null;
		profileCompletedPuzzlesId: string;
		puzzle?: {
			__typename: 'Puzzle';
			createdAt: string;
			id: string;
			puzJson?: string | null;
			puzKey?: string | null;
			updatedAt: string;
		} | null;
		timeInSeconds: number;
		updatedAt: string;
		usedCheck: boolean;
		usedClear: boolean;
		usedReveal: boolean;
		userPuzzlePuzzleId: string;
	} | null;
};
