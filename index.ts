export type TypeChecker<T> = ((x: any) => x is T) & {type: T};
export const num: TypeChecker<number> = <TypeChecker<number>> (function(x: any): x is number {
    return typeof x === 'number';
});

export const str: TypeChecker<string> = <TypeChecker<string>> (function(x: any): x is string {
    return typeof x === 'string';
});

export const bool: TypeChecker<boolean> = <TypeChecker<boolean>> (function(x: any): x is boolean {
    return typeof x === 'boolean';
});

type Literals = string | number | boolean;
type LitOrTyp<T> = TypeChecker<T> | Literals;
export function literal<T extends Literals>(val: T): TypeChecker<T> {
    return <TypeChecker<T>> ((x: any): x is T => x === val);
}

type TypeCheckerOrLiteralType<T extends LitOrTyp<any>> = T extends TypeChecker<any> ? T['type'] : T;
export function optional<T extends LitOrTyp<any>>(f: T): TypeChecker<{x?: TypeCheckerOrLiteralType<T>}['x']> {
    if (typeof f === 'function') {
        var fun = <Function> f;
        return <TypeChecker<TypeCheckerOrLiteralType<T> | undefined>> ((x: any): x is TypeCheckerOrLiteralType<T> | undefined => x == null || fun(x));
    } else {
        return <TypeChecker<TypeCheckerOrLiteralType<T> | undefined>> ((x: any): x is TypeCheckerOrLiteralType<T> | undefined => x == null || x === f);
    }
}

export function union<T extends LitOrTyp<any>>(types: T[]): TypeChecker<TypeCheckerOrLiteralType<T>> {
    return <TypeChecker<TypeCheckerOrLiteralType<T>>> ((x: any): x is TypeCheckerOrLiteralType<T> => {
        for (var i = 0; i < types.length; i++) {
            if (typeof types[i] === 'function') {
                var fun = <Function> types[i];
                if (fun(x)) {
                    return true;
                }
            } else {
                if (x === types[i]) {
                    return true;
                }
            }
        }

        return false;
    });
}

//https://stackoverflow.com/questions/50374908/transform-union-type-to-intersection-type
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;
type LitToTypC<T extends LitOrTyp<any>> = (T extends TypeChecker<any> ? T : TypeChecker<T>);
type TypToTyp<T> = (T extends TypeChecker<any> ? T['type'] : never);
type IntersectionType<T extends LitOrTyp<any>> = TypToTyp<UnionToIntersection<LitToTypC<T>>>;
export function intersection<T extends LitOrTyp<any>>(types: T[]): TypeChecker<IntersectionType<T>> {
    return <TypeChecker<IntersectionType<T>>> ((x: any): x is IntersectionType<T> => {
        for (var i = 0; i < types.length; i++) {
            if (typeof types[i] === 'function') {
                var fun = <Function> types[i];
                if (!fun(x)) {
                    return false;
                }
            } else {
                if (x !== types[i]) {
                    return false;
                }
            }
        }

        return true;
    });
}

export function array<T extends LitOrTyp<any>>(type: T): TypeChecker<TypeCheckerOrLiteralType<T>[]> {
    if (typeof type === 'function') {
        var fun = <Function> type;
        return <TypeChecker<TypeCheckerOrLiteralType<T>[]>> ((x: any): x is T[] => {
            if (!(x instanceof Array)) {
                return false;
            }
            for (var i = 0; i < x.length; i++) {
                if (!fun(x[i])) {
                    return false;
                }
            }
            return true;
        });
    } else {
        return <TypeChecker<TypeCheckerOrLiteralType<T>[]>> ((x: any): x is T[] => {
            if (!(x instanceof Array)) {
                return false;
            }
            for (var i = 0; i < x.length; i++) {
                if (x[i] !== type) {
                    return false;
                }
            }
            return true;
        });
    }
}

type NonNullableKeys<T> = {[key in keyof T]: TypeChecker<undefined> extends T[key] ? never : key}[keyof T];
type NullableKeys<T> = {[key in keyof T]: TypeChecker<undefined> extends T[key] ? key : never}[keyof T];
type ScaryDictType<T extends {[key: string]: LitOrTyp<any>}> = {[key in NonNullableKeys<T>]: TypeCheckerOrLiteralType<T[key]>} & {[key in NullableKeys<T>]?: TypeCheckerOrLiteralType<T[key]>};
type DictType<T extends {[key: string]: LitOrTyp<any>}> = {[key in keyof ScaryDictType<T>]: ScaryDictType<T>[key]};
export function dict<T extends {[key: string]: U}, U extends LitOrTyp<any>>(types: T): TypeChecker<{[key in keyof ScaryDictType<T>]: ScaryDictType<T>[key]}> {
    return <TypeChecker<DictType<T>>> ((x: any): x is DictType<T> => {
        for (var key in types) {
            var type = types[key];
            if (typeof type === 'function') {
                var fun = <Function> type;
                if (!fun(x[key])) {
                    return false;
                }
            } else {
                if (x[key] !== type) {
                    return false;
                }
            }
        }

        return true;
    });
}

export function strDict<T extends LitOrTyp<any>>(types: T): TypeChecker<Record<string, TypeCheckerOrLiteralType<T>>> {
    if (typeof types === 'function') {
        var fun = <Function> types;
        return <TypeChecker<Record<string, TypeCheckerOrLiteralType<T>>>> ((x: any): x is Record<string, TypeCheckerOrLiteralType<T>> => {
            for (var key in x) {
                if (!fun(x[key])) {
                    return false;
                }
            }
            return true;
        });
    } else {
        return <TypeChecker<Record<string, TypeCheckerOrLiteralType<T>>>> ((x: any): x is Record<string, TypeCheckerOrLiteralType<T>> => {
            for (var key in x) {
                if (x[key] !== types) {
                    return false;
                }
            }
            return true;
        });
    }
}