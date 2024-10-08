export type TQueryKey<TKey, TListQuery = any, TDetailQuery = string> = {
  all: readonly [TKey];
  lists: () => readonly [...TQueryKey<TKey>["all"], "list"];
  list: (
    query?: TListQuery
  ) => readonly [
    ...ReturnType<TQueryKey<TKey>["lists"]>,
    { query: TListQuery | undefined }
  ];
  details: () => readonly [...TQueryKey<TKey>["all"], "detail"];
  detail: (
    id: TDetailQuery,
    query?: TListQuery
  ) => readonly [
    ...ReturnType<TQueryKey<TKey>["details"]>,
    TDetailQuery,
    { query: TListQuery | undefined }
  ];
};

export const queryKeysFactory = <
  T,
  TListQueryType = any,
  TDetailQueryType = string
>(
  globalKey: T
) => {
  const queryKeyFactory: TQueryKey<T, TListQueryType, TDetailQueryType> = {
    all: [globalKey],
    lists: () => [...queryKeyFactory.all, "list"],
    list: (query?: TListQueryType) => [...queryKeyFactory.lists(), { query }],
    details: () => [...queryKeyFactory.all, "detail"],
    detail: (id: TDetailQueryType, query?: TListQueryType) => [
      ...queryKeyFactory.details(),
      id,
      { query },
    ],
  };
  return queryKeyFactory;
};
