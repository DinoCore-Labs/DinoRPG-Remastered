
/**
 * Client
**/

import * as runtime from './runtime/client.js';
import $Types = runtime.Types // general types
import $Public = runtime.Types.Public
import $Utils = runtime.Types.Utils
import $Extensions = runtime.Types.Extensions
import $Result = runtime.Types.Result

export type PrismaPromise<T> = $Public.PrismaPromise<T>


/**
 * Model Ranking
 * 
 */
export type Ranking = $Result.DefaultSelection<Prisma.$RankingPayload>
/**
 * Model SignupDeviceMonthCounter
 * 
 */
export type SignupDeviceMonthCounter = $Result.DefaultSelection<Prisma.$SignupDeviceMonthCounterPayload>
/**
 * Model SignupIpMonthCounter
 * 
 */
export type SignupIpMonthCounter = $Result.DefaultSelection<Prisma.$SignupIpMonthCounterPayload>
/**
 * Model User
 * 
 */
export type User = $Result.DefaultSelection<Prisma.$UserPayload>
/**
 * Model UserItems
 * 
 */
export type UserItems = $Result.DefaultSelection<Prisma.$UserItemsPayload>
/**
 * Model UserProfile
 * 
 */
export type UserProfile = $Result.DefaultSelection<Prisma.$UserProfilePayload>
/**
 * Model UserRewards
 * 
 */
export type UserRewards = $Result.DefaultSelection<Prisma.$UserRewardsPayload>
/**
 * Model UserTracking
 * 
 */
export type UserTracking = $Result.DefaultSelection<Prisma.$UserTrackingPayload>
/**
 * Model UserWallet
 * 
 */
export type UserWallet = $Result.DefaultSelection<Prisma.$UserWalletPayload>

/**
 * Enums
 */
export namespace $Enums {
  export const Language: {
  FR: 'FR',
  EN: 'EN',
  ES: 'ES',
  DE: 'DE'
};

export type Language = (typeof Language)[keyof typeof Language]


export const Gender: {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER'
};

export type Gender = (typeof Gender)[keyof typeof Gender]


export const MoneyType: {
  GOLD: 'GOLD'
};

export type MoneyType = (typeof MoneyType)[keyof typeof MoneyType]


export const Role: {
  PLAYER: 'PLAYER',
  MODERATOR: 'MODERATOR',
  ADMIN: 'ADMIN',
  SUPER_ADMIN: 'SUPER_ADMIN'
};

export type Role = (typeof Role)[keyof typeof Role]

}

export type Language = $Enums.Language

export const Language: typeof $Enums.Language

export type Gender = $Enums.Gender

export const Gender: typeof $Enums.Gender

export type MoneyType = $Enums.MoneyType

export const MoneyType: typeof $Enums.MoneyType

export type Role = $Enums.Role

export const Role: typeof $Enums.Role

/**
 * ##  Prisma Client ʲˢ
 *
 * Type-safe database client for TypeScript & Node.js
 * @example
 * ```
 * const prisma = new PrismaClient()
 * // Fetch zero or more Rankings
 * const rankings = await prisma.ranking.findMany()
 * ```
 *
 *
 * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
 */
export class PrismaClient<
  ClientOptions extends Prisma.PrismaClientOptions = Prisma.PrismaClientOptions,
  const U = 'log' extends keyof ClientOptions ? ClientOptions['log'] extends Array<Prisma.LogLevel | Prisma.LogDefinition> ? Prisma.GetEvents<ClientOptions['log']> : never : never,
  ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs
> {
  [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['other'] }

    /**
   * ##  Prisma Client ʲˢ
   *
   * Type-safe database client for TypeScript & Node.js
   * @example
   * ```
   * const prisma = new PrismaClient()
   * // Fetch zero or more Rankings
   * const rankings = await prisma.ranking.findMany()
   * ```
   *
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client).
   */

  constructor(optionsArg ?: Prisma.Subset<ClientOptions, Prisma.PrismaClientOptions>);
  $on<V extends U>(eventType: V, callback: (event: V extends 'query' ? Prisma.QueryEvent : Prisma.LogEvent) => void): PrismaClient;

  /**
   * Connect with the database
   */
  $connect(): $Utils.JsPromise<void>;

  /**
   * Disconnect from the database
   */
  $disconnect(): $Utils.JsPromise<void>;

/**
   * Executes a prepared raw query and returns the number of affected rows.
   * @example
   * ```
   * const result = await prisma.$executeRaw`UPDATE User SET cool = ${true} WHERE email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Executes a raw query and returns the number of affected rows.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$executeRawUnsafe('UPDATE User SET cool = $1 WHERE email = $2 ;', true, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $executeRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<number>;

  /**
   * Performs a prepared raw query and returns the `SELECT` data.
   * @example
   * ```
   * const result = await prisma.$queryRaw`SELECT * FROM User WHERE id = ${1} OR email = ${'user@email.com'};`
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRaw<T = unknown>(query: TemplateStringsArray | Prisma.Sql, ...values: any[]): Prisma.PrismaPromise<T>;

  /**
   * Performs a raw query and returns the `SELECT` data.
   * Susceptible to SQL injections, see documentation.
   * @example
   * ```
   * const result = await prisma.$queryRawUnsafe('SELECT * FROM User WHERE id = $1 OR email = $2;', 1, 'user@email.com')
   * ```
   *
   * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/raw-database-access).
   */
  $queryRawUnsafe<T = unknown>(query: string, ...values: any[]): Prisma.PrismaPromise<T>;


  /**
   * Allows the running of a sequence of read/write operations that are guaranteed to either succeed or fail as a whole.
   * @example
   * ```
   * const [george, bob, alice] = await prisma.$transaction([
   *   prisma.user.create({ data: { name: 'George' } }),
   *   prisma.user.create({ data: { name: 'Bob' } }),
   *   prisma.user.create({ data: { name: 'Alice' } }),
   * ])
   * ```
   * 
   * Read more in our [docs](https://www.prisma.io/docs/concepts/components/prisma-client/transactions).
   */
  $transaction<P extends Prisma.PrismaPromise<any>[]>(arg: [...P], options?: { isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<runtime.Types.Utils.UnwrapTuple<P>>

  $transaction<R>(fn: (prisma: Omit<PrismaClient, runtime.ITXClientDenyList>) => $Utils.JsPromise<R>, options?: { maxWait?: number, timeout?: number, isolationLevel?: Prisma.TransactionIsolationLevel }): $Utils.JsPromise<R>

  $extends: $Extensions.ExtendsHook<"extends", Prisma.TypeMapCb<ClientOptions>, ExtArgs, $Utils.Call<Prisma.TypeMapCb<ClientOptions>, {
    extArgs: ExtArgs
  }>>

      /**
   * `prisma.ranking`: Exposes CRUD operations for the **Ranking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Rankings
    * const rankings = await prisma.ranking.findMany()
    * ```
    */
  get ranking(): Prisma.RankingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signupDeviceMonthCounter`: Exposes CRUD operations for the **SignupDeviceMonthCounter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SignupDeviceMonthCounters
    * const signupDeviceMonthCounters = await prisma.signupDeviceMonthCounter.findMany()
    * ```
    */
  get signupDeviceMonthCounter(): Prisma.SignupDeviceMonthCounterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.signupIpMonthCounter`: Exposes CRUD operations for the **SignupIpMonthCounter** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more SignupIpMonthCounters
    * const signupIpMonthCounters = await prisma.signupIpMonthCounter.findMany()
    * ```
    */
  get signupIpMonthCounter(): Prisma.SignupIpMonthCounterDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.user`: Exposes CRUD operations for the **User** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more Users
    * const users = await prisma.user.findMany()
    * ```
    */
  get user(): Prisma.UserDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userItems`: Exposes CRUD operations for the **UserItems** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserItems
    * const userItems = await prisma.userItems.findMany()
    * ```
    */
  get userItems(): Prisma.UserItemsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userProfile`: Exposes CRUD operations for the **UserProfile** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserProfiles
    * const userProfiles = await prisma.userProfile.findMany()
    * ```
    */
  get userProfile(): Prisma.UserProfileDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userRewards`: Exposes CRUD operations for the **UserRewards** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserRewards
    * const userRewards = await prisma.userRewards.findMany()
    * ```
    */
  get userRewards(): Prisma.UserRewardsDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userTracking`: Exposes CRUD operations for the **UserTracking** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserTrackings
    * const userTrackings = await prisma.userTracking.findMany()
    * ```
    */
  get userTracking(): Prisma.UserTrackingDelegate<ExtArgs, ClientOptions>;

  /**
   * `prisma.userWallet`: Exposes CRUD operations for the **UserWallet** model.
    * Example usage:
    * ```ts
    * // Fetch zero or more UserWallets
    * const userWallets = await prisma.userWallet.findMany()
    * ```
    */
  get userWallet(): Prisma.UserWalletDelegate<ExtArgs, ClientOptions>;
}

export namespace Prisma {
  export import DMMF = runtime.DMMF

  export type PrismaPromise<T> = $Public.PrismaPromise<T>

  /**
   * Validator
   */
  export import validator = runtime.Public.validator

  /**
   * Prisma Errors
   */
  export import PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError
  export import PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError
  export import PrismaClientRustPanicError = runtime.PrismaClientRustPanicError
  export import PrismaClientInitializationError = runtime.PrismaClientInitializationError
  export import PrismaClientValidationError = runtime.PrismaClientValidationError

  /**
   * Re-export of sql-template-tag
   */
  export import sql = runtime.sqltag
  export import empty = runtime.empty
  export import join = runtime.join
  export import raw = runtime.raw
  export import Sql = runtime.Sql



  /**
   * Decimal.js
   */
  export import Decimal = runtime.Decimal

  export type DecimalJsLike = runtime.DecimalJsLike

  /**
  * Extensions
  */
  export import Extension = $Extensions.UserArgs
  export import getExtensionContext = runtime.Extensions.getExtensionContext
  export import Args = $Public.Args
  export import Payload = $Public.Payload
  export import Result = $Public.Result
  export import Exact = $Public.Exact

  /**
   * Prisma Client JS version: 7.0.0
   * Query Engine version: 0c19ccc313cf9911a90d99d2ac2eb0280c76c513
   */
  export type PrismaVersion = {
    client: string
    engine: string
  }

  export const prismaVersion: PrismaVersion

  /**
   * Utility Types
   */


  export import Bytes = runtime.Bytes
  export import JsonObject = runtime.JsonObject
  export import JsonArray = runtime.JsonArray
  export import JsonValue = runtime.JsonValue
  export import InputJsonObject = runtime.InputJsonObject
  export import InputJsonArray = runtime.InputJsonArray
  export import InputJsonValue = runtime.InputJsonValue

  /**
   * Types of the values used to represent different kinds of `null` values when working with JSON fields.
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  namespace NullTypes {
    /**
    * Type of `Prisma.DbNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.DbNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class DbNull {
      private DbNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.JsonNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.JsonNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class JsonNull {
      private JsonNull: never
      private constructor()
    }

    /**
    * Type of `Prisma.AnyNull`.
    *
    * You cannot use other instances of this class. Please use the `Prisma.AnyNull` value.
    *
    * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
    */
    class AnyNull {
      private AnyNull: never
      private constructor()
    }
  }

  /**
   * Helper for filtering JSON entries that have `null` on the database (empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const DbNull: NullTypes.DbNull

  /**
   * Helper for filtering JSON entries that have JSON `null` values (not empty on the db)
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const JsonNull: NullTypes.JsonNull

  /**
   * Helper for filtering JSON entries that are `Prisma.DbNull` or `Prisma.JsonNull`
   *
   * @see https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-on-a-json-field
   */
  export const AnyNull: NullTypes.AnyNull

  type SelectAndInclude = {
    select: any
    include: any
  }

  type SelectAndOmit = {
    select: any
    omit: any
  }

  /**
   * Get the type of the value, that the Promise holds.
   */
  export type PromiseType<T extends PromiseLike<any>> = T extends PromiseLike<infer U> ? U : T;

  /**
   * Get the return type of a function which returns a Promise.
   */
  export type PromiseReturnType<T extends (...args: any) => $Utils.JsPromise<any>> = PromiseType<ReturnType<T>>

  /**
   * From T, pick a set of properties whose keys are in the union K
   */
  type Prisma__Pick<T, K extends keyof T> = {
      [P in K]: T[P];
  };


  export type Enumerable<T> = T | Array<T>;

  export type RequiredKeys<T> = {
    [K in keyof T]-?: {} extends Prisma__Pick<T, K> ? never : K
  }[keyof T]

  export type TruthyKeys<T> = keyof {
    [K in keyof T as T[K] extends false | undefined | null ? never : K]: K
  }

  export type TrueKeys<T> = TruthyKeys<Prisma__Pick<T, RequiredKeys<T>>>

  /**
   * Subset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection
   */
  export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
  };

  /**
   * SelectSubset
   * @desc From `T` pick properties that exist in `U`. Simple version of Intersection.
   * Additionally, it validates, if both select and include are present. If the case, it errors.
   */
  export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    (T extends SelectAndInclude
      ? 'Please either choose `select` or `include`.'
      : T extends SelectAndOmit
        ? 'Please either choose `select` or `omit`.'
        : {})

  /**
   * Subset + Intersection
   * @desc From `T` pick properties that exist in `U` and intersect `K`
   */
  export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never
  } &
    K

  type Without<T, U> = { [P in Exclude<keyof T, keyof U>]?: never };

  /**
   * XOR is needed to have a real mutually exclusive union type
   * https://stackoverflow.com/questions/42123407/does-typescript-support-mutually-exclusive-types
   */
  type XOR<T, U> =
    T extends object ?
    U extends object ?
      (Without<T, U> & U) | (Without<U, T> & T)
    : U : T


  /**
   * Is T a Record?
   */
  type IsObject<T extends any> = T extends Array<any>
  ? False
  : T extends Date
  ? False
  : T extends Uint8Array
  ? False
  : T extends BigInt
  ? False
  : T extends object
  ? True
  : False


  /**
   * If it's T[], return T
   */
  export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T

  /**
   * From ts-toolbelt
   */

  type __Either<O extends object, K extends Key> = Omit<O, K> &
    {
      // Merge all but K
      [P in K]: Prisma__Pick<O, P & keyof O> // With K possibilities
    }[K]

  type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>

  type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>

  type _Either<
    O extends object,
    K extends Key,
    strict extends Boolean
  > = {
    1: EitherStrict<O, K>
    0: EitherLoose<O, K>
  }[strict]

  type Either<
    O extends object,
    K extends Key,
    strict extends Boolean = 1
  > = O extends unknown ? _Either<O, K, strict> : never

  export type Union = any

  type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K]
  } & {}

  /** Helper Types for "Merge" **/
  export type IntersectOf<U extends Union> = (
    U extends unknown ? (k: U) => void : never
  ) extends (k: infer I) => void
    ? I
    : never

  export type Overwrite<O extends object, O1 extends object> = {
      [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
  } & {};

  type _Merge<U extends object> = IntersectOf<Overwrite<U, {
      [K in keyof U]-?: At<U, K>;
  }>>;

  type Key = string | number | symbol;
  type AtBasic<O extends object, K extends Key> = K extends keyof O ? O[K] : never;
  type AtStrict<O extends object, K extends Key> = O[K & keyof O];
  type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
  export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
      1: AtStrict<O, K>;
      0: AtLoose<O, K>;
  }[strict];

  export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
  } & {};

  export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
  } & {};

  type _Record<K extends keyof any, T> = {
    [P in K]: T;
  };

  // cause typescript not to expand types and preserve names
  type NoExpand<T> = T extends unknown ? T : never;

  // this type assumes the passed object is entirely optional
  type AtLeast<O extends object, K extends string> = NoExpand<
    O extends unknown
    ? | (K extends keyof O ? { [P in K]: O[P] } & O : O)
      | {[P in keyof O as P extends K ? P : never]-?: O[P]} & O
    : never>;

  type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;

  export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
  /** End Helper Types for "Merge" **/

  export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;

  /**
  A [[Boolean]]
  */
  export type Boolean = True | False

  // /**
  // 1
  // */
  export type True = 1

  /**
  0
  */
  export type False = 0

  export type Not<B extends Boolean> = {
    0: 1
    1: 0
  }[B]

  export type Extends<A1 extends any, A2 extends any> = [A1] extends [never]
    ? 0 // anything `never` is false
    : A1 extends A2
    ? 1
    : 0

  export type Has<U extends Union, U1 extends Union> = Not<
    Extends<Exclude<U1, U>, U1>
  >

  export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
      0: 0
      1: 1
    }
    1: {
      0: 1
      1: 1
    }
  }[B1][B2]

  export type Keys<U extends Union> = U extends unknown ? keyof U : never

  type Cast<A, B> = A extends B ? A : B;

  export const type: unique symbol;



  /**
   * Used by group by
   */

  export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O
      ? O[P]
      : never
  } : never

  type FieldPaths<
    T,
    U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>
  > = IsObject<T> extends True ? U : T

  type GetHavingFields<T> = {
    [K in keyof T]: Or<
      Or<Extends<'OR', K>, Extends<'AND', K>>,
      Extends<'NOT', K>
    > extends True
      ? // infer is only needed to not hit TS limit
        // based on the brilliant idea of Pierre-Antoine Mills
        // https://github.com/microsoft/TypeScript/issues/30188#issuecomment-478938437
        T[K] extends infer TK
        ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never>
        : never
      : {} extends FieldPaths<T[K]>
      ? never
      : K
  }[keyof T]

  /**
   * Convert tuple to union
   */
  type _TupleToUnion<T> = T extends (infer E)[] ? E : never
  type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>
  type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T

  /**
   * Like `Pick`, but additionally can also accept an array of keys
   */
  type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>

  /**
   * Exclude all keys with underscores
   */
  type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T


  export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>

  type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>


  export const ModelName: {
    Ranking: 'Ranking',
    SignupDeviceMonthCounter: 'SignupDeviceMonthCounter',
    SignupIpMonthCounter: 'SignupIpMonthCounter',
    User: 'User',
    UserItems: 'UserItems',
    UserProfile: 'UserProfile',
    UserRewards: 'UserRewards',
    UserTracking: 'UserTracking',
    UserWallet: 'UserWallet'
  };

  export type ModelName = (typeof ModelName)[keyof typeof ModelName]



  interface TypeMapCb<ClientOptions = {}> extends $Utils.Fn<{extArgs: $Extensions.InternalArgs }, $Utils.Record<string, any>> {
    returns: Prisma.TypeMap<this['params']['extArgs'], ClientOptions extends { omit: infer OmitOptions } ? OmitOptions : {}>
  }

  export type TypeMap<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
      omit: GlobalOmitOptions
    }
    meta: {
      modelProps: "ranking" | "signupDeviceMonthCounter" | "signupIpMonthCounter" | "user" | "userItems" | "userProfile" | "userRewards" | "userTracking" | "userWallet"
      txIsolationLevel: Prisma.TransactionIsolationLevel
    }
    model: {
      Ranking: {
        payload: Prisma.$RankingPayload<ExtArgs>
        fields: Prisma.RankingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.RankingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.RankingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>
          }
          findFirst: {
            args: Prisma.RankingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.RankingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>
          }
          findMany: {
            args: Prisma.RankingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>[]
          }
          create: {
            args: Prisma.RankingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>
          }
          createMany: {
            args: Prisma.RankingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.RankingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>[]
          }
          delete: {
            args: Prisma.RankingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>
          }
          update: {
            args: Prisma.RankingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>
          }
          deleteMany: {
            args: Prisma.RankingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.RankingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.RankingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>[]
          }
          upsert: {
            args: Prisma.RankingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$RankingPayload>
          }
          aggregate: {
            args: Prisma.RankingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateRanking>
          }
          groupBy: {
            args: Prisma.RankingGroupByArgs<ExtArgs>
            result: $Utils.Optional<RankingGroupByOutputType>[]
          }
          count: {
            args: Prisma.RankingCountArgs<ExtArgs>
            result: $Utils.Optional<RankingCountAggregateOutputType> | number
          }
        }
      }
      SignupDeviceMonthCounter: {
        payload: Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>
        fields: Prisma.SignupDeviceMonthCounterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignupDeviceMonthCounterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignupDeviceMonthCounterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>
          }
          findFirst: {
            args: Prisma.SignupDeviceMonthCounterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignupDeviceMonthCounterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>
          }
          findMany: {
            args: Prisma.SignupDeviceMonthCounterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>[]
          }
          create: {
            args: Prisma.SignupDeviceMonthCounterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>
          }
          createMany: {
            args: Prisma.SignupDeviceMonthCounterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignupDeviceMonthCounterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>[]
          }
          delete: {
            args: Prisma.SignupDeviceMonthCounterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>
          }
          update: {
            args: Prisma.SignupDeviceMonthCounterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>
          }
          deleteMany: {
            args: Prisma.SignupDeviceMonthCounterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignupDeviceMonthCounterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignupDeviceMonthCounterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>[]
          }
          upsert: {
            args: Prisma.SignupDeviceMonthCounterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupDeviceMonthCounterPayload>
          }
          aggregate: {
            args: Prisma.SignupDeviceMonthCounterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignupDeviceMonthCounter>
          }
          groupBy: {
            args: Prisma.SignupDeviceMonthCounterGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignupDeviceMonthCounterGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignupDeviceMonthCounterCountArgs<ExtArgs>
            result: $Utils.Optional<SignupDeviceMonthCounterCountAggregateOutputType> | number
          }
        }
      }
      SignupIpMonthCounter: {
        payload: Prisma.$SignupIpMonthCounterPayload<ExtArgs>
        fields: Prisma.SignupIpMonthCounterFieldRefs
        operations: {
          findUnique: {
            args: Prisma.SignupIpMonthCounterFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.SignupIpMonthCounterFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>
          }
          findFirst: {
            args: Prisma.SignupIpMonthCounterFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.SignupIpMonthCounterFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>
          }
          findMany: {
            args: Prisma.SignupIpMonthCounterFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>[]
          }
          create: {
            args: Prisma.SignupIpMonthCounterCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>
          }
          createMany: {
            args: Prisma.SignupIpMonthCounterCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.SignupIpMonthCounterCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>[]
          }
          delete: {
            args: Prisma.SignupIpMonthCounterDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>
          }
          update: {
            args: Prisma.SignupIpMonthCounterUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>
          }
          deleteMany: {
            args: Prisma.SignupIpMonthCounterDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.SignupIpMonthCounterUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.SignupIpMonthCounterUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>[]
          }
          upsert: {
            args: Prisma.SignupIpMonthCounterUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$SignupIpMonthCounterPayload>
          }
          aggregate: {
            args: Prisma.SignupIpMonthCounterAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateSignupIpMonthCounter>
          }
          groupBy: {
            args: Prisma.SignupIpMonthCounterGroupByArgs<ExtArgs>
            result: $Utils.Optional<SignupIpMonthCounterGroupByOutputType>[]
          }
          count: {
            args: Prisma.SignupIpMonthCounterCountArgs<ExtArgs>
            result: $Utils.Optional<SignupIpMonthCounterCountAggregateOutputType> | number
          }
        }
      }
      User: {
        payload: Prisma.$UserPayload<ExtArgs>
        fields: Prisma.UserFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findFirst: {
            args: Prisma.UserFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          findMany: {
            args: Prisma.UserFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          create: {
            args: Prisma.UserCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          createMany: {
            args: Prisma.UserCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          delete: {
            args: Prisma.UserDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          update: {
            args: Prisma.UserUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          deleteMany: {
            args: Prisma.UserDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>[]
          }
          upsert: {
            args: Prisma.UserUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserPayload>
          }
          aggregate: {
            args: Prisma.UserAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUser>
          }
          groupBy: {
            args: Prisma.UserGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserCountArgs<ExtArgs>
            result: $Utils.Optional<UserCountAggregateOutputType> | number
          }
        }
      }
      UserItems: {
        payload: Prisma.$UserItemsPayload<ExtArgs>
        fields: Prisma.UserItemsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserItemsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserItemsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>
          }
          findFirst: {
            args: Prisma.UserItemsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserItemsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>
          }
          findMany: {
            args: Prisma.UserItemsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>[]
          }
          create: {
            args: Prisma.UserItemsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>
          }
          createMany: {
            args: Prisma.UserItemsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserItemsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>[]
          }
          delete: {
            args: Prisma.UserItemsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>
          }
          update: {
            args: Prisma.UserItemsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>
          }
          deleteMany: {
            args: Prisma.UserItemsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserItemsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserItemsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>[]
          }
          upsert: {
            args: Prisma.UserItemsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserItemsPayload>
          }
          aggregate: {
            args: Prisma.UserItemsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserItems>
          }
          groupBy: {
            args: Prisma.UserItemsGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserItemsGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserItemsCountArgs<ExtArgs>
            result: $Utils.Optional<UserItemsCountAggregateOutputType> | number
          }
        }
      }
      UserProfile: {
        payload: Prisma.$UserProfilePayload<ExtArgs>
        fields: Prisma.UserProfileFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserProfileFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserProfileFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findFirst: {
            args: Prisma.UserProfileFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserProfileFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          findMany: {
            args: Prisma.UserProfileFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          create: {
            args: Prisma.UserProfileCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          createMany: {
            args: Prisma.UserProfileCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserProfileCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          delete: {
            args: Prisma.UserProfileDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          update: {
            args: Prisma.UserProfileUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          deleteMany: {
            args: Prisma.UserProfileDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserProfileUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserProfileUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>[]
          }
          upsert: {
            args: Prisma.UserProfileUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserProfilePayload>
          }
          aggregate: {
            args: Prisma.UserProfileAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserProfile>
          }
          groupBy: {
            args: Prisma.UserProfileGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserProfileGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserProfileCountArgs<ExtArgs>
            result: $Utils.Optional<UserProfileCountAggregateOutputType> | number
          }
        }
      }
      UserRewards: {
        payload: Prisma.$UserRewardsPayload<ExtArgs>
        fields: Prisma.UserRewardsFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserRewardsFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserRewardsFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>
          }
          findFirst: {
            args: Prisma.UserRewardsFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserRewardsFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>
          }
          findMany: {
            args: Prisma.UserRewardsFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>[]
          }
          create: {
            args: Prisma.UserRewardsCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>
          }
          createMany: {
            args: Prisma.UserRewardsCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserRewardsCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>[]
          }
          delete: {
            args: Prisma.UserRewardsDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>
          }
          update: {
            args: Prisma.UserRewardsUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>
          }
          deleteMany: {
            args: Prisma.UserRewardsDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserRewardsUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserRewardsUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>[]
          }
          upsert: {
            args: Prisma.UserRewardsUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserRewardsPayload>
          }
          aggregate: {
            args: Prisma.UserRewardsAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserRewards>
          }
          groupBy: {
            args: Prisma.UserRewardsGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserRewardsGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserRewardsCountArgs<ExtArgs>
            result: $Utils.Optional<UserRewardsCountAggregateOutputType> | number
          }
        }
      }
      UserTracking: {
        payload: Prisma.$UserTrackingPayload<ExtArgs>
        fields: Prisma.UserTrackingFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserTrackingFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserTrackingFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>
          }
          findFirst: {
            args: Prisma.UserTrackingFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserTrackingFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>
          }
          findMany: {
            args: Prisma.UserTrackingFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>[]
          }
          create: {
            args: Prisma.UserTrackingCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>
          }
          createMany: {
            args: Prisma.UserTrackingCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserTrackingCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>[]
          }
          delete: {
            args: Prisma.UserTrackingDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>
          }
          update: {
            args: Prisma.UserTrackingUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>
          }
          deleteMany: {
            args: Prisma.UserTrackingDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserTrackingUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserTrackingUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>[]
          }
          upsert: {
            args: Prisma.UserTrackingUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserTrackingPayload>
          }
          aggregate: {
            args: Prisma.UserTrackingAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserTracking>
          }
          groupBy: {
            args: Prisma.UserTrackingGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserTrackingGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserTrackingCountArgs<ExtArgs>
            result: $Utils.Optional<UserTrackingCountAggregateOutputType> | number
          }
        }
      }
      UserWallet: {
        payload: Prisma.$UserWalletPayload<ExtArgs>
        fields: Prisma.UserWalletFieldRefs
        operations: {
          findUnique: {
            args: Prisma.UserWalletFindUniqueArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload> | null
          }
          findUniqueOrThrow: {
            args: Prisma.UserWalletFindUniqueOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>
          }
          findFirst: {
            args: Prisma.UserWalletFindFirstArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload> | null
          }
          findFirstOrThrow: {
            args: Prisma.UserWalletFindFirstOrThrowArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>
          }
          findMany: {
            args: Prisma.UserWalletFindManyArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>[]
          }
          create: {
            args: Prisma.UserWalletCreateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>
          }
          createMany: {
            args: Prisma.UserWalletCreateManyArgs<ExtArgs>
            result: BatchPayload
          }
          createManyAndReturn: {
            args: Prisma.UserWalletCreateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>[]
          }
          delete: {
            args: Prisma.UserWalletDeleteArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>
          }
          update: {
            args: Prisma.UserWalletUpdateArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>
          }
          deleteMany: {
            args: Prisma.UserWalletDeleteManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateMany: {
            args: Prisma.UserWalletUpdateManyArgs<ExtArgs>
            result: BatchPayload
          }
          updateManyAndReturn: {
            args: Prisma.UserWalletUpdateManyAndReturnArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>[]
          }
          upsert: {
            args: Prisma.UserWalletUpsertArgs<ExtArgs>
            result: $Utils.PayloadToResult<Prisma.$UserWalletPayload>
          }
          aggregate: {
            args: Prisma.UserWalletAggregateArgs<ExtArgs>
            result: $Utils.Optional<AggregateUserWallet>
          }
          groupBy: {
            args: Prisma.UserWalletGroupByArgs<ExtArgs>
            result: $Utils.Optional<UserWalletGroupByOutputType>[]
          }
          count: {
            args: Prisma.UserWalletCountArgs<ExtArgs>
            result: $Utils.Optional<UserWalletCountAggregateOutputType> | number
          }
        }
      }
    }
  } & {
    other: {
      payload: any
      operations: {
        $executeRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $executeRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
        $queryRaw: {
          args: [query: TemplateStringsArray | Prisma.Sql, ...values: any[]],
          result: any
        }
        $queryRawUnsafe: {
          args: [query: string, ...values: any[]],
          result: any
        }
      }
    }
  }
  export const defineExtension: $Extensions.ExtendsHook<"define", Prisma.TypeMapCb, $Extensions.DefaultArgs>
  export type DefaultPrismaClient = PrismaClient
  export type ErrorFormat = 'pretty' | 'colorless' | 'minimal'
  export interface PrismaClientOptions {
    /**
     * @default "colorless"
     */
    errorFormat?: ErrorFormat
    /**
     * @example
     * ```
     * // Shorthand for `emit: 'stdout'`
     * log: ['query', 'info', 'warn', 'error']
     * 
     * // Emit as events only
     * log: [
     *   { emit: 'event', level: 'query' },
     *   { emit: 'event', level: 'info' },
     *   { emit: 'event', level: 'warn' }
     *   { emit: 'event', level: 'error' }
     * ]
     * 
     * / Emit as events and log to stdout
     * og: [
     *  { emit: 'stdout', level: 'query' },
     *  { emit: 'stdout', level: 'info' },
     *  { emit: 'stdout', level: 'warn' }
     *  { emit: 'stdout', level: 'error' }
     * 
     * ```
     * Read more in our [docs](https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-client/logging#the-log-option).
     */
    log?: (LogLevel | LogDefinition)[]
    /**
     * The default values for transactionOptions
     * maxWait ?= 2000
     * timeout ?= 5000
     */
    transactionOptions?: {
      maxWait?: number
      timeout?: number
      isolationLevel?: Prisma.TransactionIsolationLevel
    }
    /**
     * Instance of a Driver Adapter, e.g., like one provided by `@prisma/adapter-planetscale`
     */
    adapter?: runtime.SqlDriverAdapterFactory
    /**
     * Prisma Accelerate URL allowing the client to connect through Accelerate instead of a direct database.
     */
    accelerateUrl?: string
    /**
     * Global configuration for omitting model fields by default.
     * 
     * @example
     * ```
     * const prisma = new PrismaClient({
     *   omit: {
     *     user: {
     *       password: true
     *     }
     *   }
     * })
     * ```
     */
    omit?: Prisma.GlobalOmitConfig
  }
  export type GlobalOmitConfig = {
    ranking?: RankingOmit
    signupDeviceMonthCounter?: SignupDeviceMonthCounterOmit
    signupIpMonthCounter?: SignupIpMonthCounterOmit
    user?: UserOmit
    userItems?: UserItemsOmit
    userProfile?: UserProfileOmit
    userRewards?: UserRewardsOmit
    userTracking?: UserTrackingOmit
    userWallet?: UserWalletOmit
  }

  /* Types for Logging */
  export type LogLevel = 'info' | 'query' | 'warn' | 'error'
  export type LogDefinition = {
    level: LogLevel
    emit: 'stdout' | 'event'
  }

  export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;

  export type GetLogType<T> = CheckIsLogLevel<
    T extends LogDefinition ? T['level'] : T
  >;

  export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition>
    ? GetLogType<T[number]>
    : never;

  export type QueryEvent = {
    timestamp: Date
    query: string
    params: string
    duration: number
    target: string
  }

  export type LogEvent = {
    timestamp: Date
    message: string
    target: string
  }
  /* End Types for Logging */


  export type PrismaAction =
    | 'findUnique'
    | 'findUniqueOrThrow'
    | 'findMany'
    | 'findFirst'
    | 'findFirstOrThrow'
    | 'create'
    | 'createMany'
    | 'createManyAndReturn'
    | 'update'
    | 'updateMany'
    | 'updateManyAndReturn'
    | 'upsert'
    | 'delete'
    | 'deleteMany'
    | 'executeRaw'
    | 'queryRaw'
    | 'aggregate'
    | 'count'
    | 'runCommandRaw'
    | 'findRaw'
    | 'groupBy'

  // tested in getLogLevel.test.ts
  export function getLogLevel(log: Array<LogLevel | LogDefinition>): LogLevel | undefined;

  /**
   * `PrismaClient` proxy available in interactive transactions.
   */
  export type TransactionClient = Omit<Prisma.DefaultPrismaClient, runtime.ITXClientDenyList>

  export type Datasource = {
    url?: string
  }

  /**
   * Count Types
   */


  /**
   * Count Type UserCountOutputType
   */

  export type UserCountOutputType = {
    items: number
    rewards: number
    statsTracking: number
    wallets: number
  }

  export type UserCountOutputTypeSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | UserCountOutputTypeCountItemsArgs
    rewards?: boolean | UserCountOutputTypeCountRewardsArgs
    statsTracking?: boolean | UserCountOutputTypeCountStatsTrackingArgs
    wallets?: boolean | UserCountOutputTypeCountWalletsArgs
  }

  // Custom InputTypes
  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserCountOutputType
     */
    select?: UserCountOutputTypeSelect<ExtArgs> | null
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountItemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserItemsWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountRewardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRewardsWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountStatsTrackingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTrackingWhereInput
  }

  /**
   * UserCountOutputType without action
   */
  export type UserCountOutputTypeCountWalletsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWalletWhereInput
  }


  /**
   * Models
   */

  /**
   * Model Ranking
   */

  export type AggregateRanking = {
    _count: RankingCountAggregateOutputType | null
    _avg: RankingAvgAggregateOutputType | null
    _sum: RankingSumAggregateOutputType | null
    _min: RankingMinAggregateOutputType | null
    _max: RankingMaxAggregateOutputType | null
  }

  export type RankingAvgAggregateOutputType = {
    id: number | null
    dinozCount: number | null
    points: number | null
    average: number | null
    completion: number | null
    dojo: number | null
  }

  export type RankingSumAggregateOutputType = {
    id: number | null
    dinozCount: number | null
    points: number | null
    average: number | null
    completion: number | null
    dojo: number | null
  }

  export type RankingMinAggregateOutputType = {
    id: number | null
    dinozCount: number | null
    points: number | null
    average: number | null
    completion: number | null
    dojo: number | null
    userId: string | null
  }

  export type RankingMaxAggregateOutputType = {
    id: number | null
    dinozCount: number | null
    points: number | null
    average: number | null
    completion: number | null
    dojo: number | null
    userId: string | null
  }

  export type RankingCountAggregateOutputType = {
    id: number
    dinozCount: number
    points: number
    average: number
    completion: number
    dojo: number
    userId: number
    _all: number
  }


  export type RankingAvgAggregateInputType = {
    id?: true
    dinozCount?: true
    points?: true
    average?: true
    completion?: true
    dojo?: true
  }

  export type RankingSumAggregateInputType = {
    id?: true
    dinozCount?: true
    points?: true
    average?: true
    completion?: true
    dojo?: true
  }

  export type RankingMinAggregateInputType = {
    id?: true
    dinozCount?: true
    points?: true
    average?: true
    completion?: true
    dojo?: true
    userId?: true
  }

  export type RankingMaxAggregateInputType = {
    id?: true
    dinozCount?: true
    points?: true
    average?: true
    completion?: true
    dojo?: true
    userId?: true
  }

  export type RankingCountAggregateInputType = {
    id?: true
    dinozCount?: true
    points?: true
    average?: true
    completion?: true
    dojo?: true
    userId?: true
    _all?: true
  }

  export type RankingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Ranking to aggregate.
     */
    where?: RankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rankings to fetch.
     */
    orderBy?: RankingOrderByWithRelationInput | RankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: RankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Rankings
    **/
    _count?: true | RankingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: RankingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: RankingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: RankingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: RankingMaxAggregateInputType
  }

  export type GetRankingAggregateType<T extends RankingAggregateArgs> = {
        [P in keyof T & keyof AggregateRanking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateRanking[P]>
      : GetScalarType<T[P], AggregateRanking[P]>
  }




  export type RankingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: RankingWhereInput
    orderBy?: RankingOrderByWithAggregationInput | RankingOrderByWithAggregationInput[]
    by: RankingScalarFieldEnum[] | RankingScalarFieldEnum
    having?: RankingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: RankingCountAggregateInputType | true
    _avg?: RankingAvgAggregateInputType
    _sum?: RankingSumAggregateInputType
    _min?: RankingMinAggregateInputType
    _max?: RankingMaxAggregateInputType
  }

  export type RankingGroupByOutputType = {
    id: number
    dinozCount: number
    points: number
    average: number
    completion: number
    dojo: number
    userId: string
    _count: RankingCountAggregateOutputType | null
    _avg: RankingAvgAggregateOutputType | null
    _sum: RankingSumAggregateOutputType | null
    _min: RankingMinAggregateOutputType | null
    _max: RankingMaxAggregateOutputType | null
  }

  type GetRankingGroupByPayload<T extends RankingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<RankingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof RankingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], RankingGroupByOutputType[P]>
            : GetScalarType<T[P], RankingGroupByOutputType[P]>
        }
      >
    >


  export type RankingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dinozCount?: boolean
    points?: boolean
    average?: boolean
    completion?: boolean
    dojo?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ranking"]>

  export type RankingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dinozCount?: boolean
    points?: boolean
    average?: boolean
    completion?: boolean
    dojo?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ranking"]>

  export type RankingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    dinozCount?: boolean
    points?: boolean
    average?: boolean
    completion?: boolean
    dojo?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["ranking"]>

  export type RankingSelectScalar = {
    id?: boolean
    dinozCount?: boolean
    points?: boolean
    average?: boolean
    completion?: boolean
    dojo?: boolean
    userId?: boolean
  }

  export type RankingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "dinozCount" | "points" | "average" | "completion" | "dojo" | "userId", ExtArgs["result"]["ranking"]>
  export type RankingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RankingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type RankingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $RankingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "Ranking"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      dinozCount: number
      points: number
      average: number
      completion: number
      dojo: number
      userId: string
    }, ExtArgs["result"]["ranking"]>
    composites: {}
  }

  type RankingGetPayload<S extends boolean | null | undefined | RankingDefaultArgs> = $Result.GetResult<Prisma.$RankingPayload, S>

  type RankingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<RankingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: RankingCountAggregateInputType | true
    }

  export interface RankingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['Ranking'], meta: { name: 'Ranking' } }
    /**
     * Find zero or one Ranking that matches the filter.
     * @param {RankingFindUniqueArgs} args - Arguments to find a Ranking
     * @example
     * // Get one Ranking
     * const ranking = await prisma.ranking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends RankingFindUniqueArgs>(args: SelectSubset<T, RankingFindUniqueArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one Ranking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {RankingFindUniqueOrThrowArgs} args - Arguments to find a Ranking
     * @example
     * // Get one Ranking
     * const ranking = await prisma.ranking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends RankingFindUniqueOrThrowArgs>(args: SelectSubset<T, RankingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ranking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingFindFirstArgs} args - Arguments to find a Ranking
     * @example
     * // Get one Ranking
     * const ranking = await prisma.ranking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends RankingFindFirstArgs>(args?: SelectSubset<T, RankingFindFirstArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first Ranking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingFindFirstOrThrowArgs} args - Arguments to find a Ranking
     * @example
     * // Get one Ranking
     * const ranking = await prisma.ranking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends RankingFindFirstOrThrowArgs>(args?: SelectSubset<T, RankingFindFirstOrThrowArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Rankings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Rankings
     * const rankings = await prisma.ranking.findMany()
     * 
     * // Get first 10 Rankings
     * const rankings = await prisma.ranking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const rankingWithIdOnly = await prisma.ranking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends RankingFindManyArgs>(args?: SelectSubset<T, RankingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a Ranking.
     * @param {RankingCreateArgs} args - Arguments to create a Ranking.
     * @example
     * // Create one Ranking
     * const Ranking = await prisma.ranking.create({
     *   data: {
     *     // ... data to create a Ranking
     *   }
     * })
     * 
     */
    create<T extends RankingCreateArgs>(args: SelectSubset<T, RankingCreateArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Rankings.
     * @param {RankingCreateManyArgs} args - Arguments to create many Rankings.
     * @example
     * // Create many Rankings
     * const ranking = await prisma.ranking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends RankingCreateManyArgs>(args?: SelectSubset<T, RankingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Rankings and returns the data saved in the database.
     * @param {RankingCreateManyAndReturnArgs} args - Arguments to create many Rankings.
     * @example
     * // Create many Rankings
     * const ranking = await prisma.ranking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Rankings and only return the `id`
     * const rankingWithIdOnly = await prisma.ranking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends RankingCreateManyAndReturnArgs>(args?: SelectSubset<T, RankingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a Ranking.
     * @param {RankingDeleteArgs} args - Arguments to delete one Ranking.
     * @example
     * // Delete one Ranking
     * const Ranking = await prisma.ranking.delete({
     *   where: {
     *     // ... filter to delete one Ranking
     *   }
     * })
     * 
     */
    delete<T extends RankingDeleteArgs>(args: SelectSubset<T, RankingDeleteArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one Ranking.
     * @param {RankingUpdateArgs} args - Arguments to update one Ranking.
     * @example
     * // Update one Ranking
     * const ranking = await prisma.ranking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends RankingUpdateArgs>(args: SelectSubset<T, RankingUpdateArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Rankings.
     * @param {RankingDeleteManyArgs} args - Arguments to filter Rankings to delete.
     * @example
     * // Delete a few Rankings
     * const { count } = await prisma.ranking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends RankingDeleteManyArgs>(args?: SelectSubset<T, RankingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Rankings
     * const ranking = await prisma.ranking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends RankingUpdateManyArgs>(args: SelectSubset<T, RankingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Rankings and returns the data updated in the database.
     * @param {RankingUpdateManyAndReturnArgs} args - Arguments to update many Rankings.
     * @example
     * // Update many Rankings
     * const ranking = await prisma.ranking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Rankings and only return the `id`
     * const rankingWithIdOnly = await prisma.ranking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends RankingUpdateManyAndReturnArgs>(args: SelectSubset<T, RankingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one Ranking.
     * @param {RankingUpsertArgs} args - Arguments to update or create a Ranking.
     * @example
     * // Update or create a Ranking
     * const ranking = await prisma.ranking.upsert({
     *   create: {
     *     // ... data to create a Ranking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the Ranking we want to update
     *   }
     * })
     */
    upsert<T extends RankingUpsertArgs>(args: SelectSubset<T, RankingUpsertArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Rankings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingCountArgs} args - Arguments to filter Rankings to count.
     * @example
     * // Count the number of Rankings
     * const count = await prisma.ranking.count({
     *   where: {
     *     // ... the filter for the Rankings we want to count
     *   }
     * })
    **/
    count<T extends RankingCountArgs>(
      args?: Subset<T, RankingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], RankingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a Ranking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends RankingAggregateArgs>(args: Subset<T, RankingAggregateArgs>): Prisma.PrismaPromise<GetRankingAggregateType<T>>

    /**
     * Group by Ranking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {RankingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends RankingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: RankingGroupByArgs['orderBy'] }
        : { orderBy?: RankingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, RankingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRankingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the Ranking model
   */
  readonly fields: RankingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for Ranking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__RankingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the Ranking model
   */
  interface RankingFieldRefs {
    readonly id: FieldRef<"Ranking", 'Int'>
    readonly dinozCount: FieldRef<"Ranking", 'Int'>
    readonly points: FieldRef<"Ranking", 'Int'>
    readonly average: FieldRef<"Ranking", 'Int'>
    readonly completion: FieldRef<"Ranking", 'Int'>
    readonly dojo: FieldRef<"Ranking", 'Int'>
    readonly userId: FieldRef<"Ranking", 'String'>
  }
    

  // Custom InputTypes
  /**
   * Ranking findUnique
   */
  export type RankingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * Filter, which Ranking to fetch.
     */
    where: RankingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking findUniqueOrThrow
   */
  export type RankingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * Filter, which Ranking to fetch.
     */
    where: RankingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking findFirst
   */
  export type RankingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * Filter, which Ranking to fetch.
     */
    where?: RankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rankings to fetch.
     */
    orderBy?: RankingOrderByWithRelationInput | RankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rankings.
     */
    cursor?: RankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rankings.
     */
    distinct?: RankingScalarFieldEnum | RankingScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking findFirstOrThrow
   */
  export type RankingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * Filter, which Ranking to fetch.
     */
    where?: RankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rankings to fetch.
     */
    orderBy?: RankingOrderByWithRelationInput | RankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Rankings.
     */
    cursor?: RankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rankings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Rankings.
     */
    distinct?: RankingScalarFieldEnum | RankingScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking findMany
   */
  export type RankingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * Filter, which Rankings to fetch.
     */
    where?: RankingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Rankings to fetch.
     */
    orderBy?: RankingOrderByWithRelationInput | RankingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Rankings.
     */
    cursor?: RankingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Rankings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Rankings.
     */
    skip?: number
    distinct?: RankingScalarFieldEnum | RankingScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking create
   */
  export type RankingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * The data needed to create a Ranking.
     */
    data: XOR<RankingCreateInput, RankingUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking createMany
   */
  export type RankingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Rankings.
     */
    data: RankingCreateManyInput | RankingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * Ranking createManyAndReturn
   */
  export type RankingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * The data used to create many Rankings.
     */
    data: RankingCreateManyInput | RankingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ranking update
   */
  export type RankingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * The data needed to update a Ranking.
     */
    data: XOR<RankingUpdateInput, RankingUncheckedUpdateInput>
    /**
     * Choose, which Ranking to update.
     */
    where: RankingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking updateMany
   */
  export type RankingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Rankings.
     */
    data: XOR<RankingUpdateManyMutationInput, RankingUncheckedUpdateManyInput>
    /**
     * Filter which Rankings to update
     */
    where?: RankingWhereInput
    /**
     * Limit how many Rankings to update.
     */
    limit?: number
  }

  /**
   * Ranking updateManyAndReturn
   */
  export type RankingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * The data used to update Rankings.
     */
    data: XOR<RankingUpdateManyMutationInput, RankingUncheckedUpdateManyInput>
    /**
     * Filter which Rankings to update
     */
    where?: RankingWhereInput
    /**
     * Limit how many Rankings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * Ranking upsert
   */
  export type RankingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * The filter to search for the Ranking to update in case it exists.
     */
    where: RankingWhereUniqueInput
    /**
     * In case the Ranking found by the `where` argument doesn't exist, create a new Ranking with this data.
     */
    create: XOR<RankingCreateInput, RankingUncheckedCreateInput>
    /**
     * In case the Ranking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<RankingUpdateInput, RankingUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking delete
   */
  export type RankingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    /**
     * Filter which Ranking to delete.
     */
    where: RankingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * Ranking deleteMany
   */
  export type RankingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Rankings to delete
     */
    where?: RankingWhereInput
    /**
     * Limit how many Rankings to delete.
     */
    limit?: number
  }

  /**
   * Ranking without action
   */
  export type RankingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
  }


  /**
   * Model SignupDeviceMonthCounter
   */

  export type AggregateSignupDeviceMonthCounter = {
    _count: SignupDeviceMonthCounterCountAggregateOutputType | null
    _avg: SignupDeviceMonthCounterAvgAggregateOutputType | null
    _sum: SignupDeviceMonthCounterSumAggregateOutputType | null
    _min: SignupDeviceMonthCounterMinAggregateOutputType | null
    _max: SignupDeviceMonthCounterMaxAggregateOutputType | null
  }

  export type SignupDeviceMonthCounterAvgAggregateOutputType = {
    id: number | null
    count: number | null
  }

  export type SignupDeviceMonthCounterSumAggregateOutputType = {
    id: number | null
    count: number | null
  }

  export type SignupDeviceMonthCounterMinAggregateOutputType = {
    id: number | null
    monthKey: string | null
    deviceToken: string | null
    count: number | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignupDeviceMonthCounterMaxAggregateOutputType = {
    id: number | null
    monthKey: string | null
    deviceToken: string | null
    count: number | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignupDeviceMonthCounterCountAggregateOutputType = {
    id: number
    monthKey: number
    deviceToken: number
    count: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SignupDeviceMonthCounterAvgAggregateInputType = {
    id?: true
    count?: true
  }

  export type SignupDeviceMonthCounterSumAggregateInputType = {
    id?: true
    count?: true
  }

  export type SignupDeviceMonthCounterMinAggregateInputType = {
    id?: true
    monthKey?: true
    deviceToken?: true
    count?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignupDeviceMonthCounterMaxAggregateInputType = {
    id?: true
    monthKey?: true
    deviceToken?: true
    count?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignupDeviceMonthCounterCountAggregateInputType = {
    id?: true
    monthKey?: true
    deviceToken?: true
    count?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SignupDeviceMonthCounterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignupDeviceMonthCounter to aggregate.
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupDeviceMonthCounters to fetch.
     */
    orderBy?: SignupDeviceMonthCounterOrderByWithRelationInput | SignupDeviceMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignupDeviceMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupDeviceMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupDeviceMonthCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SignupDeviceMonthCounters
    **/
    _count?: true | SignupDeviceMonthCounterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SignupDeviceMonthCounterAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SignupDeviceMonthCounterSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignupDeviceMonthCounterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignupDeviceMonthCounterMaxAggregateInputType
  }

  export type GetSignupDeviceMonthCounterAggregateType<T extends SignupDeviceMonthCounterAggregateArgs> = {
        [P in keyof T & keyof AggregateSignupDeviceMonthCounter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignupDeviceMonthCounter[P]>
      : GetScalarType<T[P], AggregateSignupDeviceMonthCounter[P]>
  }




  export type SignupDeviceMonthCounterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignupDeviceMonthCounterWhereInput
    orderBy?: SignupDeviceMonthCounterOrderByWithAggregationInput | SignupDeviceMonthCounterOrderByWithAggregationInput[]
    by: SignupDeviceMonthCounterScalarFieldEnum[] | SignupDeviceMonthCounterScalarFieldEnum
    having?: SignupDeviceMonthCounterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignupDeviceMonthCounterCountAggregateInputType | true
    _avg?: SignupDeviceMonthCounterAvgAggregateInputType
    _sum?: SignupDeviceMonthCounterSumAggregateInputType
    _min?: SignupDeviceMonthCounterMinAggregateInputType
    _max?: SignupDeviceMonthCounterMaxAggregateInputType
  }

  export type SignupDeviceMonthCounterGroupByOutputType = {
    id: number
    monthKey: string
    deviceToken: string
    count: number
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: SignupDeviceMonthCounterCountAggregateOutputType | null
    _avg: SignupDeviceMonthCounterAvgAggregateOutputType | null
    _sum: SignupDeviceMonthCounterSumAggregateOutputType | null
    _min: SignupDeviceMonthCounterMinAggregateOutputType | null
    _max: SignupDeviceMonthCounterMaxAggregateOutputType | null
  }

  type GetSignupDeviceMonthCounterGroupByPayload<T extends SignupDeviceMonthCounterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignupDeviceMonthCounterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignupDeviceMonthCounterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignupDeviceMonthCounterGroupByOutputType[P]>
            : GetScalarType<T[P], SignupDeviceMonthCounterGroupByOutputType[P]>
        }
      >
    >


  export type SignupDeviceMonthCounterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monthKey?: boolean
    deviceToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupDeviceMonthCounter"]>

  export type SignupDeviceMonthCounterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monthKey?: boolean
    deviceToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupDeviceMonthCounter"]>

  export type SignupDeviceMonthCounterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monthKey?: boolean
    deviceToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupDeviceMonthCounter"]>

  export type SignupDeviceMonthCounterSelectScalar = {
    id?: boolean
    monthKey?: boolean
    deviceToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SignupDeviceMonthCounterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "monthKey" | "deviceToken" | "count" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["signupDeviceMonthCounter"]>

  export type $SignupDeviceMonthCounterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SignupDeviceMonthCounter"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      monthKey: string
      deviceToken: string
      count: number
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["signupDeviceMonthCounter"]>
    composites: {}
  }

  type SignupDeviceMonthCounterGetPayload<S extends boolean | null | undefined | SignupDeviceMonthCounterDefaultArgs> = $Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload, S>

  type SignupDeviceMonthCounterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignupDeviceMonthCounterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: SignupDeviceMonthCounterCountAggregateInputType | true
    }

  export interface SignupDeviceMonthCounterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SignupDeviceMonthCounter'], meta: { name: 'SignupDeviceMonthCounter' } }
    /**
     * Find zero or one SignupDeviceMonthCounter that matches the filter.
     * @param {SignupDeviceMonthCounterFindUniqueArgs} args - Arguments to find a SignupDeviceMonthCounter
     * @example
     * // Get one SignupDeviceMonthCounter
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignupDeviceMonthCounterFindUniqueArgs>(args: SelectSubset<T, SignupDeviceMonthCounterFindUniqueArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SignupDeviceMonthCounter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignupDeviceMonthCounterFindUniqueOrThrowArgs} args - Arguments to find a SignupDeviceMonthCounter
     * @example
     * // Get one SignupDeviceMonthCounter
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignupDeviceMonthCounterFindUniqueOrThrowArgs>(args: SelectSubset<T, SignupDeviceMonthCounterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignupDeviceMonthCounter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterFindFirstArgs} args - Arguments to find a SignupDeviceMonthCounter
     * @example
     * // Get one SignupDeviceMonthCounter
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignupDeviceMonthCounterFindFirstArgs>(args?: SelectSubset<T, SignupDeviceMonthCounterFindFirstArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignupDeviceMonthCounter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterFindFirstOrThrowArgs} args - Arguments to find a SignupDeviceMonthCounter
     * @example
     * // Get one SignupDeviceMonthCounter
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignupDeviceMonthCounterFindFirstOrThrowArgs>(args?: SelectSubset<T, SignupDeviceMonthCounterFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SignupDeviceMonthCounters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SignupDeviceMonthCounters
     * const signupDeviceMonthCounters = await prisma.signupDeviceMonthCounter.findMany()
     * 
     * // Get first 10 SignupDeviceMonthCounters
     * const signupDeviceMonthCounters = await prisma.signupDeviceMonthCounter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signupDeviceMonthCounterWithIdOnly = await prisma.signupDeviceMonthCounter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignupDeviceMonthCounterFindManyArgs>(args?: SelectSubset<T, SignupDeviceMonthCounterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SignupDeviceMonthCounter.
     * @param {SignupDeviceMonthCounterCreateArgs} args - Arguments to create a SignupDeviceMonthCounter.
     * @example
     * // Create one SignupDeviceMonthCounter
     * const SignupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.create({
     *   data: {
     *     // ... data to create a SignupDeviceMonthCounter
     *   }
     * })
     * 
     */
    create<T extends SignupDeviceMonthCounterCreateArgs>(args: SelectSubset<T, SignupDeviceMonthCounterCreateArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SignupDeviceMonthCounters.
     * @param {SignupDeviceMonthCounterCreateManyArgs} args - Arguments to create many SignupDeviceMonthCounters.
     * @example
     * // Create many SignupDeviceMonthCounters
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignupDeviceMonthCounterCreateManyArgs>(args?: SelectSubset<T, SignupDeviceMonthCounterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SignupDeviceMonthCounters and returns the data saved in the database.
     * @param {SignupDeviceMonthCounterCreateManyAndReturnArgs} args - Arguments to create many SignupDeviceMonthCounters.
     * @example
     * // Create many SignupDeviceMonthCounters
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SignupDeviceMonthCounters and only return the `id`
     * const signupDeviceMonthCounterWithIdOnly = await prisma.signupDeviceMonthCounter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignupDeviceMonthCounterCreateManyAndReturnArgs>(args?: SelectSubset<T, SignupDeviceMonthCounterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SignupDeviceMonthCounter.
     * @param {SignupDeviceMonthCounterDeleteArgs} args - Arguments to delete one SignupDeviceMonthCounter.
     * @example
     * // Delete one SignupDeviceMonthCounter
     * const SignupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.delete({
     *   where: {
     *     // ... filter to delete one SignupDeviceMonthCounter
     *   }
     * })
     * 
     */
    delete<T extends SignupDeviceMonthCounterDeleteArgs>(args: SelectSubset<T, SignupDeviceMonthCounterDeleteArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SignupDeviceMonthCounter.
     * @param {SignupDeviceMonthCounterUpdateArgs} args - Arguments to update one SignupDeviceMonthCounter.
     * @example
     * // Update one SignupDeviceMonthCounter
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignupDeviceMonthCounterUpdateArgs>(args: SelectSubset<T, SignupDeviceMonthCounterUpdateArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SignupDeviceMonthCounters.
     * @param {SignupDeviceMonthCounterDeleteManyArgs} args - Arguments to filter SignupDeviceMonthCounters to delete.
     * @example
     * // Delete a few SignupDeviceMonthCounters
     * const { count } = await prisma.signupDeviceMonthCounter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignupDeviceMonthCounterDeleteManyArgs>(args?: SelectSubset<T, SignupDeviceMonthCounterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignupDeviceMonthCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SignupDeviceMonthCounters
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignupDeviceMonthCounterUpdateManyArgs>(args: SelectSubset<T, SignupDeviceMonthCounterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignupDeviceMonthCounters and returns the data updated in the database.
     * @param {SignupDeviceMonthCounterUpdateManyAndReturnArgs} args - Arguments to update many SignupDeviceMonthCounters.
     * @example
     * // Update many SignupDeviceMonthCounters
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SignupDeviceMonthCounters and only return the `id`
     * const signupDeviceMonthCounterWithIdOnly = await prisma.signupDeviceMonthCounter.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignupDeviceMonthCounterUpdateManyAndReturnArgs>(args: SelectSubset<T, SignupDeviceMonthCounterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SignupDeviceMonthCounter.
     * @param {SignupDeviceMonthCounterUpsertArgs} args - Arguments to update or create a SignupDeviceMonthCounter.
     * @example
     * // Update or create a SignupDeviceMonthCounter
     * const signupDeviceMonthCounter = await prisma.signupDeviceMonthCounter.upsert({
     *   create: {
     *     // ... data to create a SignupDeviceMonthCounter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SignupDeviceMonthCounter we want to update
     *   }
     * })
     */
    upsert<T extends SignupDeviceMonthCounterUpsertArgs>(args: SelectSubset<T, SignupDeviceMonthCounterUpsertArgs<ExtArgs>>): Prisma__SignupDeviceMonthCounterClient<$Result.GetResult<Prisma.$SignupDeviceMonthCounterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SignupDeviceMonthCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterCountArgs} args - Arguments to filter SignupDeviceMonthCounters to count.
     * @example
     * // Count the number of SignupDeviceMonthCounters
     * const count = await prisma.signupDeviceMonthCounter.count({
     *   where: {
     *     // ... the filter for the SignupDeviceMonthCounters we want to count
     *   }
     * })
    **/
    count<T extends SignupDeviceMonthCounterCountArgs>(
      args?: Subset<T, SignupDeviceMonthCounterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignupDeviceMonthCounterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SignupDeviceMonthCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignupDeviceMonthCounterAggregateArgs>(args: Subset<T, SignupDeviceMonthCounterAggregateArgs>): Prisma.PrismaPromise<GetSignupDeviceMonthCounterAggregateType<T>>

    /**
     * Group by SignupDeviceMonthCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupDeviceMonthCounterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignupDeviceMonthCounterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignupDeviceMonthCounterGroupByArgs['orderBy'] }
        : { orderBy?: SignupDeviceMonthCounterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignupDeviceMonthCounterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignupDeviceMonthCounterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SignupDeviceMonthCounter model
   */
  readonly fields: SignupDeviceMonthCounterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SignupDeviceMonthCounter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignupDeviceMonthCounterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SignupDeviceMonthCounter model
   */
  interface SignupDeviceMonthCounterFieldRefs {
    readonly id: FieldRef<"SignupDeviceMonthCounter", 'Int'>
    readonly monthKey: FieldRef<"SignupDeviceMonthCounter", 'String'>
    readonly deviceToken: FieldRef<"SignupDeviceMonthCounter", 'String'>
    readonly count: FieldRef<"SignupDeviceMonthCounter", 'Int'>
    readonly expiresAt: FieldRef<"SignupDeviceMonthCounter", 'DateTime'>
    readonly createdAt: FieldRef<"SignupDeviceMonthCounter", 'DateTime'>
    readonly updatedAt: FieldRef<"SignupDeviceMonthCounter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SignupDeviceMonthCounter findUnique
   */
  export type SignupDeviceMonthCounterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupDeviceMonthCounter to fetch.
     */
    where: SignupDeviceMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter findUniqueOrThrow
   */
  export type SignupDeviceMonthCounterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupDeviceMonthCounter to fetch.
     */
    where: SignupDeviceMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter findFirst
   */
  export type SignupDeviceMonthCounterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupDeviceMonthCounter to fetch.
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupDeviceMonthCounters to fetch.
     */
    orderBy?: SignupDeviceMonthCounterOrderByWithRelationInput | SignupDeviceMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignupDeviceMonthCounters.
     */
    cursor?: SignupDeviceMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupDeviceMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupDeviceMonthCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignupDeviceMonthCounters.
     */
    distinct?: SignupDeviceMonthCounterScalarFieldEnum | SignupDeviceMonthCounterScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter findFirstOrThrow
   */
  export type SignupDeviceMonthCounterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupDeviceMonthCounter to fetch.
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupDeviceMonthCounters to fetch.
     */
    orderBy?: SignupDeviceMonthCounterOrderByWithRelationInput | SignupDeviceMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignupDeviceMonthCounters.
     */
    cursor?: SignupDeviceMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupDeviceMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupDeviceMonthCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignupDeviceMonthCounters.
     */
    distinct?: SignupDeviceMonthCounterScalarFieldEnum | SignupDeviceMonthCounterScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter findMany
   */
  export type SignupDeviceMonthCounterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupDeviceMonthCounters to fetch.
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupDeviceMonthCounters to fetch.
     */
    orderBy?: SignupDeviceMonthCounterOrderByWithRelationInput | SignupDeviceMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SignupDeviceMonthCounters.
     */
    cursor?: SignupDeviceMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupDeviceMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupDeviceMonthCounters.
     */
    skip?: number
    distinct?: SignupDeviceMonthCounterScalarFieldEnum | SignupDeviceMonthCounterScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter create
   */
  export type SignupDeviceMonthCounterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * The data needed to create a SignupDeviceMonthCounter.
     */
    data: XOR<SignupDeviceMonthCounterCreateInput, SignupDeviceMonthCounterUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter createMany
   */
  export type SignupDeviceMonthCounterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SignupDeviceMonthCounters.
     */
    data: SignupDeviceMonthCounterCreateManyInput | SignupDeviceMonthCounterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SignupDeviceMonthCounter createManyAndReturn
   */
  export type SignupDeviceMonthCounterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * The data used to create many SignupDeviceMonthCounters.
     */
    data: SignupDeviceMonthCounterCreateManyInput | SignupDeviceMonthCounterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SignupDeviceMonthCounter update
   */
  export type SignupDeviceMonthCounterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * The data needed to update a SignupDeviceMonthCounter.
     */
    data: XOR<SignupDeviceMonthCounterUpdateInput, SignupDeviceMonthCounterUncheckedUpdateInput>
    /**
     * Choose, which SignupDeviceMonthCounter to update.
     */
    where: SignupDeviceMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter updateMany
   */
  export type SignupDeviceMonthCounterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SignupDeviceMonthCounters.
     */
    data: XOR<SignupDeviceMonthCounterUpdateManyMutationInput, SignupDeviceMonthCounterUncheckedUpdateManyInput>
    /**
     * Filter which SignupDeviceMonthCounters to update
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * Limit how many SignupDeviceMonthCounters to update.
     */
    limit?: number
  }

  /**
   * SignupDeviceMonthCounter updateManyAndReturn
   */
  export type SignupDeviceMonthCounterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * The data used to update SignupDeviceMonthCounters.
     */
    data: XOR<SignupDeviceMonthCounterUpdateManyMutationInput, SignupDeviceMonthCounterUncheckedUpdateManyInput>
    /**
     * Filter which SignupDeviceMonthCounters to update
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * Limit how many SignupDeviceMonthCounters to update.
     */
    limit?: number
  }

  /**
   * SignupDeviceMonthCounter upsert
   */
  export type SignupDeviceMonthCounterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * The filter to search for the SignupDeviceMonthCounter to update in case it exists.
     */
    where: SignupDeviceMonthCounterWhereUniqueInput
    /**
     * In case the SignupDeviceMonthCounter found by the `where` argument doesn't exist, create a new SignupDeviceMonthCounter with this data.
     */
    create: XOR<SignupDeviceMonthCounterCreateInput, SignupDeviceMonthCounterUncheckedCreateInput>
    /**
     * In case the SignupDeviceMonthCounter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignupDeviceMonthCounterUpdateInput, SignupDeviceMonthCounterUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter delete
   */
  export type SignupDeviceMonthCounterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
    /**
     * Filter which SignupDeviceMonthCounter to delete.
     */
    where: SignupDeviceMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupDeviceMonthCounter deleteMany
   */
  export type SignupDeviceMonthCounterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignupDeviceMonthCounters to delete
     */
    where?: SignupDeviceMonthCounterWhereInput
    /**
     * Limit how many SignupDeviceMonthCounters to delete.
     */
    limit?: number
  }

  /**
   * SignupDeviceMonthCounter without action
   */
  export type SignupDeviceMonthCounterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupDeviceMonthCounter
     */
    select?: SignupDeviceMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupDeviceMonthCounter
     */
    omit?: SignupDeviceMonthCounterOmit<ExtArgs> | null
  }


  /**
   * Model SignupIpMonthCounter
   */

  export type AggregateSignupIpMonthCounter = {
    _count: SignupIpMonthCounterCountAggregateOutputType | null
    _avg: SignupIpMonthCounterAvgAggregateOutputType | null
    _sum: SignupIpMonthCounterSumAggregateOutputType | null
    _min: SignupIpMonthCounterMinAggregateOutputType | null
    _max: SignupIpMonthCounterMaxAggregateOutputType | null
  }

  export type SignupIpMonthCounterAvgAggregateOutputType = {
    id: number | null
    count: number | null
  }

  export type SignupIpMonthCounterSumAggregateOutputType = {
    id: number | null
    count: number | null
  }

  export type SignupIpMonthCounterMinAggregateOutputType = {
    id: number | null
    monthKey: string | null
    ipToken: string | null
    count: number | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignupIpMonthCounterMaxAggregateOutputType = {
    id: number | null
    monthKey: string | null
    ipToken: string | null
    count: number | null
    expiresAt: Date | null
    createdAt: Date | null
    updatedAt: Date | null
  }

  export type SignupIpMonthCounterCountAggregateOutputType = {
    id: number
    monthKey: number
    ipToken: number
    count: number
    expiresAt: number
    createdAt: number
    updatedAt: number
    _all: number
  }


  export type SignupIpMonthCounterAvgAggregateInputType = {
    id?: true
    count?: true
  }

  export type SignupIpMonthCounterSumAggregateInputType = {
    id?: true
    count?: true
  }

  export type SignupIpMonthCounterMinAggregateInputType = {
    id?: true
    monthKey?: true
    ipToken?: true
    count?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignupIpMonthCounterMaxAggregateInputType = {
    id?: true
    monthKey?: true
    ipToken?: true
    count?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
  }

  export type SignupIpMonthCounterCountAggregateInputType = {
    id?: true
    monthKey?: true
    ipToken?: true
    count?: true
    expiresAt?: true
    createdAt?: true
    updatedAt?: true
    _all?: true
  }

  export type SignupIpMonthCounterAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignupIpMonthCounter to aggregate.
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupIpMonthCounters to fetch.
     */
    orderBy?: SignupIpMonthCounterOrderByWithRelationInput | SignupIpMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: SignupIpMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupIpMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupIpMonthCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned SignupIpMonthCounters
    **/
    _count?: true | SignupIpMonthCounterCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: SignupIpMonthCounterAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: SignupIpMonthCounterSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: SignupIpMonthCounterMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: SignupIpMonthCounterMaxAggregateInputType
  }

  export type GetSignupIpMonthCounterAggregateType<T extends SignupIpMonthCounterAggregateArgs> = {
        [P in keyof T & keyof AggregateSignupIpMonthCounter]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateSignupIpMonthCounter[P]>
      : GetScalarType<T[P], AggregateSignupIpMonthCounter[P]>
  }




  export type SignupIpMonthCounterGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: SignupIpMonthCounterWhereInput
    orderBy?: SignupIpMonthCounterOrderByWithAggregationInput | SignupIpMonthCounterOrderByWithAggregationInput[]
    by: SignupIpMonthCounterScalarFieldEnum[] | SignupIpMonthCounterScalarFieldEnum
    having?: SignupIpMonthCounterScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: SignupIpMonthCounterCountAggregateInputType | true
    _avg?: SignupIpMonthCounterAvgAggregateInputType
    _sum?: SignupIpMonthCounterSumAggregateInputType
    _min?: SignupIpMonthCounterMinAggregateInputType
    _max?: SignupIpMonthCounterMaxAggregateInputType
  }

  export type SignupIpMonthCounterGroupByOutputType = {
    id: number
    monthKey: string
    ipToken: string
    count: number
    expiresAt: Date
    createdAt: Date
    updatedAt: Date
    _count: SignupIpMonthCounterCountAggregateOutputType | null
    _avg: SignupIpMonthCounterAvgAggregateOutputType | null
    _sum: SignupIpMonthCounterSumAggregateOutputType | null
    _min: SignupIpMonthCounterMinAggregateOutputType | null
    _max: SignupIpMonthCounterMaxAggregateOutputType | null
  }

  type GetSignupIpMonthCounterGroupByPayload<T extends SignupIpMonthCounterGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<SignupIpMonthCounterGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof SignupIpMonthCounterGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], SignupIpMonthCounterGroupByOutputType[P]>
            : GetScalarType<T[P], SignupIpMonthCounterGroupByOutputType[P]>
        }
      >
    >


  export type SignupIpMonthCounterSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monthKey?: boolean
    ipToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupIpMonthCounter"]>

  export type SignupIpMonthCounterSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monthKey?: boolean
    ipToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupIpMonthCounter"]>

  export type SignupIpMonthCounterSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    monthKey?: boolean
    ipToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }, ExtArgs["result"]["signupIpMonthCounter"]>

  export type SignupIpMonthCounterSelectScalar = {
    id?: boolean
    monthKey?: boolean
    ipToken?: boolean
    count?: boolean
    expiresAt?: boolean
    createdAt?: boolean
    updatedAt?: boolean
  }

  export type SignupIpMonthCounterOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "monthKey" | "ipToken" | "count" | "expiresAt" | "createdAt" | "updatedAt", ExtArgs["result"]["signupIpMonthCounter"]>

  export type $SignupIpMonthCounterPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "SignupIpMonthCounter"
    objects: {}
    scalars: $Extensions.GetPayloadResult<{
      id: number
      monthKey: string
      ipToken: string
      count: number
      expiresAt: Date
      createdAt: Date
      updatedAt: Date
    }, ExtArgs["result"]["signupIpMonthCounter"]>
    composites: {}
  }

  type SignupIpMonthCounterGetPayload<S extends boolean | null | undefined | SignupIpMonthCounterDefaultArgs> = $Result.GetResult<Prisma.$SignupIpMonthCounterPayload, S>

  type SignupIpMonthCounterCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<SignupIpMonthCounterFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: SignupIpMonthCounterCountAggregateInputType | true
    }

  export interface SignupIpMonthCounterDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['SignupIpMonthCounter'], meta: { name: 'SignupIpMonthCounter' } }
    /**
     * Find zero or one SignupIpMonthCounter that matches the filter.
     * @param {SignupIpMonthCounterFindUniqueArgs} args - Arguments to find a SignupIpMonthCounter
     * @example
     * // Get one SignupIpMonthCounter
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends SignupIpMonthCounterFindUniqueArgs>(args: SelectSubset<T, SignupIpMonthCounterFindUniqueArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one SignupIpMonthCounter that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {SignupIpMonthCounterFindUniqueOrThrowArgs} args - Arguments to find a SignupIpMonthCounter
     * @example
     * // Get one SignupIpMonthCounter
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends SignupIpMonthCounterFindUniqueOrThrowArgs>(args: SelectSubset<T, SignupIpMonthCounterFindUniqueOrThrowArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignupIpMonthCounter that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterFindFirstArgs} args - Arguments to find a SignupIpMonthCounter
     * @example
     * // Get one SignupIpMonthCounter
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends SignupIpMonthCounterFindFirstArgs>(args?: SelectSubset<T, SignupIpMonthCounterFindFirstArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first SignupIpMonthCounter that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterFindFirstOrThrowArgs} args - Arguments to find a SignupIpMonthCounter
     * @example
     * // Get one SignupIpMonthCounter
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends SignupIpMonthCounterFindFirstOrThrowArgs>(args?: SelectSubset<T, SignupIpMonthCounterFindFirstOrThrowArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more SignupIpMonthCounters that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all SignupIpMonthCounters
     * const signupIpMonthCounters = await prisma.signupIpMonthCounter.findMany()
     * 
     * // Get first 10 SignupIpMonthCounters
     * const signupIpMonthCounters = await prisma.signupIpMonthCounter.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const signupIpMonthCounterWithIdOnly = await prisma.signupIpMonthCounter.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends SignupIpMonthCounterFindManyArgs>(args?: SelectSubset<T, SignupIpMonthCounterFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a SignupIpMonthCounter.
     * @param {SignupIpMonthCounterCreateArgs} args - Arguments to create a SignupIpMonthCounter.
     * @example
     * // Create one SignupIpMonthCounter
     * const SignupIpMonthCounter = await prisma.signupIpMonthCounter.create({
     *   data: {
     *     // ... data to create a SignupIpMonthCounter
     *   }
     * })
     * 
     */
    create<T extends SignupIpMonthCounterCreateArgs>(args: SelectSubset<T, SignupIpMonthCounterCreateArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many SignupIpMonthCounters.
     * @param {SignupIpMonthCounterCreateManyArgs} args - Arguments to create many SignupIpMonthCounters.
     * @example
     * // Create many SignupIpMonthCounters
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends SignupIpMonthCounterCreateManyArgs>(args?: SelectSubset<T, SignupIpMonthCounterCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many SignupIpMonthCounters and returns the data saved in the database.
     * @param {SignupIpMonthCounterCreateManyAndReturnArgs} args - Arguments to create many SignupIpMonthCounters.
     * @example
     * // Create many SignupIpMonthCounters
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many SignupIpMonthCounters and only return the `id`
     * const signupIpMonthCounterWithIdOnly = await prisma.signupIpMonthCounter.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends SignupIpMonthCounterCreateManyAndReturnArgs>(args?: SelectSubset<T, SignupIpMonthCounterCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a SignupIpMonthCounter.
     * @param {SignupIpMonthCounterDeleteArgs} args - Arguments to delete one SignupIpMonthCounter.
     * @example
     * // Delete one SignupIpMonthCounter
     * const SignupIpMonthCounter = await prisma.signupIpMonthCounter.delete({
     *   where: {
     *     // ... filter to delete one SignupIpMonthCounter
     *   }
     * })
     * 
     */
    delete<T extends SignupIpMonthCounterDeleteArgs>(args: SelectSubset<T, SignupIpMonthCounterDeleteArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one SignupIpMonthCounter.
     * @param {SignupIpMonthCounterUpdateArgs} args - Arguments to update one SignupIpMonthCounter.
     * @example
     * // Update one SignupIpMonthCounter
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends SignupIpMonthCounterUpdateArgs>(args: SelectSubset<T, SignupIpMonthCounterUpdateArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more SignupIpMonthCounters.
     * @param {SignupIpMonthCounterDeleteManyArgs} args - Arguments to filter SignupIpMonthCounters to delete.
     * @example
     * // Delete a few SignupIpMonthCounters
     * const { count } = await prisma.signupIpMonthCounter.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends SignupIpMonthCounterDeleteManyArgs>(args?: SelectSubset<T, SignupIpMonthCounterDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignupIpMonthCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many SignupIpMonthCounters
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends SignupIpMonthCounterUpdateManyArgs>(args: SelectSubset<T, SignupIpMonthCounterUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more SignupIpMonthCounters and returns the data updated in the database.
     * @param {SignupIpMonthCounterUpdateManyAndReturnArgs} args - Arguments to update many SignupIpMonthCounters.
     * @example
     * // Update many SignupIpMonthCounters
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more SignupIpMonthCounters and only return the `id`
     * const signupIpMonthCounterWithIdOnly = await prisma.signupIpMonthCounter.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends SignupIpMonthCounterUpdateManyAndReturnArgs>(args: SelectSubset<T, SignupIpMonthCounterUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one SignupIpMonthCounter.
     * @param {SignupIpMonthCounterUpsertArgs} args - Arguments to update or create a SignupIpMonthCounter.
     * @example
     * // Update or create a SignupIpMonthCounter
     * const signupIpMonthCounter = await prisma.signupIpMonthCounter.upsert({
     *   create: {
     *     // ... data to create a SignupIpMonthCounter
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the SignupIpMonthCounter we want to update
     *   }
     * })
     */
    upsert<T extends SignupIpMonthCounterUpsertArgs>(args: SelectSubset<T, SignupIpMonthCounterUpsertArgs<ExtArgs>>): Prisma__SignupIpMonthCounterClient<$Result.GetResult<Prisma.$SignupIpMonthCounterPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of SignupIpMonthCounters.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterCountArgs} args - Arguments to filter SignupIpMonthCounters to count.
     * @example
     * // Count the number of SignupIpMonthCounters
     * const count = await prisma.signupIpMonthCounter.count({
     *   where: {
     *     // ... the filter for the SignupIpMonthCounters we want to count
     *   }
     * })
    **/
    count<T extends SignupIpMonthCounterCountArgs>(
      args?: Subset<T, SignupIpMonthCounterCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], SignupIpMonthCounterCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a SignupIpMonthCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends SignupIpMonthCounterAggregateArgs>(args: Subset<T, SignupIpMonthCounterAggregateArgs>): Prisma.PrismaPromise<GetSignupIpMonthCounterAggregateType<T>>

    /**
     * Group by SignupIpMonthCounter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {SignupIpMonthCounterGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends SignupIpMonthCounterGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: SignupIpMonthCounterGroupByArgs['orderBy'] }
        : { orderBy?: SignupIpMonthCounterGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, SignupIpMonthCounterGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSignupIpMonthCounterGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the SignupIpMonthCounter model
   */
  readonly fields: SignupIpMonthCounterFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for SignupIpMonthCounter.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__SignupIpMonthCounterClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the SignupIpMonthCounter model
   */
  interface SignupIpMonthCounterFieldRefs {
    readonly id: FieldRef<"SignupIpMonthCounter", 'Int'>
    readonly monthKey: FieldRef<"SignupIpMonthCounter", 'String'>
    readonly ipToken: FieldRef<"SignupIpMonthCounter", 'String'>
    readonly count: FieldRef<"SignupIpMonthCounter", 'Int'>
    readonly expiresAt: FieldRef<"SignupIpMonthCounter", 'DateTime'>
    readonly createdAt: FieldRef<"SignupIpMonthCounter", 'DateTime'>
    readonly updatedAt: FieldRef<"SignupIpMonthCounter", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * SignupIpMonthCounter findUnique
   */
  export type SignupIpMonthCounterFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupIpMonthCounter to fetch.
     */
    where: SignupIpMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter findUniqueOrThrow
   */
  export type SignupIpMonthCounterFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupIpMonthCounter to fetch.
     */
    where: SignupIpMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter findFirst
   */
  export type SignupIpMonthCounterFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupIpMonthCounter to fetch.
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupIpMonthCounters to fetch.
     */
    orderBy?: SignupIpMonthCounterOrderByWithRelationInput | SignupIpMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignupIpMonthCounters.
     */
    cursor?: SignupIpMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupIpMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupIpMonthCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignupIpMonthCounters.
     */
    distinct?: SignupIpMonthCounterScalarFieldEnum | SignupIpMonthCounterScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter findFirstOrThrow
   */
  export type SignupIpMonthCounterFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupIpMonthCounter to fetch.
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupIpMonthCounters to fetch.
     */
    orderBy?: SignupIpMonthCounterOrderByWithRelationInput | SignupIpMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for SignupIpMonthCounters.
     */
    cursor?: SignupIpMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupIpMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupIpMonthCounters.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of SignupIpMonthCounters.
     */
    distinct?: SignupIpMonthCounterScalarFieldEnum | SignupIpMonthCounterScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter findMany
   */
  export type SignupIpMonthCounterFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * Filter, which SignupIpMonthCounters to fetch.
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of SignupIpMonthCounters to fetch.
     */
    orderBy?: SignupIpMonthCounterOrderByWithRelationInput | SignupIpMonthCounterOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing SignupIpMonthCounters.
     */
    cursor?: SignupIpMonthCounterWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` SignupIpMonthCounters from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` SignupIpMonthCounters.
     */
    skip?: number
    distinct?: SignupIpMonthCounterScalarFieldEnum | SignupIpMonthCounterScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter create
   */
  export type SignupIpMonthCounterCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * The data needed to create a SignupIpMonthCounter.
     */
    data: XOR<SignupIpMonthCounterCreateInput, SignupIpMonthCounterUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter createMany
   */
  export type SignupIpMonthCounterCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many SignupIpMonthCounters.
     */
    data: SignupIpMonthCounterCreateManyInput | SignupIpMonthCounterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SignupIpMonthCounter createManyAndReturn
   */
  export type SignupIpMonthCounterCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * The data used to create many SignupIpMonthCounters.
     */
    data: SignupIpMonthCounterCreateManyInput | SignupIpMonthCounterCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * SignupIpMonthCounter update
   */
  export type SignupIpMonthCounterUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * The data needed to update a SignupIpMonthCounter.
     */
    data: XOR<SignupIpMonthCounterUpdateInput, SignupIpMonthCounterUncheckedUpdateInput>
    /**
     * Choose, which SignupIpMonthCounter to update.
     */
    where: SignupIpMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter updateMany
   */
  export type SignupIpMonthCounterUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update SignupIpMonthCounters.
     */
    data: XOR<SignupIpMonthCounterUpdateManyMutationInput, SignupIpMonthCounterUncheckedUpdateManyInput>
    /**
     * Filter which SignupIpMonthCounters to update
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * Limit how many SignupIpMonthCounters to update.
     */
    limit?: number
  }

  /**
   * SignupIpMonthCounter updateManyAndReturn
   */
  export type SignupIpMonthCounterUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * The data used to update SignupIpMonthCounters.
     */
    data: XOR<SignupIpMonthCounterUpdateManyMutationInput, SignupIpMonthCounterUncheckedUpdateManyInput>
    /**
     * Filter which SignupIpMonthCounters to update
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * Limit how many SignupIpMonthCounters to update.
     */
    limit?: number
  }

  /**
   * SignupIpMonthCounter upsert
   */
  export type SignupIpMonthCounterUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * The filter to search for the SignupIpMonthCounter to update in case it exists.
     */
    where: SignupIpMonthCounterWhereUniqueInput
    /**
     * In case the SignupIpMonthCounter found by the `where` argument doesn't exist, create a new SignupIpMonthCounter with this data.
     */
    create: XOR<SignupIpMonthCounterCreateInput, SignupIpMonthCounterUncheckedCreateInput>
    /**
     * In case the SignupIpMonthCounter was found with the provided `where` argument, update it with this data.
     */
    update: XOR<SignupIpMonthCounterUpdateInput, SignupIpMonthCounterUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter delete
   */
  export type SignupIpMonthCounterDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
    /**
     * Filter which SignupIpMonthCounter to delete.
     */
    where: SignupIpMonthCounterWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * SignupIpMonthCounter deleteMany
   */
  export type SignupIpMonthCounterDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which SignupIpMonthCounters to delete
     */
    where?: SignupIpMonthCounterWhereInput
    /**
     * Limit how many SignupIpMonthCounters to delete.
     */
    limit?: number
  }

  /**
   * SignupIpMonthCounter without action
   */
  export type SignupIpMonthCounterDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the SignupIpMonthCounter
     */
    select?: SignupIpMonthCounterSelect<ExtArgs> | null
    /**
     * Omit specific fields from the SignupIpMonthCounter
     */
    omit?: SignupIpMonthCounterOmit<ExtArgs> | null
  }


  /**
   * Model User
   */

  export type AggregateUser = {
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  export type UserMinAggregateOutputType = {
    id: string | null
    name: string | null
    password: string | null
    role: $Enums.Role | null
    createdDate: Date | null
    updatedAt: Date | null
    lastLogin: Date | null
  }

  export type UserMaxAggregateOutputType = {
    id: string | null
    name: string | null
    password: string | null
    role: $Enums.Role | null
    createdDate: Date | null
    updatedAt: Date | null
    lastLogin: Date | null
  }

  export type UserCountAggregateOutputType = {
    id: number
    name: number
    password: number
    role: number
    createdDate: number
    updatedAt: number
    lastLogin: number
    _all: number
  }


  export type UserMinAggregateInputType = {
    id?: true
    name?: true
    password?: true
    role?: true
    createdDate?: true
    updatedAt?: true
    lastLogin?: true
  }

  export type UserMaxAggregateInputType = {
    id?: true
    name?: true
    password?: true
    role?: true
    createdDate?: true
    updatedAt?: true
    lastLogin?: true
  }

  export type UserCountAggregateInputType = {
    id?: true
    name?: true
    password?: true
    role?: true
    createdDate?: true
    updatedAt?: true
    lastLogin?: true
    _all?: true
  }

  export type UserAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which User to aggregate.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned Users
    **/
    _count?: true | UserCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserMaxAggregateInputType
  }

  export type GetUserAggregateType<T extends UserAggregateArgs> = {
        [P in keyof T & keyof AggregateUser]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUser[P]>
      : GetScalarType<T[P], AggregateUser[P]>
  }




  export type UserGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWhereInput
    orderBy?: UserOrderByWithAggregationInput | UserOrderByWithAggregationInput[]
    by: UserScalarFieldEnum[] | UserScalarFieldEnum
    having?: UserScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserCountAggregateInputType | true
    _min?: UserMinAggregateInputType
    _max?: UserMaxAggregateInputType
  }

  export type UserGroupByOutputType = {
    id: string
    name: string
    password: string
    role: $Enums.Role
    createdDate: Date
    updatedAt: Date | null
    lastLogin: Date
    _count: UserCountAggregateOutputType | null
    _min: UserMinAggregateOutputType | null
    _max: UserMaxAggregateOutputType | null
  }

  type GetUserGroupByPayload<T extends UserGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserGroupByOutputType[P]>
            : GetScalarType<T[P], UserGroupByOutputType[P]>
        }
      >
    >


  export type UserSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdDate?: boolean
    updatedAt?: boolean
    lastLogin?: boolean
    items?: boolean | User$itemsArgs<ExtArgs>
    profile?: boolean | User$profileArgs<ExtArgs>
    ranking?: boolean | User$rankingArgs<ExtArgs>
    rewards?: boolean | User$rewardsArgs<ExtArgs>
    statsTracking?: boolean | User$statsTrackingArgs<ExtArgs>
    wallets?: boolean | User$walletsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["user"]>

  export type UserSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdDate?: boolean
    updatedAt?: boolean
    lastLogin?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdDate?: boolean
    updatedAt?: boolean
    lastLogin?: boolean
  }, ExtArgs["result"]["user"]>

  export type UserSelectScalar = {
    id?: boolean
    name?: boolean
    password?: boolean
    role?: boolean
    createdDate?: boolean
    updatedAt?: boolean
    lastLogin?: boolean
  }

  export type UserOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "name" | "password" | "role" | "createdDate" | "updatedAt" | "lastLogin", ExtArgs["result"]["user"]>
  export type UserInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    items?: boolean | User$itemsArgs<ExtArgs>
    profile?: boolean | User$profileArgs<ExtArgs>
    ranking?: boolean | User$rankingArgs<ExtArgs>
    rewards?: boolean | User$rewardsArgs<ExtArgs>
    statsTracking?: boolean | User$statsTrackingArgs<ExtArgs>
    wallets?: boolean | User$walletsArgs<ExtArgs>
    _count?: boolean | UserCountOutputTypeDefaultArgs<ExtArgs>
  }
  export type UserIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}
  export type UserIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {}

  export type $UserPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "User"
    objects: {
      items: Prisma.$UserItemsPayload<ExtArgs>[]
      profile: Prisma.$UserProfilePayload<ExtArgs> | null
      ranking: Prisma.$RankingPayload<ExtArgs> | null
      rewards: Prisma.$UserRewardsPayload<ExtArgs>[]
      statsTracking: Prisma.$UserTrackingPayload<ExtArgs>[]
      wallets: Prisma.$UserWalletPayload<ExtArgs>[]
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      name: string
      password: string
      role: $Enums.Role
      createdDate: Date
      updatedAt: Date | null
      lastLogin: Date
    }, ExtArgs["result"]["user"]>
    composites: {}
  }

  type UserGetPayload<S extends boolean | null | undefined | UserDefaultArgs> = $Result.GetResult<Prisma.$UserPayload, S>

  type UserCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UserCountAggregateInputType | true
    }

  export interface UserDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['User'], meta: { name: 'User' } }
    /**
     * Find zero or one User that matches the filter.
     * @param {UserFindUniqueArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserFindUniqueArgs>(args: SelectSubset<T, UserFindUniqueArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one User that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserFindUniqueOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserFindUniqueOrThrowArgs>(args: SelectSubset<T, UserFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserFindFirstArgs>(args?: SelectSubset<T, UserFindFirstArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first User that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindFirstOrThrowArgs} args - Arguments to find a User
     * @example
     * // Get one User
     * const user = await prisma.user.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserFindFirstOrThrowArgs>(args?: SelectSubset<T, UserFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more Users that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all Users
     * const users = await prisma.user.findMany()
     * 
     * // Get first 10 Users
     * const users = await prisma.user.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWithIdOnly = await prisma.user.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserFindManyArgs>(args?: SelectSubset<T, UserFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a User.
     * @param {UserCreateArgs} args - Arguments to create a User.
     * @example
     * // Create one User
     * const User = await prisma.user.create({
     *   data: {
     *     // ... data to create a User
     *   }
     * })
     * 
     */
    create<T extends UserCreateArgs>(args: SelectSubset<T, UserCreateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many Users.
     * @param {UserCreateManyArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserCreateManyArgs>(args?: SelectSubset<T, UserCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many Users and returns the data saved in the database.
     * @param {UserCreateManyAndReturnArgs} args - Arguments to create many Users.
     * @example
     * // Create many Users
     * const user = await prisma.user.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many Users and only return the `id`
     * const userWithIdOnly = await prisma.user.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserCreateManyAndReturnArgs>(args?: SelectSubset<T, UserCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a User.
     * @param {UserDeleteArgs} args - Arguments to delete one User.
     * @example
     * // Delete one User
     * const User = await prisma.user.delete({
     *   where: {
     *     // ... filter to delete one User
     *   }
     * })
     * 
     */
    delete<T extends UserDeleteArgs>(args: SelectSubset<T, UserDeleteArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one User.
     * @param {UserUpdateArgs} args - Arguments to update one User.
     * @example
     * // Update one User
     * const user = await prisma.user.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserUpdateArgs>(args: SelectSubset<T, UserUpdateArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more Users.
     * @param {UserDeleteManyArgs} args - Arguments to filter Users to delete.
     * @example
     * // Delete a few Users
     * const { count } = await prisma.user.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserDeleteManyArgs>(args?: SelectSubset<T, UserDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserUpdateManyArgs>(args: SelectSubset<T, UserUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more Users and returns the data updated in the database.
     * @param {UserUpdateManyAndReturnArgs} args - Arguments to update many Users.
     * @example
     * // Update many Users
     * const user = await prisma.user.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more Users and only return the `id`
     * const userWithIdOnly = await prisma.user.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserUpdateManyAndReturnArgs>(args: SelectSubset<T, UserUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one User.
     * @param {UserUpsertArgs} args - Arguments to update or create a User.
     * @example
     * // Update or create a User
     * const user = await prisma.user.upsert({
     *   create: {
     *     // ... data to create a User
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the User we want to update
     *   }
     * })
     */
    upsert<T extends UserUpsertArgs>(args: SelectSubset<T, UserUpsertArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of Users.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserCountArgs} args - Arguments to filter Users to count.
     * @example
     * // Count the number of Users
     * const count = await prisma.user.count({
     *   where: {
     *     // ... the filter for the Users we want to count
     *   }
     * })
    **/
    count<T extends UserCountArgs>(
      args?: Subset<T, UserCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserAggregateArgs>(args: Subset<T, UserAggregateArgs>): Prisma.PrismaPromise<GetUserAggregateType<T>>

    /**
     * Group by User.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserGroupByArgs['orderBy'] }
        : { orderBy?: UserGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the User model
   */
  readonly fields: UserFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for User.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    items<T extends User$itemsArgs<ExtArgs> = {}>(args?: Subset<T, User$itemsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    profile<T extends User$profileArgs<ExtArgs> = {}>(args?: Subset<T, User$profileArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    ranking<T extends User$rankingArgs<ExtArgs> = {}>(args?: Subset<T, User$rankingArgs<ExtArgs>>): Prisma__RankingClient<$Result.GetResult<Prisma.$RankingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    rewards<T extends User$rewardsArgs<ExtArgs> = {}>(args?: Subset<T, User$rewardsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    statsTracking<T extends User$statsTrackingArgs<ExtArgs> = {}>(args?: Subset<T, User$statsTrackingArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    wallets<T extends User$walletsArgs<ExtArgs> = {}>(args?: Subset<T, User$walletsArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the User model
   */
  interface UserFieldRefs {
    readonly id: FieldRef<"User", 'String'>
    readonly name: FieldRef<"User", 'String'>
    readonly password: FieldRef<"User", 'String'>
    readonly role: FieldRef<"User", 'Role'>
    readonly createdDate: FieldRef<"User", 'DateTime'>
    readonly updatedAt: FieldRef<"User", 'DateTime'>
    readonly lastLogin: FieldRef<"User", 'DateTime'>
  }
    

  // Custom InputTypes
  /**
   * User findUnique
   */
  export type UserFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User findUniqueOrThrow
   */
  export type UserFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where: UserWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User findFirst
   */
  export type UserFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User findFirstOrThrow
   */
  export type UserFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which User to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of Users.
     */
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User findMany
   */
  export type UserFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter, which Users to fetch.
     */
    where?: UserWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of Users to fetch.
     */
    orderBy?: UserOrderByWithRelationInput | UserOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing Users.
     */
    cursor?: UserWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` Users from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` Users.
     */
    skip?: number
    distinct?: UserScalarFieldEnum | UserScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User create
   */
  export type UserCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to create a User.
     */
    data: XOR<UserCreateInput, UserUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User createMany
   */
  export type UserCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User createManyAndReturn
   */
  export type UserCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to create many Users.
     */
    data: UserCreateManyInput | UserCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * User update
   */
  export type UserUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The data needed to update a User.
     */
    data: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    /**
     * Choose, which User to update.
     */
    where: UserWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User updateMany
   */
  export type UserUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User updateManyAndReturn
   */
  export type UserUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * The data used to update Users.
     */
    data: XOR<UserUpdateManyMutationInput, UserUncheckedUpdateManyInput>
    /**
     * Filter which Users to update
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to update.
     */
    limit?: number
  }

  /**
   * User upsert
   */
  export type UserUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * The filter to search for the User to update in case it exists.
     */
    where: UserWhereUniqueInput
    /**
     * In case the User found by the `where` argument doesn't exist, create a new User with this data.
     */
    create: XOR<UserCreateInput, UserUncheckedCreateInput>
    /**
     * In case the User was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserUpdateInput, UserUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User delete
   */
  export type UserDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    /**
     * Filter which User to delete.
     */
    where: UserWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * User deleteMany
   */
  export type UserDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which Users to delete
     */
    where?: UserWhereInput
    /**
     * Limit how many Users to delete.
     */
    limit?: number
  }

  /**
   * User.items
   */
  export type User$itemsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    where?: UserItemsWhereInput
    orderBy?: UserItemsOrderByWithRelationInput | UserItemsOrderByWithRelationInput[]
    cursor?: UserItemsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserItemsScalarFieldEnum | UserItemsScalarFieldEnum[]
  }

  /**
   * User.profile
   */
  export type User$profileArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    where?: UserProfileWhereInput
  }

  /**
   * User.ranking
   */
  export type User$rankingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the Ranking
     */
    select?: RankingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the Ranking
     */
    omit?: RankingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: RankingInclude<ExtArgs> | null
    where?: RankingWhereInput
  }

  /**
   * User.rewards
   */
  export type User$rewardsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    where?: UserRewardsWhereInput
    orderBy?: UserRewardsOrderByWithRelationInput | UserRewardsOrderByWithRelationInput[]
    cursor?: UserRewardsWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserRewardsScalarFieldEnum | UserRewardsScalarFieldEnum[]
  }

  /**
   * User.statsTracking
   */
  export type User$statsTrackingArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    where?: UserTrackingWhereInput
    orderBy?: UserTrackingOrderByWithRelationInput | UserTrackingOrderByWithRelationInput[]
    cursor?: UserTrackingWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserTrackingScalarFieldEnum | UserTrackingScalarFieldEnum[]
  }

  /**
   * User.wallets
   */
  export type User$walletsArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    where?: UserWalletWhereInput
    orderBy?: UserWalletOrderByWithRelationInput | UserWalletOrderByWithRelationInput[]
    cursor?: UserWalletWhereUniqueInput
    take?: number
    skip?: number
    distinct?: UserWalletScalarFieldEnum | UserWalletScalarFieldEnum[]
  }

  /**
   * User without action
   */
  export type UserDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
  }


  /**
   * Model UserItems
   */

  export type AggregateUserItems = {
    _count: UserItemsCountAggregateOutputType | null
    _avg: UserItemsAvgAggregateOutputType | null
    _sum: UserItemsSumAggregateOutputType | null
    _min: UserItemsMinAggregateOutputType | null
    _max: UserItemsMaxAggregateOutputType | null
  }

  export type UserItemsAvgAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: number | null
  }

  export type UserItemsSumAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: number | null
  }

  export type UserItemsMinAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: number | null
    userId: string | null
  }

  export type UserItemsMaxAggregateOutputType = {
    id: number | null
    itemId: number | null
    quantity: number | null
    userId: string | null
  }

  export type UserItemsCountAggregateOutputType = {
    id: number
    itemId: number
    quantity: number
    userId: number
    _all: number
  }


  export type UserItemsAvgAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
  }

  export type UserItemsSumAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
  }

  export type UserItemsMinAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    userId?: true
  }

  export type UserItemsMaxAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    userId?: true
  }

  export type UserItemsCountAggregateInputType = {
    id?: true
    itemId?: true
    quantity?: true
    userId?: true
    _all?: true
  }

  export type UserItemsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserItems to aggregate.
     */
    where?: UserItemsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserItems to fetch.
     */
    orderBy?: UserItemsOrderByWithRelationInput | UserItemsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserItemsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserItems
    **/
    _count?: true | UserItemsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserItemsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserItemsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserItemsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserItemsMaxAggregateInputType
  }

  export type GetUserItemsAggregateType<T extends UserItemsAggregateArgs> = {
        [P in keyof T & keyof AggregateUserItems]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserItems[P]>
      : GetScalarType<T[P], AggregateUserItems[P]>
  }




  export type UserItemsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserItemsWhereInput
    orderBy?: UserItemsOrderByWithAggregationInput | UserItemsOrderByWithAggregationInput[]
    by: UserItemsScalarFieldEnum[] | UserItemsScalarFieldEnum
    having?: UserItemsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserItemsCountAggregateInputType | true
    _avg?: UserItemsAvgAggregateInputType
    _sum?: UserItemsSumAggregateInputType
    _min?: UserItemsMinAggregateInputType
    _max?: UserItemsMaxAggregateInputType
  }

  export type UserItemsGroupByOutputType = {
    id: number
    itemId: number
    quantity: number
    userId: string
    _count: UserItemsCountAggregateOutputType | null
    _avg: UserItemsAvgAggregateOutputType | null
    _sum: UserItemsSumAggregateOutputType | null
    _min: UserItemsMinAggregateOutputType | null
    _max: UserItemsMaxAggregateOutputType | null
  }

  type GetUserItemsGroupByPayload<T extends UserItemsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserItemsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserItemsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserItemsGroupByOutputType[P]>
            : GetScalarType<T[P], UserItemsGroupByOutputType[P]>
        }
      >
    >


  export type UserItemsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userItems"]>

  export type UserItemsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userItems"]>

  export type UserItemsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userItems"]>

  export type UserItemsSelectScalar = {
    id?: boolean
    itemId?: boolean
    quantity?: boolean
    userId?: boolean
  }

  export type UserItemsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "itemId" | "quantity" | "userId", ExtArgs["result"]["userItems"]>
  export type UserItemsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserItemsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserItemsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserItemsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserItems"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      itemId: number
      quantity: number
      userId: string
    }, ExtArgs["result"]["userItems"]>
    composites: {}
  }

  type UserItemsGetPayload<S extends boolean | null | undefined | UserItemsDefaultArgs> = $Result.GetResult<Prisma.$UserItemsPayload, S>

  type UserItemsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserItemsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UserItemsCountAggregateInputType | true
    }

  export interface UserItemsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserItems'], meta: { name: 'UserItems' } }
    /**
     * Find zero or one UserItems that matches the filter.
     * @param {UserItemsFindUniqueArgs} args - Arguments to find a UserItems
     * @example
     * // Get one UserItems
     * const userItems = await prisma.userItems.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserItemsFindUniqueArgs>(args: SelectSubset<T, UserItemsFindUniqueArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserItems that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserItemsFindUniqueOrThrowArgs} args - Arguments to find a UserItems
     * @example
     * // Get one UserItems
     * const userItems = await prisma.userItems.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserItemsFindUniqueOrThrowArgs>(args: SelectSubset<T, UserItemsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsFindFirstArgs} args - Arguments to find a UserItems
     * @example
     * // Get one UserItems
     * const userItems = await prisma.userItems.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserItemsFindFirstArgs>(args?: SelectSubset<T, UserItemsFindFirstArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserItems that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsFindFirstOrThrowArgs} args - Arguments to find a UserItems
     * @example
     * // Get one UserItems
     * const userItems = await prisma.userItems.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserItemsFindFirstOrThrowArgs>(args?: SelectSubset<T, UserItemsFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserItems that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserItems
     * const userItems = await prisma.userItems.findMany()
     * 
     * // Get first 10 UserItems
     * const userItems = await prisma.userItems.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userItemsWithIdOnly = await prisma.userItems.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserItemsFindManyArgs>(args?: SelectSubset<T, UserItemsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserItems.
     * @param {UserItemsCreateArgs} args - Arguments to create a UserItems.
     * @example
     * // Create one UserItems
     * const UserItems = await prisma.userItems.create({
     *   data: {
     *     // ... data to create a UserItems
     *   }
     * })
     * 
     */
    create<T extends UserItemsCreateArgs>(args: SelectSubset<T, UserItemsCreateArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserItems.
     * @param {UserItemsCreateManyArgs} args - Arguments to create many UserItems.
     * @example
     * // Create many UserItems
     * const userItems = await prisma.userItems.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserItemsCreateManyArgs>(args?: SelectSubset<T, UserItemsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserItems and returns the data saved in the database.
     * @param {UserItemsCreateManyAndReturnArgs} args - Arguments to create many UserItems.
     * @example
     * // Create many UserItems
     * const userItems = await prisma.userItems.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserItems and only return the `id`
     * const userItemsWithIdOnly = await prisma.userItems.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserItemsCreateManyAndReturnArgs>(args?: SelectSubset<T, UserItemsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserItems.
     * @param {UserItemsDeleteArgs} args - Arguments to delete one UserItems.
     * @example
     * // Delete one UserItems
     * const UserItems = await prisma.userItems.delete({
     *   where: {
     *     // ... filter to delete one UserItems
     *   }
     * })
     * 
     */
    delete<T extends UserItemsDeleteArgs>(args: SelectSubset<T, UserItemsDeleteArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserItems.
     * @param {UserItemsUpdateArgs} args - Arguments to update one UserItems.
     * @example
     * // Update one UserItems
     * const userItems = await prisma.userItems.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserItemsUpdateArgs>(args: SelectSubset<T, UserItemsUpdateArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserItems.
     * @param {UserItemsDeleteManyArgs} args - Arguments to filter UserItems to delete.
     * @example
     * // Delete a few UserItems
     * const { count } = await prisma.userItems.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserItemsDeleteManyArgs>(args?: SelectSubset<T, UserItemsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserItems
     * const userItems = await prisma.userItems.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserItemsUpdateManyArgs>(args: SelectSubset<T, UserItemsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserItems and returns the data updated in the database.
     * @param {UserItemsUpdateManyAndReturnArgs} args - Arguments to update many UserItems.
     * @example
     * // Update many UserItems
     * const userItems = await prisma.userItems.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserItems and only return the `id`
     * const userItemsWithIdOnly = await prisma.userItems.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserItemsUpdateManyAndReturnArgs>(args: SelectSubset<T, UserItemsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserItems.
     * @param {UserItemsUpsertArgs} args - Arguments to update or create a UserItems.
     * @example
     * // Update or create a UserItems
     * const userItems = await prisma.userItems.upsert({
     *   create: {
     *     // ... data to create a UserItems
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserItems we want to update
     *   }
     * })
     */
    upsert<T extends UserItemsUpsertArgs>(args: SelectSubset<T, UserItemsUpsertArgs<ExtArgs>>): Prisma__UserItemsClient<$Result.GetResult<Prisma.$UserItemsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsCountArgs} args - Arguments to filter UserItems to count.
     * @example
     * // Count the number of UserItems
     * const count = await prisma.userItems.count({
     *   where: {
     *     // ... the filter for the UserItems we want to count
     *   }
     * })
    **/
    count<T extends UserItemsCountArgs>(
      args?: Subset<T, UserItemsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserItemsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserItemsAggregateArgs>(args: Subset<T, UserItemsAggregateArgs>): Prisma.PrismaPromise<GetUserItemsAggregateType<T>>

    /**
     * Group by UserItems.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserItemsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserItemsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserItemsGroupByArgs['orderBy'] }
        : { orderBy?: UserItemsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserItemsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserItemsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserItems model
   */
  readonly fields: UserItemsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserItems.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserItemsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserItems model
   */
  interface UserItemsFieldRefs {
    readonly id: FieldRef<"UserItems", 'Int'>
    readonly itemId: FieldRef<"UserItems", 'Int'>
    readonly quantity: FieldRef<"UserItems", 'Int'>
    readonly userId: FieldRef<"UserItems", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserItems findUnique
   */
  export type UserItemsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * Filter, which UserItems to fetch.
     */
    where: UserItemsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems findUniqueOrThrow
   */
  export type UserItemsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * Filter, which UserItems to fetch.
     */
    where: UserItemsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems findFirst
   */
  export type UserItemsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * Filter, which UserItems to fetch.
     */
    where?: UserItemsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserItems to fetch.
     */
    orderBy?: UserItemsOrderByWithRelationInput | UserItemsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserItems.
     */
    cursor?: UserItemsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserItems.
     */
    distinct?: UserItemsScalarFieldEnum | UserItemsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems findFirstOrThrow
   */
  export type UserItemsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * Filter, which UserItems to fetch.
     */
    where?: UserItemsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserItems to fetch.
     */
    orderBy?: UserItemsOrderByWithRelationInput | UserItemsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserItems.
     */
    cursor?: UserItemsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserItems.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserItems.
     */
    distinct?: UserItemsScalarFieldEnum | UserItemsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems findMany
   */
  export type UserItemsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * Filter, which UserItems to fetch.
     */
    where?: UserItemsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserItems to fetch.
     */
    orderBy?: UserItemsOrderByWithRelationInput | UserItemsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserItems.
     */
    cursor?: UserItemsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserItems from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserItems.
     */
    skip?: number
    distinct?: UserItemsScalarFieldEnum | UserItemsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems create
   */
  export type UserItemsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * The data needed to create a UserItems.
     */
    data: XOR<UserItemsCreateInput, UserItemsUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems createMany
   */
  export type UserItemsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserItems.
     */
    data: UserItemsCreateManyInput | UserItemsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserItems createManyAndReturn
   */
  export type UserItemsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * The data used to create many UserItems.
     */
    data: UserItemsCreateManyInput | UserItemsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserItems update
   */
  export type UserItemsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * The data needed to update a UserItems.
     */
    data: XOR<UserItemsUpdateInput, UserItemsUncheckedUpdateInput>
    /**
     * Choose, which UserItems to update.
     */
    where: UserItemsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems updateMany
   */
  export type UserItemsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserItems.
     */
    data: XOR<UserItemsUpdateManyMutationInput, UserItemsUncheckedUpdateManyInput>
    /**
     * Filter which UserItems to update
     */
    where?: UserItemsWhereInput
    /**
     * Limit how many UserItems to update.
     */
    limit?: number
  }

  /**
   * UserItems updateManyAndReturn
   */
  export type UserItemsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * The data used to update UserItems.
     */
    data: XOR<UserItemsUpdateManyMutationInput, UserItemsUncheckedUpdateManyInput>
    /**
     * Filter which UserItems to update
     */
    where?: UserItemsWhereInput
    /**
     * Limit how many UserItems to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserItems upsert
   */
  export type UserItemsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * The filter to search for the UserItems to update in case it exists.
     */
    where: UserItemsWhereUniqueInput
    /**
     * In case the UserItems found by the `where` argument doesn't exist, create a new UserItems with this data.
     */
    create: XOR<UserItemsCreateInput, UserItemsUncheckedCreateInput>
    /**
     * In case the UserItems was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserItemsUpdateInput, UserItemsUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems delete
   */
  export type UserItemsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
    /**
     * Filter which UserItems to delete.
     */
    where: UserItemsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserItems deleteMany
   */
  export type UserItemsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserItems to delete
     */
    where?: UserItemsWhereInput
    /**
     * Limit how many UserItems to delete.
     */
    limit?: number
  }

  /**
   * UserItems without action
   */
  export type UserItemsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserItems
     */
    select?: UserItemsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserItems
     */
    omit?: UserItemsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserItemsInclude<ExtArgs> | null
  }


  /**
   * Model UserProfile
   */

  export type AggregateUserProfile = {
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  export type UserProfileAvgAggregateOutputType = {
    age: number | null
  }

  export type UserProfileSumAggregateOutputType = {
    age: number | null
  }

  export type UserProfileMinAggregateOutputType = {
    id: string | null
    userId: string | null
    avatar: Bytes | null
    avatarType: string | null
    language: $Enums.Language | null
    gender: $Enums.Gender | null
    age: number | null
    description: string | null
  }

  export type UserProfileMaxAggregateOutputType = {
    id: string | null
    userId: string | null
    avatar: Bytes | null
    avatarType: string | null
    language: $Enums.Language | null
    gender: $Enums.Gender | null
    age: number | null
    description: string | null
  }

  export type UserProfileCountAggregateOutputType = {
    id: number
    userId: number
    avatar: number
    avatarType: number
    language: number
    gender: number
    age: number
    description: number
    _all: number
  }


  export type UserProfileAvgAggregateInputType = {
    age?: true
  }

  export type UserProfileSumAggregateInputType = {
    age?: true
  }

  export type UserProfileMinAggregateInputType = {
    id?: true
    userId?: true
    avatar?: true
    avatarType?: true
    language?: true
    gender?: true
    age?: true
    description?: true
  }

  export type UserProfileMaxAggregateInputType = {
    id?: true
    userId?: true
    avatar?: true
    avatarType?: true
    language?: true
    gender?: true
    age?: true
    description?: true
  }

  export type UserProfileCountAggregateInputType = {
    id?: true
    userId?: true
    avatar?: true
    avatarType?: true
    language?: true
    gender?: true
    age?: true
    description?: true
    _all?: true
  }

  export type UserProfileAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfile to aggregate.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserProfiles
    **/
    _count?: true | UserProfileCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserProfileAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserProfileSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserProfileMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserProfileMaxAggregateInputType
  }

  export type GetUserProfileAggregateType<T extends UserProfileAggregateArgs> = {
        [P in keyof T & keyof AggregateUserProfile]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserProfile[P]>
      : GetScalarType<T[P], AggregateUserProfile[P]>
  }




  export type UserProfileGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserProfileWhereInput
    orderBy?: UserProfileOrderByWithAggregationInput | UserProfileOrderByWithAggregationInput[]
    by: UserProfileScalarFieldEnum[] | UserProfileScalarFieldEnum
    having?: UserProfileScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserProfileCountAggregateInputType | true
    _avg?: UserProfileAvgAggregateInputType
    _sum?: UserProfileSumAggregateInputType
    _min?: UserProfileMinAggregateInputType
    _max?: UserProfileMaxAggregateInputType
  }

  export type UserProfileGroupByOutputType = {
    id: string
    userId: string
    avatar: Bytes | null
    avatarType: string | null
    language: $Enums.Language | null
    gender: $Enums.Gender | null
    age: number | null
    description: string | null
    _count: UserProfileCountAggregateOutputType | null
    _avg: UserProfileAvgAggregateOutputType | null
    _sum: UserProfileSumAggregateOutputType | null
    _min: UserProfileMinAggregateOutputType | null
    _max: UserProfileMaxAggregateOutputType | null
  }

  type GetUserProfileGroupByPayload<T extends UserProfileGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserProfileGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserProfileGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
            : GetScalarType<T[P], UserProfileGroupByOutputType[P]>
        }
      >
    >


  export type UserProfileSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    avatar?: boolean
    avatarType?: boolean
    language?: boolean
    gender?: boolean
    age?: boolean
    description?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    avatar?: boolean
    avatarType?: boolean
    language?: boolean
    gender?: boolean
    age?: boolean
    description?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    userId?: boolean
    avatar?: boolean
    avatarType?: boolean
    language?: boolean
    gender?: boolean
    age?: boolean
    description?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userProfile"]>

  export type UserProfileSelectScalar = {
    id?: boolean
    userId?: boolean
    avatar?: boolean
    avatarType?: boolean
    language?: boolean
    gender?: boolean
    age?: boolean
    description?: boolean
  }

  export type UserProfileOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "userId" | "avatar" | "avatarType" | "language" | "gender" | "age" | "description", ExtArgs["result"]["userProfile"]>
  export type UserProfileInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserProfileIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserProfileIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserProfilePayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserProfile"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      userId: string
      avatar: Prisma.Bytes | null
      avatarType: string | null
      language: $Enums.Language | null
      gender: $Enums.Gender | null
      age: number | null
      description: string | null
    }, ExtArgs["result"]["userProfile"]>
    composites: {}
  }

  type UserProfileGetPayload<S extends boolean | null | undefined | UserProfileDefaultArgs> = $Result.GetResult<Prisma.$UserProfilePayload, S>

  type UserProfileCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserProfileFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UserProfileCountAggregateInputType | true
    }

  export interface UserProfileDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserProfile'], meta: { name: 'UserProfile' } }
    /**
     * Find zero or one UserProfile that matches the filter.
     * @param {UserProfileFindUniqueArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserProfileFindUniqueArgs>(args: SelectSubset<T, UserProfileFindUniqueArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserProfile that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserProfileFindUniqueOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserProfileFindUniqueOrThrowArgs>(args: SelectSubset<T, UserProfileFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserProfile that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserProfileFindFirstArgs>(args?: SelectSubset<T, UserProfileFindFirstArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserProfile that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindFirstOrThrowArgs} args - Arguments to find a UserProfile
     * @example
     * // Get one UserProfile
     * const userProfile = await prisma.userProfile.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserProfileFindFirstOrThrowArgs>(args?: SelectSubset<T, UserProfileFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserProfiles that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserProfiles
     * const userProfiles = await prisma.userProfile.findMany()
     * 
     * // Get first 10 UserProfiles
     * const userProfiles = await prisma.userProfile.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserProfileFindManyArgs>(args?: SelectSubset<T, UserProfileFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserProfile.
     * @param {UserProfileCreateArgs} args - Arguments to create a UserProfile.
     * @example
     * // Create one UserProfile
     * const UserProfile = await prisma.userProfile.create({
     *   data: {
     *     // ... data to create a UserProfile
     *   }
     * })
     * 
     */
    create<T extends UserProfileCreateArgs>(args: SelectSubset<T, UserProfileCreateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserProfiles.
     * @param {UserProfileCreateManyArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserProfileCreateManyArgs>(args?: SelectSubset<T, UserProfileCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserProfiles and returns the data saved in the database.
     * @param {UserProfileCreateManyAndReturnArgs} args - Arguments to create many UserProfiles.
     * @example
     * // Create many UserProfiles
     * const userProfile = await prisma.userProfile.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserProfileCreateManyAndReturnArgs>(args?: SelectSubset<T, UserProfileCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserProfile.
     * @param {UserProfileDeleteArgs} args - Arguments to delete one UserProfile.
     * @example
     * // Delete one UserProfile
     * const UserProfile = await prisma.userProfile.delete({
     *   where: {
     *     // ... filter to delete one UserProfile
     *   }
     * })
     * 
     */
    delete<T extends UserProfileDeleteArgs>(args: SelectSubset<T, UserProfileDeleteArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserProfile.
     * @param {UserProfileUpdateArgs} args - Arguments to update one UserProfile.
     * @example
     * // Update one UserProfile
     * const userProfile = await prisma.userProfile.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserProfileUpdateArgs>(args: SelectSubset<T, UserProfileUpdateArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserProfiles.
     * @param {UserProfileDeleteManyArgs} args - Arguments to filter UserProfiles to delete.
     * @example
     * // Delete a few UserProfiles
     * const { count } = await prisma.userProfile.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserProfileDeleteManyArgs>(args?: SelectSubset<T, UserProfileDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserProfileUpdateManyArgs>(args: SelectSubset<T, UserProfileUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserProfiles and returns the data updated in the database.
     * @param {UserProfileUpdateManyAndReturnArgs} args - Arguments to update many UserProfiles.
     * @example
     * // Update many UserProfiles
     * const userProfile = await prisma.userProfile.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserProfiles and only return the `id`
     * const userProfileWithIdOnly = await prisma.userProfile.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserProfileUpdateManyAndReturnArgs>(args: SelectSubset<T, UserProfileUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserProfile.
     * @param {UserProfileUpsertArgs} args - Arguments to update or create a UserProfile.
     * @example
     * // Update or create a UserProfile
     * const userProfile = await prisma.userProfile.upsert({
     *   create: {
     *     // ... data to create a UserProfile
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserProfile we want to update
     *   }
     * })
     */
    upsert<T extends UserProfileUpsertArgs>(args: SelectSubset<T, UserProfileUpsertArgs<ExtArgs>>): Prisma__UserProfileClient<$Result.GetResult<Prisma.$UserProfilePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserProfiles.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileCountArgs} args - Arguments to filter UserProfiles to count.
     * @example
     * // Count the number of UserProfiles
     * const count = await prisma.userProfile.count({
     *   where: {
     *     // ... the filter for the UserProfiles we want to count
     *   }
     * })
    **/
    count<T extends UserProfileCountArgs>(
      args?: Subset<T, UserProfileCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserProfileCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserProfileAggregateArgs>(args: Subset<T, UserProfileAggregateArgs>): Prisma.PrismaPromise<GetUserProfileAggregateType<T>>

    /**
     * Group by UserProfile.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserProfileGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserProfileGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserProfileGroupByArgs['orderBy'] }
        : { orderBy?: UserProfileGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserProfileGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserProfileGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserProfile model
   */
  readonly fields: UserProfileFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserProfile.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserProfileClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserProfile model
   */
  interface UserProfileFieldRefs {
    readonly id: FieldRef<"UserProfile", 'String'>
    readonly userId: FieldRef<"UserProfile", 'String'>
    readonly avatar: FieldRef<"UserProfile", 'Bytes'>
    readonly avatarType: FieldRef<"UserProfile", 'String'>
    readonly language: FieldRef<"UserProfile", 'Language'>
    readonly gender: FieldRef<"UserProfile", 'Gender'>
    readonly age: FieldRef<"UserProfile", 'Int'>
    readonly description: FieldRef<"UserProfile", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserProfile findUnique
   */
  export type UserProfileFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile findUniqueOrThrow
   */
  export type UserProfileFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where: UserProfileWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile findFirst
   */
  export type UserProfileFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile findFirstOrThrow
   */
  export type UserProfileFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfile to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserProfiles.
     */
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile findMany
   */
  export type UserProfileFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter, which UserProfiles to fetch.
     */
    where?: UserProfileWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserProfiles to fetch.
     */
    orderBy?: UserProfileOrderByWithRelationInput | UserProfileOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserProfiles.
     */
    cursor?: UserProfileWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserProfiles from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserProfiles.
     */
    skip?: number
    distinct?: UserProfileScalarFieldEnum | UserProfileScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile create
   */
  export type UserProfileCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to create a UserProfile.
     */
    data: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile createMany
   */
  export type UserProfileCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserProfile createManyAndReturn
   */
  export type UserProfileCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * The data used to create many UserProfiles.
     */
    data: UserProfileCreateManyInput | UserProfileCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile update
   */
  export type UserProfileUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The data needed to update a UserProfile.
     */
    data: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
    /**
     * Choose, which UserProfile to update.
     */
    where: UserProfileWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile updateMany
   */
  export type UserProfileUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to update.
     */
    limit?: number
  }

  /**
   * UserProfile updateManyAndReturn
   */
  export type UserProfileUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * The data used to update UserProfiles.
     */
    data: XOR<UserProfileUpdateManyMutationInput, UserProfileUncheckedUpdateManyInput>
    /**
     * Filter which UserProfiles to update
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserProfile upsert
   */
  export type UserProfileUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * The filter to search for the UserProfile to update in case it exists.
     */
    where: UserProfileWhereUniqueInput
    /**
     * In case the UserProfile found by the `where` argument doesn't exist, create a new UserProfile with this data.
     */
    create: XOR<UserProfileCreateInput, UserProfileUncheckedCreateInput>
    /**
     * In case the UserProfile was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserProfileUpdateInput, UserProfileUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile delete
   */
  export type UserProfileDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
    /**
     * Filter which UserProfile to delete.
     */
    where: UserProfileWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserProfile deleteMany
   */
  export type UserProfileDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserProfiles to delete
     */
    where?: UserProfileWhereInput
    /**
     * Limit how many UserProfiles to delete.
     */
    limit?: number
  }

  /**
   * UserProfile without action
   */
  export type UserProfileDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserProfile
     */
    select?: UserProfileSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserProfile
     */
    omit?: UserProfileOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserProfileInclude<ExtArgs> | null
  }


  /**
   * Model UserRewards
   */

  export type AggregateUserRewards = {
    _count: UserRewardsCountAggregateOutputType | null
    _avg: UserRewardsAvgAggregateOutputType | null
    _sum: UserRewardsSumAggregateOutputType | null
    _min: UserRewardsMinAggregateOutputType | null
    _max: UserRewardsMaxAggregateOutputType | null
  }

  export type UserRewardsAvgAggregateOutputType = {
    id: number | null
    rewardId: number | null
  }

  export type UserRewardsSumAggregateOutputType = {
    id: number | null
    rewardId: number | null
  }

  export type UserRewardsMinAggregateOutputType = {
    id: number | null
    rewardId: number | null
    userId: string | null
  }

  export type UserRewardsMaxAggregateOutputType = {
    id: number | null
    rewardId: number | null
    userId: string | null
  }

  export type UserRewardsCountAggregateOutputType = {
    id: number
    rewardId: number
    userId: number
    _all: number
  }


  export type UserRewardsAvgAggregateInputType = {
    id?: true
    rewardId?: true
  }

  export type UserRewardsSumAggregateInputType = {
    id?: true
    rewardId?: true
  }

  export type UserRewardsMinAggregateInputType = {
    id?: true
    rewardId?: true
    userId?: true
  }

  export type UserRewardsMaxAggregateInputType = {
    id?: true
    rewardId?: true
    userId?: true
  }

  export type UserRewardsCountAggregateInputType = {
    id?: true
    rewardId?: true
    userId?: true
    _all?: true
  }

  export type UserRewardsAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRewards to aggregate.
     */
    where?: UserRewardsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewards to fetch.
     */
    orderBy?: UserRewardsOrderByWithRelationInput | UserRewardsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserRewardsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserRewards
    **/
    _count?: true | UserRewardsCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserRewardsAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserRewardsSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserRewardsMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserRewardsMaxAggregateInputType
  }

  export type GetUserRewardsAggregateType<T extends UserRewardsAggregateArgs> = {
        [P in keyof T & keyof AggregateUserRewards]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserRewards[P]>
      : GetScalarType<T[P], AggregateUserRewards[P]>
  }




  export type UserRewardsGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserRewardsWhereInput
    orderBy?: UserRewardsOrderByWithAggregationInput | UserRewardsOrderByWithAggregationInput[]
    by: UserRewardsScalarFieldEnum[] | UserRewardsScalarFieldEnum
    having?: UserRewardsScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserRewardsCountAggregateInputType | true
    _avg?: UserRewardsAvgAggregateInputType
    _sum?: UserRewardsSumAggregateInputType
    _min?: UserRewardsMinAggregateInputType
    _max?: UserRewardsMaxAggregateInputType
  }

  export type UserRewardsGroupByOutputType = {
    id: number
    rewardId: number
    userId: string | null
    _count: UserRewardsCountAggregateOutputType | null
    _avg: UserRewardsAvgAggregateOutputType | null
    _sum: UserRewardsSumAggregateOutputType | null
    _min: UserRewardsMinAggregateOutputType | null
    _max: UserRewardsMaxAggregateOutputType | null
  }

  type GetUserRewardsGroupByPayload<T extends UserRewardsGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserRewardsGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserRewardsGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserRewardsGroupByOutputType[P]>
            : GetScalarType<T[P], UserRewardsGroupByOutputType[P]>
        }
      >
    >


  export type UserRewardsSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    rewardId?: boolean
    userId?: boolean
    user?: boolean | UserRewards$userArgs<ExtArgs>
  }, ExtArgs["result"]["userRewards"]>

  export type UserRewardsSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    rewardId?: boolean
    userId?: boolean
    user?: boolean | UserRewards$userArgs<ExtArgs>
  }, ExtArgs["result"]["userRewards"]>

  export type UserRewardsSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    rewardId?: boolean
    userId?: boolean
    user?: boolean | UserRewards$userArgs<ExtArgs>
  }, ExtArgs["result"]["userRewards"]>

  export type UserRewardsSelectScalar = {
    id?: boolean
    rewardId?: boolean
    userId?: boolean
  }

  export type UserRewardsOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "rewardId" | "userId", ExtArgs["result"]["userRewards"]>
  export type UserRewardsInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserRewards$userArgs<ExtArgs>
  }
  export type UserRewardsIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserRewards$userArgs<ExtArgs>
  }
  export type UserRewardsIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserRewards$userArgs<ExtArgs>
  }

  export type $UserRewardsPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserRewards"
    objects: {
      user: Prisma.$UserPayload<ExtArgs> | null
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      rewardId: number
      userId: string | null
    }, ExtArgs["result"]["userRewards"]>
    composites: {}
  }

  type UserRewardsGetPayload<S extends boolean | null | undefined | UserRewardsDefaultArgs> = $Result.GetResult<Prisma.$UserRewardsPayload, S>

  type UserRewardsCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserRewardsFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UserRewardsCountAggregateInputType | true
    }

  export interface UserRewardsDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserRewards'], meta: { name: 'UserRewards' } }
    /**
     * Find zero or one UserRewards that matches the filter.
     * @param {UserRewardsFindUniqueArgs} args - Arguments to find a UserRewards
     * @example
     * // Get one UserRewards
     * const userRewards = await prisma.userRewards.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserRewardsFindUniqueArgs>(args: SelectSubset<T, UserRewardsFindUniqueArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserRewards that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserRewardsFindUniqueOrThrowArgs} args - Arguments to find a UserRewards
     * @example
     * // Get one UserRewards
     * const userRewards = await prisma.userRewards.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserRewardsFindUniqueOrThrowArgs>(args: SelectSubset<T, UserRewardsFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserRewards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsFindFirstArgs} args - Arguments to find a UserRewards
     * @example
     * // Get one UserRewards
     * const userRewards = await prisma.userRewards.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserRewardsFindFirstArgs>(args?: SelectSubset<T, UserRewardsFindFirstArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserRewards that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsFindFirstOrThrowArgs} args - Arguments to find a UserRewards
     * @example
     * // Get one UserRewards
     * const userRewards = await prisma.userRewards.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserRewardsFindFirstOrThrowArgs>(args?: SelectSubset<T, UserRewardsFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserRewards that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserRewards
     * const userRewards = await prisma.userRewards.findMany()
     * 
     * // Get first 10 UserRewards
     * const userRewards = await prisma.userRewards.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userRewardsWithIdOnly = await prisma.userRewards.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserRewardsFindManyArgs>(args?: SelectSubset<T, UserRewardsFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserRewards.
     * @param {UserRewardsCreateArgs} args - Arguments to create a UserRewards.
     * @example
     * // Create one UserRewards
     * const UserRewards = await prisma.userRewards.create({
     *   data: {
     *     // ... data to create a UserRewards
     *   }
     * })
     * 
     */
    create<T extends UserRewardsCreateArgs>(args: SelectSubset<T, UserRewardsCreateArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserRewards.
     * @param {UserRewardsCreateManyArgs} args - Arguments to create many UserRewards.
     * @example
     * // Create many UserRewards
     * const userRewards = await prisma.userRewards.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserRewardsCreateManyArgs>(args?: SelectSubset<T, UserRewardsCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserRewards and returns the data saved in the database.
     * @param {UserRewardsCreateManyAndReturnArgs} args - Arguments to create many UserRewards.
     * @example
     * // Create many UserRewards
     * const userRewards = await prisma.userRewards.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserRewards and only return the `id`
     * const userRewardsWithIdOnly = await prisma.userRewards.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserRewardsCreateManyAndReturnArgs>(args?: SelectSubset<T, UserRewardsCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserRewards.
     * @param {UserRewardsDeleteArgs} args - Arguments to delete one UserRewards.
     * @example
     * // Delete one UserRewards
     * const UserRewards = await prisma.userRewards.delete({
     *   where: {
     *     // ... filter to delete one UserRewards
     *   }
     * })
     * 
     */
    delete<T extends UserRewardsDeleteArgs>(args: SelectSubset<T, UserRewardsDeleteArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserRewards.
     * @param {UserRewardsUpdateArgs} args - Arguments to update one UserRewards.
     * @example
     * // Update one UserRewards
     * const userRewards = await prisma.userRewards.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserRewardsUpdateArgs>(args: SelectSubset<T, UserRewardsUpdateArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserRewards.
     * @param {UserRewardsDeleteManyArgs} args - Arguments to filter UserRewards to delete.
     * @example
     * // Delete a few UserRewards
     * const { count } = await prisma.userRewards.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserRewardsDeleteManyArgs>(args?: SelectSubset<T, UserRewardsDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserRewards
     * const userRewards = await prisma.userRewards.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserRewardsUpdateManyArgs>(args: SelectSubset<T, UserRewardsUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserRewards and returns the data updated in the database.
     * @param {UserRewardsUpdateManyAndReturnArgs} args - Arguments to update many UserRewards.
     * @example
     * // Update many UserRewards
     * const userRewards = await prisma.userRewards.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserRewards and only return the `id`
     * const userRewardsWithIdOnly = await prisma.userRewards.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserRewardsUpdateManyAndReturnArgs>(args: SelectSubset<T, UserRewardsUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserRewards.
     * @param {UserRewardsUpsertArgs} args - Arguments to update or create a UserRewards.
     * @example
     * // Update or create a UserRewards
     * const userRewards = await prisma.userRewards.upsert({
     *   create: {
     *     // ... data to create a UserRewards
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserRewards we want to update
     *   }
     * })
     */
    upsert<T extends UserRewardsUpsertArgs>(args: SelectSubset<T, UserRewardsUpsertArgs<ExtArgs>>): Prisma__UserRewardsClient<$Result.GetResult<Prisma.$UserRewardsPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserRewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsCountArgs} args - Arguments to filter UserRewards to count.
     * @example
     * // Count the number of UserRewards
     * const count = await prisma.userRewards.count({
     *   where: {
     *     // ... the filter for the UserRewards we want to count
     *   }
     * })
    **/
    count<T extends UserRewardsCountArgs>(
      args?: Subset<T, UserRewardsCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserRewardsCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserRewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserRewardsAggregateArgs>(args: Subset<T, UserRewardsAggregateArgs>): Prisma.PrismaPromise<GetUserRewardsAggregateType<T>>

    /**
     * Group by UserRewards.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserRewardsGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserRewardsGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserRewardsGroupByArgs['orderBy'] }
        : { orderBy?: UserRewardsGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserRewardsGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserRewardsGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserRewards model
   */
  readonly fields: UserRewardsFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserRewards.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserRewardsClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserRewards$userArgs<ExtArgs> = {}>(args?: Subset<T, UserRewards$userArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserRewards model
   */
  interface UserRewardsFieldRefs {
    readonly id: FieldRef<"UserRewards", 'Int'>
    readonly rewardId: FieldRef<"UserRewards", 'Int'>
    readonly userId: FieldRef<"UserRewards", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserRewards findUnique
   */
  export type UserRewardsFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * Filter, which UserRewards to fetch.
     */
    where: UserRewardsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards findUniqueOrThrow
   */
  export type UserRewardsFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * Filter, which UserRewards to fetch.
     */
    where: UserRewardsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards findFirst
   */
  export type UserRewardsFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * Filter, which UserRewards to fetch.
     */
    where?: UserRewardsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewards to fetch.
     */
    orderBy?: UserRewardsOrderByWithRelationInput | UserRewardsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRewards.
     */
    cursor?: UserRewardsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRewards.
     */
    distinct?: UserRewardsScalarFieldEnum | UserRewardsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards findFirstOrThrow
   */
  export type UserRewardsFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * Filter, which UserRewards to fetch.
     */
    where?: UserRewardsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewards to fetch.
     */
    orderBy?: UserRewardsOrderByWithRelationInput | UserRewardsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserRewards.
     */
    cursor?: UserRewardsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewards.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserRewards.
     */
    distinct?: UserRewardsScalarFieldEnum | UserRewardsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards findMany
   */
  export type UserRewardsFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * Filter, which UserRewards to fetch.
     */
    where?: UserRewardsWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserRewards to fetch.
     */
    orderBy?: UserRewardsOrderByWithRelationInput | UserRewardsOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserRewards.
     */
    cursor?: UserRewardsWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserRewards from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserRewards.
     */
    skip?: number
    distinct?: UserRewardsScalarFieldEnum | UserRewardsScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards create
   */
  export type UserRewardsCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * The data needed to create a UserRewards.
     */
    data: XOR<UserRewardsCreateInput, UserRewardsUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards createMany
   */
  export type UserRewardsCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserRewards.
     */
    data: UserRewardsCreateManyInput | UserRewardsCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserRewards createManyAndReturn
   */
  export type UserRewardsCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * The data used to create many UserRewards.
     */
    data: UserRewardsCreateManyInput | UserRewardsCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserRewards update
   */
  export type UserRewardsUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * The data needed to update a UserRewards.
     */
    data: XOR<UserRewardsUpdateInput, UserRewardsUncheckedUpdateInput>
    /**
     * Choose, which UserRewards to update.
     */
    where: UserRewardsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards updateMany
   */
  export type UserRewardsUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserRewards.
     */
    data: XOR<UserRewardsUpdateManyMutationInput, UserRewardsUncheckedUpdateManyInput>
    /**
     * Filter which UserRewards to update
     */
    where?: UserRewardsWhereInput
    /**
     * Limit how many UserRewards to update.
     */
    limit?: number
  }

  /**
   * UserRewards updateManyAndReturn
   */
  export type UserRewardsUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * The data used to update UserRewards.
     */
    data: XOR<UserRewardsUpdateManyMutationInput, UserRewardsUncheckedUpdateManyInput>
    /**
     * Filter which UserRewards to update
     */
    where?: UserRewardsWhereInput
    /**
     * Limit how many UserRewards to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserRewards upsert
   */
  export type UserRewardsUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * The filter to search for the UserRewards to update in case it exists.
     */
    where: UserRewardsWhereUniqueInput
    /**
     * In case the UserRewards found by the `where` argument doesn't exist, create a new UserRewards with this data.
     */
    create: XOR<UserRewardsCreateInput, UserRewardsUncheckedCreateInput>
    /**
     * In case the UserRewards was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserRewardsUpdateInput, UserRewardsUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards delete
   */
  export type UserRewardsDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
    /**
     * Filter which UserRewards to delete.
     */
    where: UserRewardsWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserRewards deleteMany
   */
  export type UserRewardsDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserRewards to delete
     */
    where?: UserRewardsWhereInput
    /**
     * Limit how many UserRewards to delete.
     */
    limit?: number
  }

  /**
   * UserRewards.user
   */
  export type UserRewards$userArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the User
     */
    select?: UserSelect<ExtArgs> | null
    /**
     * Omit specific fields from the User
     */
    omit?: UserOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserInclude<ExtArgs> | null
    where?: UserWhereInput
  }

  /**
   * UserRewards without action
   */
  export type UserRewardsDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserRewards
     */
    select?: UserRewardsSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserRewards
     */
    omit?: UserRewardsOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserRewardsInclude<ExtArgs> | null
  }


  /**
   * Model UserTracking
   */

  export type AggregateUserTracking = {
    _count: UserTrackingCountAggregateOutputType | null
    _avg: UserTrackingAvgAggregateOutputType | null
    _sum: UserTrackingSumAggregateOutputType | null
    _min: UserTrackingMinAggregateOutputType | null
    _max: UserTrackingMaxAggregateOutputType | null
  }

  export type UserTrackingAvgAggregateOutputType = {
    id: number | null
    quantity: number | null
  }

  export type UserTrackingSumAggregateOutputType = {
    id: number | null
    quantity: number | null
  }

  export type UserTrackingMinAggregateOutputType = {
    id: number | null
    stat: string | null
    quantity: number | null
    userId: string | null
  }

  export type UserTrackingMaxAggregateOutputType = {
    id: number | null
    stat: string | null
    quantity: number | null
    userId: string | null
  }

  export type UserTrackingCountAggregateOutputType = {
    id: number
    stat: number
    quantity: number
    userId: number
    _all: number
  }


  export type UserTrackingAvgAggregateInputType = {
    id?: true
    quantity?: true
  }

  export type UserTrackingSumAggregateInputType = {
    id?: true
    quantity?: true
  }

  export type UserTrackingMinAggregateInputType = {
    id?: true
    stat?: true
    quantity?: true
    userId?: true
  }

  export type UserTrackingMaxAggregateInputType = {
    id?: true
    stat?: true
    quantity?: true
    userId?: true
  }

  export type UserTrackingCountAggregateInputType = {
    id?: true
    stat?: true
    quantity?: true
    userId?: true
    _all?: true
  }

  export type UserTrackingAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTracking to aggregate.
     */
    where?: UserTrackingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTrackings to fetch.
     */
    orderBy?: UserTrackingOrderByWithRelationInput | UserTrackingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserTrackingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTrackings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTrackings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserTrackings
    **/
    _count?: true | UserTrackingCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserTrackingAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserTrackingSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserTrackingMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserTrackingMaxAggregateInputType
  }

  export type GetUserTrackingAggregateType<T extends UserTrackingAggregateArgs> = {
        [P in keyof T & keyof AggregateUserTracking]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserTracking[P]>
      : GetScalarType<T[P], AggregateUserTracking[P]>
  }




  export type UserTrackingGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserTrackingWhereInput
    orderBy?: UserTrackingOrderByWithAggregationInput | UserTrackingOrderByWithAggregationInput[]
    by: UserTrackingScalarFieldEnum[] | UserTrackingScalarFieldEnum
    having?: UserTrackingScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserTrackingCountAggregateInputType | true
    _avg?: UserTrackingAvgAggregateInputType
    _sum?: UserTrackingSumAggregateInputType
    _min?: UserTrackingMinAggregateInputType
    _max?: UserTrackingMaxAggregateInputType
  }

  export type UserTrackingGroupByOutputType = {
    id: number
    stat: string
    quantity: number
    userId: string
    _count: UserTrackingCountAggregateOutputType | null
    _avg: UserTrackingAvgAggregateOutputType | null
    _sum: UserTrackingSumAggregateOutputType | null
    _min: UserTrackingMinAggregateOutputType | null
    _max: UserTrackingMaxAggregateOutputType | null
  }

  type GetUserTrackingGroupByPayload<T extends UserTrackingGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserTrackingGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserTrackingGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserTrackingGroupByOutputType[P]>
            : GetScalarType<T[P], UserTrackingGroupByOutputType[P]>
        }
      >
    >


  export type UserTrackingSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    stat?: boolean
    quantity?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTracking"]>

  export type UserTrackingSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    stat?: boolean
    quantity?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTracking"]>

  export type UserTrackingSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    stat?: boolean
    quantity?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userTracking"]>

  export type UserTrackingSelectScalar = {
    id?: boolean
    stat?: boolean
    quantity?: boolean
    userId?: boolean
  }

  export type UserTrackingOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "stat" | "quantity" | "userId", ExtArgs["result"]["userTracking"]>
  export type UserTrackingInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserTrackingIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserTrackingIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserTrackingPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserTracking"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: number
      stat: string
      quantity: number
      userId: string
    }, ExtArgs["result"]["userTracking"]>
    composites: {}
  }

  type UserTrackingGetPayload<S extends boolean | null | undefined | UserTrackingDefaultArgs> = $Result.GetResult<Prisma.$UserTrackingPayload, S>

  type UserTrackingCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserTrackingFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UserTrackingCountAggregateInputType | true
    }

  export interface UserTrackingDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserTracking'], meta: { name: 'UserTracking' } }
    /**
     * Find zero or one UserTracking that matches the filter.
     * @param {UserTrackingFindUniqueArgs} args - Arguments to find a UserTracking
     * @example
     * // Get one UserTracking
     * const userTracking = await prisma.userTracking.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserTrackingFindUniqueArgs>(args: SelectSubset<T, UserTrackingFindUniqueArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserTracking that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserTrackingFindUniqueOrThrowArgs} args - Arguments to find a UserTracking
     * @example
     * // Get one UserTracking
     * const userTracking = await prisma.userTracking.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserTrackingFindUniqueOrThrowArgs>(args: SelectSubset<T, UserTrackingFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTracking that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingFindFirstArgs} args - Arguments to find a UserTracking
     * @example
     * // Get one UserTracking
     * const userTracking = await prisma.userTracking.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserTrackingFindFirstArgs>(args?: SelectSubset<T, UserTrackingFindFirstArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserTracking that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingFindFirstOrThrowArgs} args - Arguments to find a UserTracking
     * @example
     * // Get one UserTracking
     * const userTracking = await prisma.userTracking.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserTrackingFindFirstOrThrowArgs>(args?: SelectSubset<T, UserTrackingFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserTrackings that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserTrackings
     * const userTrackings = await prisma.userTracking.findMany()
     * 
     * // Get first 10 UserTrackings
     * const userTrackings = await prisma.userTracking.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userTrackingWithIdOnly = await prisma.userTracking.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserTrackingFindManyArgs>(args?: SelectSubset<T, UserTrackingFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserTracking.
     * @param {UserTrackingCreateArgs} args - Arguments to create a UserTracking.
     * @example
     * // Create one UserTracking
     * const UserTracking = await prisma.userTracking.create({
     *   data: {
     *     // ... data to create a UserTracking
     *   }
     * })
     * 
     */
    create<T extends UserTrackingCreateArgs>(args: SelectSubset<T, UserTrackingCreateArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserTrackings.
     * @param {UserTrackingCreateManyArgs} args - Arguments to create many UserTrackings.
     * @example
     * // Create many UserTrackings
     * const userTracking = await prisma.userTracking.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserTrackingCreateManyArgs>(args?: SelectSubset<T, UserTrackingCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserTrackings and returns the data saved in the database.
     * @param {UserTrackingCreateManyAndReturnArgs} args - Arguments to create many UserTrackings.
     * @example
     * // Create many UserTrackings
     * const userTracking = await prisma.userTracking.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserTrackings and only return the `id`
     * const userTrackingWithIdOnly = await prisma.userTracking.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserTrackingCreateManyAndReturnArgs>(args?: SelectSubset<T, UserTrackingCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserTracking.
     * @param {UserTrackingDeleteArgs} args - Arguments to delete one UserTracking.
     * @example
     * // Delete one UserTracking
     * const UserTracking = await prisma.userTracking.delete({
     *   where: {
     *     // ... filter to delete one UserTracking
     *   }
     * })
     * 
     */
    delete<T extends UserTrackingDeleteArgs>(args: SelectSubset<T, UserTrackingDeleteArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserTracking.
     * @param {UserTrackingUpdateArgs} args - Arguments to update one UserTracking.
     * @example
     * // Update one UserTracking
     * const userTracking = await prisma.userTracking.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserTrackingUpdateArgs>(args: SelectSubset<T, UserTrackingUpdateArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserTrackings.
     * @param {UserTrackingDeleteManyArgs} args - Arguments to filter UserTrackings to delete.
     * @example
     * // Delete a few UserTrackings
     * const { count } = await prisma.userTracking.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserTrackingDeleteManyArgs>(args?: SelectSubset<T, UserTrackingDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTrackings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserTrackings
     * const userTracking = await prisma.userTracking.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserTrackingUpdateManyArgs>(args: SelectSubset<T, UserTrackingUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserTrackings and returns the data updated in the database.
     * @param {UserTrackingUpdateManyAndReturnArgs} args - Arguments to update many UserTrackings.
     * @example
     * // Update many UserTrackings
     * const userTracking = await prisma.userTracking.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserTrackings and only return the `id`
     * const userTrackingWithIdOnly = await prisma.userTracking.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserTrackingUpdateManyAndReturnArgs>(args: SelectSubset<T, UserTrackingUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserTracking.
     * @param {UserTrackingUpsertArgs} args - Arguments to update or create a UserTracking.
     * @example
     * // Update or create a UserTracking
     * const userTracking = await prisma.userTracking.upsert({
     *   create: {
     *     // ... data to create a UserTracking
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserTracking we want to update
     *   }
     * })
     */
    upsert<T extends UserTrackingUpsertArgs>(args: SelectSubset<T, UserTrackingUpsertArgs<ExtArgs>>): Prisma__UserTrackingClient<$Result.GetResult<Prisma.$UserTrackingPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserTrackings.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingCountArgs} args - Arguments to filter UserTrackings to count.
     * @example
     * // Count the number of UserTrackings
     * const count = await prisma.userTracking.count({
     *   where: {
     *     // ... the filter for the UserTrackings we want to count
     *   }
     * })
    **/
    count<T extends UserTrackingCountArgs>(
      args?: Subset<T, UserTrackingCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserTrackingCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserTracking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserTrackingAggregateArgs>(args: Subset<T, UserTrackingAggregateArgs>): Prisma.PrismaPromise<GetUserTrackingAggregateType<T>>

    /**
     * Group by UserTracking.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserTrackingGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserTrackingGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserTrackingGroupByArgs['orderBy'] }
        : { orderBy?: UserTrackingGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserTrackingGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserTrackingGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserTracking model
   */
  readonly fields: UserTrackingFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserTracking.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserTrackingClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserTracking model
   */
  interface UserTrackingFieldRefs {
    readonly id: FieldRef<"UserTracking", 'Int'>
    readonly stat: FieldRef<"UserTracking", 'String'>
    readonly quantity: FieldRef<"UserTracking", 'Int'>
    readonly userId: FieldRef<"UserTracking", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserTracking findUnique
   */
  export type UserTrackingFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * Filter, which UserTracking to fetch.
     */
    where: UserTrackingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking findUniqueOrThrow
   */
  export type UserTrackingFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * Filter, which UserTracking to fetch.
     */
    where: UserTrackingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking findFirst
   */
  export type UserTrackingFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * Filter, which UserTracking to fetch.
     */
    where?: UserTrackingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTrackings to fetch.
     */
    orderBy?: UserTrackingOrderByWithRelationInput | UserTrackingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTrackings.
     */
    cursor?: UserTrackingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTrackings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTrackings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTrackings.
     */
    distinct?: UserTrackingScalarFieldEnum | UserTrackingScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking findFirstOrThrow
   */
  export type UserTrackingFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * Filter, which UserTracking to fetch.
     */
    where?: UserTrackingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTrackings to fetch.
     */
    orderBy?: UserTrackingOrderByWithRelationInput | UserTrackingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserTrackings.
     */
    cursor?: UserTrackingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTrackings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTrackings.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserTrackings.
     */
    distinct?: UserTrackingScalarFieldEnum | UserTrackingScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking findMany
   */
  export type UserTrackingFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * Filter, which UserTrackings to fetch.
     */
    where?: UserTrackingWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserTrackings to fetch.
     */
    orderBy?: UserTrackingOrderByWithRelationInput | UserTrackingOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserTrackings.
     */
    cursor?: UserTrackingWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserTrackings from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserTrackings.
     */
    skip?: number
    distinct?: UserTrackingScalarFieldEnum | UserTrackingScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking create
   */
  export type UserTrackingCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * The data needed to create a UserTracking.
     */
    data: XOR<UserTrackingCreateInput, UserTrackingUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking createMany
   */
  export type UserTrackingCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserTrackings.
     */
    data: UserTrackingCreateManyInput | UserTrackingCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserTracking createManyAndReturn
   */
  export type UserTrackingCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * The data used to create many UserTrackings.
     */
    data: UserTrackingCreateManyInput | UserTrackingCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTracking update
   */
  export type UserTrackingUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * The data needed to update a UserTracking.
     */
    data: XOR<UserTrackingUpdateInput, UserTrackingUncheckedUpdateInput>
    /**
     * Choose, which UserTracking to update.
     */
    where: UserTrackingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking updateMany
   */
  export type UserTrackingUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserTrackings.
     */
    data: XOR<UserTrackingUpdateManyMutationInput, UserTrackingUncheckedUpdateManyInput>
    /**
     * Filter which UserTrackings to update
     */
    where?: UserTrackingWhereInput
    /**
     * Limit how many UserTrackings to update.
     */
    limit?: number
  }

  /**
   * UserTracking updateManyAndReturn
   */
  export type UserTrackingUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * The data used to update UserTrackings.
     */
    data: XOR<UserTrackingUpdateManyMutationInput, UserTrackingUncheckedUpdateManyInput>
    /**
     * Filter which UserTrackings to update
     */
    where?: UserTrackingWhereInput
    /**
     * Limit how many UserTrackings to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserTracking upsert
   */
  export type UserTrackingUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * The filter to search for the UserTracking to update in case it exists.
     */
    where: UserTrackingWhereUniqueInput
    /**
     * In case the UserTracking found by the `where` argument doesn't exist, create a new UserTracking with this data.
     */
    create: XOR<UserTrackingCreateInput, UserTrackingUncheckedCreateInput>
    /**
     * In case the UserTracking was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserTrackingUpdateInput, UserTrackingUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking delete
   */
  export type UserTrackingDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
    /**
     * Filter which UserTracking to delete.
     */
    where: UserTrackingWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserTracking deleteMany
   */
  export type UserTrackingDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserTrackings to delete
     */
    where?: UserTrackingWhereInput
    /**
     * Limit how many UserTrackings to delete.
     */
    limit?: number
  }

  /**
   * UserTracking without action
   */
  export type UserTrackingDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserTracking
     */
    select?: UserTrackingSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserTracking
     */
    omit?: UserTrackingOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserTrackingInclude<ExtArgs> | null
  }


  /**
   * Model UserWallet
   */

  export type AggregateUserWallet = {
    _count: UserWalletCountAggregateOutputType | null
    _avg: UserWalletAvgAggregateOutputType | null
    _sum: UserWalletSumAggregateOutputType | null
    _min: UserWalletMinAggregateOutputType | null
    _max: UserWalletMaxAggregateOutputType | null
  }

  export type UserWalletAvgAggregateOutputType = {
    amount: number | null
  }

  export type UserWalletSumAggregateOutputType = {
    amount: number | null
  }

  export type UserWalletMinAggregateOutputType = {
    id: string | null
    type: $Enums.MoneyType | null
    amount: number | null
    userId: string | null
  }

  export type UserWalletMaxAggregateOutputType = {
    id: string | null
    type: $Enums.MoneyType | null
    amount: number | null
    userId: string | null
  }

  export type UserWalletCountAggregateOutputType = {
    id: number
    type: number
    amount: number
    userId: number
    _all: number
  }


  export type UserWalletAvgAggregateInputType = {
    amount?: true
  }

  export type UserWalletSumAggregateInputType = {
    amount?: true
  }

  export type UserWalletMinAggregateInputType = {
    id?: true
    type?: true
    amount?: true
    userId?: true
  }

  export type UserWalletMaxAggregateInputType = {
    id?: true
    type?: true
    amount?: true
    userId?: true
  }

  export type UserWalletCountAggregateInputType = {
    id?: true
    type?: true
    amount?: true
    userId?: true
    _all?: true
  }

  export type UserWalletAggregateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserWallet to aggregate.
     */
    where?: UserWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserWallets to fetch.
     */
    orderBy?: UserWalletOrderByWithRelationInput | UserWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the start position
     */
    cursor?: UserWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Count returned UserWallets
    **/
    _count?: true | UserWalletCountAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to average
    **/
    _avg?: UserWalletAvgAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to sum
    **/
    _sum?: UserWalletSumAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the minimum value
    **/
    _min?: UserWalletMinAggregateInputType
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/aggregations Aggregation Docs}
     * 
     * Select which fields to find the maximum value
    **/
    _max?: UserWalletMaxAggregateInputType
  }

  export type GetUserWalletAggregateType<T extends UserWalletAggregateArgs> = {
        [P in keyof T & keyof AggregateUserWallet]: P extends '_count' | 'count'
      ? T[P] extends true
        ? number
        : GetScalarType<T[P], AggregateUserWallet[P]>
      : GetScalarType<T[P], AggregateUserWallet[P]>
  }




  export type UserWalletGroupByArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    where?: UserWalletWhereInput
    orderBy?: UserWalletOrderByWithAggregationInput | UserWalletOrderByWithAggregationInput[]
    by: UserWalletScalarFieldEnum[] | UserWalletScalarFieldEnum
    having?: UserWalletScalarWhereWithAggregatesInput
    take?: number
    skip?: number
    _count?: UserWalletCountAggregateInputType | true
    _avg?: UserWalletAvgAggregateInputType
    _sum?: UserWalletSumAggregateInputType
    _min?: UserWalletMinAggregateInputType
    _max?: UserWalletMaxAggregateInputType
  }

  export type UserWalletGroupByOutputType = {
    id: string
    type: $Enums.MoneyType
    amount: number
    userId: string
    _count: UserWalletCountAggregateOutputType | null
    _avg: UserWalletAvgAggregateOutputType | null
    _sum: UserWalletSumAggregateOutputType | null
    _min: UserWalletMinAggregateOutputType | null
    _max: UserWalletMaxAggregateOutputType | null
  }

  type GetUserWalletGroupByPayload<T extends UserWalletGroupByArgs> = Prisma.PrismaPromise<
    Array<
      PickEnumerable<UserWalletGroupByOutputType, T['by']> &
        {
          [P in ((keyof T) & (keyof UserWalletGroupByOutputType))]: P extends '_count'
            ? T[P] extends boolean
              ? number
              : GetScalarType<T[P], UserWalletGroupByOutputType[P]>
            : GetScalarType<T[P], UserWalletGroupByOutputType[P]>
        }
      >
    >


  export type UserWalletSelect<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    amount?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userWallet"]>

  export type UserWalletSelectCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    amount?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userWallet"]>

  export type UserWalletSelectUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetSelect<{
    id?: boolean
    type?: boolean
    amount?: boolean
    userId?: boolean
    user?: boolean | UserDefaultArgs<ExtArgs>
  }, ExtArgs["result"]["userWallet"]>

  export type UserWalletSelectScalar = {
    id?: boolean
    type?: boolean
    amount?: boolean
    userId?: boolean
  }

  export type UserWalletOmit<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = $Extensions.GetOmit<"id" | "type" | "amount" | "userId", ExtArgs["result"]["userWallet"]>
  export type UserWalletInclude<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserWalletIncludeCreateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }
  export type UserWalletIncludeUpdateManyAndReturn<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    user?: boolean | UserDefaultArgs<ExtArgs>
  }

  export type $UserWalletPayload<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    name: "UserWallet"
    objects: {
      user: Prisma.$UserPayload<ExtArgs>
    }
    scalars: $Extensions.GetPayloadResult<{
      id: string
      type: $Enums.MoneyType
      amount: number
      userId: string
    }, ExtArgs["result"]["userWallet"]>
    composites: {}
  }

  type UserWalletGetPayload<S extends boolean | null | undefined | UserWalletDefaultArgs> = $Result.GetResult<Prisma.$UserWalletPayload, S>

  type UserWalletCountArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> =
    Omit<UserWalletFindManyArgs, 'select' | 'include' | 'distinct' | 'omit' | 'relationLoadStrategy'> & {
      select?: UserWalletCountAggregateInputType | true
    }

  export interface UserWalletDelegate<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: { types: Prisma.TypeMap<ExtArgs>['model']['UserWallet'], meta: { name: 'UserWallet' } }
    /**
     * Find zero or one UserWallet that matches the filter.
     * @param {UserWalletFindUniqueArgs} args - Arguments to find a UserWallet
     * @example
     * // Get one UserWallet
     * const userWallet = await prisma.userWallet.findUnique({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUnique<T extends UserWalletFindUniqueArgs>(args: SelectSubset<T, UserWalletFindUniqueArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find one UserWallet that matches the filter or throw an error with `error.code='P2025'`
     * if no matches were found.
     * @param {UserWalletFindUniqueOrThrowArgs} args - Arguments to find a UserWallet
     * @example
     * // Get one UserWallet
     * const userWallet = await prisma.userWallet.findUniqueOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findUniqueOrThrow<T extends UserWalletFindUniqueOrThrowArgs>(args: SelectSubset<T, UserWalletFindUniqueOrThrowArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserWallet that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletFindFirstArgs} args - Arguments to find a UserWallet
     * @example
     * // Get one UserWallet
     * const userWallet = await prisma.userWallet.findFirst({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirst<T extends UserWalletFindFirstArgs>(args?: SelectSubset<T, UserWalletFindFirstArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>

    /**
     * Find the first UserWallet that matches the filter or
     * throw `PrismaKnownClientError` with `P2025` code if no matches were found.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletFindFirstOrThrowArgs} args - Arguments to find a UserWallet
     * @example
     * // Get one UserWallet
     * const userWallet = await prisma.userWallet.findFirstOrThrow({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     */
    findFirstOrThrow<T extends UserWalletFindFirstOrThrowArgs>(args?: SelectSubset<T, UserWalletFindFirstOrThrowArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Find zero or more UserWallets that matches the filter.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletFindManyArgs} args - Arguments to filter and select certain fields only.
     * @example
     * // Get all UserWallets
     * const userWallets = await prisma.userWallet.findMany()
     * 
     * // Get first 10 UserWallets
     * const userWallets = await prisma.userWallet.findMany({ take: 10 })
     * 
     * // Only select the `id`
     * const userWalletWithIdOnly = await prisma.userWallet.findMany({ select: { id: true } })
     * 
     */
    findMany<T extends UserWalletFindManyArgs>(args?: SelectSubset<T, UserWalletFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>

    /**
     * Create a UserWallet.
     * @param {UserWalletCreateArgs} args - Arguments to create a UserWallet.
     * @example
     * // Create one UserWallet
     * const UserWallet = await prisma.userWallet.create({
     *   data: {
     *     // ... data to create a UserWallet
     *   }
     * })
     * 
     */
    create<T extends UserWalletCreateArgs>(args: SelectSubset<T, UserWalletCreateArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Create many UserWallets.
     * @param {UserWalletCreateManyArgs} args - Arguments to create many UserWallets.
     * @example
     * // Create many UserWallets
     * const userWallet = await prisma.userWallet.createMany({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     *     
     */
    createMany<T extends UserWalletCreateManyArgs>(args?: SelectSubset<T, UserWalletCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Create many UserWallets and returns the data saved in the database.
     * @param {UserWalletCreateManyAndReturnArgs} args - Arguments to create many UserWallets.
     * @example
     * // Create many UserWallets
     * const userWallet = await prisma.userWallet.createManyAndReturn({
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Create many UserWallets and only return the `id`
     * const userWalletWithIdOnly = await prisma.userWallet.createManyAndReturn({
     *   select: { id: true },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    createManyAndReturn<T extends UserWalletCreateManyAndReturnArgs>(args?: SelectSubset<T, UserWalletCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>

    /**
     * Delete a UserWallet.
     * @param {UserWalletDeleteArgs} args - Arguments to delete one UserWallet.
     * @example
     * // Delete one UserWallet
     * const UserWallet = await prisma.userWallet.delete({
     *   where: {
     *     // ... filter to delete one UserWallet
     *   }
     * })
     * 
     */
    delete<T extends UserWalletDeleteArgs>(args: SelectSubset<T, UserWalletDeleteArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Update one UserWallet.
     * @param {UserWalletUpdateArgs} args - Arguments to update one UserWallet.
     * @example
     * // Update one UserWallet
     * const userWallet = await prisma.userWallet.update({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    update<T extends UserWalletUpdateArgs>(args: SelectSubset<T, UserWalletUpdateArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>

    /**
     * Delete zero or more UserWallets.
     * @param {UserWalletDeleteManyArgs} args - Arguments to filter UserWallets to delete.
     * @example
     * // Delete a few UserWallets
     * const { count } = await prisma.userWallet.deleteMany({
     *   where: {
     *     // ... provide filter here
     *   }
     * })
     * 
     */
    deleteMany<T extends UserWalletDeleteManyArgs>(args?: SelectSubset<T, UserWalletDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserWallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletUpdateManyArgs} args - Arguments to update one or more rows.
     * @example
     * // Update many UserWallets
     * const userWallet = await prisma.userWallet.updateMany({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: {
     *     // ... provide data here
     *   }
     * })
     * 
     */
    updateMany<T extends UserWalletUpdateManyArgs>(args: SelectSubset<T, UserWalletUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<BatchPayload>

    /**
     * Update zero or more UserWallets and returns the data updated in the database.
     * @param {UserWalletUpdateManyAndReturnArgs} args - Arguments to update many UserWallets.
     * @example
     * // Update many UserWallets
     * const userWallet = await prisma.userWallet.updateManyAndReturn({
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * 
     * // Update zero or more UserWallets and only return the `id`
     * const userWalletWithIdOnly = await prisma.userWallet.updateManyAndReturn({
     *   select: { id: true },
     *   where: {
     *     // ... provide filter here
     *   },
     *   data: [
     *     // ... provide data here
     *   ]
     * })
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * 
     */
    updateManyAndReturn<T extends UserWalletUpdateManyAndReturnArgs>(args: SelectSubset<T, UserWalletUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>

    /**
     * Create or update one UserWallet.
     * @param {UserWalletUpsertArgs} args - Arguments to update or create a UserWallet.
     * @example
     * // Update or create a UserWallet
     * const userWallet = await prisma.userWallet.upsert({
     *   create: {
     *     // ... data to create a UserWallet
     *   },
     *   update: {
     *     // ... in case it already exists, update
     *   },
     *   where: {
     *     // ... the filter for the UserWallet we want to update
     *   }
     * })
     */
    upsert<T extends UserWalletUpsertArgs>(args: SelectSubset<T, UserWalletUpsertArgs<ExtArgs>>): Prisma__UserWalletClient<$Result.GetResult<Prisma.$UserWalletPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>


    /**
     * Count the number of UserWallets.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletCountArgs} args - Arguments to filter UserWallets to count.
     * @example
     * // Count the number of UserWallets
     * const count = await prisma.userWallet.count({
     *   where: {
     *     // ... the filter for the UserWallets we want to count
     *   }
     * })
    **/
    count<T extends UserWalletCountArgs>(
      args?: Subset<T, UserWalletCountArgs>,
    ): Prisma.PrismaPromise<
      T extends $Utils.Record<'select', any>
        ? T['select'] extends true
          ? number
          : GetScalarType<T['select'], UserWalletCountAggregateOutputType>
        : number
    >

    /**
     * Allows you to perform aggregations operations on a UserWallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletAggregateArgs} args - Select which aggregations you would like to apply and on what fields.
     * @example
     * // Ordered by age ascending
     * // Where email contains prisma.io
     * // Limited to the 10 users
     * const aggregations = await prisma.user.aggregate({
     *   _avg: {
     *     age: true,
     *   },
     *   where: {
     *     email: {
     *       contains: "prisma.io",
     *     },
     *   },
     *   orderBy: {
     *     age: "asc",
     *   },
     *   take: 10,
     * })
    **/
    aggregate<T extends UserWalletAggregateArgs>(args: Subset<T, UserWalletAggregateArgs>): Prisma.PrismaPromise<GetUserWalletAggregateType<T>>

    /**
     * Group by UserWallet.
     * Note, that providing `undefined` is treated as the value not being there.
     * Read more here: https://pris.ly/d/null-undefined
     * @param {UserWalletGroupByArgs} args - Group by arguments.
     * @example
     * // Group by city, order by createdAt, get count
     * const result = await prisma.user.groupBy({
     *   by: ['city', 'createdAt'],
     *   orderBy: {
     *     createdAt: true
     *   },
     *   _count: {
     *     _all: true
     *   },
     * })
     * 
    **/
    groupBy<
      T extends UserWalletGroupByArgs,
      HasSelectOrTake extends Or<
        Extends<'skip', Keys<T>>,
        Extends<'take', Keys<T>>
      >,
      OrderByArg extends True extends HasSelectOrTake
        ? { orderBy: UserWalletGroupByArgs['orderBy'] }
        : { orderBy?: UserWalletGroupByArgs['orderBy'] },
      OrderFields extends ExcludeUnderscoreKeys<Keys<MaybeTupleToUnion<T['orderBy']>>>,
      ByFields extends MaybeTupleToUnion<T['by']>,
      ByValid extends Has<ByFields, OrderFields>,
      HavingFields extends GetHavingFields<T['having']>,
      HavingValid extends Has<ByFields, HavingFields>,
      ByEmpty extends T['by'] extends never[] ? True : False,
      InputErrors extends ByEmpty extends True
      ? `Error: "by" must not be empty.`
      : HavingValid extends False
      ? {
          [P in HavingFields]: P extends ByFields
            ? never
            : P extends string
            ? `Error: Field "${P}" used in "having" needs to be provided in "by".`
            : [
                Error,
                'Field ',
                P,
                ` in "having" needs to be provided in "by"`,
              ]
        }[HavingFields]
      : 'take' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "take", you also need to provide "orderBy"'
      : 'skip' extends Keys<T>
      ? 'orderBy' extends Keys<T>
        ? ByValid extends True
          ? {}
          : {
              [P in OrderFields]: P extends ByFields
                ? never
                : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
            }[OrderFields]
        : 'Error: If you provide "skip", you also need to provide "orderBy"'
      : ByValid extends True
      ? {}
      : {
          [P in OrderFields]: P extends ByFields
            ? never
            : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`
        }[OrderFields]
    >(args: SubsetIntersection<T, UserWalletGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetUserWalletGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>
  /**
   * Fields of the UserWallet model
   */
  readonly fields: UserWalletFieldRefs;
  }

  /**
   * The delegate class that acts as a "Promise-like" for UserWallet.
   * Why is this prefixed with `Prisma__`?
   * Because we want to prevent naming conflicts as mentioned in
   * https://github.com/prisma/prisma-client-js/issues/707
   */
  export interface Prisma__UserWalletClient<T, Null = never, ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise"
    user<T extends UserDefaultArgs<ExtArgs> = {}>(args?: Subset<T, UserDefaultArgs<ExtArgs>>): Prisma__UserClient<$Result.GetResult<Prisma.$UserPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>
    /**
     * Attaches callbacks for the resolution and/or rejection of the Promise.
     * @param onfulfilled The callback to execute when the Promise is resolved.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of which ever callback is executed.
     */
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): $Utils.JsPromise<TResult1 | TResult2>
    /**
     * Attaches a callback for only the rejection of the Promise.
     * @param onrejected The callback to execute when the Promise is rejected.
     * @returns A Promise for the completion of the callback.
     */
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): $Utils.JsPromise<T | TResult>
    /**
     * Attaches a callback that is invoked when the Promise is settled (fulfilled or rejected). The
     * resolved value cannot be modified from the callback.
     * @param onfinally The callback to execute when the Promise is settled (fulfilled or rejected).
     * @returns A Promise for the completion of the callback.
     */
    finally(onfinally?: (() => void) | undefined | null): $Utils.JsPromise<T>
  }




  /**
   * Fields of the UserWallet model
   */
  interface UserWalletFieldRefs {
    readonly id: FieldRef<"UserWallet", 'String'>
    readonly type: FieldRef<"UserWallet", 'MoneyType'>
    readonly amount: FieldRef<"UserWallet", 'Int'>
    readonly userId: FieldRef<"UserWallet", 'String'>
  }
    

  // Custom InputTypes
  /**
   * UserWallet findUnique
   */
  export type UserWalletFindUniqueArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * Filter, which UserWallet to fetch.
     */
    where: UserWalletWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet findUniqueOrThrow
   */
  export type UserWalletFindUniqueOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * Filter, which UserWallet to fetch.
     */
    where: UserWalletWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet findFirst
   */
  export type UserWalletFindFirstArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * Filter, which UserWallet to fetch.
     */
    where?: UserWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserWallets to fetch.
     */
    orderBy?: UserWalletOrderByWithRelationInput | UserWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserWallets.
     */
    cursor?: UserWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserWallets.
     */
    distinct?: UserWalletScalarFieldEnum | UserWalletScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet findFirstOrThrow
   */
  export type UserWalletFindFirstOrThrowArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * Filter, which UserWallet to fetch.
     */
    where?: UserWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserWallets to fetch.
     */
    orderBy?: UserWalletOrderByWithRelationInput | UserWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for searching for UserWallets.
     */
    cursor?: UserWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserWallets.
     */
    skip?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/distinct Distinct Docs}
     * 
     * Filter by unique combinations of UserWallets.
     */
    distinct?: UserWalletScalarFieldEnum | UserWalletScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet findMany
   */
  export type UserWalletFindManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * Filter, which UserWallets to fetch.
     */
    where?: UserWalletWhereInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/sorting Sorting Docs}
     * 
     * Determine the order of UserWallets to fetch.
     */
    orderBy?: UserWalletOrderByWithRelationInput | UserWalletOrderByWithRelationInput[]
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination#cursor-based-pagination Cursor Docs}
     * 
     * Sets the position for listing UserWallets.
     */
    cursor?: UserWalletWhereUniqueInput
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Take `±n` UserWallets from the position of the cursor.
     */
    take?: number
    /**
     * {@link https://www.prisma.io/docs/concepts/components/prisma-client/pagination Pagination Docs}
     * 
     * Skip the first `n` UserWallets.
     */
    skip?: number
    distinct?: UserWalletScalarFieldEnum | UserWalletScalarFieldEnum[]
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet create
   */
  export type UserWalletCreateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * The data needed to create a UserWallet.
     */
    data: XOR<UserWalletCreateInput, UserWalletUncheckedCreateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet createMany
   */
  export type UserWalletCreateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to create many UserWallets.
     */
    data: UserWalletCreateManyInput | UserWalletCreateManyInput[]
    skipDuplicates?: boolean
  }

  /**
   * UserWallet createManyAndReturn
   */
  export type UserWalletCreateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelectCreateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * The data used to create many UserWallets.
     */
    data: UserWalletCreateManyInput | UserWalletCreateManyInput[]
    skipDuplicates?: boolean
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletIncludeCreateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserWallet update
   */
  export type UserWalletUpdateArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * The data needed to update a UserWallet.
     */
    data: XOR<UserWalletUpdateInput, UserWalletUncheckedUpdateInput>
    /**
     * Choose, which UserWallet to update.
     */
    where: UserWalletWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet updateMany
   */
  export type UserWalletUpdateManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * The data used to update UserWallets.
     */
    data: XOR<UserWalletUpdateManyMutationInput, UserWalletUncheckedUpdateManyInput>
    /**
     * Filter which UserWallets to update
     */
    where?: UserWalletWhereInput
    /**
     * Limit how many UserWallets to update.
     */
    limit?: number
  }

  /**
   * UserWallet updateManyAndReturn
   */
  export type UserWalletUpdateManyAndReturnArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelectUpdateManyAndReturn<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * The data used to update UserWallets.
     */
    data: XOR<UserWalletUpdateManyMutationInput, UserWalletUncheckedUpdateManyInput>
    /**
     * Filter which UserWallets to update
     */
    where?: UserWalletWhereInput
    /**
     * Limit how many UserWallets to update.
     */
    limit?: number
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletIncludeUpdateManyAndReturn<ExtArgs> | null
  }

  /**
   * UserWallet upsert
   */
  export type UserWalletUpsertArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * The filter to search for the UserWallet to update in case it exists.
     */
    where: UserWalletWhereUniqueInput
    /**
     * In case the UserWallet found by the `where` argument doesn't exist, create a new UserWallet with this data.
     */
    create: XOR<UserWalletCreateInput, UserWalletUncheckedCreateInput>
    /**
     * In case the UserWallet was found with the provided `where` argument, update it with this data.
     */
    update: XOR<UserWalletUpdateInput, UserWalletUncheckedUpdateInput>
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet delete
   */
  export type UserWalletDeleteArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
    /**
     * Filter which UserWallet to delete.
     */
    where: UserWalletWhereUniqueInput
    relationLoadStrategy?: RelationLoadStrategy
  }

  /**
   * UserWallet deleteMany
   */
  export type UserWalletDeleteManyArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Filter which UserWallets to delete
     */
    where?: UserWalletWhereInput
    /**
     * Limit how many UserWallets to delete.
     */
    limit?: number
  }

  /**
   * UserWallet without action
   */
  export type UserWalletDefaultArgs<ExtArgs extends $Extensions.InternalArgs = $Extensions.DefaultArgs> = {
    /**
     * Select specific fields to fetch from the UserWallet
     */
    select?: UserWalletSelect<ExtArgs> | null
    /**
     * Omit specific fields from the UserWallet
     */
    omit?: UserWalletOmit<ExtArgs> | null
    /**
     * Choose, which related nodes to fetch as well
     */
    include?: UserWalletInclude<ExtArgs> | null
  }


  /**
   * Enums
   */

  export const TransactionIsolationLevel: {
    ReadUncommitted: 'ReadUncommitted',
    ReadCommitted: 'ReadCommitted',
    RepeatableRead: 'RepeatableRead',
    Serializable: 'Serializable'
  };

  export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel]


  export const RankingScalarFieldEnum: {
    id: 'id',
    dinozCount: 'dinozCount',
    points: 'points',
    average: 'average',
    completion: 'completion',
    dojo: 'dojo',
    userId: 'userId'
  };

  export type RankingScalarFieldEnum = (typeof RankingScalarFieldEnum)[keyof typeof RankingScalarFieldEnum]


  export const RelationLoadStrategy: {
    query: 'query',
    join: 'join'
  };

  export type RelationLoadStrategy = (typeof RelationLoadStrategy)[keyof typeof RelationLoadStrategy]


  export const SignupDeviceMonthCounterScalarFieldEnum: {
    id: 'id',
    monthKey: 'monthKey',
    deviceToken: 'deviceToken',
    count: 'count',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SignupDeviceMonthCounterScalarFieldEnum = (typeof SignupDeviceMonthCounterScalarFieldEnum)[keyof typeof SignupDeviceMonthCounterScalarFieldEnum]


  export const SignupIpMonthCounterScalarFieldEnum: {
    id: 'id',
    monthKey: 'monthKey',
    ipToken: 'ipToken',
    count: 'count',
    expiresAt: 'expiresAt',
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  };

  export type SignupIpMonthCounterScalarFieldEnum = (typeof SignupIpMonthCounterScalarFieldEnum)[keyof typeof SignupIpMonthCounterScalarFieldEnum]


  export const UserScalarFieldEnum: {
    id: 'id',
    name: 'name',
    password: 'password',
    role: 'role',
    createdDate: 'createdDate',
    updatedAt: 'updatedAt',
    lastLogin: 'lastLogin'
  };

  export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum]


  export const UserItemsScalarFieldEnum: {
    id: 'id',
    itemId: 'itemId',
    quantity: 'quantity',
    userId: 'userId'
  };

  export type UserItemsScalarFieldEnum = (typeof UserItemsScalarFieldEnum)[keyof typeof UserItemsScalarFieldEnum]


  export const UserProfileScalarFieldEnum: {
    id: 'id',
    userId: 'userId',
    avatar: 'avatar',
    avatarType: 'avatarType',
    language: 'language',
    gender: 'gender',
    age: 'age',
    description: 'description'
  };

  export type UserProfileScalarFieldEnum = (typeof UserProfileScalarFieldEnum)[keyof typeof UserProfileScalarFieldEnum]


  export const UserRewardsScalarFieldEnum: {
    id: 'id',
    rewardId: 'rewardId',
    userId: 'userId'
  };

  export type UserRewardsScalarFieldEnum = (typeof UserRewardsScalarFieldEnum)[keyof typeof UserRewardsScalarFieldEnum]


  export const UserTrackingScalarFieldEnum: {
    id: 'id',
    stat: 'stat',
    quantity: 'quantity',
    userId: 'userId'
  };

  export type UserTrackingScalarFieldEnum = (typeof UserTrackingScalarFieldEnum)[keyof typeof UserTrackingScalarFieldEnum]


  export const UserWalletScalarFieldEnum: {
    id: 'id',
    type: 'type',
    amount: 'amount',
    userId: 'userId'
  };

  export type UserWalletScalarFieldEnum = (typeof UserWalletScalarFieldEnum)[keyof typeof UserWalletScalarFieldEnum]


  export const SortOrder: {
    asc: 'asc',
    desc: 'desc'
  };

  export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder]


  export const QueryMode: {
    default: 'default',
    insensitive: 'insensitive'
  };

  export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode]


  export const NullsOrder: {
    first: 'first',
    last: 'last'
  };

  export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder]


  /**
   * Field references
   */


  /**
   * Reference to a field of type 'Int'
   */
  export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>
    


  /**
   * Reference to a field of type 'Int[]'
   */
  export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>
    


  /**
   * Reference to a field of type 'String'
   */
  export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>
    


  /**
   * Reference to a field of type 'String[]'
   */
  export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>
    


  /**
   * Reference to a field of type 'DateTime'
   */
  export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>
    


  /**
   * Reference to a field of type 'DateTime[]'
   */
  export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>
    


  /**
   * Reference to a field of type 'Role'
   */
  export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>
    


  /**
   * Reference to a field of type 'Role[]'
   */
  export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>
    


  /**
   * Reference to a field of type 'Bytes'
   */
  export type BytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes'>
    


  /**
   * Reference to a field of type 'Bytes[]'
   */
  export type ListBytesFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Bytes[]'>
    


  /**
   * Reference to a field of type 'Language'
   */
  export type EnumLanguageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Language'>
    


  /**
   * Reference to a field of type 'Language[]'
   */
  export type ListEnumLanguageFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Language[]'>
    


  /**
   * Reference to a field of type 'Gender'
   */
  export type EnumGenderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Gender'>
    


  /**
   * Reference to a field of type 'Gender[]'
   */
  export type ListEnumGenderFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Gender[]'>
    


  /**
   * Reference to a field of type 'MoneyType'
   */
  export type EnumMoneyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MoneyType'>
    


  /**
   * Reference to a field of type 'MoneyType[]'
   */
  export type ListEnumMoneyTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'MoneyType[]'>
    


  /**
   * Reference to a field of type 'Float'
   */
  export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>
    


  /**
   * Reference to a field of type 'Float[]'
   */
  export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>
    
  /**
   * Deep Input Types
   */


  export type RankingWhereInput = {
    AND?: RankingWhereInput | RankingWhereInput[]
    OR?: RankingWhereInput[]
    NOT?: RankingWhereInput | RankingWhereInput[]
    id?: IntFilter<"Ranking"> | number
    dinozCount?: IntFilter<"Ranking"> | number
    points?: IntFilter<"Ranking"> | number
    average?: IntFilter<"Ranking"> | number
    completion?: IntFilter<"Ranking"> | number
    dojo?: IntFilter<"Ranking"> | number
    userId?: StringFilter<"Ranking"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type RankingOrderByWithRelationInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type RankingWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    userId?: string
    AND?: RankingWhereInput | RankingWhereInput[]
    OR?: RankingWhereInput[]
    NOT?: RankingWhereInput | RankingWhereInput[]
    dinozCount?: IntFilter<"Ranking"> | number
    points?: IntFilter<"Ranking"> | number
    average?: IntFilter<"Ranking"> | number
    completion?: IntFilter<"Ranking"> | number
    dojo?: IntFilter<"Ranking"> | number
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type RankingOrderByWithAggregationInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
    userId?: SortOrder
    _count?: RankingCountOrderByAggregateInput
    _avg?: RankingAvgOrderByAggregateInput
    _max?: RankingMaxOrderByAggregateInput
    _min?: RankingMinOrderByAggregateInput
    _sum?: RankingSumOrderByAggregateInput
  }

  export type RankingScalarWhereWithAggregatesInput = {
    AND?: RankingScalarWhereWithAggregatesInput | RankingScalarWhereWithAggregatesInput[]
    OR?: RankingScalarWhereWithAggregatesInput[]
    NOT?: RankingScalarWhereWithAggregatesInput | RankingScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"Ranking"> | number
    dinozCount?: IntWithAggregatesFilter<"Ranking"> | number
    points?: IntWithAggregatesFilter<"Ranking"> | number
    average?: IntWithAggregatesFilter<"Ranking"> | number
    completion?: IntWithAggregatesFilter<"Ranking"> | number
    dojo?: IntWithAggregatesFilter<"Ranking"> | number
    userId?: StringWithAggregatesFilter<"Ranking"> | string
  }

  export type SignupDeviceMonthCounterWhereInput = {
    AND?: SignupDeviceMonthCounterWhereInput | SignupDeviceMonthCounterWhereInput[]
    OR?: SignupDeviceMonthCounterWhereInput[]
    NOT?: SignupDeviceMonthCounterWhereInput | SignupDeviceMonthCounterWhereInput[]
    id?: IntFilter<"SignupDeviceMonthCounter"> | number
    monthKey?: StringFilter<"SignupDeviceMonthCounter"> | string
    deviceToken?: StringFilter<"SignupDeviceMonthCounter"> | string
    count?: IntFilter<"SignupDeviceMonthCounter"> | number
    expiresAt?: DateTimeFilter<"SignupDeviceMonthCounter"> | Date | string
    createdAt?: DateTimeFilter<"SignupDeviceMonthCounter"> | Date | string
    updatedAt?: DateTimeFilter<"SignupDeviceMonthCounter"> | Date | string
  }

  export type SignupDeviceMonthCounterOrderByWithRelationInput = {
    id?: SortOrder
    monthKey?: SortOrder
    deviceToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupDeviceMonthCounterWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    monthKey_deviceToken?: SignupDeviceMonthCounterMonthKeyDeviceTokenCompoundUniqueInput
    AND?: SignupDeviceMonthCounterWhereInput | SignupDeviceMonthCounterWhereInput[]
    OR?: SignupDeviceMonthCounterWhereInput[]
    NOT?: SignupDeviceMonthCounterWhereInput | SignupDeviceMonthCounterWhereInput[]
    monthKey?: StringFilter<"SignupDeviceMonthCounter"> | string
    deviceToken?: StringFilter<"SignupDeviceMonthCounter"> | string
    count?: IntFilter<"SignupDeviceMonthCounter"> | number
    expiresAt?: DateTimeFilter<"SignupDeviceMonthCounter"> | Date | string
    createdAt?: DateTimeFilter<"SignupDeviceMonthCounter"> | Date | string
    updatedAt?: DateTimeFilter<"SignupDeviceMonthCounter"> | Date | string
  }, "id" | "monthKey_deviceToken">

  export type SignupDeviceMonthCounterOrderByWithAggregationInput = {
    id?: SortOrder
    monthKey?: SortOrder
    deviceToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SignupDeviceMonthCounterCountOrderByAggregateInput
    _avg?: SignupDeviceMonthCounterAvgOrderByAggregateInput
    _max?: SignupDeviceMonthCounterMaxOrderByAggregateInput
    _min?: SignupDeviceMonthCounterMinOrderByAggregateInput
    _sum?: SignupDeviceMonthCounterSumOrderByAggregateInput
  }

  export type SignupDeviceMonthCounterScalarWhereWithAggregatesInput = {
    AND?: SignupDeviceMonthCounterScalarWhereWithAggregatesInput | SignupDeviceMonthCounterScalarWhereWithAggregatesInput[]
    OR?: SignupDeviceMonthCounterScalarWhereWithAggregatesInput[]
    NOT?: SignupDeviceMonthCounterScalarWhereWithAggregatesInput | SignupDeviceMonthCounterScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SignupDeviceMonthCounter"> | number
    monthKey?: StringWithAggregatesFilter<"SignupDeviceMonthCounter"> | string
    deviceToken?: StringWithAggregatesFilter<"SignupDeviceMonthCounter"> | string
    count?: IntWithAggregatesFilter<"SignupDeviceMonthCounter"> | number
    expiresAt?: DateTimeWithAggregatesFilter<"SignupDeviceMonthCounter"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"SignupDeviceMonthCounter"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SignupDeviceMonthCounter"> | Date | string
  }

  export type SignupIpMonthCounterWhereInput = {
    AND?: SignupIpMonthCounterWhereInput | SignupIpMonthCounterWhereInput[]
    OR?: SignupIpMonthCounterWhereInput[]
    NOT?: SignupIpMonthCounterWhereInput | SignupIpMonthCounterWhereInput[]
    id?: IntFilter<"SignupIpMonthCounter"> | number
    monthKey?: StringFilter<"SignupIpMonthCounter"> | string
    ipToken?: StringFilter<"SignupIpMonthCounter"> | string
    count?: IntFilter<"SignupIpMonthCounter"> | number
    expiresAt?: DateTimeFilter<"SignupIpMonthCounter"> | Date | string
    createdAt?: DateTimeFilter<"SignupIpMonthCounter"> | Date | string
    updatedAt?: DateTimeFilter<"SignupIpMonthCounter"> | Date | string
  }

  export type SignupIpMonthCounterOrderByWithRelationInput = {
    id?: SortOrder
    monthKey?: SortOrder
    ipToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupIpMonthCounterWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    monthKey_ipToken?: SignupIpMonthCounterMonthKeyIpTokenCompoundUniqueInput
    AND?: SignupIpMonthCounterWhereInput | SignupIpMonthCounterWhereInput[]
    OR?: SignupIpMonthCounterWhereInput[]
    NOT?: SignupIpMonthCounterWhereInput | SignupIpMonthCounterWhereInput[]
    monthKey?: StringFilter<"SignupIpMonthCounter"> | string
    ipToken?: StringFilter<"SignupIpMonthCounter"> | string
    count?: IntFilter<"SignupIpMonthCounter"> | number
    expiresAt?: DateTimeFilter<"SignupIpMonthCounter"> | Date | string
    createdAt?: DateTimeFilter<"SignupIpMonthCounter"> | Date | string
    updatedAt?: DateTimeFilter<"SignupIpMonthCounter"> | Date | string
  }, "id" | "monthKey_ipToken">

  export type SignupIpMonthCounterOrderByWithAggregationInput = {
    id?: SortOrder
    monthKey?: SortOrder
    ipToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
    _count?: SignupIpMonthCounterCountOrderByAggregateInput
    _avg?: SignupIpMonthCounterAvgOrderByAggregateInput
    _max?: SignupIpMonthCounterMaxOrderByAggregateInput
    _min?: SignupIpMonthCounterMinOrderByAggregateInput
    _sum?: SignupIpMonthCounterSumOrderByAggregateInput
  }

  export type SignupIpMonthCounterScalarWhereWithAggregatesInput = {
    AND?: SignupIpMonthCounterScalarWhereWithAggregatesInput | SignupIpMonthCounterScalarWhereWithAggregatesInput[]
    OR?: SignupIpMonthCounterScalarWhereWithAggregatesInput[]
    NOT?: SignupIpMonthCounterScalarWhereWithAggregatesInput | SignupIpMonthCounterScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"SignupIpMonthCounter"> | number
    monthKey?: StringWithAggregatesFilter<"SignupIpMonthCounter"> | string
    ipToken?: StringWithAggregatesFilter<"SignupIpMonthCounter"> | string
    count?: IntWithAggregatesFilter<"SignupIpMonthCounter"> | number
    expiresAt?: DateTimeWithAggregatesFilter<"SignupIpMonthCounter"> | Date | string
    createdAt?: DateTimeWithAggregatesFilter<"SignupIpMonthCounter"> | Date | string
    updatedAt?: DateTimeWithAggregatesFilter<"SignupIpMonthCounter"> | Date | string
  }

  export type UserWhereInput = {
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    id?: StringFilter<"User"> | string
    name?: StringFilter<"User"> | string
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdDate?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    lastLogin?: DateTimeFilter<"User"> | Date | string
    items?: UserItemsListRelationFilter
    profile?: XOR<UserProfileNullableScalarRelationFilter, UserProfileWhereInput> | null
    ranking?: XOR<RankingNullableScalarRelationFilter, RankingWhereInput> | null
    rewards?: UserRewardsListRelationFilter
    statsTracking?: UserTrackingListRelationFilter
    wallets?: UserWalletListRelationFilter
  }

  export type UserOrderByWithRelationInput = {
    id?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdDate?: SortOrder
    updatedAt?: SortOrderInput | SortOrder
    lastLogin?: SortOrder
    items?: UserItemsOrderByRelationAggregateInput
    profile?: UserProfileOrderByWithRelationInput
    ranking?: RankingOrderByWithRelationInput
    rewards?: UserRewardsOrderByRelationAggregateInput
    statsTracking?: UserTrackingOrderByRelationAggregateInput
    wallets?: UserWalletOrderByRelationAggregateInput
  }

  export type UserWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    name?: string
    AND?: UserWhereInput | UserWhereInput[]
    OR?: UserWhereInput[]
    NOT?: UserWhereInput | UserWhereInput[]
    password?: StringFilter<"User"> | string
    role?: EnumRoleFilter<"User"> | $Enums.Role
    createdDate?: DateTimeFilter<"User"> | Date | string
    updatedAt?: DateTimeNullableFilter<"User"> | Date | string | null
    lastLogin?: DateTimeFilter<"User"> | Date | string
    items?: UserItemsListRelationFilter
    profile?: XOR<UserProfileNullableScalarRelationFilter, UserProfileWhereInput> | null
    ranking?: XOR<RankingNullableScalarRelationFilter, RankingWhereInput> | null
    rewards?: UserRewardsListRelationFilter
    statsTracking?: UserTrackingListRelationFilter
    wallets?: UserWalletListRelationFilter
  }, "id" | "name">

  export type UserOrderByWithAggregationInput = {
    id?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdDate?: SortOrder
    updatedAt?: SortOrderInput | SortOrder
    lastLogin?: SortOrder
    _count?: UserCountOrderByAggregateInput
    _max?: UserMaxOrderByAggregateInput
    _min?: UserMinOrderByAggregateInput
  }

  export type UserScalarWhereWithAggregatesInput = {
    AND?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    OR?: UserScalarWhereWithAggregatesInput[]
    NOT?: UserScalarWhereWithAggregatesInput | UserScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"User"> | string
    name?: StringWithAggregatesFilter<"User"> | string
    password?: StringWithAggregatesFilter<"User"> | string
    role?: EnumRoleWithAggregatesFilter<"User"> | $Enums.Role
    createdDate?: DateTimeWithAggregatesFilter<"User"> | Date | string
    updatedAt?: DateTimeNullableWithAggregatesFilter<"User"> | Date | string | null
    lastLogin?: DateTimeWithAggregatesFilter<"User"> | Date | string
  }

  export type UserItemsWhereInput = {
    AND?: UserItemsWhereInput | UserItemsWhereInput[]
    OR?: UserItemsWhereInput[]
    NOT?: UserItemsWhereInput | UserItemsWhereInput[]
    id?: IntFilter<"UserItems"> | number
    itemId?: IntFilter<"UserItems"> | number
    quantity?: IntFilter<"UserItems"> | number
    userId?: StringFilter<"UserItems"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserItemsOrderByWithRelationInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserItemsWhereUniqueInput = Prisma.AtLeast<{
    itemId_userId?: UserItemsItemIdUserIdCompoundUniqueInput
    AND?: UserItemsWhereInput | UserItemsWhereInput[]
    OR?: UserItemsWhereInput[]
    NOT?: UserItemsWhereInput | UserItemsWhereInput[]
    id?: IntFilter<"UserItems"> | number
    itemId?: IntFilter<"UserItems"> | number
    quantity?: IntFilter<"UserItems"> | number
    userId?: StringFilter<"UserItems"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "itemId_userId">

  export type UserItemsOrderByWithAggregationInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
    _count?: UserItemsCountOrderByAggregateInput
    _avg?: UserItemsAvgOrderByAggregateInput
    _max?: UserItemsMaxOrderByAggregateInput
    _min?: UserItemsMinOrderByAggregateInput
    _sum?: UserItemsSumOrderByAggregateInput
  }

  export type UserItemsScalarWhereWithAggregatesInput = {
    AND?: UserItemsScalarWhereWithAggregatesInput | UserItemsScalarWhereWithAggregatesInput[]
    OR?: UserItemsScalarWhereWithAggregatesInput[]
    NOT?: UserItemsScalarWhereWithAggregatesInput | UserItemsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserItems"> | number
    itemId?: IntWithAggregatesFilter<"UserItems"> | number
    quantity?: IntWithAggregatesFilter<"UserItems"> | number
    userId?: StringWithAggregatesFilter<"UserItems"> | string
  }

  export type UserProfileWhereInput = {
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    id?: StringFilter<"UserProfile"> | string
    userId?: StringFilter<"UserProfile"> | string
    avatar?: BytesNullableFilter<"UserProfile"> | Bytes | null
    avatarType?: StringNullableFilter<"UserProfile"> | string | null
    language?: EnumLanguageNullableFilter<"UserProfile"> | $Enums.Language | null
    gender?: EnumGenderNullableFilter<"UserProfile"> | $Enums.Gender | null
    age?: IntNullableFilter<"UserProfile"> | number | null
    description?: StringNullableFilter<"UserProfile"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserProfileOrderByWithRelationInput = {
    id?: SortOrder
    userId?: SortOrder
    avatar?: SortOrderInput | SortOrder
    avatarType?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserProfileWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId?: string
    AND?: UserProfileWhereInput | UserProfileWhereInput[]
    OR?: UserProfileWhereInput[]
    NOT?: UserProfileWhereInput | UserProfileWhereInput[]
    avatar?: BytesNullableFilter<"UserProfile"> | Bytes | null
    avatarType?: StringNullableFilter<"UserProfile"> | string | null
    language?: EnumLanguageNullableFilter<"UserProfile"> | $Enums.Language | null
    gender?: EnumGenderNullableFilter<"UserProfile"> | $Enums.Gender | null
    age?: IntNullableFilter<"UserProfile"> | number | null
    description?: StringNullableFilter<"UserProfile"> | string | null
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId">

  export type UserProfileOrderByWithAggregationInput = {
    id?: SortOrder
    userId?: SortOrder
    avatar?: SortOrderInput | SortOrder
    avatarType?: SortOrderInput | SortOrder
    language?: SortOrderInput | SortOrder
    gender?: SortOrderInput | SortOrder
    age?: SortOrderInput | SortOrder
    description?: SortOrderInput | SortOrder
    _count?: UserProfileCountOrderByAggregateInput
    _avg?: UserProfileAvgOrderByAggregateInput
    _max?: UserProfileMaxOrderByAggregateInput
    _min?: UserProfileMinOrderByAggregateInput
    _sum?: UserProfileSumOrderByAggregateInput
  }

  export type UserProfileScalarWhereWithAggregatesInput = {
    AND?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    OR?: UserProfileScalarWhereWithAggregatesInput[]
    NOT?: UserProfileScalarWhereWithAggregatesInput | UserProfileScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserProfile"> | string
    userId?: StringWithAggregatesFilter<"UserProfile"> | string
    avatar?: BytesNullableWithAggregatesFilter<"UserProfile"> | Bytes | null
    avatarType?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
    language?: EnumLanguageNullableWithAggregatesFilter<"UserProfile"> | $Enums.Language | null
    gender?: EnumGenderNullableWithAggregatesFilter<"UserProfile"> | $Enums.Gender | null
    age?: IntNullableWithAggregatesFilter<"UserProfile"> | number | null
    description?: StringNullableWithAggregatesFilter<"UserProfile"> | string | null
  }

  export type UserRewardsWhereInput = {
    AND?: UserRewardsWhereInput | UserRewardsWhereInput[]
    OR?: UserRewardsWhereInput[]
    NOT?: UserRewardsWhereInput | UserRewardsWhereInput[]
    id?: IntFilter<"UserRewards"> | number
    rewardId?: IntFilter<"UserRewards"> | number
    userId?: StringNullableFilter<"UserRewards"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }

  export type UserRewardsOrderByWithRelationInput = {
    id?: SortOrder
    rewardId?: SortOrder
    userId?: SortOrderInput | SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserRewardsWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    rewardId_userId?: UserRewardsRewardIdUserIdCompoundUniqueInput
    AND?: UserRewardsWhereInput | UserRewardsWhereInput[]
    OR?: UserRewardsWhereInput[]
    NOT?: UserRewardsWhereInput | UserRewardsWhereInput[]
    rewardId?: IntFilter<"UserRewards"> | number
    userId?: StringNullableFilter<"UserRewards"> | string | null
    user?: XOR<UserNullableScalarRelationFilter, UserWhereInput> | null
  }, "id" | "rewardId_userId">

  export type UserRewardsOrderByWithAggregationInput = {
    id?: SortOrder
    rewardId?: SortOrder
    userId?: SortOrderInput | SortOrder
    _count?: UserRewardsCountOrderByAggregateInput
    _avg?: UserRewardsAvgOrderByAggregateInput
    _max?: UserRewardsMaxOrderByAggregateInput
    _min?: UserRewardsMinOrderByAggregateInput
    _sum?: UserRewardsSumOrderByAggregateInput
  }

  export type UserRewardsScalarWhereWithAggregatesInput = {
    AND?: UserRewardsScalarWhereWithAggregatesInput | UserRewardsScalarWhereWithAggregatesInput[]
    OR?: UserRewardsScalarWhereWithAggregatesInput[]
    NOT?: UserRewardsScalarWhereWithAggregatesInput | UserRewardsScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserRewards"> | number
    rewardId?: IntWithAggregatesFilter<"UserRewards"> | number
    userId?: StringNullableWithAggregatesFilter<"UserRewards"> | string | null
  }

  export type UserTrackingWhereInput = {
    AND?: UserTrackingWhereInput | UserTrackingWhereInput[]
    OR?: UserTrackingWhereInput[]
    NOT?: UserTrackingWhereInput | UserTrackingWhereInput[]
    id?: IntFilter<"UserTracking"> | number
    stat?: StringFilter<"UserTracking"> | string
    quantity?: IntFilter<"UserTracking"> | number
    userId?: StringFilter<"UserTracking"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserTrackingOrderByWithRelationInput = {
    id?: SortOrder
    stat?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserTrackingWhereUniqueInput = Prisma.AtLeast<{
    id?: number
    stat_userId?: UserTrackingStatUserIdCompoundUniqueInput
    AND?: UserTrackingWhereInput | UserTrackingWhereInput[]
    OR?: UserTrackingWhereInput[]
    NOT?: UserTrackingWhereInput | UserTrackingWhereInput[]
    stat?: StringFilter<"UserTracking"> | string
    quantity?: IntFilter<"UserTracking"> | number
    userId?: StringFilter<"UserTracking"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "stat_userId">

  export type UserTrackingOrderByWithAggregationInput = {
    id?: SortOrder
    stat?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
    _count?: UserTrackingCountOrderByAggregateInput
    _avg?: UserTrackingAvgOrderByAggregateInput
    _max?: UserTrackingMaxOrderByAggregateInput
    _min?: UserTrackingMinOrderByAggregateInput
    _sum?: UserTrackingSumOrderByAggregateInput
  }

  export type UserTrackingScalarWhereWithAggregatesInput = {
    AND?: UserTrackingScalarWhereWithAggregatesInput | UserTrackingScalarWhereWithAggregatesInput[]
    OR?: UserTrackingScalarWhereWithAggregatesInput[]
    NOT?: UserTrackingScalarWhereWithAggregatesInput | UserTrackingScalarWhereWithAggregatesInput[]
    id?: IntWithAggregatesFilter<"UserTracking"> | number
    stat?: StringWithAggregatesFilter<"UserTracking"> | string
    quantity?: IntWithAggregatesFilter<"UserTracking"> | number
    userId?: StringWithAggregatesFilter<"UserTracking"> | string
  }

  export type UserWalletWhereInput = {
    AND?: UserWalletWhereInput | UserWalletWhereInput[]
    OR?: UserWalletWhereInput[]
    NOT?: UserWalletWhereInput | UserWalletWhereInput[]
    id?: StringFilter<"UserWallet"> | string
    type?: EnumMoneyTypeFilter<"UserWallet"> | $Enums.MoneyType
    amount?: IntFilter<"UserWallet"> | number
    userId?: StringFilter<"UserWallet"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }

  export type UserWalletOrderByWithRelationInput = {
    id?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
    user?: UserOrderByWithRelationInput
  }

  export type UserWalletWhereUniqueInput = Prisma.AtLeast<{
    id?: string
    userId_type?: UserWalletUserIdTypeCompoundUniqueInput
    AND?: UserWalletWhereInput | UserWalletWhereInput[]
    OR?: UserWalletWhereInput[]
    NOT?: UserWalletWhereInput | UserWalletWhereInput[]
    type?: EnumMoneyTypeFilter<"UserWallet"> | $Enums.MoneyType
    amount?: IntFilter<"UserWallet"> | number
    userId?: StringFilter<"UserWallet"> | string
    user?: XOR<UserScalarRelationFilter, UserWhereInput>
  }, "id" | "userId_type">

  export type UserWalletOrderByWithAggregationInput = {
    id?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
    _count?: UserWalletCountOrderByAggregateInput
    _avg?: UserWalletAvgOrderByAggregateInput
    _max?: UserWalletMaxOrderByAggregateInput
    _min?: UserWalletMinOrderByAggregateInput
    _sum?: UserWalletSumOrderByAggregateInput
  }

  export type UserWalletScalarWhereWithAggregatesInput = {
    AND?: UserWalletScalarWhereWithAggregatesInput | UserWalletScalarWhereWithAggregatesInput[]
    OR?: UserWalletScalarWhereWithAggregatesInput[]
    NOT?: UserWalletScalarWhereWithAggregatesInput | UserWalletScalarWhereWithAggregatesInput[]
    id?: StringWithAggregatesFilter<"UserWallet"> | string
    type?: EnumMoneyTypeWithAggregatesFilter<"UserWallet"> | $Enums.MoneyType
    amount?: IntWithAggregatesFilter<"UserWallet"> | number
    userId?: StringWithAggregatesFilter<"UserWallet"> | string
  }

  export type RankingCreateInput = {
    dinozCount?: number
    points?: number
    average?: number
    completion?: number
    dojo?: number
    user: UserCreateNestedOneWithoutRankingInput
  }

  export type RankingUncheckedCreateInput = {
    id?: number
    dinozCount?: number
    points?: number
    average?: number
    completion?: number
    dojo?: number
    userId: string
  }

  export type RankingUpdateInput = {
    dinozCount?: IntFieldUpdateOperationsInput | number
    points?: IntFieldUpdateOperationsInput | number
    average?: IntFieldUpdateOperationsInput | number
    completion?: IntFieldUpdateOperationsInput | number
    dojo?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutRankingNestedInput
  }

  export type RankingUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    dinozCount?: IntFieldUpdateOperationsInput | number
    points?: IntFieldUpdateOperationsInput | number
    average?: IntFieldUpdateOperationsInput | number
    completion?: IntFieldUpdateOperationsInput | number
    dojo?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type RankingCreateManyInput = {
    id?: number
    dinozCount?: number
    points?: number
    average?: number
    completion?: number
    dojo?: number
    userId: string
  }

  export type RankingUpdateManyMutationInput = {
    dinozCount?: IntFieldUpdateOperationsInput | number
    points?: IntFieldUpdateOperationsInput | number
    average?: IntFieldUpdateOperationsInput | number
    completion?: IntFieldUpdateOperationsInput | number
    dojo?: IntFieldUpdateOperationsInput | number
  }

  export type RankingUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    dinozCount?: IntFieldUpdateOperationsInput | number
    points?: IntFieldUpdateOperationsInput | number
    average?: IntFieldUpdateOperationsInput | number
    completion?: IntFieldUpdateOperationsInput | number
    dojo?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type SignupDeviceMonthCounterCreateInput = {
    monthKey: string
    deviceToken: string
    count?: number
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupDeviceMonthCounterUncheckedCreateInput = {
    id?: number
    monthKey: string
    deviceToken: string
    count?: number
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupDeviceMonthCounterUpdateInput = {
    monthKey?: StringFieldUpdateOperationsInput | string
    deviceToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupDeviceMonthCounterUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    monthKey?: StringFieldUpdateOperationsInput | string
    deviceToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupDeviceMonthCounterCreateManyInput = {
    id?: number
    monthKey: string
    deviceToken: string
    count?: number
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupDeviceMonthCounterUpdateManyMutationInput = {
    monthKey?: StringFieldUpdateOperationsInput | string
    deviceToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupDeviceMonthCounterUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    monthKey?: StringFieldUpdateOperationsInput | string
    deviceToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupIpMonthCounterCreateInput = {
    monthKey: string
    ipToken: string
    count?: number
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupIpMonthCounterUncheckedCreateInput = {
    id?: number
    monthKey: string
    ipToken: string
    count?: number
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupIpMonthCounterUpdateInput = {
    monthKey?: StringFieldUpdateOperationsInput | string
    ipToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupIpMonthCounterUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    monthKey?: StringFieldUpdateOperationsInput | string
    ipToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupIpMonthCounterCreateManyInput = {
    id?: number
    monthKey: string
    ipToken: string
    count?: number
    expiresAt: Date | string
    createdAt?: Date | string
    updatedAt?: Date | string
  }

  export type SignupIpMonthCounterUpdateManyMutationInput = {
    monthKey?: StringFieldUpdateOperationsInput | string
    ipToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type SignupIpMonthCounterUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    monthKey?: StringFieldUpdateOperationsInput | string
    ipToken?: StringFieldUpdateOperationsInput | string
    count?: IntFieldUpdateOperationsInput | number
    expiresAt?: DateTimeFieldUpdateOperationsInput | Date | string
    createdAt?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserCreateInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    ranking?: RankingCreateNestedOneWithoutUserInput
    rewards?: UserRewardsCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingCreateNestedManyWithoutUserInput
    wallets?: UserWalletCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    ranking?: RankingUncheckedCreateNestedOneWithoutUserInput
    rewards?: UserRewardsUncheckedCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingUncheckedCreateNestedManyWithoutUserInput
    wallets?: UserWalletUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    ranking?: RankingUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    ranking?: RankingUncheckedUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUncheckedUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUncheckedUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateManyInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
  }

  export type UserUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
  }

  export type UserItemsCreateInput = {
    id?: number
    itemId: number
    quantity: number
    user: UserCreateNestedOneWithoutItemsInput
  }

  export type UserItemsUncheckedCreateInput = {
    id?: number
    itemId: number
    quantity: number
    userId: string
  }

  export type UserItemsUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutItemsNestedInput
  }

  export type UserItemsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserItemsCreateManyInput = {
    id?: number
    itemId: number
    quantity: number
    userId: string
  }

  export type UserItemsUpdateManyMutationInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserItemsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserProfileCreateInput = {
    id?: string
    avatar?: Bytes | null
    avatarType?: string | null
    language?: $Enums.Language | null
    gender?: $Enums.Gender | null
    age?: number | null
    description?: string | null
    user: UserCreateNestedOneWithoutProfileInput
  }

  export type UserProfileUncheckedCreateInput = {
    id?: string
    userId: string
    avatar?: Bytes | null
    avatarType?: string | null
    language?: $Enums.Language | null
    gender?: $Enums.Gender | null
    age?: number | null
    description?: string | null
  }

  export type UserProfileUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    avatar?: NullableBytesFieldUpdateOperationsInput | Bytes | null
    avatarType?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableEnumLanguageFieldUpdateOperationsInput | $Enums.Language | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
    user?: UserUpdateOneRequiredWithoutProfileNestedInput
  }

  export type UserProfileUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    avatar?: NullableBytesFieldUpdateOperationsInput | Bytes | null
    avatarType?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableEnumLanguageFieldUpdateOperationsInput | $Enums.Language | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserProfileCreateManyInput = {
    id?: string
    userId: string
    avatar?: Bytes | null
    avatarType?: string | null
    language?: $Enums.Language | null
    gender?: $Enums.Gender | null
    age?: number | null
    description?: string | null
  }

  export type UserProfileUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    avatar?: NullableBytesFieldUpdateOperationsInput | Bytes | null
    avatarType?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableEnumLanguageFieldUpdateOperationsInput | $Enums.Language | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserProfileUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    userId?: StringFieldUpdateOperationsInput | string
    avatar?: NullableBytesFieldUpdateOperationsInput | Bytes | null
    avatarType?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableEnumLanguageFieldUpdateOperationsInput | $Enums.Language | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardsCreateInput = {
    rewardId: number
    user?: UserCreateNestedOneWithoutRewardsInput
  }

  export type UserRewardsUncheckedCreateInput = {
    id?: number
    rewardId: number
    userId?: string | null
  }

  export type UserRewardsUpdateInput = {
    rewardId?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneWithoutRewardsNestedInput
  }

  export type UserRewardsUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    rewardId?: IntFieldUpdateOperationsInput | number
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserRewardsCreateManyInput = {
    id?: number
    rewardId: number
    userId?: string | null
  }

  export type UserRewardsUpdateManyMutationInput = {
    rewardId?: IntFieldUpdateOperationsInput | number
  }

  export type UserRewardsUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    rewardId?: IntFieldUpdateOperationsInput | number
    userId?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserTrackingCreateInput = {
    stat: string
    quantity?: number
    user: UserCreateNestedOneWithoutStatsTrackingInput
  }

  export type UserTrackingUncheckedCreateInput = {
    id?: number
    stat: string
    quantity?: number
    userId: string
  }

  export type UserTrackingUpdateInput = {
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutStatsTrackingNestedInput
  }

  export type UserTrackingUncheckedUpdateInput = {
    id?: IntFieldUpdateOperationsInput | number
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserTrackingCreateManyInput = {
    id?: number
    stat: string
    quantity?: number
    userId: string
  }

  export type UserTrackingUpdateManyMutationInput = {
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserTrackingUncheckedUpdateManyInput = {
    id?: IntFieldUpdateOperationsInput | number
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserWalletCreateInput = {
    id?: string
    type: $Enums.MoneyType
    amount?: number
    user: UserCreateNestedOneWithoutWalletsInput
  }

  export type UserWalletUncheckedCreateInput = {
    id?: string
    type: $Enums.MoneyType
    amount?: number
    userId: string
  }

  export type UserWalletUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
    user?: UserUpdateOneRequiredWithoutWalletsNestedInput
  }

  export type UserWalletUncheckedUpdateInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type UserWalletCreateManyInput = {
    id?: string
    type: $Enums.MoneyType
    amount?: number
    userId: string
  }

  export type UserWalletUpdateManyMutationInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
  }

  export type UserWalletUncheckedUpdateManyInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
    userId?: StringFieldUpdateOperationsInput | string
  }

  export type IntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type StringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type UserScalarRelationFilter = {
    is?: UserWhereInput
    isNot?: UserWhereInput
  }

  export type RankingCountOrderByAggregateInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
    userId?: SortOrder
  }

  export type RankingAvgOrderByAggregateInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
  }

  export type RankingMaxOrderByAggregateInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
    userId?: SortOrder
  }

  export type RankingMinOrderByAggregateInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
    userId?: SortOrder
  }

  export type RankingSumOrderByAggregateInput = {
    id?: SortOrder
    dinozCount?: SortOrder
    points?: SortOrder
    average?: SortOrder
    completion?: SortOrder
    dojo?: SortOrder
  }

  export type IntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type StringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type DateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type SignupDeviceMonthCounterMonthKeyDeviceTokenCompoundUniqueInput = {
    monthKey: string
    deviceToken: string
  }

  export type SignupDeviceMonthCounterCountOrderByAggregateInput = {
    id?: SortOrder
    monthKey?: SortOrder
    deviceToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupDeviceMonthCounterAvgOrderByAggregateInput = {
    id?: SortOrder
    count?: SortOrder
  }

  export type SignupDeviceMonthCounterMaxOrderByAggregateInput = {
    id?: SortOrder
    monthKey?: SortOrder
    deviceToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupDeviceMonthCounterMinOrderByAggregateInput = {
    id?: SortOrder
    monthKey?: SortOrder
    deviceToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupDeviceMonthCounterSumOrderByAggregateInput = {
    id?: SortOrder
    count?: SortOrder
  }

  export type DateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type SignupIpMonthCounterMonthKeyIpTokenCompoundUniqueInput = {
    monthKey: string
    ipToken: string
  }

  export type SignupIpMonthCounterCountOrderByAggregateInput = {
    id?: SortOrder
    monthKey?: SortOrder
    ipToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupIpMonthCounterAvgOrderByAggregateInput = {
    id?: SortOrder
    count?: SortOrder
  }

  export type SignupIpMonthCounterMaxOrderByAggregateInput = {
    id?: SortOrder
    monthKey?: SortOrder
    ipToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupIpMonthCounterMinOrderByAggregateInput = {
    id?: SortOrder
    monthKey?: SortOrder
    ipToken?: SortOrder
    count?: SortOrder
    expiresAt?: SortOrder
    createdAt?: SortOrder
    updatedAt?: SortOrder
  }

  export type SignupIpMonthCounterSumOrderByAggregateInput = {
    id?: SortOrder
    count?: SortOrder
  }

  export type EnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type DateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type UserItemsListRelationFilter = {
    every?: UserItemsWhereInput
    some?: UserItemsWhereInput
    none?: UserItemsWhereInput
  }

  export type UserProfileNullableScalarRelationFilter = {
    is?: UserProfileWhereInput | null
    isNot?: UserProfileWhereInput | null
  }

  export type RankingNullableScalarRelationFilter = {
    is?: RankingWhereInput | null
    isNot?: RankingWhereInput | null
  }

  export type UserRewardsListRelationFilter = {
    every?: UserRewardsWhereInput
    some?: UserRewardsWhereInput
    none?: UserRewardsWhereInput
  }

  export type UserTrackingListRelationFilter = {
    every?: UserTrackingWhereInput
    some?: UserTrackingWhereInput
    none?: UserTrackingWhereInput
  }

  export type UserWalletListRelationFilter = {
    every?: UserWalletWhereInput
    some?: UserWalletWhereInput
    none?: UserWalletWhereInput
  }

  export type SortOrderInput = {
    sort: SortOrder
    nulls?: NullsOrder
  }

  export type UserItemsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserRewardsOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserTrackingOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserWalletOrderByRelationAggregateInput = {
    _count?: SortOrder
  }

  export type UserCountOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdDate?: SortOrder
    updatedAt?: SortOrder
    lastLogin?: SortOrder
  }

  export type UserMaxOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdDate?: SortOrder
    updatedAt?: SortOrder
    lastLogin?: SortOrder
  }

  export type UserMinOrderByAggregateInput = {
    id?: SortOrder
    name?: SortOrder
    password?: SortOrder
    role?: SortOrder
    createdDate?: SortOrder
    updatedAt?: SortOrder
    lastLogin?: SortOrder
  }

  export type EnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type DateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type UserItemsItemIdUserIdCompoundUniqueInput = {
    itemId: number
    userId: string
  }

  export type UserItemsCountOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
  }

  export type UserItemsAvgOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
  }

  export type UserItemsMaxOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
  }

  export type UserItemsMinOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
  }

  export type UserItemsSumOrderByAggregateInput = {
    id?: SortOrder
    itemId?: SortOrder
    quantity?: SortOrder
  }

  export type BytesNullableFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel> | null
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    not?: NestedBytesNullableFilter<$PrismaModel> | Bytes | null
  }

  export type StringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type EnumLanguageNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Language | EnumLanguageFieldRefInput<$PrismaModel> | null
    in?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLanguageNullableFilter<$PrismaModel> | $Enums.Language | null
  }

  export type EnumGenderNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableFilter<$PrismaModel> | $Enums.Gender | null
  }

  export type IntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type UserProfileCountOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    avatar?: SortOrder
    avatarType?: SortOrder
    language?: SortOrder
    gender?: SortOrder
    age?: SortOrder
    description?: SortOrder
  }

  export type UserProfileAvgOrderByAggregateInput = {
    age?: SortOrder
  }

  export type UserProfileMaxOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    avatar?: SortOrder
    avatarType?: SortOrder
    language?: SortOrder
    gender?: SortOrder
    age?: SortOrder
    description?: SortOrder
  }

  export type UserProfileMinOrderByAggregateInput = {
    id?: SortOrder
    userId?: SortOrder
    avatar?: SortOrder
    avatarType?: SortOrder
    language?: SortOrder
    gender?: SortOrder
    age?: SortOrder
    description?: SortOrder
  }

  export type UserProfileSumOrderByAggregateInput = {
    age?: SortOrder
  }

  export type BytesNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel> | null
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    not?: NestedBytesNullableWithAggregatesFilter<$PrismaModel> | Bytes | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBytesNullableFilter<$PrismaModel>
    _max?: NestedBytesNullableFilter<$PrismaModel>
  }

  export type StringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    mode?: QueryMode
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type EnumLanguageNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Language | EnumLanguageFieldRefInput<$PrismaModel> | null
    in?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLanguageNullableWithAggregatesFilter<$PrismaModel> | $Enums.Language | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumLanguageNullableFilter<$PrismaModel>
    _max?: NestedEnumLanguageNullableFilter<$PrismaModel>
  }

  export type EnumGenderNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableWithAggregatesFilter<$PrismaModel> | $Enums.Gender | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumGenderNullableFilter<$PrismaModel>
    _max?: NestedEnumGenderNullableFilter<$PrismaModel>
  }

  export type IntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type UserNullableScalarRelationFilter = {
    is?: UserWhereInput | null
    isNot?: UserWhereInput | null
  }

  export type UserRewardsRewardIdUserIdCompoundUniqueInput = {
    rewardId: number
    userId: string
  }

  export type UserRewardsCountOrderByAggregateInput = {
    id?: SortOrder
    rewardId?: SortOrder
    userId?: SortOrder
  }

  export type UserRewardsAvgOrderByAggregateInput = {
    id?: SortOrder
    rewardId?: SortOrder
  }

  export type UserRewardsMaxOrderByAggregateInput = {
    id?: SortOrder
    rewardId?: SortOrder
    userId?: SortOrder
  }

  export type UserRewardsMinOrderByAggregateInput = {
    id?: SortOrder
    rewardId?: SortOrder
    userId?: SortOrder
  }

  export type UserRewardsSumOrderByAggregateInput = {
    id?: SortOrder
    rewardId?: SortOrder
  }

  export type UserTrackingStatUserIdCompoundUniqueInput = {
    stat: string
    userId: string
  }

  export type UserTrackingCountOrderByAggregateInput = {
    id?: SortOrder
    stat?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
  }

  export type UserTrackingAvgOrderByAggregateInput = {
    id?: SortOrder
    quantity?: SortOrder
  }

  export type UserTrackingMaxOrderByAggregateInput = {
    id?: SortOrder
    stat?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
  }

  export type UserTrackingMinOrderByAggregateInput = {
    id?: SortOrder
    stat?: SortOrder
    quantity?: SortOrder
    userId?: SortOrder
  }

  export type UserTrackingSumOrderByAggregateInput = {
    id?: SortOrder
    quantity?: SortOrder
  }

  export type EnumMoneyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MoneyType | EnumMoneyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMoneyTypeFilter<$PrismaModel> | $Enums.MoneyType
  }

  export type UserWalletUserIdTypeCompoundUniqueInput = {
    userId: string
    type: $Enums.MoneyType
  }

  export type UserWalletCountOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
  }

  export type UserWalletAvgOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type UserWalletMaxOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
  }

  export type UserWalletMinOrderByAggregateInput = {
    id?: SortOrder
    type?: SortOrder
    amount?: SortOrder
    userId?: SortOrder
  }

  export type UserWalletSumOrderByAggregateInput = {
    amount?: SortOrder
  }

  export type EnumMoneyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MoneyType | EnumMoneyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMoneyTypeWithAggregatesFilter<$PrismaModel> | $Enums.MoneyType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMoneyTypeFilter<$PrismaModel>
    _max?: NestedEnumMoneyTypeFilter<$PrismaModel>
  }

  export type UserCreateNestedOneWithoutRankingInput = {
    create?: XOR<UserCreateWithoutRankingInput, UserUncheckedCreateWithoutRankingInput>
    connectOrCreate?: UserCreateOrConnectWithoutRankingInput
    connect?: UserWhereUniqueInput
  }

  export type IntFieldUpdateOperationsInput = {
    set?: number
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutRankingNestedInput = {
    create?: XOR<UserCreateWithoutRankingInput, UserUncheckedCreateWithoutRankingInput>
    connectOrCreate?: UserCreateOrConnectWithoutRankingInput
    upsert?: UserUpsertWithoutRankingInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRankingInput, UserUpdateWithoutRankingInput>, UserUncheckedUpdateWithoutRankingInput>
  }

  export type StringFieldUpdateOperationsInput = {
    set?: string
  }

  export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string
  }

  export type UserItemsCreateNestedManyWithoutUserInput = {
    create?: XOR<UserItemsCreateWithoutUserInput, UserItemsUncheckedCreateWithoutUserInput> | UserItemsCreateWithoutUserInput[] | UserItemsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserItemsCreateOrConnectWithoutUserInput | UserItemsCreateOrConnectWithoutUserInput[]
    createMany?: UserItemsCreateManyUserInputEnvelope
    connect?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
  }

  export type UserProfileCreateNestedOneWithoutUserInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    connect?: UserProfileWhereUniqueInput
  }

  export type RankingCreateNestedOneWithoutUserInput = {
    create?: XOR<RankingCreateWithoutUserInput, RankingUncheckedCreateWithoutUserInput>
    connectOrCreate?: RankingCreateOrConnectWithoutUserInput
    connect?: RankingWhereUniqueInput
  }

  export type UserRewardsCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRewardsCreateWithoutUserInput, UserRewardsUncheckedCreateWithoutUserInput> | UserRewardsCreateWithoutUserInput[] | UserRewardsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardsCreateOrConnectWithoutUserInput | UserRewardsCreateOrConnectWithoutUserInput[]
    createMany?: UserRewardsCreateManyUserInputEnvelope
    connect?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
  }

  export type UserTrackingCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTrackingCreateWithoutUserInput, UserTrackingUncheckedCreateWithoutUserInput> | UserTrackingCreateWithoutUserInput[] | UserTrackingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTrackingCreateOrConnectWithoutUserInput | UserTrackingCreateOrConnectWithoutUserInput[]
    createMany?: UserTrackingCreateManyUserInputEnvelope
    connect?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
  }

  export type UserWalletCreateNestedManyWithoutUserInput = {
    create?: XOR<UserWalletCreateWithoutUserInput, UserWalletUncheckedCreateWithoutUserInput> | UserWalletCreateWithoutUserInput[] | UserWalletUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserWalletCreateOrConnectWithoutUserInput | UserWalletCreateOrConnectWithoutUserInput[]
    createMany?: UserWalletCreateManyUserInputEnvelope
    connect?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
  }

  export type UserItemsUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserItemsCreateWithoutUserInput, UserItemsUncheckedCreateWithoutUserInput> | UserItemsCreateWithoutUserInput[] | UserItemsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserItemsCreateOrConnectWithoutUserInput | UserItemsCreateOrConnectWithoutUserInput[]
    createMany?: UserItemsCreateManyUserInputEnvelope
    connect?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
  }

  export type UserProfileUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    connect?: UserProfileWhereUniqueInput
  }

  export type RankingUncheckedCreateNestedOneWithoutUserInput = {
    create?: XOR<RankingCreateWithoutUserInput, RankingUncheckedCreateWithoutUserInput>
    connectOrCreate?: RankingCreateOrConnectWithoutUserInput
    connect?: RankingWhereUniqueInput
  }

  export type UserRewardsUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserRewardsCreateWithoutUserInput, UserRewardsUncheckedCreateWithoutUserInput> | UserRewardsCreateWithoutUserInput[] | UserRewardsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardsCreateOrConnectWithoutUserInput | UserRewardsCreateOrConnectWithoutUserInput[]
    createMany?: UserRewardsCreateManyUserInputEnvelope
    connect?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
  }

  export type UserTrackingUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserTrackingCreateWithoutUserInput, UserTrackingUncheckedCreateWithoutUserInput> | UserTrackingCreateWithoutUserInput[] | UserTrackingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTrackingCreateOrConnectWithoutUserInput | UserTrackingCreateOrConnectWithoutUserInput[]
    createMany?: UserTrackingCreateManyUserInputEnvelope
    connect?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
  }

  export type UserWalletUncheckedCreateNestedManyWithoutUserInput = {
    create?: XOR<UserWalletCreateWithoutUserInput, UserWalletUncheckedCreateWithoutUserInput> | UserWalletCreateWithoutUserInput[] | UserWalletUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserWalletCreateOrConnectWithoutUserInput | UserWalletCreateOrConnectWithoutUserInput[]
    createMany?: UserWalletCreateManyUserInputEnvelope
    connect?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
  }

  export type EnumRoleFieldUpdateOperationsInput = {
    set?: $Enums.Role
  }

  export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null
  }

  export type UserItemsUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserItemsCreateWithoutUserInput, UserItemsUncheckedCreateWithoutUserInput> | UserItemsCreateWithoutUserInput[] | UserItemsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserItemsCreateOrConnectWithoutUserInput | UserItemsCreateOrConnectWithoutUserInput[]
    upsert?: UserItemsUpsertWithWhereUniqueWithoutUserInput | UserItemsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserItemsCreateManyUserInputEnvelope
    set?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    disconnect?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    delete?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    connect?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    update?: UserItemsUpdateWithWhereUniqueWithoutUserInput | UserItemsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserItemsUpdateManyWithWhereWithoutUserInput | UserItemsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserItemsScalarWhereInput | UserItemsScalarWhereInput[]
  }

  export type UserProfileUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    upsert?: UserProfileUpsertWithoutUserInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutUserInput, UserProfileUpdateWithoutUserInput>, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type RankingUpdateOneWithoutUserNestedInput = {
    create?: XOR<RankingCreateWithoutUserInput, RankingUncheckedCreateWithoutUserInput>
    connectOrCreate?: RankingCreateOrConnectWithoutUserInput
    upsert?: RankingUpsertWithoutUserInput
    disconnect?: RankingWhereInput | boolean
    delete?: RankingWhereInput | boolean
    connect?: RankingWhereUniqueInput
    update?: XOR<XOR<RankingUpdateToOneWithWhereWithoutUserInput, RankingUpdateWithoutUserInput>, RankingUncheckedUpdateWithoutUserInput>
  }

  export type UserRewardsUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRewardsCreateWithoutUserInput, UserRewardsUncheckedCreateWithoutUserInput> | UserRewardsCreateWithoutUserInput[] | UserRewardsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardsCreateOrConnectWithoutUserInput | UserRewardsCreateOrConnectWithoutUserInput[]
    upsert?: UserRewardsUpsertWithWhereUniqueWithoutUserInput | UserRewardsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRewardsCreateManyUserInputEnvelope
    set?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    disconnect?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    delete?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    connect?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    update?: UserRewardsUpdateWithWhereUniqueWithoutUserInput | UserRewardsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRewardsUpdateManyWithWhereWithoutUserInput | UserRewardsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRewardsScalarWhereInput | UserRewardsScalarWhereInput[]
  }

  export type UserTrackingUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTrackingCreateWithoutUserInput, UserTrackingUncheckedCreateWithoutUserInput> | UserTrackingCreateWithoutUserInput[] | UserTrackingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTrackingCreateOrConnectWithoutUserInput | UserTrackingCreateOrConnectWithoutUserInput[]
    upsert?: UserTrackingUpsertWithWhereUniqueWithoutUserInput | UserTrackingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTrackingCreateManyUserInputEnvelope
    set?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    disconnect?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    delete?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    connect?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    update?: UserTrackingUpdateWithWhereUniqueWithoutUserInput | UserTrackingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTrackingUpdateManyWithWhereWithoutUserInput | UserTrackingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTrackingScalarWhereInput | UserTrackingScalarWhereInput[]
  }

  export type UserWalletUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserWalletCreateWithoutUserInput, UserWalletUncheckedCreateWithoutUserInput> | UserWalletCreateWithoutUserInput[] | UserWalletUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserWalletCreateOrConnectWithoutUserInput | UserWalletCreateOrConnectWithoutUserInput[]
    upsert?: UserWalletUpsertWithWhereUniqueWithoutUserInput | UserWalletUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserWalletCreateManyUserInputEnvelope
    set?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    disconnect?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    delete?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    connect?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    update?: UserWalletUpdateWithWhereUniqueWithoutUserInput | UserWalletUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserWalletUpdateManyWithWhereWithoutUserInput | UserWalletUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserWalletScalarWhereInput | UserWalletScalarWhereInput[]
  }

  export type UserItemsUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserItemsCreateWithoutUserInput, UserItemsUncheckedCreateWithoutUserInput> | UserItemsCreateWithoutUserInput[] | UserItemsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserItemsCreateOrConnectWithoutUserInput | UserItemsCreateOrConnectWithoutUserInput[]
    upsert?: UserItemsUpsertWithWhereUniqueWithoutUserInput | UserItemsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserItemsCreateManyUserInputEnvelope
    set?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    disconnect?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    delete?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    connect?: UserItemsWhereUniqueInput | UserItemsWhereUniqueInput[]
    update?: UserItemsUpdateWithWhereUniqueWithoutUserInput | UserItemsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserItemsUpdateManyWithWhereWithoutUserInput | UserItemsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserItemsScalarWhereInput | UserItemsScalarWhereInput[]
  }

  export type UserProfileUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    connectOrCreate?: UserProfileCreateOrConnectWithoutUserInput
    upsert?: UserProfileUpsertWithoutUserInput
    disconnect?: UserProfileWhereInput | boolean
    delete?: UserProfileWhereInput | boolean
    connect?: UserProfileWhereUniqueInput
    update?: XOR<XOR<UserProfileUpdateToOneWithWhereWithoutUserInput, UserProfileUpdateWithoutUserInput>, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type RankingUncheckedUpdateOneWithoutUserNestedInput = {
    create?: XOR<RankingCreateWithoutUserInput, RankingUncheckedCreateWithoutUserInput>
    connectOrCreate?: RankingCreateOrConnectWithoutUserInput
    upsert?: RankingUpsertWithoutUserInput
    disconnect?: RankingWhereInput | boolean
    delete?: RankingWhereInput | boolean
    connect?: RankingWhereUniqueInput
    update?: XOR<XOR<RankingUpdateToOneWithWhereWithoutUserInput, RankingUpdateWithoutUserInput>, RankingUncheckedUpdateWithoutUserInput>
  }

  export type UserRewardsUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserRewardsCreateWithoutUserInput, UserRewardsUncheckedCreateWithoutUserInput> | UserRewardsCreateWithoutUserInput[] | UserRewardsUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserRewardsCreateOrConnectWithoutUserInput | UserRewardsCreateOrConnectWithoutUserInput[]
    upsert?: UserRewardsUpsertWithWhereUniqueWithoutUserInput | UserRewardsUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserRewardsCreateManyUserInputEnvelope
    set?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    disconnect?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    delete?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    connect?: UserRewardsWhereUniqueInput | UserRewardsWhereUniqueInput[]
    update?: UserRewardsUpdateWithWhereUniqueWithoutUserInput | UserRewardsUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserRewardsUpdateManyWithWhereWithoutUserInput | UserRewardsUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserRewardsScalarWhereInput | UserRewardsScalarWhereInput[]
  }

  export type UserTrackingUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserTrackingCreateWithoutUserInput, UserTrackingUncheckedCreateWithoutUserInput> | UserTrackingCreateWithoutUserInput[] | UserTrackingUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserTrackingCreateOrConnectWithoutUserInput | UserTrackingCreateOrConnectWithoutUserInput[]
    upsert?: UserTrackingUpsertWithWhereUniqueWithoutUserInput | UserTrackingUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserTrackingCreateManyUserInputEnvelope
    set?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    disconnect?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    delete?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    connect?: UserTrackingWhereUniqueInput | UserTrackingWhereUniqueInput[]
    update?: UserTrackingUpdateWithWhereUniqueWithoutUserInput | UserTrackingUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserTrackingUpdateManyWithWhereWithoutUserInput | UserTrackingUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserTrackingScalarWhereInput | UserTrackingScalarWhereInput[]
  }

  export type UserWalletUncheckedUpdateManyWithoutUserNestedInput = {
    create?: XOR<UserWalletCreateWithoutUserInput, UserWalletUncheckedCreateWithoutUserInput> | UserWalletCreateWithoutUserInput[] | UserWalletUncheckedCreateWithoutUserInput[]
    connectOrCreate?: UserWalletCreateOrConnectWithoutUserInput | UserWalletCreateOrConnectWithoutUserInput[]
    upsert?: UserWalletUpsertWithWhereUniqueWithoutUserInput | UserWalletUpsertWithWhereUniqueWithoutUserInput[]
    createMany?: UserWalletCreateManyUserInputEnvelope
    set?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    disconnect?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    delete?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    connect?: UserWalletWhereUniqueInput | UserWalletWhereUniqueInput[]
    update?: UserWalletUpdateWithWhereUniqueWithoutUserInput | UserWalletUpdateWithWhereUniqueWithoutUserInput[]
    updateMany?: UserWalletUpdateManyWithWhereWithoutUserInput | UserWalletUpdateManyWithWhereWithoutUserInput[]
    deleteMany?: UserWalletScalarWhereInput | UserWalletScalarWhereInput[]
  }

  export type UserCreateNestedOneWithoutItemsInput = {
    create?: XOR<UserCreateWithoutItemsInput, UserUncheckedCreateWithoutItemsInput>
    connectOrCreate?: UserCreateOrConnectWithoutItemsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutItemsNestedInput = {
    create?: XOR<UserCreateWithoutItemsInput, UserUncheckedCreateWithoutItemsInput>
    connectOrCreate?: UserCreateOrConnectWithoutItemsInput
    upsert?: UserUpsertWithoutItemsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutItemsInput, UserUpdateWithoutItemsInput>, UserUncheckedUpdateWithoutItemsInput>
  }

  export type UserCreateNestedOneWithoutProfileInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    connect?: UserWhereUniqueInput
  }

  export type NullableBytesFieldUpdateOperationsInput = {
    set?: Bytes | null
  }

  export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null
  }

  export type NullableEnumLanguageFieldUpdateOperationsInput = {
    set?: $Enums.Language | null
  }

  export type NullableEnumGenderFieldUpdateOperationsInput = {
    set?: $Enums.Gender | null
  }

  export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null
    increment?: number
    decrement?: number
    multiply?: number
    divide?: number
  }

  export type UserUpdateOneRequiredWithoutProfileNestedInput = {
    create?: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    connectOrCreate?: UserCreateOrConnectWithoutProfileInput
    upsert?: UserUpsertWithoutProfileInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutProfileInput, UserUpdateWithoutProfileInput>, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserCreateNestedOneWithoutRewardsInput = {
    create?: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRewardsInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneWithoutRewardsNestedInput = {
    create?: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
    connectOrCreate?: UserCreateOrConnectWithoutRewardsInput
    upsert?: UserUpsertWithoutRewardsInput
    disconnect?: UserWhereInput | boolean
    delete?: UserWhereInput | boolean
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutRewardsInput, UserUpdateWithoutRewardsInput>, UserUncheckedUpdateWithoutRewardsInput>
  }

  export type UserCreateNestedOneWithoutStatsTrackingInput = {
    create?: XOR<UserCreateWithoutStatsTrackingInput, UserUncheckedCreateWithoutStatsTrackingInput>
    connectOrCreate?: UserCreateOrConnectWithoutStatsTrackingInput
    connect?: UserWhereUniqueInput
  }

  export type UserUpdateOneRequiredWithoutStatsTrackingNestedInput = {
    create?: XOR<UserCreateWithoutStatsTrackingInput, UserUncheckedCreateWithoutStatsTrackingInput>
    connectOrCreate?: UserCreateOrConnectWithoutStatsTrackingInput
    upsert?: UserUpsertWithoutStatsTrackingInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutStatsTrackingInput, UserUpdateWithoutStatsTrackingInput>, UserUncheckedUpdateWithoutStatsTrackingInput>
  }

  export type UserCreateNestedOneWithoutWalletsInput = {
    create?: XOR<UserCreateWithoutWalletsInput, UserUncheckedCreateWithoutWalletsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWalletsInput
    connect?: UserWhereUniqueInput
  }

  export type EnumMoneyTypeFieldUpdateOperationsInput = {
    set?: $Enums.MoneyType
  }

  export type UserUpdateOneRequiredWithoutWalletsNestedInput = {
    create?: XOR<UserCreateWithoutWalletsInput, UserUncheckedCreateWithoutWalletsInput>
    connectOrCreate?: UserCreateOrConnectWithoutWalletsInput
    upsert?: UserUpsertWithoutWalletsInput
    connect?: UserWhereUniqueInput
    update?: XOR<XOR<UserUpdateToOneWithWhereWithoutWalletsInput, UserUpdateWithoutWalletsInput>, UserUncheckedUpdateWithoutWalletsInput>
  }

  export type NestedIntFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntFilter<$PrismaModel> | number
  }

  export type NestedStringFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringFilter<$PrismaModel> | string
  }

  export type NestedIntWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel>
    in?: number[] | ListIntFieldRefInput<$PrismaModel>
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel>
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntWithAggregatesFilter<$PrismaModel> | number
    _count?: NestedIntFilter<$PrismaModel>
    _avg?: NestedFloatFilter<$PrismaModel>
    _sum?: NestedIntFilter<$PrismaModel>
    _min?: NestedIntFilter<$PrismaModel>
    _max?: NestedIntFilter<$PrismaModel>
  }

  export type NestedFloatFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel>
    in?: number[] | ListFloatFieldRefInput<$PrismaModel>
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel>
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatFilter<$PrismaModel> | number
  }

  export type NestedStringWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel>
    in?: string[] | ListStringFieldRefInput<$PrismaModel>
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel>
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringWithAggregatesFilter<$PrismaModel> | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedStringFilter<$PrismaModel>
    _max?: NestedStringFilter<$PrismaModel>
  }

  export type NestedDateTimeFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeFilter<$PrismaModel> | Date | string
  }

  export type NestedDateTimeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel>
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeWithAggregatesFilter<$PrismaModel> | Date | string
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedDateTimeFilter<$PrismaModel>
    _max?: NestedDateTimeFilter<$PrismaModel>
  }

  export type NestedEnumRoleFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleFilter<$PrismaModel> | $Enums.Role
  }

  export type NestedDateTimeNullableFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableFilter<$PrismaModel> | Date | string | null
  }

  export type NestedEnumRoleWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Role | EnumRoleFieldRefInput<$PrismaModel>
    in?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    notIn?: $Enums.Role[] | ListEnumRoleFieldRefInput<$PrismaModel>
    not?: NestedEnumRoleWithAggregatesFilter<$PrismaModel> | $Enums.Role
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumRoleFilter<$PrismaModel>
    _max?: NestedEnumRoleFilter<$PrismaModel>
  }

  export type NestedDateTimeNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Date | string | DateTimeFieldRefInput<$PrismaModel> | null
    in?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    notIn?: Date[] | string[] | ListDateTimeFieldRefInput<$PrismaModel> | null
    lt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    lte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gt?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    gte?: Date | string | DateTimeFieldRefInput<$PrismaModel>
    not?: NestedDateTimeNullableWithAggregatesFilter<$PrismaModel> | Date | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedDateTimeNullableFilter<$PrismaModel>
    _max?: NestedDateTimeNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableFilter<$PrismaModel> | number | null
  }

  export type NestedBytesNullableFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel> | null
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    not?: NestedBytesNullableFilter<$PrismaModel> | Bytes | null
  }

  export type NestedStringNullableFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableFilter<$PrismaModel> | string | null
  }

  export type NestedEnumLanguageNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Language | EnumLanguageFieldRefInput<$PrismaModel> | null
    in?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLanguageNullableFilter<$PrismaModel> | $Enums.Language | null
  }

  export type NestedEnumGenderNullableFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableFilter<$PrismaModel> | $Enums.Gender | null
  }

  export type NestedBytesNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: Bytes | BytesFieldRefInput<$PrismaModel> | null
    in?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    notIn?: Bytes[] | ListBytesFieldRefInput<$PrismaModel> | null
    not?: NestedBytesNullableWithAggregatesFilter<$PrismaModel> | Bytes | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedBytesNullableFilter<$PrismaModel>
    _max?: NestedBytesNullableFilter<$PrismaModel>
  }

  export type NestedStringNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: string | StringFieldRefInput<$PrismaModel> | null
    in?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    notIn?: string[] | ListStringFieldRefInput<$PrismaModel> | null
    lt?: string | StringFieldRefInput<$PrismaModel>
    lte?: string | StringFieldRefInput<$PrismaModel>
    gt?: string | StringFieldRefInput<$PrismaModel>
    gte?: string | StringFieldRefInput<$PrismaModel>
    contains?: string | StringFieldRefInput<$PrismaModel>
    startsWith?: string | StringFieldRefInput<$PrismaModel>
    endsWith?: string | StringFieldRefInput<$PrismaModel>
    not?: NestedStringNullableWithAggregatesFilter<$PrismaModel> | string | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedStringNullableFilter<$PrismaModel>
    _max?: NestedStringNullableFilter<$PrismaModel>
  }

  export type NestedEnumLanguageNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Language | EnumLanguageFieldRefInput<$PrismaModel> | null
    in?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Language[] | ListEnumLanguageFieldRefInput<$PrismaModel> | null
    not?: NestedEnumLanguageNullableWithAggregatesFilter<$PrismaModel> | $Enums.Language | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumLanguageNullableFilter<$PrismaModel>
    _max?: NestedEnumLanguageNullableFilter<$PrismaModel>
  }

  export type NestedEnumGenderNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.Gender | EnumGenderFieldRefInput<$PrismaModel> | null
    in?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    notIn?: $Enums.Gender[] | ListEnumGenderFieldRefInput<$PrismaModel> | null
    not?: NestedEnumGenderNullableWithAggregatesFilter<$PrismaModel> | $Enums.Gender | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedEnumGenderNullableFilter<$PrismaModel>
    _max?: NestedEnumGenderNullableFilter<$PrismaModel>
  }

  export type NestedIntNullableWithAggregatesFilter<$PrismaModel = never> = {
    equals?: number | IntFieldRefInput<$PrismaModel> | null
    in?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListIntFieldRefInput<$PrismaModel> | null
    lt?: number | IntFieldRefInput<$PrismaModel>
    lte?: number | IntFieldRefInput<$PrismaModel>
    gt?: number | IntFieldRefInput<$PrismaModel>
    gte?: number | IntFieldRefInput<$PrismaModel>
    not?: NestedIntNullableWithAggregatesFilter<$PrismaModel> | number | null
    _count?: NestedIntNullableFilter<$PrismaModel>
    _avg?: NestedFloatNullableFilter<$PrismaModel>
    _sum?: NestedIntNullableFilter<$PrismaModel>
    _min?: NestedIntNullableFilter<$PrismaModel>
    _max?: NestedIntNullableFilter<$PrismaModel>
  }

  export type NestedFloatNullableFilter<$PrismaModel = never> = {
    equals?: number | FloatFieldRefInput<$PrismaModel> | null
    in?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    notIn?: number[] | ListFloatFieldRefInput<$PrismaModel> | null
    lt?: number | FloatFieldRefInput<$PrismaModel>
    lte?: number | FloatFieldRefInput<$PrismaModel>
    gt?: number | FloatFieldRefInput<$PrismaModel>
    gte?: number | FloatFieldRefInput<$PrismaModel>
    not?: NestedFloatNullableFilter<$PrismaModel> | number | null
  }

  export type NestedEnumMoneyTypeFilter<$PrismaModel = never> = {
    equals?: $Enums.MoneyType | EnumMoneyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMoneyTypeFilter<$PrismaModel> | $Enums.MoneyType
  }

  export type NestedEnumMoneyTypeWithAggregatesFilter<$PrismaModel = never> = {
    equals?: $Enums.MoneyType | EnumMoneyTypeFieldRefInput<$PrismaModel>
    in?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    notIn?: $Enums.MoneyType[] | ListEnumMoneyTypeFieldRefInput<$PrismaModel>
    not?: NestedEnumMoneyTypeWithAggregatesFilter<$PrismaModel> | $Enums.MoneyType
    _count?: NestedIntFilter<$PrismaModel>
    _min?: NestedEnumMoneyTypeFilter<$PrismaModel>
    _max?: NestedEnumMoneyTypeFilter<$PrismaModel>
  }

  export type UserCreateWithoutRankingInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    rewards?: UserRewardsCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingCreateNestedManyWithoutUserInput
    wallets?: UserWalletCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRankingInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    rewards?: UserRewardsUncheckedCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingUncheckedCreateNestedManyWithoutUserInput
    wallets?: UserWalletUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRankingInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRankingInput, UserUncheckedCreateWithoutRankingInput>
  }

  export type UserUpsertWithoutRankingInput = {
    update: XOR<UserUpdateWithoutRankingInput, UserUncheckedUpdateWithoutRankingInput>
    create: XOR<UserCreateWithoutRankingInput, UserUncheckedCreateWithoutRankingInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRankingInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRankingInput, UserUncheckedUpdateWithoutRankingInput>
  }

  export type UserUpdateWithoutRankingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRankingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUncheckedUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUncheckedUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserItemsCreateWithoutUserInput = {
    id?: number
    itemId: number
    quantity: number
  }

  export type UserItemsUncheckedCreateWithoutUserInput = {
    id?: number
    itemId: number
    quantity: number
  }

  export type UserItemsCreateOrConnectWithoutUserInput = {
    where: UserItemsWhereUniqueInput
    create: XOR<UserItemsCreateWithoutUserInput, UserItemsUncheckedCreateWithoutUserInput>
  }

  export type UserItemsCreateManyUserInputEnvelope = {
    data: UserItemsCreateManyUserInput | UserItemsCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserProfileCreateWithoutUserInput = {
    id?: string
    avatar?: Bytes | null
    avatarType?: string | null
    language?: $Enums.Language | null
    gender?: $Enums.Gender | null
    age?: number | null
    description?: string | null
  }

  export type UserProfileUncheckedCreateWithoutUserInput = {
    id?: string
    avatar?: Bytes | null
    avatarType?: string | null
    language?: $Enums.Language | null
    gender?: $Enums.Gender | null
    age?: number | null
    description?: string | null
  }

  export type UserProfileCreateOrConnectWithoutUserInput = {
    where: UserProfileWhereUniqueInput
    create: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
  }

  export type RankingCreateWithoutUserInput = {
    dinozCount?: number
    points?: number
    average?: number
    completion?: number
    dojo?: number
  }

  export type RankingUncheckedCreateWithoutUserInput = {
    id?: number
    dinozCount?: number
    points?: number
    average?: number
    completion?: number
    dojo?: number
  }

  export type RankingCreateOrConnectWithoutUserInput = {
    where: RankingWhereUniqueInput
    create: XOR<RankingCreateWithoutUserInput, RankingUncheckedCreateWithoutUserInput>
  }

  export type UserRewardsCreateWithoutUserInput = {
    rewardId: number
  }

  export type UserRewardsUncheckedCreateWithoutUserInput = {
    id?: number
    rewardId: number
  }

  export type UserRewardsCreateOrConnectWithoutUserInput = {
    where: UserRewardsWhereUniqueInput
    create: XOR<UserRewardsCreateWithoutUserInput, UserRewardsUncheckedCreateWithoutUserInput>
  }

  export type UserRewardsCreateManyUserInputEnvelope = {
    data: UserRewardsCreateManyUserInput | UserRewardsCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserTrackingCreateWithoutUserInput = {
    stat: string
    quantity?: number
  }

  export type UserTrackingUncheckedCreateWithoutUserInput = {
    id?: number
    stat: string
    quantity?: number
  }

  export type UserTrackingCreateOrConnectWithoutUserInput = {
    where: UserTrackingWhereUniqueInput
    create: XOR<UserTrackingCreateWithoutUserInput, UserTrackingUncheckedCreateWithoutUserInput>
  }

  export type UserTrackingCreateManyUserInputEnvelope = {
    data: UserTrackingCreateManyUserInput | UserTrackingCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserWalletCreateWithoutUserInput = {
    id?: string
    type: $Enums.MoneyType
    amount?: number
  }

  export type UserWalletUncheckedCreateWithoutUserInput = {
    id?: string
    type: $Enums.MoneyType
    amount?: number
  }

  export type UserWalletCreateOrConnectWithoutUserInput = {
    where: UserWalletWhereUniqueInput
    create: XOR<UserWalletCreateWithoutUserInput, UserWalletUncheckedCreateWithoutUserInput>
  }

  export type UserWalletCreateManyUserInputEnvelope = {
    data: UserWalletCreateManyUserInput | UserWalletCreateManyUserInput[]
    skipDuplicates?: boolean
  }

  export type UserItemsUpsertWithWhereUniqueWithoutUserInput = {
    where: UserItemsWhereUniqueInput
    update: XOR<UserItemsUpdateWithoutUserInput, UserItemsUncheckedUpdateWithoutUserInput>
    create: XOR<UserItemsCreateWithoutUserInput, UserItemsUncheckedCreateWithoutUserInput>
  }

  export type UserItemsUpdateWithWhereUniqueWithoutUserInput = {
    where: UserItemsWhereUniqueInput
    data: XOR<UserItemsUpdateWithoutUserInput, UserItemsUncheckedUpdateWithoutUserInput>
  }

  export type UserItemsUpdateManyWithWhereWithoutUserInput = {
    where: UserItemsScalarWhereInput
    data: XOR<UserItemsUpdateManyMutationInput, UserItemsUncheckedUpdateManyWithoutUserInput>
  }

  export type UserItemsScalarWhereInput = {
    AND?: UserItemsScalarWhereInput | UserItemsScalarWhereInput[]
    OR?: UserItemsScalarWhereInput[]
    NOT?: UserItemsScalarWhereInput | UserItemsScalarWhereInput[]
    id?: IntFilter<"UserItems"> | number
    itemId?: IntFilter<"UserItems"> | number
    quantity?: IntFilter<"UserItems"> | number
    userId?: StringFilter<"UserItems"> | string
  }

  export type UserProfileUpsertWithoutUserInput = {
    update: XOR<UserProfileUpdateWithoutUserInput, UserProfileUncheckedUpdateWithoutUserInput>
    create: XOR<UserProfileCreateWithoutUserInput, UserProfileUncheckedCreateWithoutUserInput>
    where?: UserProfileWhereInput
  }

  export type UserProfileUpdateToOneWithWhereWithoutUserInput = {
    where?: UserProfileWhereInput
    data: XOR<UserProfileUpdateWithoutUserInput, UserProfileUncheckedUpdateWithoutUserInput>
  }

  export type UserProfileUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    avatar?: NullableBytesFieldUpdateOperationsInput | Bytes | null
    avatarType?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableEnumLanguageFieldUpdateOperationsInput | $Enums.Language | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type UserProfileUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    avatar?: NullableBytesFieldUpdateOperationsInput | Bytes | null
    avatarType?: NullableStringFieldUpdateOperationsInput | string | null
    language?: NullableEnumLanguageFieldUpdateOperationsInput | $Enums.Language | null
    gender?: NullableEnumGenderFieldUpdateOperationsInput | $Enums.Gender | null
    age?: NullableIntFieldUpdateOperationsInput | number | null
    description?: NullableStringFieldUpdateOperationsInput | string | null
  }

  export type RankingUpsertWithoutUserInput = {
    update: XOR<RankingUpdateWithoutUserInput, RankingUncheckedUpdateWithoutUserInput>
    create: XOR<RankingCreateWithoutUserInput, RankingUncheckedCreateWithoutUserInput>
    where?: RankingWhereInput
  }

  export type RankingUpdateToOneWithWhereWithoutUserInput = {
    where?: RankingWhereInput
    data: XOR<RankingUpdateWithoutUserInput, RankingUncheckedUpdateWithoutUserInput>
  }

  export type RankingUpdateWithoutUserInput = {
    dinozCount?: IntFieldUpdateOperationsInput | number
    points?: IntFieldUpdateOperationsInput | number
    average?: IntFieldUpdateOperationsInput | number
    completion?: IntFieldUpdateOperationsInput | number
    dojo?: IntFieldUpdateOperationsInput | number
  }

  export type RankingUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    dinozCount?: IntFieldUpdateOperationsInput | number
    points?: IntFieldUpdateOperationsInput | number
    average?: IntFieldUpdateOperationsInput | number
    completion?: IntFieldUpdateOperationsInput | number
    dojo?: IntFieldUpdateOperationsInput | number
  }

  export type UserRewardsUpsertWithWhereUniqueWithoutUserInput = {
    where: UserRewardsWhereUniqueInput
    update: XOR<UserRewardsUpdateWithoutUserInput, UserRewardsUncheckedUpdateWithoutUserInput>
    create: XOR<UserRewardsCreateWithoutUserInput, UserRewardsUncheckedCreateWithoutUserInput>
  }

  export type UserRewardsUpdateWithWhereUniqueWithoutUserInput = {
    where: UserRewardsWhereUniqueInput
    data: XOR<UserRewardsUpdateWithoutUserInput, UserRewardsUncheckedUpdateWithoutUserInput>
  }

  export type UserRewardsUpdateManyWithWhereWithoutUserInput = {
    where: UserRewardsScalarWhereInput
    data: XOR<UserRewardsUpdateManyMutationInput, UserRewardsUncheckedUpdateManyWithoutUserInput>
  }

  export type UserRewardsScalarWhereInput = {
    AND?: UserRewardsScalarWhereInput | UserRewardsScalarWhereInput[]
    OR?: UserRewardsScalarWhereInput[]
    NOT?: UserRewardsScalarWhereInput | UserRewardsScalarWhereInput[]
    id?: IntFilter<"UserRewards"> | number
    rewardId?: IntFilter<"UserRewards"> | number
    userId?: StringNullableFilter<"UserRewards"> | string | null
  }

  export type UserTrackingUpsertWithWhereUniqueWithoutUserInput = {
    where: UserTrackingWhereUniqueInput
    update: XOR<UserTrackingUpdateWithoutUserInput, UserTrackingUncheckedUpdateWithoutUserInput>
    create: XOR<UserTrackingCreateWithoutUserInput, UserTrackingUncheckedCreateWithoutUserInput>
  }

  export type UserTrackingUpdateWithWhereUniqueWithoutUserInput = {
    where: UserTrackingWhereUniqueInput
    data: XOR<UserTrackingUpdateWithoutUserInput, UserTrackingUncheckedUpdateWithoutUserInput>
  }

  export type UserTrackingUpdateManyWithWhereWithoutUserInput = {
    where: UserTrackingScalarWhereInput
    data: XOR<UserTrackingUpdateManyMutationInput, UserTrackingUncheckedUpdateManyWithoutUserInput>
  }

  export type UserTrackingScalarWhereInput = {
    AND?: UserTrackingScalarWhereInput | UserTrackingScalarWhereInput[]
    OR?: UserTrackingScalarWhereInput[]
    NOT?: UserTrackingScalarWhereInput | UserTrackingScalarWhereInput[]
    id?: IntFilter<"UserTracking"> | number
    stat?: StringFilter<"UserTracking"> | string
    quantity?: IntFilter<"UserTracking"> | number
    userId?: StringFilter<"UserTracking"> | string
  }

  export type UserWalletUpsertWithWhereUniqueWithoutUserInput = {
    where: UserWalletWhereUniqueInput
    update: XOR<UserWalletUpdateWithoutUserInput, UserWalletUncheckedUpdateWithoutUserInput>
    create: XOR<UserWalletCreateWithoutUserInput, UserWalletUncheckedCreateWithoutUserInput>
  }

  export type UserWalletUpdateWithWhereUniqueWithoutUserInput = {
    where: UserWalletWhereUniqueInput
    data: XOR<UserWalletUpdateWithoutUserInput, UserWalletUncheckedUpdateWithoutUserInput>
  }

  export type UserWalletUpdateManyWithWhereWithoutUserInput = {
    where: UserWalletScalarWhereInput
    data: XOR<UserWalletUpdateManyMutationInput, UserWalletUncheckedUpdateManyWithoutUserInput>
  }

  export type UserWalletScalarWhereInput = {
    AND?: UserWalletScalarWhereInput | UserWalletScalarWhereInput[]
    OR?: UserWalletScalarWhereInput[]
    NOT?: UserWalletScalarWhereInput | UserWalletScalarWhereInput[]
    id?: StringFilter<"UserWallet"> | string
    type?: EnumMoneyTypeFilter<"UserWallet"> | $Enums.MoneyType
    amount?: IntFilter<"UserWallet"> | number
    userId?: StringFilter<"UserWallet"> | string
  }

  export type UserCreateWithoutItemsInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    profile?: UserProfileCreateNestedOneWithoutUserInput
    ranking?: RankingCreateNestedOneWithoutUserInput
    rewards?: UserRewardsCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingCreateNestedManyWithoutUserInput
    wallets?: UserWalletCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutItemsInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    ranking?: RankingUncheckedCreateNestedOneWithoutUserInput
    rewards?: UserRewardsUncheckedCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingUncheckedCreateNestedManyWithoutUserInput
    wallets?: UserWalletUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutItemsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutItemsInput, UserUncheckedCreateWithoutItemsInput>
  }

  export type UserUpsertWithoutItemsInput = {
    update: XOR<UserUpdateWithoutItemsInput, UserUncheckedUpdateWithoutItemsInput>
    create: XOR<UserCreateWithoutItemsInput, UserUncheckedCreateWithoutItemsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutItemsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutItemsInput, UserUncheckedUpdateWithoutItemsInput>
  }

  export type UserUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    ranking?: RankingUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutItemsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    ranking?: RankingUncheckedUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUncheckedUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUncheckedUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutProfileInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsCreateNestedManyWithoutUserInput
    ranking?: RankingCreateNestedOneWithoutUserInput
    rewards?: UserRewardsCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingCreateNestedManyWithoutUserInput
    wallets?: UserWalletCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutProfileInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsUncheckedCreateNestedManyWithoutUserInput
    ranking?: RankingUncheckedCreateNestedOneWithoutUserInput
    rewards?: UserRewardsUncheckedCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingUncheckedCreateNestedManyWithoutUserInput
    wallets?: UserWalletUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutProfileInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
  }

  export type UserUpsertWithoutProfileInput = {
    update: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
    create: XOR<UserCreateWithoutProfileInput, UserUncheckedCreateWithoutProfileInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutProfileInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutProfileInput, UserUncheckedUpdateWithoutProfileInput>
  }

  export type UserUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUpdateManyWithoutUserNestedInput
    ranking?: RankingUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutProfileInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUncheckedUpdateManyWithoutUserNestedInput
    ranking?: RankingUncheckedUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUncheckedUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUncheckedUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutRewardsInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    ranking?: RankingCreateNestedOneWithoutUserInput
    statsTracking?: UserTrackingCreateNestedManyWithoutUserInput
    wallets?: UserWalletCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutRewardsInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    ranking?: RankingUncheckedCreateNestedOneWithoutUserInput
    statsTracking?: UserTrackingUncheckedCreateNestedManyWithoutUserInput
    wallets?: UserWalletUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutRewardsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
  }

  export type UserUpsertWithoutRewardsInput = {
    update: XOR<UserUpdateWithoutRewardsInput, UserUncheckedUpdateWithoutRewardsInput>
    create: XOR<UserCreateWithoutRewardsInput, UserUncheckedCreateWithoutRewardsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutRewardsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutRewardsInput, UserUncheckedUpdateWithoutRewardsInput>
  }

  export type UserUpdateWithoutRewardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    ranking?: RankingUpdateOneWithoutUserNestedInput
    statsTracking?: UserTrackingUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutRewardsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    ranking?: RankingUncheckedUpdateOneWithoutUserNestedInput
    statsTracking?: UserTrackingUncheckedUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutStatsTrackingInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    ranking?: RankingCreateNestedOneWithoutUserInput
    rewards?: UserRewardsCreateNestedManyWithoutUserInput
    wallets?: UserWalletCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutStatsTrackingInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    ranking?: RankingUncheckedCreateNestedOneWithoutUserInput
    rewards?: UserRewardsUncheckedCreateNestedManyWithoutUserInput
    wallets?: UserWalletUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutStatsTrackingInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutStatsTrackingInput, UserUncheckedCreateWithoutStatsTrackingInput>
  }

  export type UserUpsertWithoutStatsTrackingInput = {
    update: XOR<UserUpdateWithoutStatsTrackingInput, UserUncheckedUpdateWithoutStatsTrackingInput>
    create: XOR<UserCreateWithoutStatsTrackingInput, UserUncheckedCreateWithoutStatsTrackingInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutStatsTrackingInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutStatsTrackingInput, UserUncheckedUpdateWithoutStatsTrackingInput>
  }

  export type UserUpdateWithoutStatsTrackingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    ranking?: RankingUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutStatsTrackingInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    ranking?: RankingUncheckedUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUncheckedUpdateManyWithoutUserNestedInput
    wallets?: UserWalletUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserCreateWithoutWalletsInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsCreateNestedManyWithoutUserInput
    profile?: UserProfileCreateNestedOneWithoutUserInput
    ranking?: RankingCreateNestedOneWithoutUserInput
    rewards?: UserRewardsCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingCreateNestedManyWithoutUserInput
  }

  export type UserUncheckedCreateWithoutWalletsInput = {
    id?: string
    name: string
    password: string
    role?: $Enums.Role
    createdDate?: Date | string
    updatedAt?: Date | string | null
    lastLogin?: Date | string
    items?: UserItemsUncheckedCreateNestedManyWithoutUserInput
    profile?: UserProfileUncheckedCreateNestedOneWithoutUserInput
    ranking?: RankingUncheckedCreateNestedOneWithoutUserInput
    rewards?: UserRewardsUncheckedCreateNestedManyWithoutUserInput
    statsTracking?: UserTrackingUncheckedCreateNestedManyWithoutUserInput
  }

  export type UserCreateOrConnectWithoutWalletsInput = {
    where: UserWhereUniqueInput
    create: XOR<UserCreateWithoutWalletsInput, UserUncheckedCreateWithoutWalletsInput>
  }

  export type UserUpsertWithoutWalletsInput = {
    update: XOR<UserUpdateWithoutWalletsInput, UserUncheckedUpdateWithoutWalletsInput>
    create: XOR<UserCreateWithoutWalletsInput, UserUncheckedCreateWithoutWalletsInput>
    where?: UserWhereInput
  }

  export type UserUpdateToOneWithWhereWithoutWalletsInput = {
    where?: UserWhereInput
    data: XOR<UserUpdateWithoutWalletsInput, UserUncheckedUpdateWithoutWalletsInput>
  }

  export type UserUpdateWithoutWalletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUpdateManyWithoutUserNestedInput
    profile?: UserProfileUpdateOneWithoutUserNestedInput
    ranking?: RankingUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUpdateManyWithoutUserNestedInput
  }

  export type UserUncheckedUpdateWithoutWalletsInput = {
    id?: StringFieldUpdateOperationsInput | string
    name?: StringFieldUpdateOperationsInput | string
    password?: StringFieldUpdateOperationsInput | string
    role?: EnumRoleFieldUpdateOperationsInput | $Enums.Role
    createdDate?: DateTimeFieldUpdateOperationsInput | Date | string
    updatedAt?: NullableDateTimeFieldUpdateOperationsInput | Date | string | null
    lastLogin?: DateTimeFieldUpdateOperationsInput | Date | string
    items?: UserItemsUncheckedUpdateManyWithoutUserNestedInput
    profile?: UserProfileUncheckedUpdateOneWithoutUserNestedInput
    ranking?: RankingUncheckedUpdateOneWithoutUserNestedInput
    rewards?: UserRewardsUncheckedUpdateManyWithoutUserNestedInput
    statsTracking?: UserTrackingUncheckedUpdateManyWithoutUserNestedInput
  }

  export type UserItemsCreateManyUserInput = {
    id?: number
    itemId: number
    quantity: number
  }

  export type UserRewardsCreateManyUserInput = {
    id?: number
    rewardId: number
  }

  export type UserTrackingCreateManyUserInput = {
    id?: number
    stat: string
    quantity?: number
  }

  export type UserWalletCreateManyUserInput = {
    id?: string
    type: $Enums.MoneyType
    amount?: number
  }

  export type UserItemsUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserItemsUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserItemsUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    itemId?: IntFieldUpdateOperationsInput | number
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserRewardsUpdateWithoutUserInput = {
    rewardId?: IntFieldUpdateOperationsInput | number
  }

  export type UserRewardsUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    rewardId?: IntFieldUpdateOperationsInput | number
  }

  export type UserRewardsUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    rewardId?: IntFieldUpdateOperationsInput | number
  }

  export type UserTrackingUpdateWithoutUserInput = {
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserTrackingUncheckedUpdateWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserTrackingUncheckedUpdateManyWithoutUserInput = {
    id?: IntFieldUpdateOperationsInput | number
    stat?: StringFieldUpdateOperationsInput | string
    quantity?: IntFieldUpdateOperationsInput | number
  }

  export type UserWalletUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
  }

  export type UserWalletUncheckedUpdateWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
  }

  export type UserWalletUncheckedUpdateManyWithoutUserInput = {
    id?: StringFieldUpdateOperationsInput | string
    type?: EnumMoneyTypeFieldUpdateOperationsInput | $Enums.MoneyType
    amount?: IntFieldUpdateOperationsInput | number
  }



  /**
   * Batch Payload for updateMany & deleteMany & createMany
   */

  export type BatchPayload = {
    count: number
  }

  /**
   * DMMF
   */
  export const dmmf: runtime.BaseDMMF
}