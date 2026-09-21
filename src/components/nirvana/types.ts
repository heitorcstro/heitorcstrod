export type Prioridade = "1" | "2" | "3" | "D";

export type CorCategoria =
  | "Red"
  | "Green"
  | "Blue"
  | "Purple"
  | "Yellow"
  | "Orange"
  | "Magenta"
  | "Gold";

export const PRIORIDADES: Prioridade[] = ["1", "2", "3", "D"];

export const CORES_CATEGORIA: CorCategoria[] = [
  "Red",
  "Green",
  "Blue",
  "Purple",
  "Yellow",
  "Orange",
  "Magenta",
  "Gold",
];

export const ROTULOS_COR_CATEGORIA: Record<CorCategoria, string> = {
  Red: "Vermelho",
  Green: "Verde",
  Blue: "Azul",
  Purple: "Roxo",
  Yellow: "Amarelo",
  Orange: "Laranja",
  Magenta: "Magenta",
  Gold: "Dourado",
};

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
  /** true quando o usuário reordenou manualmente (arrastando) os itens. */
  ordemManual?: boolean;
};

export type Categoria = {
  id: string;
  nome: string;
  cor: CorCategoria;
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

export const corCategoriaAleatoria = (): CorCategoria => {
  const indice = Math.floor(Math.random() * CORES_CATEGORIA.length);
  return CORES_CATEGORIA[indice] ?? "Blue";
};

export const ehCorCategoria = (cor: unknown): cor is CorCategoria =>
  typeof cor === "string" && CORES_CATEGORIA.includes(cor as CorCategoria);

export const categoriasIniciais = (): Categoria[] =>
  CATEGORIAS_PADRAO.map((nome) => {
    const cor = corCategoriaAleatoria();
    return {
      id: criarId(),
      nome,
      cor,
      isShoppingList: cor === "Gold",
      subcategorias: [{ id: criarId(), nome: "Geral", itens: [] }],
    };
  });

export const normalizarCategorias = (categorias: Categoria[]): Categoria[] =>
  categorias.map((categoria) => {
    const corExistente = (categoria as { cor?: unknown }).cor;
    const cor = ehCorCategoria(corExistente) ? corExistente : corCategoriaAleatoria();
    return {
      ...categoria,
      cor,
      isShoppingList: cor === "Gold",
      subcategorias: Array.isArray(categoria.subcategorias) ? categoria.subcategorias : [],
    };
  });

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

/**
 * Ordem exibida: a ordem manual (arrastada) sobrepõe a ordenação automática.
 */
export const itensExibidos = (sub: Subcategoria): Item[] =>
  sub.ordemManual ? sub.itens : ordenarItens(sub.itens);

/** Move um elemento identificado por id para a posição de outro. */
export const moverPorId = <T extends { id: string }>(
  lista: T[],
  ativoId: string,
  sobreId: string,
): T[] => {
  const de = lista.findIndex((x) => x.id === ativoId);
  const para = lista.findIndex((x) => x.id === sobreId);
  if (de === -1 || para === -1) return lista;
  const copia = [...lista];
  const movido = copia[de];
  if (!movido) return lista;
  copia.splice(de, 1);
  copia.splice(para, 0, movido);
  return copia;
};

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
