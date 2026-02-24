/**
 * Operations API — Call logs data fetcher
 */
import { USE_MOCK, apiFetch, buildFilterParams } from "./api";
import { getOperationsPage } from "../mock/mockOperationsData";

const mockDelay = () =>
  new Promise((r) => setTimeout(r, Math.random() * 200 + 50));

export async function fetchOperationsLogs({
  page,
  pageSize,
  sort,
  dir,
  filters,
  search,
}) {
  if (USE_MOCK) {
    await mockDelay();
    return getOperationsPage({ page, pageSize, sort, dir, filters, search });
  }

  const params = new URLSearchParams();
  params.set("page", page);
  params.set("size", pageSize);
  if (sort) params.set("sort", sort);
  if (dir) params.set("dir", dir);
  if (search) params.set("search", search);

  const filterStr = buildFilterParams(filters);
  const fullParams = filterStr
    ? `${params.toString()}&${filterStr}`
    : params.toString();

  return apiFetch(`/operations/logs?${fullParams}`);
}
