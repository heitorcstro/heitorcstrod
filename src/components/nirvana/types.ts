export type Item = {
  id: string;
  texto: string;
  concluido: boolean;
};

export type Categoria = {
  id: string;
  nome: string;
  itens: Item[];
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
  CATEGORIAS_PADRAO.map((nome) => ({ id: criarId(), nome, itens: [] }));
