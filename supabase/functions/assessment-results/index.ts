import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

// Mapeamento das perguntas do questionário
const questionMapping: Record<string, { text: string; dimension: string; options: Array<{ value: number; text: string }> }> = {
  "q1": {
    text: "Como a alta direção exerce a liderança e interage com as partes interessadas?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não há liderança estruturada ou interação com partes interessadas" },
      { value: 2, text: "Liderança básica com interação informal" },
      { value: 3, text: "Liderança parcialmente estruturada com algumas interações" },
      { value: 4, text: "Liderança bem estruturada com interação sistemática" },
      { value: 5, text: "Liderança exemplar com engajamento proativo de todas as partes" }
    ]
  },
  "q2": {
    text: "Como é implementado o sistema de liderança da organização?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não existe um sistema de liderança estruturado" },
      { value: 2, text: "Sistema de liderança básico e informal" },
      { value: 3, text: "Sistema de liderança parcialmente implementado" },
      { value: 4, text: "Sistema de liderança bem estruturado e amplamente aplicado" },
      { value: 5, text: "Sistema de liderança robusto, integrado e continuamente aprimorado" }
    ]
  },
  "q3": {
    text: "Como a organização analisa criticamente o desempenho global?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não há análise crítica estruturada do desempenho" },
      { value: 2, text: "Análises pontuais e informais do desempenho" },
      { value: 3, text: "Análise crítica parcial com alguns indicadores" },
      { value: 4, text: "Análise crítica sistemática com indicadores abrangentes" },
      { value: 5, text: "Análise crítica robusta, integrada e orientada para melhoria contínua" }
    ]
  },
  "q4": {
    text: "Como a alta direção demonstra comprometimento com a excelência e sustentabilidade?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não há demonstração clara de comprometimento com excelência" },
      { value: 2, text: "Comprometimento básico e esporádico" },
      { value: 3, text: "Comprometimento parcial com algumas iniciativas" },
      { value: 4, text: "Comprometimento claro e consistente na maioria das ações" },
      { value: 5, text: "Comprometimento exemplar e inspirador em todas as dimensões" }
    ]
  },
  "q5": {
    text: "Como são formuladas as estratégias da organização?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não há processo estruturado de formulação de estratégias" },
      { value: 2, text: "Processo básico e informal de definição estratégica" },
      { value: 3, text: "Processo de formulação estratégica parcialmente estruturado" },
      { value: 4, text: "Processo bem estruturado com metodologia definida" },
      { value: 5, text: "Processo robusto, sistemático e continuamente aprimorado" }
    ]
  },
  "q6": {
    text: "Como são implementadas as estratégias da organização?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não há processo estruturado de implementação estratégica" },
      { value: 2, text: "Implementação básica e informal das estratégias" },
      { value: 3, text: "Implementação parcial com alguns mecanismos de controle" },
      { value: 4, text: "Implementação sistemática com acompanhamento regular" },
      { value: 5, text: "Implementação exemplar com gestão integrada e monitoramento contínuo" }
    ]
  },
  "q7": {
    text: "Como são gerenciados os processos finalísticos da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada dos processos finalísticos" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns controles" },
      { value: 4, text: "Gestão sistemática e bem estruturada" },
      { value: 5, text: "Gestão exemplar com otimização contínua" }
    ]
  },
  "q8": {
    text: "Como são gerenciados os processos de apoio da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada dos processos de apoio" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns procedimentos definidos" },
      { value: 4, text: "Gestão sistemática e bem estruturada" },
      { value: 5, text: "Gestão exemplar com integração total" }
    ]
  },
  "q9": {
    text: "Como são gerenciados os fornecedores da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada de fornecedores" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns métodos" },
      { value: 4, text: "Gestão sistemática e bem estruturada" },
      { value: 5, text: "Gestão exemplar com parcerias estratégicas" }
    ]
  },
  "q10": {
    text: "Como são gerenciadas as finanças da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada das finanças" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns controles" },
      { value: 4, text: "Gestão sistemática e bem estruturada" },
      { value: 5, text: "Gestão exemplar com planejamento estratégico" }
    ]
  },
  "q11": {
    text: "Como são definidos os sistemas de trabalho da organização?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não há definição estruturada dos sistemas de trabalho" },
      { value: 2, text: "Definição básica e informal" },
      { value: 3, text: "Definição parcial com alguns métodos" },
      { value: 4, text: "Definição sistemática e bem estruturada" },
      { value: 5, text: "Definição exemplar com inovação contínua" }
    ]
  },
  "q12": {
    text: "Como são desenvolvidas as competências das pessoas?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não há desenvolvimento estruturado de competências" },
      { value: 2, text: "Desenvolvimento básico e informal" },
      { value: 3, text: "Desenvolvimento parcial com alguns métodos" },
      { value: 4, text: "Desenvolvimento sistemático e bem estruturado" },
      { value: 5, text: "Desenvolvimento exemplar com inovação contínua" }
    ]
  },
  "q13": {
    text: "Como é promovida a qualidade de vida das pessoas?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não há promoção estruturada da qualidade de vida" },
      { value: 2, text: "Promoção básica e informal" },
      { value: 3, text: "Promoção parcial com algumas iniciativas" },
      { value: 4, text: "Promoção sistemática e bem estruturada" },
      { value: 5, text: "Promoção exemplar com programas abrangentes" }
    ]
  },
  "q14": {
    text: "Como são segmentados os clientes e mercados?",
    dimension: "Clientes",
    options: [
        { value: 1, text: "Não há segmentação estruturada" },
        { value: 2, text: "Segmentação básica e informal" },
        { value: 3, text: "Segmentação parcial com alguns critérios" },
        { value: 4, text: "Segmentação sistemática e bem definida" },
        { value: 5, text: "Segmentação exemplar e estratégica" }
      ]
  },
  "q15": {
    text: "Como são desenvolvidos os produtos e serviços?",
    dimension: "Clientes",
    options: [
        { value: 1, text: "Não há processo estruturado de desenvolvimento" },
        { value: 2, text: "Desenvolvimento básico e informal" },
        { value: 3, text: "Processo parcial com alguns controles" },
        { value: 4, text: "Processo sistemático e bem estruturado" },
        { value: 5, text: "Processo exemplar com inovação contínua" }
      ]
  },
  "q16": {
    text: "Como é realizado o relacionamento com os clientes?",
    dimension: "Clientes",
    options: [
        { value: 1, text: "Não há gestão estruturada do relacionamento" },
        { value: 2, text: "Relacionamento básico e informal" },
        { value: 3, text: "Relacionamento parcial com alguns canais" },
        { value: 4, text: "Relacionamento sistemático e multicanal" },
        { value: 5, text: "Relacionamento exemplar e personalizado" }
      ]
  },
  "q17": {
    text: "Como a organização atua em relação à responsabilidade socioambiental?",
    dimension: "Sociedade",
    options: [
      { value: 1, text: "Não há atuação estruturada em responsabilidade socioambiental" },
      { value: 2, text: "Atuação básica e esporádica" },
      { value: 3, text: "Atuação parcial com algumas iniciativas" },
      { value: 4, text: "Atuação sistemática e abrangente" },
      { value: 5, text: "Atuação exemplar e transformadora" }
    ]
  },
  "q18": {
    text: "Como a organização trata as questões éticas?",
    dimension: "Sociedade",
    options: [
      { value: 1, text: "Não há tratamento estruturado de questões éticas" },
      { value: 2, text: "Tratamento básico e informal" },
      { value: 3, text: "Tratamento parcial com alguns códigos" },
      { value: 4, text: "Tratamento sistemático com códigos bem definidos" },
      { value: 5, text: "Tratamento exemplar com cultura ética sólida" }
    ]
  },
  "q19": {
    text: "Como a organização desenvolve a cidadania?",
    dimension: "Sociedade",
    options: [
      { value: 1, text: "Não há desenvolvimento estruturado de cidadania" },
      { value: 2, text: "Desenvolvimento básico e esporádico" },
      { value: 3, text: "Desenvolvimento parcial com algumas ações" },
      { value: 4, text: "Desenvolvimento sistemático e abrangente" },
      { value: 5, text: "Desenvolvimento exemplar e transformador" }
    ]
  },
  "q20": {
    text: "Como são gerenciadas as informações da organização?",
    dimension: "Informações e Conhecimento",
    options: [
      { value: 1, text: "Não há gestão estruturada das informações" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns sistemas" },
      { value: 4, text: "Gestão sistemática e bem estruturada" },
      { value: 5, text: "Gestão exemplar com integração total" }
    ]
  },
  "q21": {
    text: "Como são gerenciados os conhecimentos da organização?",
    dimension: "Informações e Conhecimento",
    options: [
      { value: 1, text: "Não há gestão estruturada do conhecimento" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns repositórios" },
      { value: 4, text: "Gestão sistemática e compartilhada" },
      { value: 5, text: "Gestão exemplar com inovação contínua" }
    ]
  },
  "q22": {
    text: "Como são avaliados os resultados relativos aos clientes e mercados?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação estruturada dos resultados" },
      { value: 2, text: "Avaliação básica e esporádica" },
      { value: 3, text: "Avaliação parcial com alguns indicadores" },
      { value: 4, text: "Avaliação sistemática e abrangente" },
      { value: 5, text: "Avaliação exemplar com benchmarking" }
    ]
  },
  "q23": {
    text: "Como são avaliados os resultados relativos às pessoas?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação estruturada dos resultados" },
      { value: 2, text: "Avaliação básica e informal" },
      { value: 3, text: "Avaliação parcial com alguns indicadores" },
      { value: 4, text: "Avaliação sistemática e regular" },
      { value: 5, text: "Avaliação exemplar com ações de melhoria" }
    ]
  },
  "q24": {
    text: "Como são avaliados os resultados dos processos principais do negócio?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação estruturada dos resultados" },
      { value: 2, text: "Avaliação básica e esporádica" },
      { value: 3, text: "Avaliação parcial com alguns indicadores" },
      { value: 4, text: "Avaliação sistemática e regular" },
      { value: 5, text: "Avaliação exemplar com melhoria contínua" }
    ]
  },
  "q25": {
    text: "Como são avaliados os resultados relativos à sociedade?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação estruturada dos resultados" },
      { value: 2, text: "Avaliação básica e informal" },
      { value: 3, text: "Avaliação parcial com alguns indicadores" },
      { value: 4, text: "Avaliação sistemática e documentada" },
      { value: 5, text: "Avaliação exemplar com impacto positivo" }
    ]
  }
};

// Função para formatar as respostas do assessment
function formatAssessmentAnswers(answers: Record<string, any>): string {
  const dimensionGroups: Record<string, Array<{ question: string; answer: string }>> = {};
  
  // Agrupar respostas por dimensão
  Object.entries(answers).forEach(([questionId, answerData]) => {
    const questionInfo = questionMapping[questionId];
    if (questionInfo) {
      const dimension = questionInfo.dimension;
      if (!dimensionGroups[dimension]) {
        dimensionGroups[dimension] = [];
      }
      
      let answerText = '';
      if (typeof answerData === 'object' && answerData.answer_text) {
        answerText = answerData.answer_text;
      } else if (typeof answerData === 'number') {
        const option = questionInfo.options.find(opt => opt.value === answerData);
        answerText = option ? option.text : `Pontuação: ${answerData}`;
      } else {
        answerText = String(answerData);
      }
      
      dimensionGroups[dimension].push({
        question: questionInfo.text,
        answer: answerText
      });
    }
  });
  
  // Gerar HTML formatado por dimensão
  let formattedHtml = '';
  Object.entries(dimensionGroups).forEach(([dimension, questions]) => {
    formattedHtml += `
      <div style="margin-bottom: 25px; padding: 15px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f8f9fa;">
        <h4 style="color: #2c3e50; margin-bottom: 15px; font-size: 16px; font-weight: bold;">${dimension}</h4>
        <div style="space-y: 10px;">`;
    
    questions.forEach(({ question, answer }) => {
      formattedHtml += `
          <div style="margin-bottom: 12px; padding: 10px; background-color: #ffffff; border-radius: 5px; border-left: 3px solid #3498db;">
            <p style="margin: 0 0 5px 0; font-weight: bold; color: #2c3e50; font-size: 14px;">${question}</p>
            <p style="margin: 0; color: #555; font-size: 13px; line-height: 1.4;">${answer}</p>
          </div>`;
    });
    
    formattedHtml += `
        </div>
      </div>`;
  });
  
  return formattedHtml;
}

// Função para obter recomendações por dimensão e nível
function getDimensionRecommendations(dimension: string, level: number): string {
  const recommendations: Record<string, Record<number, string>> = {
    "Liderança": {
      1: "• Definir missão, visão e valores organizacionais claros\n• Estabelecer estrutura básica de liderança\n• Implementar reuniões regulares de liderança\n• Criar canais básicos de comunicação interna\n• Desenvolver competências fundamentais de liderança",
      2: "• Implementar sistema de liderança estruturado\n• Estabelecer políticas de gestão documentadas\n• Criar ferramentas de gestão de desempenho\n• Desenvolver programas de treinamento em liderança\n• Implementar feedback 360 graus",
      3: "• Fortalecer cultura de liderança\n• Implementar programas de desenvolvimento contínuo\n• Estabelecer indicadores de eficácia da liderança\n• Criar programas de sucessão\n• Promover liderança colaborativa",
      4: "• Consolidar práticas de liderança de alta performance\n• Implementar analytics de pessoas\n• Desenvolver liderança digital\n• Estabelecer programas de liderança estratégica\n• Promover liderança adaptativa",
      5: "• Manter excelência reconhecida em liderança\n• Tornar-se referência no mercado\n• Desenvolver líderes visionários\n• Implementar liderança consciente\n• Estabelecer-se como benchmark de liderança"
    },
    "Estratégias e Planos": {
      1: "• Definir missão, visão e valores organizacionais\n• Estabelecer objetivos estratégicos de curto prazo\n• Criar planos de ação básicos\n• Implementar reuniões de acompanhamento\n• Documentar planos estratégicos",
      2: "• Desenvolver processo de planejamento estruturado\n• Implementar análise SWOT\n• Estabelecer objetivos de médio prazo\n• Criar sistema de indicadores estratégicos\n• Promover alinhamento entre áreas",
      3: "• Estruturar sistema de gestão estratégica\n• Implementar análise de tendências de mercado\n• Estabelecer balanced scorecard\n• Criar gestão de portfólio de projetos\n• Desenvolver inteligência competitiva",
      4: "• Consolidar sistema integrado de gestão estratégica\n• Implementar business intelligence\n• Desenvolver inteligência de mercado\n• Estabelecer estratégias de transformação digital\n• Promover cultura de inovação",
      5: "• Praticar excelência em gestão estratégica\n• Tornar-se referência no setor\n• Desenvolver estratégias disruptivas\n• Liderar transformações setoriais\n• Implementar estratégias de sustentabilidade"
    },
    "Processos": {
      1: "• Mapear processos críticos da organização\n• Estabelecer procedimentos operacionais padronizados\n• Implementar controles básicos de qualidade\n• Definir responsabilidades claras\n• Criar documentação fundamental",
      2: "• Desenvolver sistema estruturado de gestão de processos\n• Implementar documentação detalhada\n• Estabelecer indicadores de performance\n• Criar ciclos de melhoria contínua\n• Promover treinamento em gestão de processos",
      3: "• Estruturar sistema avançado de gestão de processos\n• Implementar automação básica\n• Estabelecer metodologias de melhoria contínua\n• Criar gestão proativa de riscos\n• Promover cultura de excelência operacional",
      4: "• Consolidar processos de alta performance\n• Implementar automação avançada\n• Desenvolver capacidades analíticas\n• Estabelecer processos ágeis\n• Implementar gestão end-to-end",
      5: "• Praticar excelência em gestão de processos\n• Tornar-se referência no setor\n• Desenvolver processos inovadores\n• Estabelecer benchmarks de eficiência\n• Implementar processos sustentáveis"
    },
    "Pessoas": {
      1: "Organize uma estrutura básica de recursos humanos estabelecendo políticas fundamentais de contratação, demissão e gestão de pessoal, criando um manual do colaborador com direitos e deveres claramente definidos. Defina descrições detalhadas de cargos e responsabilidades para todas as posições, estabelecendo organogramas claros e linhas de reporte bem definidas. Implemente controles básicos de ponto, folha de pagamento e benefícios obrigatórios. Crie processos simples de integração de novos colaboradores e estabeleça canais básicos de comunicação interna.",
      2: "Implemente processos estruturados de recrutamento e seleção utilizando técnicas modernas de entrevista, testes de competência e verificação de referências para atrair e selecionar os melhores talentos. Desenvolva programas básicos de treinamento e desenvolvimento profissional alinhados com as necessidades da organização e aspirações dos colaboradores. Melhore significativamente a comunicação interna através de reuniões regulares, newsletters, murais informativos e canais digitais. Estabeleça políticas claras de avaliação de desempenho e feedback contínuo.",
      3: "Estruture um sistema abrangente de gestão de competências mapeando as competências técnicas e comportamentais necessárias para cada função e desenvolvendo planos individuais de desenvolvimento. Monitore regularmente o clima organizacional através de pesquisas estruturadas, grupos focais e indicadores de satisfação, implementando ações corretivas baseadas nos resultados. Implemente programas de sucessão e planos de carreira claros. Desenvolva lideranças internas através de programas de mentoring e coaching.",
      4: "Pratique gestão de talentos avançada utilizando analytics de RH, inteligência artificial para recrutamento e sistemas sofisticados de gestão de performance que identifiquem e desenvolvam high performers. Promova ativamente o engajamento e bem-estar dos colaboradores através de programas de qualidade de vida, flexibilidade no trabalho, reconhecimento e recompensas diferenciadas. Implemente cultura de feedback contínuo, diversidade e inclusão. Desenvolva programas inovadores de retenção de talentos e employer branding.",
      5: "Torne-se uma referência reconhecida em gestão de pessoas no seu setor através da implementação de práticas inovadoras de people analytics, employee experience design e future of work. Inove constantemente em práticas de RH desenvolvendo metodologias próprias de desenvolvimento humano, programas de well-being holísticos e modelos de trabalho flexíveis que sirvam de benchmark. Implemente tecnologias de ponta como IA para personalização de experiências e desenvolvimento de competências. Estabeleça parcerias com universidades para pesquisa em gestão de pessoas."
    },
    "Clientes": {
      1: "• Organizar processos fundamentais de atendimento\n• Estabelecer canais de comunicação claros\n• Implementar pesquisas básicas de satisfação\n• Criar banco de dados básico de clientes\n• Desenvolver políticas de relacionamento",
      2: "• Desenvolver sistema estruturado de CRM\n• Implementar segmentação básica de clientes\n• Estabelecer métricas de satisfação\n• Promover treinamento em atendimento\n• Criar processos de recuperação de clientes",
      3: "• Estruturar gestão avançada de relacionamento\n• Implementar análise de comportamento do cliente\n• Estabelecer jornada do cliente\n• Desenvolver programas de experiência\n• Promover cultura customer-centric",
      4: "• Consolidar excelência em experiência do cliente\n• Implementar analytics avançados\n• Desenvolver estratégia omnichannel\n• Estabelecer capacidades de antecipação\n• Promover co-criação de valor",
      5: "• Praticar excelência em experiência do cliente\n• Tornar-se referência no mercado\n• Desenvolver experiências únicas\n• Estabelecer programas de advocacy\n• Criar impacto positivo na comunidade"
    },
    "Resultados": {
      1: "• Estabelecer sistema básico de métricas\n• Implementar rotinas de monitoramento\n• Desenvolver práticas de acompanhamento\n• Promover cultura inicial de resultados\n• Estabelecer responsabilização por metas",
      2: "• Desenvolver sistema estruturado de gestão\n• Implementar KPIs bem definidos\n• Estabelecer dashboards de acompanhamento\n• Criar análise sistemática de tendências\n• Promover gestão efetiva por resultados",
      3: "• Implementar gestão estratégica de resultados\n• Desenvolver balanced scorecard\n• Estabelecer capacidades preditivas\n• Criar gestão efetiva de valor\n• Promover cultura de alta performance",
      4: "• Consolidar gestão avançada de resultados\n• Implementar analytics preditivos\n• Desenvolver gestão integrada de valor\n• Estabelecer capacidades de transformação\n• Criar liderança reconhecida em resultados",
      5: "• Praticar excelência sustentável em resultados\n• Tornar-se referência reconhecida\n• Desenvolver capacidades inovadoras\n• Liderar transformação de mercado\n• Implementar criação de valor sustentável"
    },
    "Sociedade": {
      1: "Inicie um processo de identificação e mapeamento dos impactos sociais básicos da sua organização através de diagnósticos participativos envolvendo colaboradores, comunidade local e stakeholders relevantes. Estabeleça um programa rigoroso de cumprimento da legislação ambiental e social, criando check-lists de conformidade e realizando auditorias internas regulares. Implemente práticas básicas de responsabilidade social como separação de resíduos, uso consciente de recursos naturais e respeito aos direitos trabalhistas. Crie canais de comunicação com a comunidade local para receber feedback sobre impactos das operações.",
      2: "Desenvolva programas estruturados de responsabilidade social corporativa alinhados com os Objetivos de Desenvolvimento Sustentável (ODS) da ONU, estabelecendo metas claras, cronogramas e indicadores de impacto. Engaje ativamente a comunidade local através de parcerias com ONGs, escolas e organizações comunitárias, desenvolvendo projetos de educação, capacitação profissional e geração de renda. Implemente políticas de diversidade e inclusão no ambiente de trabalho e estabeleça programas de voluntariado corporativo. Crie relatórios anuais de sustentabilidade para comunicar transparentemente as ações e resultados.",
      3: "Implemente um sistema de gestão ambiental estruturado baseado em normas como ISO 14001, estabelecendo políticas ambientais claras, objetivos mensuráveis e programas de treinamento para todos os colaboradores. Monitore sistematicamente os impactos socioambientais através de indicadores específicos como pegada de carbono, consumo de água, geração de resíduos e impactos na biodiversidade. Desenvolva programas de economia circular, redução de desperdícios e uso de energias renováveis. Estabeleça parcerias com fornecedores que compartilhem valores de sustentabilidade.",
      4: "Integre completamente a sustentabilidade à estratégia organizacional, incorporando critérios ESG (Environmental, Social and Governance) em todos os processos de tomada de decisão e planejamento estratégico. Promova desenvolvimento social ativo através de investimento social privado, criação de negócios sociais e desenvolvimento de cadeias produtivas sustentáveis. Implemente sistemas avançados de gestão de riscos socioambientais e desenvolva produtos e serviços com impacto social positivo. Estabeleça metas science-based para redução de emissões e outros impactos ambientais.",
      5: "Torne-se uma referência reconhecida em sustentabilidade no seu setor através da implementação de práticas inovadoras, obtenção de certificações internacionais e participação em índices de sustentabilidade. Lidere iniciativas setoriais de sustentabilidade através de associações empresariais, fóruns de sustentabilidade e parcerias estratégicas com outras organizações. Desenvolva tecnologias e metodologias próprias para soluções sustentáveis e compartilhe conhecimento através de publicações e eventos. Implemente programas de regeneração ambiental que vão além da neutralidade de impactos.",
      6: "Transforme positivamente a sociedade através de iniciativas disruptivas que criem valor compartilhado e solucionem grandes desafios socioambientais globais. Torne-se um modelo global de sustentabilidade, influenciando políticas públicas, padrões setoriais e práticas empresariais em escala internacional. Estabeleça parcerias estratégicas com governos, organizações multilaterais e academia para desenvolvimento de soluções sistêmicas. Crie um legado duradouro de impacto positivo que inspire e transforme toda a cadeia de valor e a sociedade como um todo."
    },
    "Informações e Conhecimento": {
      1: "Inicie um processo de organização das informações básicas da empresa através da criação de repositórios centralizados, padronização de nomenclaturas e estabelecimento de hierarquias claras de acesso. Estabeleça sistemas básicos de comunicação interna utilizando ferramentas como email corporativo, murais informativos e reuniões regulares para garantir fluxo adequado de informações. Implemente controles básicos de segurança da informação e backup de dados críticos. Crie procedimentos simples para documentação de processos e conhecimentos essenciais da organização.",
      2: "Implemente sistemas estruturados de gestão de informações utilizando ferramentas de TI adequadas como sistemas ERP básicos, plataformas de colaboração e bancos de dados organizados. Desenvolva uma base de conhecimento organizacional através da documentação sistemática de processos, melhores práticas, lições aprendidas e expertise dos colaboradores. Estabeleça políticas claras de gestão da informação incluindo classificação, retenção e descarte de documentos. Crie programas de treinamento para capacitar colaboradores no uso efetivo dos sistemas de informação.",
      3: "Estruture um sistema abrangente de gestão do conhecimento implementando comunidades de prática, repositórios especializados e processos formais de captura e transferência de conhecimento tácito. Monitore sistematicamente a qualidade das informações através de indicadores específicos como precisão, completude, atualidade e relevância dos dados. Implemente ferramentas avançadas de business intelligence para análise e visualização de dados. Estabeleça governança de dados com responsabilidades claras e processos de validação contínua.",
      4: "Integre completamente os sistemas de informação da organização através de plataformas unificadas, APIs e interfaces que permitam fluxo seamless de dados entre diferentes áreas e processos. Promova ativamente o compartilhamento de conhecimento através de programas de mentoring, workshops internos, wikis corporativas e sistemas de gestão de competências. Implemente analytics avançados e inteligência artificial para extrair insights estratégicos dos dados. Desenvolva capacidades de gestão de big data e análise preditiva para suporte à tomada de decisões.",
      5: "Pratique gestão avançada do conhecimento utilizando tecnologias de ponta como machine learning, processamento de linguagem natural e sistemas de recomendação para otimizar a descoberta e aplicação de conhecimento. Use analytics sofisticados e ciência de dados para fundamentar decisões estratégicas, identificar padrões ocultos e antecipar tendências. Implemente sistemas de knowledge management que aprendem continuamente e se adaptam às necessidades da organização. Estabeleça parcerias com universidades e centros de pesquisa para acesso a conhecimento de fronteira.",
      6: "Torne-se uma referência global em gestão da informação e conhecimento no seu setor, desenvolvendo metodologias inovadoras e tecnologias proprietárias que sejam estudadas e replicadas por outras organizações. Influencie o desenvolvimento de padrões e melhores práticas da indústria através de liderança em associações, publicação de pesquisas e participação em fóruns internacionais. Estabeleça ecossistemas de conhecimento que conectem a organização com redes globais de expertise. Crie centros de excelência que sirvam como referência e inspirem a evolução das práticas de gestão do conhecimento em toda a indústria."
    }
  };
  
  return recommendations[dimension]?.[level] || "Recomendações não disponíveis para este nível.";
}

// Função para gerar análise detalhada por dimensão em HTML
function generateDimensionAnalysisHtml(dimensionAnalysis: Record<string, DimensionAnalysis>): string {
  let analysisHtml = '<div style="margin: 20px 0;">';
  
  Object.keys(dimensionAnalysis).forEach(dimension => {
    const analysis = dimensionAnalysis[dimension];
    const recommendations = getDimensionRecommendations(dimension, analysis.level.level);
    
    analysisHtml += `
      <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
        <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px; font-weight: bold;">${dimension}</h3>
        
        <div style="margin-bottom: 15px;">
          <p style="margin: 5px 0; font-size: 14px;"><strong>Pontuação:</strong> ${analysis.score} pontos</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Percentual:</strong> ${Math.round(analysis.percentage)}%</p>
          <p style="margin: 5px 0; font-size: 14px;"><strong>Nível de Maturidade:</strong> ${analysis.level.level} - ${analysis.level.title}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db; margin-bottom: 15px;">
          <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px; font-weight: bold;">Descrição do Nível:</h4>
          <p style="margin: 0; line-height: 1.6; color: #555; font-size: 14px;">${analysis.level.description}</p>
        </div>
        
        <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60;">
          <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px; font-weight: bold;">Recomendações Específicas:</h4>
          <p style="margin: 0; line-height: 1.6; color: #555; font-size: 14px;">${recommendations}</p>
        </div>
      </div>`;
  });
  
  analysisHtml += '</div>';
  return analysisHtml;
}

interface AssessmentData {
  userInfo: {
    name: string
    email: string
    company: string
    position?: string
  }
  result: {
    level: number
    title: string
    description: string
  }
  totalScore: number
  percentage: number
  answers: Record<string, any>
  dimensionAnalysis?: Record<string, any>
}

interface DimensionAnalysis {
  score: number
  percentage: number
  level: {
    level: number
    title: string
    description: string
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Parse request body
    const assessmentData: AssessmentData = await req.json()
    const { userInfo, result, totalScore, percentage, answers } = assessmentData

    // Validate required fields
    if (!userInfo?.name || !userInfo?.email || !userInfo?.company || !result || !answers) {
      return new Response(
        JSON.stringify({ error: 'Dados incompletos do assessment' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(userInfo.email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

    // Try database insert with minimal error handling
     try {
       const { data: savedAssessment, error: dbError } = await supabase
         .from('assessments')
         .insert({
           name: userInfo.name,
           email: userInfo.email,
           company: userInfo.company || 'Não informado',
           position: userInfo.position || null,
           total_score: totalScore,
           percentage: percentage,
           maturity_level: result.level,
           level_title: result.title || 'Nível ' + result.level,
           level_description: result.description || 'Descrição do nível',
           answers: answers || {}
         })
         .select()
         .single()

       if (dbError) {
         console.error('Database error:', dbError)
         return new Response(
           JSON.stringify({ 
             success: false, 
             message: 'Database error: ' + dbError.message,
             error: dbError
           }),
           { 
             status: 500, 
             headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
           }
         )
       }

       // Send email notification if Resend API key is configured
       console.log('RESEND_API_KEY exists:', !!RESEND_API_KEY)
       console.log('RESEND_API_KEY length:', RESEND_API_KEY ? RESEND_API_KEY.length : 0)
       
       if (RESEND_API_KEY) {
         try {
           console.log('Attempting to send assessment email to Resend...')
           
           // Format answers for email display
           const answersHtml = formatAssessmentAnswers(answers)
           
           // Gerar análise por dimensão se disponível
           let dimensionAnalysisHtml = '';
           if (assessmentData.dimensionAnalysis) {
             dimensionAnalysisHtml = `
               <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                 <h3 style="color: #495057; margin-bottom: 20px;">Análise Detalhada por Dimensão</h3>
                 ${generateDimensionAnalysisHtml(assessmentData.dimensionAnalysis)}
               </div>
             `;
           }

           const emailPayload = {
             from: 'Stratica Website <onboarding@resend.dev>',
             to: ['marcelo@ainda.app'],
             subject: `Novo Assessment Completado - ${userInfo.name} (${userInfo.company})`,
             html: `
               <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                 <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                   <h1 style="color: #2c3e50; text-align: center; margin-bottom: 30px;">Novo Assessment de Maturidade Digital Completado</h1>
                   
                   <div style="background-color: #ecf0f1; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                     <h2 style="color: #34495e; margin-bottom: 15px;">Informações do Usuário</h2>
                     <p><strong>Nome:</strong> ${userInfo.name}</p>
                     <p><strong>Email:</strong> ${userInfo.email}</p>
                     <p><strong>Empresa:</strong> ${userInfo.company}</p>
                     ${userInfo.position ? `<p><strong>Cargo:</strong> ${userInfo.position}</p>` : ''}
                   </div>
                   
                   <div style="background-color: #e8f5e8; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                     <h2 style="color: #27ae60; margin-bottom: 15px;">Resultado do Assessment</h2>
                     <p><strong>Nível de Maturidade:</strong> ${result.level} - ${result.title}</p>
                     <p><strong>Pontuação Total:</strong> ${totalScore}</p>
                     <p><strong>Percentual:</strong> ${percentage}%</p>
                     <p style="margin-top: 15px; line-height: 1.6;">${result.description}</p>
                   </div>
                   
                   ${dimensionAnalysisHtml}
                   
                   <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                     <h2 style="color: #856404; margin-bottom: 15px;">Respostas Detalhadas</h2>
                     ${answersHtml}
                   </div>
                   
                   <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 2px solid #ecf0f1;">
                     <p style="color: #7f8c8d; font-size: 14px;">Este assessment foi gerado automaticamente pelo sistema Stratica.</p>
                     <p style="color: #7f8c8d; font-size: 14px;">Assessment completado em: ${new Date().toLocaleString('pt-BR')}</p>
                   </div>
                 </div>
               </div>
             `,
           }
           
           console.log('Assessment email payload:', JSON.stringify(emailPayload, null, 2))
           
           const emailResponse = await fetch('https://api.resend.com/emails', {
             method: 'POST',
             headers: {
               'Authorization': `Bearer ${RESEND_API_KEY}`,
               'Content-Type': 'application/json',
             },
             body: JSON.stringify(emailPayload),
           })

           console.log('Assessment email response status:', emailResponse.status)
           const responseText = await emailResponse.text()
           console.log('Assessment email response body:', responseText)
           
           if (!emailResponse.ok) {
             console.error('Assessment email sending failed with status:', emailResponse.status)
             console.error('Assessment email error response:', responseText)
           } else {
             console.log('Assessment email sent successfully!')
           }
         } catch (emailError) {
           console.error('Assessment email error caught:', emailError)
           console.error('Assessment email error stack:', emailError.stack)
           // Don't fail the request if email fails
         }
       } else {
         console.log('RESEND_API_KEY not configured - skipping assessment email send')
       }

       return new Response(
         JSON.stringify({ 
           success: true, 
           message: 'Assessment salvo com sucesso no banco de dados!',
           assessment: savedAssessment
         }),
         { 
           status: 200, 
           headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
         }
       )
     } catch (error) {
       console.error('Unexpected error:', error)
       return new Response(
         JSON.stringify({ 
           success: false, 
           message: 'Erro inesperado: ' + error.message,
           error: error
         }),
         { 
           status: 500, 
           headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
         }
       )
     }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: 'Erro interno do servidor' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})