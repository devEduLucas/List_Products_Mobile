export interface Products{
    id: string;
    title: string;
    quantidade: number;
    completed: boolean;
    createdAt: string;
}

export type FilterType = "todas" | "pendentes" | "comprados";