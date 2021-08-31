import { ModelInit, MutableModel, PersistentModelConstructor } from "@aws-amplify/datastore";



export declare class IngredientItem {
  readonly name?: string;
  readonly amount?: string;
  readonly unit?: string;
  readonly preparation?: string;
  constructor(init: ModelInit<IngredientItem>);
}

export declare class IngredientGroupItem {
  readonly name?: string;
  readonly ingredient?: (IngredientItem | null)[];
  constructor(init: ModelInit<IngredientGroupItem>);
}

export declare class StepItem {
  readonly description?: string;
  readonly image?: string;
  constructor(init: ModelInit<StepItem>);
}

type ItemMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserRecipeMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

type UserMetaData = {
  readOnlyFields: 'createdAt' | 'updatedAt';
}

export declare class Item {
  readonly id: string;
  readonly name?: string;
  readonly caseInsensitiveName?: string;
  readonly description?: string;
  readonly tag?: (string | null)[];
  readonly rating?: number;
  readonly image?: string;
  readonly ingredient?: (IngredientItem | null)[];
  readonly ingredientGroup?: (IngredientGroupItem | null)[];
  readonly step?: (StepItem | null)[];
  readonly notes?: string;
  readonly forked?: string;
  readonly users?: (UserRecipe | null)[];
  readonly creator?: string;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<Item, ItemMetaData>);
  static copyOf(source: Item, mutator: (draft: MutableModel<Item, ItemMetaData>) => MutableModel<Item, ItemMetaData> | void): Item;
}

export declare class UserRecipe {
  readonly id: string;
  readonly recipes: Item;
  readonly user: User;
  readonly liked?: boolean;
  readonly rating?: number;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<UserRecipe, UserRecipeMetaData>);
  static copyOf(source: UserRecipe, mutator: (draft: MutableModel<UserRecipe, UserRecipeMetaData>) => MutableModel<UserRecipe, UserRecipeMetaData> | void): UserRecipe;
}

export declare class User {
  readonly id: string;
  readonly username: string;
  readonly recipes?: (UserRecipe | null)[];
  readonly email?: string;
  readonly provider?: string;
  readonly createdRecipes?: (Item | null)[];
  readonly createdAt?: string;
  readonly updatedAt?: string;
  constructor(init: ModelInit<User, UserMetaData>);
  static copyOf(source: User, mutator: (draft: MutableModel<User, UserMetaData>) => MutableModel<User, UserMetaData> | void): User;
}