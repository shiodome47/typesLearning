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
