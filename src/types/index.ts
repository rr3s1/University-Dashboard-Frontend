import {DEPARTMENTS} from "@/constants";

export type Department = (typeof DEPARTMENTS)[number];

export type Subject = {
    id: number;
    name: string;
    code: string;
    description: string;
    department: Department;
    createdAt?: string;
};
