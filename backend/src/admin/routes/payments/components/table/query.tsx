import { useQueryParams } from "../../../../hooks/use-query-params";

export const usePaymentsTableQuery = ({
  pageSize = 50,
  prefix,
}: {
  pageSize?: number;
  prefix?: string;
}) => {
  const raw = useQueryParams(
    ["q", "offset", "order"],
    prefix
  );

  const { offset, ...rest } = raw;
  const searchParams = {
    ...rest,
    limit: pageSize,
    offset: offset ? Number(offset) : 0,
    order: rest.order || "order_date.desc",
  };

  return { searchParams, raw };
};
