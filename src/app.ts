import * as fs from 'node:fs';
import * as path from 'node:path';
import * as readline from 'node:readline';
import { fileURLToPath } from 'node:url';

// Resolução de caminhos
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// 1. Carregamento dos arquivos da base de conhecimento (RAG leve)
function loadKnowledgeBase(): { systemPrompt: string; contextText: string } {
  const knowledgeDir = path.join(rootDir, 'knowledge');
  const promptsDir = path.join(rootDir, 'prompts');

  const produtos = fs.readFileSync(path.join(knowledgeDir, 'produtos.md'), 'utf-8');
  const objecoes = fs.readFileSync(path.join(knowledgeDir, 'objecoes.md'), 'utf-8');
  const looks = fs.readFileSync(path.join(knowledgeDir, 'looks.md'), 'utf-8');
  const guiaAtendimento = fs.readFileSync(path.join(knowledgeDir, 'guia-atendimento.md'), 'utf-8');
  const systemPrompt = fs.readFileSync(path.join(promptsDir, 'copilot_system.md'), 'utf-8');

  const contextText = `
=== BASE DE CONHECIMENTO DISPONÍVEL ===

[CATÁLOGO DE PRODUTOS]
${produtos}

[MATRIZ DE OBJEÇÕES]
${objecoes}

[LOOKS E COMBINAÇÕES PARA CROSS-SELLING]
${looks}

[GUIA DE ATENDIMENTO E TOM DE VOZ]
${guiaAtendimento}
=======================================
`;

  return { systemPrompt, contextText };
}

// 2. Motor Heurístico Offline (Fallback determinístico caso não haja GEMINI_API_KEY)
function generateOfflineHeuristicResponse(customerMessage: string): string {
  const lower = customerMessage.toLowerCase();

  let peca = 'Blazer Alfaiataria Azul Marinho Imperial';
  let intencao = 'Dúvida geral sobre o produto com interesse de compra';
  let resposta =
    'Olá! Ficamos muito felizes pelo seu interesse em nossas peças. Toda a nossa alfaiataria é confeccionada com matérias-primas nobres e corte construtivo para garantir máximo conforto e elegância. Podemos te ajudar com o tamanho ideal ou detalhes do envio?';
  let cross = {
    recomendar: 'Camisa Algodão Egípcio Branca (R$ 249,00) + Cinto Dupla Face Café (R$ 129,00)',
    argumento: 'Componha o look completo garantindo elegância pronta para qualquer ocasião corporativa ou social.',
  };

  // Análise de Intenção & Peça
  if (lower.includes('blazer') || lower.includes('paletó') || lower.includes('terno')) {
    peca = 'Blazer Alfaiataria Azul Marinho Imperial (R$ 589,00)';
    if (lower.includes('ombro') || lower.includes('apertar') || lower.includes('tamanho') || lower.includes('caimento')) {
      intencao = 'Insegurança de caimento nos ombros e corte da peça';
      resposta =
        'Olá! Esse blazer possui modelagem Slim Construtiva em lã fria 120s com 2% de elastano e abertura traseira dupla. Ele foi desenhado especialmente para não repuxar os ombros nem prender a movimentação ao volante ou na mesa de trabalho. Além disso, se precisar ajustar a numeração, nossa 1ª troca é 100% gratuita!';
    } else if (lower.includes('caro') || lower.includes('preço') || lower.includes('desconto')) {
      intencao = 'Objeção de preço com busca de valor agregado';
      resposta =
        'Olá! Entendemos a sua preocupação. O grande diferencial desta peça está na Lã Fria 120s com meio forro respirável: diferente de blazers sintéticos em poliéster, ele não esquenta no clima brasileiro, não perde a estrutura após o uso e dura anos no armário com caimento impecável. É um verdadeiro investimento que se paga ao longo de temporadas.';
    }
    cross = {
      recomendar: 'Camisa Social Algodão Egípcio Maquinetada Branca (R$ 249,00)',
      argumento: 'O colarinho italiano estruturado da camisa cria o enquadramento perfeito com a lapela do blazer.',
    };
  } else if (lower.includes('camisa') || lower.includes('egípcio') || lower.includes('branca')) {
    peca = 'Camisa Social Algodão Egípcio Maquinetada Branca (R$ 249,00)';
    intencao = 'Consulta de qualidade e toque do tecido';
    resposta =
      'Olá! Essa camisa é feita em 100% Algodão Egípcio Fio 80/2 com acabamento Easy Iron. Ela tem toque acetinado suave, respira super bem e tem alta resistência a amarrotar durante a rotina de trabalho. O colarinho italiano semi-aberto fica perfeito com ou sem gravata!';
    cross = {
      recomendar: 'Blazer Alfaiataria Azul Marinho Imperial (R$ 589,00) ou Calça Chino Cáqui (R$ 219,00)',
      argumento: 'A textura maquinetada da camisa se destaca de forma única sob a lã fria do blazer.',
    };
  } else if (lower.includes('sapato') || lower.includes('loafer') || lower.includes('mocassim') || lower.includes('pé')) {
    peca = 'Sapato Penny Loafer Couro Bovino Café (R$ 389,00)';
    intencao = 'Dúvida sobre conforto e maciez do couro';
    resposta =
      'Olá! Diferente de sapatos sociais rígidos convencionais, o nosso Penny Loafer é produzido em couro bovino floater legítimo com forro interno 100% couro natural e palmilha anatômica com memória. Ele não machuca o calcanhar e amacia já nos primeiros usos adaptando-se perfeitamente ao seu pé.';
    cross = {
      recomendar: 'Cinto Couro Dupla Face Café/Preto (R$ 129,00)',
      argumento: 'Alinhar o tom do couro do sapato com o cinto é a regra número 1 do estilo masculino clássico.',
    };
  } else if (lower.includes('calça') || lower.includes('chino') || lower.includes('cáqui')) {
    peca = 'Calça Chino Sarja Alfaiatada Cáqui (R$ 219,00)';
    intencao = 'Consulta de modelagem e versatilidade de uso';
    resposta =
      'Olá! A nossa calça Chino tem corte Slim Tapered em algodão Pima com 2% de elastano. Ela possui cós de alfaiataria estruturado, trazendo o conforto de uma calça casual com o alinhamento de uma calça social. É a peça mais versátil da nossa coleção!';
    cross = {
      recomendar: 'Sapato Penny Loafer Couro Café (R$ 389,00)',
      argumento: 'O tom cáqui da calça com o marrom café do Loafer cria o clássico contraste Weekend Chic.',
    };
  }

  return `🎯 Diagnóstico Rápido:
- Intenção: ${intencao}.
- Peça de interesse: ${peca}.

💬 Sugestão de Resposta para o Cliente:
"${resposta}"

✨ Oportunidade de Venda Adicional (Cross-selling):
- Recomendar: ${cross.recomendar}
- Argumento: "${cross.argumento}"
`;
}

// 3. Processamento via Gemini API (@google/genai)
async function processWithGemini(
  customerMessage: string,
  systemPrompt: string,
  contextText: string,
  apiKey: string
): Promise<string> {
  const { GoogleGenAI } = await import('@google/genai');
  const ai = new GoogleGenAI({ apiKey });

  const fullPrompt = `
${systemPrompt}

${contextText}

MENSAGEM DO CLIENTE RECEBIDA NO ATENDIMENTO:
"""
${customerMessage}
"""

Gere a resposta estruturada nos 3 blocos obrigatórios de acordo com a sua instrução.
`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: fullPrompt,
  });

  return response.text || generateOfflineHeuristicResponse(customerMessage);
}

// 4. Fluxo Principal da CLI
async function main() {
  console.clear();
  console.log('================================================================');
  console.log(' 👔 StylePilot AI - Copiloto Comercial & de Estilo (Moda Masculina)');
  console.log('================================================================');

  const { systemPrompt, contextText } = loadKnowledgeBase();
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    console.log('🟢 Modo Conectado: Chave GEMINI_API_KEY detectada.');
    console.log('   Modelo Ativo: Google Gemini (gemini-2.5-flash)');
  } else {
    console.log('🟡 Modo Offline / Heurístico: GEMINI_API_KEY não informada.');
    console.log('   Utilizando base de conhecimento local e matriz de desarmes.');
  }

  console.log('----------------------------------------------------------------');
  console.log('Instruções: Cole a mensagem recebida do cliente no WhatsApp/Direct.');
  console.log('Digite "sair" para encerrar.');
  console.log('----------------------------------------------------------------\n');

  // Modo de teste rápido via argumento
  if (process.argv.includes('--test')) {
    const testMessage =
      'Gostei do blazer azul marinho, mas tenho receio de não servir nos ombros e achei o preço um pouco alto... Tem desconto?';
    console.log(`[TESTE] Mensagem simulada do cliente:\n"${testMessage}"\n`);
    console.log('Processando recomendação...\n');

    let result = '';
    if (apiKey) {
      try {
        result = await processWithGemini(testMessage, systemPrompt, contextText, apiKey);
      } catch (err) {
        console.warn('⚠️ Falha ao consultar Gemini API. Usando fallback offline...');
        result = generateOfflineHeuristicResponse(testMessage);
      }
    } else {
      result = generateOfflineHeuristicResponse(testMessage);
    }

    console.log(result);
    process.exit(0);
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const promptUser = () => {
    rl.question('📩 Mensagem do Cliente > ', async (input) => {
      const trimmed = input.trim();
      if (!trimmed) {
        promptUser();
        return;
      }
      if (trimmed.toLowerCase() === 'sair') {
        console.log('\nAté logo! Boas vendas! 👔💼\n');
        rl.close();
        process.exit(0);
      }

      console.log('\n⏳ Analisando intenção, tecidos e regras de estilo...\n');
      try {
        let output = '';
        if (apiKey) {
          try {
            output = await processWithGemini(trimmed, systemPrompt, contextText, apiKey);
          } catch (apiError: any) {
            console.warn(`⚠️ Aviso: Falha na API Gemini (${apiError.message}). Alternando para motor offline...`);
            output = generateOfflineHeuristicResponse(trimmed);
          }
        } else {
          output = generateOfflineHeuristicResponse(trimmed);
        }

        console.log(output);
        console.log('----------------------------------------------------------------\n');
      } catch (err: any) {
        console.error('❌ Erro no processamento:', err.message);
      }

      promptUser();
    });
  };

  promptUser();
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
