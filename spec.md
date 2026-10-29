# 📋 Especificação Executável (Spec v1.0) - StylePilot AI

## 1. Visão Geral do Produto
* **Nome do Projeto:** `StylePilot AI` — Copiloto Comercial & de Estilo para Atendimento ao Cliente.
* **Nicho / Segmento:** Varejo de Moda Masculina Premium & Acessórios (E-commerce / Social Commerce via WhatsApp, Instagram Direct e Balcão Digital).
* **Usuário Principal:** Vendedor(a), Atendente ou Consultor(a) de Moda Masculina.
* **Proposta de Valor:** Aumentar a taxa de conversão e o ticket médio (cross-selling), capacitando o atendente em tempo real a superar inseguranças de caimento, desarmar objeções de preço e sugerir composições completas de looks com base técnica nos tecidos, corte e catálogo.

---

## 2. Problemas de Negócio a Resolver
1. **Dúvida de Tamanho e Caimento (Fit & Sizing):** Principal causador de atrito, indecisão e logística reversa na moda masculina (ombros repuxando, comprimento de manga, cintura ajustada). A IA interpreta as medidas/preferências do cliente e dá a recomendação precisa.
2. **Objeção de Preço x Valor Agregado:** O atendente frequentemente concede desconto por não saber justificar o preço. A IA destaca durabilidade da fibra natural, corte de alfaiataria, forro respirável e custo por uso.
3. **Falta de Cross-selling Prático:** O atendente foca apenas no item pedido. A IA sugere o "Look Completo" imediato (ex: Blazer + Camisa Egípcia + Cinto/Sapato em Couro Legítimo) para elevar o ticket médio.

---

## 3. Arquitetura da Solução & Base de Conhecimento
A solução utiliza injeção de contexto / RAG leve sobre arquivos Markdown locais:

```text
stylepilot/
├── knowledge/
│   ├── produtos.md         # Fichas técnicas (peça, composição do tecido, modelagem, grade de tamanhos, preço)
│   ├── objecoes.md         # Matriz de objeções (preço alto, caimento/ombros, prazo/frete, durabilidade)
│   ├── looks.md            # Regras de estilo e composições (ex: Blazer Marinho + Camisa Oxford + Penny Loafer)
│   └── guia-atendimento.md # Tom de voz da marca (consultivo, sofisticado, confiante e empático)
├── prompts/
│   └── copilot_system.md   # Prompt de sistema com Few-Shot e formato de resposta
├── src/
│   └── app.ts              # CLI interativa (TypeScript) com modo híbrido (Gemini API / Fallback offline)
├── package.json            # Configuração e dependências (tsx, @google/genai)
├── tsconfig.json           # Configuração TypeScript
├── README.md               # Documentação completa padrão DIO
└── spec.md                 # Esta especificação
```

---

## 4. Formato de Saída do Copiloto (Contrato da IA)
Ao colar a mensagem recebida do cliente no terminal, o vendedor recebe uma resposta estruturada em 3 blocos:

```yaml
🎯 Diagnóstico Rápido:
- Intenção: Dúvida de caimento com objeção velada de preço.
- Peça de interesse: Blazer Alfaiataria Azul Marinho Imperial.

💬 Sugestão de Resposta para o Cliente:
"Olá [Nome]! Esse blazer possui corte semi-estruturado em lã fria com elastano, desenhado exatamente para não prender a movimentação dos ombros e garantir caimento impecável ao longo do dia. Em relação ao investimento, a lã fria é termorreguladora e não amarrota facilmente, sendo uma peça coringa para reuniões de trabalho e eventos sociais por muitos anos!"

✨ Oportunidade de Venda Adicional (Cross-selling):
- Recomendar: Camisa Algodão Egípcio Maquinetada Branca + Cinto Couro Café Dupla Face.
- Argumento: "Com mais R$ 189 você leva a camisa maquinetada e já sai com a composição completa pronta para usar!"
```

---

## 5. Critérios de Aceite do MVP
- [x] Base de conhecimento estruturada em 4 arquivos modulares em `knowledge/`.
- [x] Prompt de sistema calibrado para consultoria de moda masculina em `prompts/copilot_system.md`.
- [x] CLI interativa em TypeScript/Node.js com leitura em streaming/interativa.
- [x] Suporte Híbrido: Conexão direta com Google Gemini via `@google/genai` (quando configurada `GEMINI_API_KEY`) e fallback automático para mecanismo heurístico determinístico offline.
- [x] Documentação em `README.md` com guia passo a passo, simulações de conversas e trade-offs técnicos.
