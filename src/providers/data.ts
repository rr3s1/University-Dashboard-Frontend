import type { CrudFilter, GetListParams } from "@refinedev/core";
import { createDataProvider, CreateDataProviderOptions } from "@refinedev/rest";

import { ListResponse } from "@/types";
import { BACKEND_BASE_URL } from "@/constants";

/** Flatten Refine filters (including nested and/or) for simple field matching. */
function collectFieldFilters(filters: CrudFilter[] | undefined) {
  const out: Array<{ field: string; operator: string; value: unknown }> = [];
  const walk = (items: CrudFilter[]) => {
    for (const f of items) {
      if ("field" in f && f.field) {
        out.push({
          field: String(f.field),
          operator: String(f.operator),
          value: f.value,
        });
      } else if ("and" in f && Array.isArray(f.and)) {
        walk(f.and);
      } else if ("or" in f && Array.isArray(f.or)) {
        walk(f.or);
      }
    }
  };
  if (filters?.length) walk(filters);
  return out;
}

/** Refine column fields like `department.name` map to backend root fields (e.g. `department`). */
function rootField(field: string): string {
  const dot = field.indexOf(".");
  return dot === -1 ? field : field.slice(0, dot);
}

/** Express API expects `page`, `limit`, `search`, `department`, `sort`, `order`. */
async function buildBackendListQuery(params: GetListParams) {
  const q: Record<string, string | number> = {};
  const { pagination } = params;
  if (pagination) {
    q.page = pagination.currentPage ?? 1;
    q.limit = pagination.pageSize ?? 10;
  }
  for (const { field, operator, value } of collectFieldFilters(params.filters)) {
    if (value === undefined || value === null || value === "") continue;
    const baseField = rootField(field);
    if (baseField === "department" && operator === "eq") {
      q.department = String(value);
    }
    if (baseField === "name" && operator === "contains") {
      q.search = String(value);
    }
  }
  const sorters = params.sorters ?? [];
  for (const sorter of sorters) {
    if (!sorter?.field) continue;
    q.sort = rootField(String(sorter.field));
    q.order = sorter.order === "asc" ? "asc" : "desc";
    break;
  }
  return q;
}

const options: CreateDataProviderOptions = {
  getList: {
    getEndpoint: ({ resource }) => resource,
    buildQueryParams: buildBackendListQuery,

    mapResponse: async (response) => {
      const payload: ListResponse = await response.json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      const payload: ListResponse = await response.json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },

};

const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options);

export { dataProvider };
