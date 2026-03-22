import {BaseRecord, DataProvider, GetListParams, GetListResponse} from "@refinedev/core";

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
      data: mockSubjects as unknown as TData[],
      total: mockSubjects.length,
    };
  },
  getOne: async () => {
    throw new Error("This function is not present in mock");
  },
  create: async () => {
    throw new Error("This function is not present in mock");
  },
  update: async () => {
    throw new Error("This function is not present in mock");
  },
  deleteOne: async () => {
    throw new Error("This function is not present in mock");
  },
  getApiUrl: () => "",
};
