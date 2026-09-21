export type Prioridade = "1" | "2" | "3" | "D";

export const PRIORIDADES: Prioridade[] = ["1", "2", "3", "D"];

export const ROTULOS_PRIORIDADE: Record<Prioridade, string> = {
  "1": "Prioridade 1",
  "2": "Prioridade 2",
  "3": "Prioridade 3",
  D: "Delegado",
};

export type Item = {
  id: string;
  texto: string;
  concluido: boolean;
  prioridade: Prioridade | null;
};

export type Subcategoria = {
  id: string;
  nome: string;
  itens: Item[];
};

export type Categoria = {
  id: string;
  nome: string;
  subcategorias: Subcategoria[];
};

export const CATEGORIAS_PADRAO = [
  "Fazer hoje",
  "Comida",
  "Exercício",
  "Bolsa de Roupas",
  "Fazer de Manhã",
  "Fazer à Noite",
  "Fazer de Maneira Urgente",
  "Bolsas Levadas",
  "Mochila Estudo",
  "Marmita",
  "Outros",
];

export const criarId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export const categoriasIniciais = (): Categoria[] =>
  CATEGORIAS_PADRAO.map((nome) => ({
    id: criarId(),
    nome,
    subcategorias: [{ id: criarId(), nome: "Geral", itens: [] }],
  }));

export const contarItens = (categoria: Categoria) =>
  categoria.subcategorias.reduce((total, s) => total + s.itens.length, 0);

export const contarPendentes = (categoria: Categoria) =>
  categoria.subcategorias.reduce(
    (total, s) => total + s.itens.filter((i) => !i.concluido).length,
    0,
  );
