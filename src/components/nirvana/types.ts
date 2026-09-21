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
  precoUnitario?: number;
  quantidade?: number;
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
  isShoppingList?: boolean;
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

const ORDEM_PRIORIDADE: Record<Prioridade, number> = {
  "1": 0,
  "2": 1,
  "3": 2,
  D: 3,
};

// Concluídos vão para o fim (sobrepõe a prioridade).
// Depois ordena por prioridade (1 > 2 > 3 > D); sem prioridade vai para o fim.
// Ordenação estável: empates mantêm a ordem de criação.
const rank = (item: Item) =>
  item.prioridade ? ORDEM_PRIORIDADE[item.prioridade] : 4;

export const ordenarItens = (itens: Item[]): Item[] =>
  [...itens].sort((a, b) => {
    if (a.concluido !== b.concluido) return a.concluido ? 1 : -1;
    return rank(a) - rank(b);
  });

export const contarItens = (categoria: Categoria) =>
  categoria.subcategorias.reduce((total, s) => total + s.itens.length, 0);

export const contarPendentes = (categoria: Categoria) =>
  categoria.subcategorias.reduce(
    (total, s) => total + s.itens.filter((i) => !i.concluido).length,
    0,
  );

// ===== Modo compras =====

export const totalItem = (item: Item) =>
  (item.precoUnitario ?? 0) * (item.quantidade ?? 1);

export const totalSubcategoria = (sub: Subcategoria) =>
  sub.itens.reduce((total, i) => total + totalItem(i), 0);

export const totalCategoria = (categoria: Categoria) =>
  categoria.subcategorias.reduce(
    (total, s) => total + totalSubcategoria(s),
    0,
  );

export const formatarBRL = (valor: number) =>
  valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
