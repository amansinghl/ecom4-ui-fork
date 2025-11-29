import { PaginationType } from "@/types/shipments";

const getFistPageUrl = (
  pagination: PaginationType,
  pathname: string,
  params: string,
): string | null =>
  pagination?.current_page === 1
    ? null
    : pathname + (params === "" ? "?page=1" : `?${params}&page=1`);

const getPreviousPageUrl = (
  pagination: PaginationType,
  pathname: string,
  params: string,
): string | null =>
  pagination?.current_page === 1
    ? null
    : pathname +
      (params === ""
        ? "?page=" + (pagination?.current_page - 1)
        : `?${params}` + "&page=" + (pagination?.current_page - 1));

const getNextPageUrl = (
  pagination: PaginationType,
  pathname: string,
  params: string,
): string | null =>
  pagination?.current_page === pagination?.last_page
    ? null
    : pathname +
      (params === ""
        ? "?page=" + (pagination?.current_page + 1)
        : `?${params}` + "&page=" + (pagination?.current_page + 1));

const getLastPageUrl = (
  pagination: PaginationType,
  pathname: string,
  params: string,
): string | null =>
  pagination?.current_page === pagination?.last_page
    ? null
    : pathname +
      (params === ""
        ? `?page=${pagination.last_page}`
        : `?${params}&page=${pagination.last_page}`);

const getUniqueParamsWithoutPage = (params: string): string => {
  let uniqueParams = "";
  params?.split("&").map((value) => {
    const param = value.split("=");
    if (uniqueParams.search(param[0]) === -1 && param[0] !== "page") {
      uniqueParams += `${param[0]}=${param[1]}&`;
    }
  });
  return uniqueParams.slice(0, -1);
};

export const decoratePagination = (
  pagination: PaginationType,
  pathname: string,
  pathParams: string,
): PaginationType => {
  const params = getUniqueParamsWithoutPage(pathParams);
  return {
    first_page_url: getFistPageUrl(pagination, pathname, params),
    prev_page_url: getPreviousPageUrl(pagination, pathname, params),
    next_page_url: getNextPageUrl(pagination, pathname, params),
    last_page_url: getLastPageUrl(pagination, pathname, params),

    current_page: pagination?.current_page,
    from: pagination?.from,
    to: pagination?.to,
    last_page: pagination?.last_page,

    per_page: pagination?.per_page,
    total: pagination?.total,
  };
};
