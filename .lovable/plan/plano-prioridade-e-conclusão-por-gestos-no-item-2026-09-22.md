# Plano: prioridade e conclusão por gestos no item

## Resultado esperado
- Remover da linha do item o quadrado de prioridade e a caixa de marcar.
- Transformar toda a área principal do item em controle interativo:
  - toque/clique curto: avançar `1 → 2 → 3 → D → T → 1`;
  - ao chegar em `T`: abrir imediatamente a transferência;
  - pressão contínua por 2 segundos: marcar como feito ou desmarcar, conforme o estado atual.
- Aplicar ao próprio item a cor correspondente à prioridade, mantendo o texto visível e o tamanho da linha estável.

## Comportamento dos gestos
- Iniciar um temporizador ao pressionar o item e cancelá-lo se o usuário soltar, sair da área ou cancelar o toque antes de 2 segundos.
- Após completar a pressão longa, alternar a conclusão apenas uma vez e impedir que a soltura também avance a prioridade.
- Cliques nos campos de compra, na alça de arraste e na lixeira continuarão isolados, sem disparar prioridade ou conclusão.
- Manter suporte a mouse e toque; o item terá identificação acessível do gesto e do estado atual.

## Preservações
- Manter a estrutura em duas linhas, o nome truncado, os campos monetários, a alça `M`, a lixeira e todos os listeners de arraste.
- Manter a ordenação automática, a transferência, o vermelho de item concluído e toda a persistência existente.
- Aplicar o mesmo comportamento nas duas visualizações que atualmente renderizam itens.

## Validação
- Testar no celular: cinco toques percorrem toda a sequência e `T` abre “Mover para”.
- Confirmar que segurar por 2 segundos marca e, repetindo, desmarca sem mudar a prioridade.
- Confirmar que toque curto, pressão longa, arraste, lixeira e campos de compra não interferem entre si.
