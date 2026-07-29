// ─────────────────────────────────────────────────────────────
// 採点で使う共通定義。
// ブラウザ（Monaco）と Node（検証ハーネス）の両方から読むため、
// このファイルは他モジュールに依存しない素の文字列だけを持つ。
// 双方が同じ前提で採点することを保証する。
// ─────────────────────────────────────────────────────────────

/** 型同一性・any 検出のヘルパー。全アサーションの先頭に連結される */
export const PRELUDE = `
type Equal<X, Y> =
  (<T>() => T extends X ? 1 : 2) extends (<T>() => T extends Y ? 1 : 2) ? true : false;
type Expect<T extends true> = T;
type NotAny<T> = 0 extends (1 & T) ? false : true;
`;

/**
 * 最小 React シム。
 * @types/react 全体をブラウザに持ち込まずに JSX と主要フックを検査する。
 * Node 側のハーネスも同じシムを使い、採点結果を一致させる。
 */
export const REACT_SHIM = `
declare namespace JSX {
  interface Element { readonly __jsx: unique symbol }
  interface ElementAttributesProperty { props: {} }
  interface ElementChildrenAttribute { children: {} }
  // 主要なイベントハンドラは型を付ける。付けないと onChange={(e) => ...} の
  // e が暗黙の any になり、strict では正しいコードでもエラーになる。
  interface DOMProps {
    key?: string | number;
    className?: string;
    id?: string;
    htmlFor?: string;
    name?: string;
    type?: string;
    placeholder?: string;
    disabled?: boolean;
    checked?: boolean;
    value?: string | number | readonly string[];
    children?: unknown;
    onChange?: (e: import("react").ChangeEvent<any>) => void;
    onSubmit?: (e: import("react").FormEvent<any>) => void;
    onClick?: (e: import("react").MouseEvent<any>) => void;
    [prop: string]: unknown;
  }
  interface IntrinsicElements { [elem: string]: DOMProps }
}
declare module "react" {
  export type ReactNode =
    | string | number | boolean | null | undefined
    | JSX.Element | Iterable<ReactNode>;
  export type Key = string | number;
  export type SetStateAction<S> = S | ((prev: S) => S);
  export type Dispatch<A> = (value: A) => void;
  export function useState<S>(initial: S | (() => S)): [S, Dispatch<SetStateAction<S>>];
  export function useState<S = undefined>(): [S | undefined, Dispatch<SetStateAction<S | undefined>>];
  export function useEffect(effect: () => void | (() => void), deps?: readonly unknown[]): void;
  export function useCallback<T extends (...args: any[]) => any>(fn: T, deps: readonly unknown[]): T;
  export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T;
  export function useRef<T>(initial: T): { current: T };
  export function useReducer<S, A>(
    reducer: (state: S, action: A) => S,
    initialState: S
  ): [S, Dispatch<A>];
  export interface Context<T> {
    Provider: (props: { value: T; children?: ReactNode }) => JSX.Element;
  }
  export function createContext<T>(defaultValue: T): Context<T>;
  export function useContext<T>(context: Context<T>): T;
  export interface ChangeEvent<T = Element> {
    target: T & { value: string; name: string; checked: boolean };
  }
  export interface FormEvent<T = Element> { preventDefault(): void; currentTarget: T }
  export interface MouseEvent<T = Element> { preventDefault(): void; currentTarget: T }
  export type PropsWithChildren<P = unknown> = P & { children?: ReactNode };
}
declare module "react/jsx-runtime" {
  export const jsx: any;
  export const jsxs: any;
  export const Fragment: any;
}
declare namespace React {
  type ReactNode = import("react").ReactNode;
  type ChangeEvent<T = Element> = import("react").ChangeEvent<T>;
  type FormEvent<T = Element> = import("react").FormEvent<T>;
  type MouseEvent<T = Element> = import("react").MouseEvent<T>;
  type Dispatch<A> = import("react").Dispatch<A>;
  type SetStateAction<S> = import("react").SetStateAction<S>;
}
`;

/**
 * 最小 Effect シム。
 *
 * effect パッケージ本体（数百ファイル）をブラウザに持ち込まずに、
 * Effect 教材で問いたいことだけを型として表現する。React シムと同じ考え方。
 *
 * 問いたいのは API の網羅ではなく「失敗と依存が型に出ているか」の 1 点なので、
 * 型引数 3 つ（成功・エラー・依存）を持つ Effect と、
 * それを組み立てる最小の関数群があれば足りる。
 *
 * Node 側のハーネスも同じシムを使い、採点結果を一致させる。
 */
export const EFFECT_SHIM = `
declare module "effect" {
  export namespace Effect {
    /**
     * Effect<成功する値, 起きうるエラー, 必要な依存>
     *
     * Promise<T> と違い、失敗と依存も型に出る。
     * これが Effect を使う理由そのものなので、教材ではここだけを問う。
     */
    export interface Effect<out A, out E = never, out R = never> {
      readonly _A: (_: never) => A;
      readonly _E: (_: never) => E;
      readonly _R: (_: never) => R;
      /**
       * Effect が iterable なので gen の中で yield* できる。
       * yield した側にエラー型と依存型が伝わり、返る値が成功型になる。
       */
      [Symbol.iterator](): Generator<Yielded<E, R>, A, any>;
    }

    export function succeed<A>(value: A): Effect<A, never, never>;
    export function fail<E>(error: E): Effect<never, E, never>;
    export function sync<A>(evaluate: () => A): Effect<A, never, never>;

    /** Promise を包む。catch でエラーを型に出すのが要点 */
    export function tryPromise<A, E>(options: {
      try: () => Promise<A>;
      catch: (e: unknown) => E;
    }): Effect<A, E, never>;
    /**
     * catch を省くと失敗は UnknownException になる。
     * 「何が失敗しうるか」が型から消える書き方なので診断教材で扱う。
     */
    export function tryPromise<A>(
      evaluate: () => Promise<A>
    ): Effect<A, UnknownException, never>;

    export function map<A, B, E, R>(
      self: Effect<A, E, R>,
      f: (a: A) => B
    ): Effect<B, E, R>;
    export function flatMap<A, B, E1, E2, R1, R2>(
      self: Effect<A, E1, R1>,
      f: (a: A) => Effect<B, E2, R2>
    ): Effect<B, E1 | E2, R1 | R2>;

    /** エラーを処理して型から消す */
    export function catchAll<A, E, R, A2, E2, R2>(
      self: Effect<A, E, R>,
      f: (e: E) => Effect<A2, E2, R2>
    ): Effect<A | A2, E2, R | R2>;
    /** _tag で 1 種類だけ処理する。残りは型に残る */
    export function catchTag<
      A,
      E extends { readonly _tag: string },
      R,
      K extends E["_tag"],
      A2,
      E2,
      R2
    >(
      self: Effect<A, E, R>,
      tag: K,
      f: (e: Extract<E, { readonly _tag: K }>) => Effect<A2, E2, R2>
    ): Effect<A | A2, Exclude<E, { readonly _tag: K }> | E2, R | R2>;

    /** 依存を1つ解決する。R から消えることを型で確かめられる */
    export function provideService<A, E, R, I, S>(
      self: Effect<A, E, R>,
      tag: Tag<I, S>,
      service: S
    ): Effect<A, E, Exclude<R, I>>;

    /** 手続き的に書くための糖衣。yield* で Effect を待つ */
    export function gen<Y extends Yielded<any, any>, AEff>(
      f: () => Generator<Y, AEff, any>
    ): Effect<AEff, ErrorOf<Y>, ContextOf<Y>>;

    /** 依存をまとめて解決する（Layer 相当を単純化したもの） */
    export function provide<A, E, R, R2>(
      self: Effect<A, E, R>,
      layer: Layer<R, R2>
    ): Effect<A, E, R2>;

    /** タグを取り出す。R に依存が現れるのはここ */
    export function service<I, S>(tag: Tag<I, S>): Effect<S, never, I>;

    /**
     * 失敗したらやり直す。成功型もエラー型も変わらない。
     * 「リトライしたから安全」ではないことを型が示す。
     */
    export function retry<A, E, R>(
      self: Effect<A, E, R>,
      policy: Schedule
    ): Effect<A, E, R>;

    /**
     * 制限時間を付ける。時間切れという新しい失敗が増えるので、
     * エラー型に TimeoutException が足される。
     */
    export function timeout<A, E, R>(
      self: Effect<A, E, R>,
      duration: DurationInput
    ): Effect<A, E | Cause.TimeoutException, R>;

    /** 実行できるのは依存が解決済み（R = never）のときだけ */
    export function runPromise<A, E>(self: Effect<A, E, never>): Promise<A>;
    export function runSync<A, E>(self: Effect<A, E, never>): A;
  }

  /** gen の中で yield* された Effect を型として拾うための目印 */
  export interface Yielded<E, R> {
    readonly _E: (_: never) => E;
    readonly _R: (_: never) => R;
  }
  export type ErrorOf<Y> = Y extends Yielded<infer E, any> ? E : never;
  export type ContextOf<Y> = Y extends Yielded<any, infer R> ? R : never;

  /** 依存を型で表す目印 */
  export interface Tag<in out Id, in out Service> {
    readonly _id: Id;
    readonly _service: Service;
  }

  /** 依存の作り方をまとめたもの。RIn を必要とし ROut を提供する */
  export interface Layer<out ROut, in RIn = never> {
    readonly _ROut: (_: never) => ROut;
    readonly _RIn: (_: RIn) => void;
  }
  export namespace Layer {
    /** 出来合いの値をそのまま提供する */
    export function succeed<I, S>(tag: Tag<I, S>, service: S): Layer<I, never>;
  }

  /** リトライの方針 */
  export interface Schedule {
    readonly _tag: "Schedule";
  }
  export namespace Schedule {
    export function recurs(times: number): Schedule;
    export function exponential(base: DurationInput): Schedule;
  }

  export type DurationInput = number | string;

  /** 本物の effect と同じく、時間切れは Cause 名前空間にある */
  export namespace Cause {
    export class TimeoutException {
      readonly _tag: "TimeoutException";
    }
  }

  export class UnknownException {
    readonly _tag: "UnknownException";
    readonly error: unknown;
  }

  export namespace Context {
    export function GenericTag<Id, Service>(key: string): Tag<Id, Service>;
  }

  export namespace Data {
    /**
     * _tag 付きのエラーを作る基底クラス。
     * _tag があると catchTag で 1 つだけ処理し、残りを型に残せる。
     */
    export function TaggedError<Tag extends string>(
      tag: Tag
    ): new <A extends Record<string, unknown> = {}>(
      args?: A
    ) => { readonly _tag: Tag } & Readonly<A>;
  }

  export function pipe<A>(a: A): A;
  export function pipe<A, B>(a: A, ab: (a: A) => B): B;
  export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
  export function pipe<A, B, C, D>(
    a: A,
    ab: (a: A) => B,
    bc: (b: B) => C,
    cd: (c: C) => D
  ): D;
}
`;
