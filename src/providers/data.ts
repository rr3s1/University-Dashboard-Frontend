import {
  BaseRecord,
  CreateParams,
  DataProvider,
  DeleteOneParams,
  GetListParams,
  GetListResponse,
  GetOneParams,
  UpdateParams,
} from "@refinedev/core";

export interface Subject extends BaseRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  description: string;
}

export const mockSubjects: Subject[] = [
  {
    id: "subj-cs-201",
    code: "CS 201",
    name: "Data Structures and Algorithms",
    department: "Computer Science",
    description:
      "Core study of lists, trees, graphs, hashing, and algorithmic complexity with hands-on implementation in a mainstream language.",
  },
  {
    id: "subj-math-301",
    code: "MATH 301",
    name: "Linear Algebra",
    department: "Mathematics",
    description:
      "Vector spaces, matrices, eigenvalues, and orthogonality with applications across science and engineering.",
  },
  {
    id: "subj-phys-210",
    code: "PHYS 210",
    name: "Electricity and Magnetism",
    department: "Physics",
    description:
      "Electrostatics, circuits, magnetic fields, and Maxwell's equations with lab work on measurement and modeling.",
  },
];

/** Mutable in-memory store for mock CRUD; seeded from {@link mockSubjects}. */
let subjectsStore: Subject[] = mockSubjects.map((s) => ({...s}));

function newSubjectId(): string {
  return `subj-${crypto.randomUUID()}`;
}

export const dataProvider: DataProvider = {
  getList: async <TData extends BaseRecord = BaseRecord>({
    resource,
  }: GetListParams): Promise<GetListResponse<TData>> => {
    if (resource !== "subjects") {
      return {
        data: [],
        total: 0,
      };
    }
    return {
      data: subjectsStore as unknown as TData[],
      total: subjectsStore.length,
    };
  },
  getOne: async <TData extends BaseRecord = BaseRecord>({
    resource,
    id,
  }: GetOneParams) => {
    if (resource !== "subjects") {
      throw new Error(`Mock data provider: resource "${resource}" is not supported`);
    }
    const sid = String(id);
    const row = subjectsStore.find((s) => s.id === sid);
    if (!row) {
      throw new Error(`Mock data provider: subject "${sid}" not found`);
    }
    return {data: row as unknown as TData};
  },
  create: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    variables,
  }: CreateParams<TVariables>) => {
    if (resource !== "subjects") {
      throw new Error(`Mock data provider: resource "${resource}" is not supported`);
    }
    const v = variables as Partial<Subject>;
    const created: Subject = {
      id: newSubjectId(),
      code: v.code ?? "",
      name: v.name ?? "",
      department: v.department ?? "",
      description: v.description ?? "",
    };
    subjectsStore = [...subjectsStore, created];
    return {data: created as unknown as TData};
  },
  update: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    id,
    variables,
  }: UpdateParams<TVariables>) => {
    if (resource !== "subjects") {
      throw new Error(`Mock data provider: resource "${resource}" is not supported`);
    }
    const sid = String(id);
    const idx = subjectsStore.findIndex((s) => s.id === sid);
    if (idx === -1) {
      throw new Error(`Mock data provider: subject "${sid}" not found`);
    }
    const patch = variables as Partial<Subject>;
    const updated: Subject = {...subjectsStore[idx], ...patch, id: subjectsStore[idx].id};
    subjectsStore = subjectsStore.map((s, i) => (i === idx ? updated : s));
    return {data: updated as unknown as TData};
  },
  deleteOne: async <TData extends BaseRecord = BaseRecord, TVariables = {}>({
    resource,
    id,
  }: DeleteOneParams<TVariables>) => {
    if (resource !== "subjects") {
      throw new Error(`Mock data provider: resource "${resource}" is not supported`);
    }
    const sid = String(id);
    const idx = subjectsStore.findIndex((s) => s.id === sid);
    if (idx === -1) {
      throw new Error(`Mock data provider: subject "${sid}" not found`);
    }
    subjectsStore = subjectsStore.filter((s) => s.id !== sid);
    return {data: {id: sid} as TData};
  },
  getApiUrl: () => "",
};
