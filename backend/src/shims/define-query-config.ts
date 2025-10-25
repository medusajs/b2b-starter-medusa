export type QueryConfig<TField extends string = string> = {
    defaults: TField[];
    allowed?: TField[];
    defaultLimit?: number;
};

export const defineQueryConfig = <TField extends string = string>(
    config: QueryConfig<TField>
): QueryConfig<TField> => config;
