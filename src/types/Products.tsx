export interface Products{
    id: string;
    title: string;
    quantidade: string;
    completed: boolean;
    createdAt: string;
}

export type FilterType = "todas" | "pendentes" | "comprados";