import type { CrudFilter, GetListParams, HttpError } from "@refinedev/core";
import { createDataProvider, type CreateDataProviderOptions } from "@refinedev/rest";

import { ListResponse } from "@/types";
import { BACKEND_BASE_URL } from "@/constants";

type ErrorBody = {
  message?: unknown;
  error?: unknown;
  errors?: unknown;
};

const STATUS_FALLBACK_MESSAGES: Record<number, string> = {
  400: "The request could not be processed.",
  401: "Authentication required.",
  403: "Access denied.",
  404: "Resource not found.",
  429: "Too many requests. Please wait before trying again.",
  500: "Something went wrong on the server. Please try again later.",
  502: "The service is temporarily unavailable.",
  503: "The service is temporarily unavailable.",
};

function stringifyErrors(errors: unknown): string | undefined {
  if (errors == null) return undefined;
  if (typeof errors === "string") return errors;
  if (Array.isArray(errors)) {
    const parts = errors.filter((e) => typeof e === "string") as string[];
    if (parts.length) return parts.join("\n");
  }
  if (typeof errors === "object") {
    const o = errors as Record<string, unknown>;
    const fieldMessages = Object.entries(o)
      .map(([k, v]) => {
        if (typeof v === "string") return `${k}: ${v}`;
        if (Array.isArray(v) && v.every((x) => typeof x === "string"))
          return `${k}: ${(v as string[]).join(", ")}`;
        return null;
      })
      .filter(Boolean) as string[];
    if (fieldMessages.length) return fieldMessages.join("\n");
  }
  return undefined;
}

/** Parse JSON error bodies from the Express API (`message`, `error`, validation `errors`). */
function messageFromErrorBody(body: unknown, status: number): string {
  if (body == null || typeof body !== "object") {
    return STATUS_FALLBACK_MESSAGES[status] ?? "Request failed.";
  }
  const b = body as ErrorBody;
  if (typeof b.message === "string" && b.message.trim()) return b.message.trim();
  if (typeof b.error === "string" && b.error.trim()) {
    return b.error.trim();
  }
  const fromErrors = stringifyErrors(b.errors);
  if (fromErrors) return fromErrors;
  return STATUS_FALLBACK_MESSAGES[status] ?? "Request failed.";
}

/**
 * Build a Refine {@link HttpError} from a failed `fetch`/`ky` response: prefer backend text,
 * then status-based fallbacks (rate limits, auth, etc.).
 */
export async function buildHttpError(response: Response): Promise<HttpError> {
  const statusCode = response.status;
  let message = STATUS_FALLBACK_MESSAGES[statusCode] ?? "Request failed.";

  try {
    const raw = await response.clone().text();
    if (raw?.trim()) {
      try {
        const parsed = JSON.parse(raw) as unknown;
        message = messageFromErrorBody(parsed, statusCode);
      } catch {
        message = raw.trim();
      }
    }
  } catch {
    // ignore
  }

  return {
    message,
    statusCode,
  };
}

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
      if (!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.json();
      return payload.data ?? [];
    },

    getTotalCount: async (response) => {
      if (!response.ok) throw await buildHttpError(response);

      const payload: ListResponse = await response.json();
      return payload.pagination?.total ?? payload.data?.length ?? 0;
    },
  },

  getOne: {
    mapResponse: async (response) => {
      if (!response.ok) throw await buildHttpError(response);
      return response.json();
    },
  },

  create: {
    transformError: async (response) => buildHttpError(response),
  },
  update: {
    transformError: async (response) => buildHttpError(response),
  },
  deleteOne: {
    transformError: async (response) => buildHttpError(response),
  },
  custom: {
    transformError: async (response) => buildHttpError(response),
  },
};

// Avoid serving cached GET responses from the browser (would skip the network and hide 429s).
const { dataProvider } = createDataProvider(BACKEND_BASE_URL, options, {
  cache: "no-store",
});

export { dataProvider };
