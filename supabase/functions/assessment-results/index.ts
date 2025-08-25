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
    text: "Como são elaborados os planos de ação da organização?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não há elaboração estruturada de planos de ação" },
      { value: 2, text: "Planos básicos e informais" },
      { value: 3, text: "Planos parcialmente estruturados" },
      { value: 4, text: "Planos bem elaborados e integrados" },
      { value: 5, text: "Planos robustos, detalhados e continuamente atualizados" }
    ]
  },
  "q8": {
    text: "Como a organização identifica, analisa e trata os riscos?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não há identificação ou tratamento estruturado de riscos" },
      { value: 2, text: "Identificação básica e informal de riscos" },
      { value: 3, text: "Processo parcial de gestão de riscos" },
      { value: 4, text: "Gestão sistemática e abrangente de riscos" },
      { value: 5, text: "Gestão exemplar e integrada de riscos" }
    ]
  },
  "q9": {
    text: "Como são gerenciados os processos finalísticos da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada dos processos finalísticos" },
      { value: 2, text: "Gestão básica e informal dos processos" },
      { value: 3, text: "Gestão parcial com alguns controles" },
      { value: 4, text: "Gestão sistemática e bem estruturada" },
      { value: 5, text: "Gestão exemplar com melhoria contínua" }
    ]
  },
  "q10": {
    text: "Como são gerenciados os processos de apoio da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada dos processos de apoio" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns controles" },
      { value: 4, text: "Gestão sistemática e integrada" },
      { value: 5, text: "Gestão exemplar com otimização contínua" }
    ]
  },
  "q11": {
    text: "Como são gerenciados os fornecedores da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão estruturada de fornecedores" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns critérios" },
      { value: 4, text: "Gestão sistemática com critérios definidos" },
      { value: 5, text: "Gestão exemplar com parcerias estratégicas" }
    ]
  },
  "q12": {
    text: "Como são gerenciadas as finanças da organização?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não há gestão financeira estruturada" },
      { value: 2, text: "Gestão financeira básica" },
      { value: 3, text: "Gestão financeira parcial" },
      { value: 4, text: "Gestão financeira sistemática" },
      { value: 5, text: "Gestão financeira exemplar e estratégica" }
    ]
  },
  "q13": {
    text: "Como são definidos os sistemas de trabalho da organização?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não há definição estruturada dos sistemas de trabalho" },
      { value: 2, text: "Definição básica e informal" },
      { value: 3, text: "Definição parcial com alguns padrões" },
      { value: 4, text: "Definição sistemática e bem estruturada" },
      { value: 5, text: "Definição exemplar com alta performance" }
    ]
  },
  "q14": {
    text: "Como são desenvolvidas as competências das pessoas?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não há desenvolvimento estruturado de competências" },
      { value: 2, text: "Desenvolvimento básico e esporádico" },
      { value: 3, text: "Desenvolvimento parcial com alguns programas" },
      { value: 4, text: "Desenvolvimento sistemático e abrangente" },
      { value: 5, text: "Desenvolvimento exemplar e estratégico" }
    ]
  },
  "q15": {
    text: "Como é promovida a qualidade de vida das pessoas?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não há promoção estruturada da qualidade de vida" },
      { value: 2, text: "Iniciativas básicas e pontuais" },
      { value: 3, text: "Programas parciais de qualidade de vida" },
      { value: 4, text: "Programas sistemáticos e abrangentes" },
      { value: 5, text: "Programas exemplares e inovadores" }
    ]
  },
  "q16": {
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
  "q17": {
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
  "q18": {
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
  "q19": {
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
  "q20": {
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
  "q21": {
    text: "Como são gerenciadas as informações da organização?",
    dimension: "Informações e Conhecimento",
    options: [
      { value: 1, text: "Não há gestão estruturada das informações" },
      { value: 2, text: "Gestão básica e informal" },
      { value: 3, text: "Gestão parcial com alguns sistemas" },
      { value: 4, text: "Gestão sistemática e integrada" },
      { value: 5, text: "Gestão exemplar com inteligência de negócios" }
    ]
  },
  "q22": {
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
  "q23": {
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
  "q24": {
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
  "q25": {
    text: "Como são avaliados os resultados dos processos principais do negócio?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação estruturada dos processos" },
      { value: 2, text: "Avaliação básica e esporádica" },
      { value: 3, text: "Avaliação parcial com alguns controles" },
      { value: 4, text: "Avaliação sistemática e regular" },
      { value: 5, text: "Avaliação exemplar com otimização contínua" }
    ]
  },
  "q26": {
    text: "Como são avaliados os resultados relativos à sociedade?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação dos impactos sociais" },
      { value: 2, text: "Avaliação básica e informal" },
      { value: 3, text: "Avaliação parcial com alguns indicadores" },
      { value: 4, text: "Avaliação sistemática e transparente" },
      { value: 5, text: "Avaliação exemplar com impacto positivo" }
    ]
  },
  "q27": {
    text: "Como são avaliados os resultados econômico-financeiros?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não há avaliação estruturada dos resultados financeiros" },
      { value: 2, text: "Avaliação básica e esporádica" },
      { value: 3, text: "Avaliação parcial com alguns indicadores" },
      { value: 4, text: "Avaliação sistemática e regular" },
      { value: 5, text: "Avaliação exemplar com análises preditivas" }
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
      1: "Estabeleça estruturas básicas de liderança com definição clara de papéis e responsabilidades. Implemente reuniões regulares de liderança e desenvolva canais de comunicação formais com as equipes. Invista em treinamento básico de liderança para gestores e crie processos simples de tomada de decisão.",
      2: "Desenvolva um sistema de liderança mais estruturado com políticas e procedimentos documentados. Implemente ferramentas de gestão de desempenho e estabeleça metas claras para líderes. Promova treinamentos em competências de liderança e crie mecanismos de feedback regular.",
      3: "Fortaleça a cultura de liderança através de programas de desenvolvimento contínuo e mentoring. Implemente sistemas de avaliação 360 graus e estabeleça indicadores de eficácia da liderança. Desenvolva sucessão de liderança e promova a liderança colaborativa entre diferentes níveis.",
      4: "Consolide práticas de liderança de alta performance com foco em inovação e transformação. Implemente liderança baseada em dados e desenvolva capacidades de liderança digital. Estabeleça programas de liderança estratégica e promova a liderança adaptativa para mudanças do mercado.",
      5: "Mantenha excelência em liderança e torne-se referência no mercado. Desenvolva líderes que inspirem transformação no setor e compartilhem melhores práticas. Implemente liderança visionária focada em sustentabilidade e impacto social, estabelecendo-se como benchmark de liderança organizacional."
    },
    "Estratégias e Planos": {
      1: "Desenvolva um processo básico de planejamento estratégico com definição de missão, visão e valores organizacionais. Estabeleça objetivos de curto prazo claros e mensuráveis. Implemente reuniões periódicas para acompanhamento de metas e crie documentação básica dos planos estratégicos.",
      2: "Estruture um processo de planejamento estratégico mais robusto com análise de cenários e definição de estratégias de médio prazo. Implemente metodologias de análise SWOT e desenvolva planos de ação detalhados. Estabeleça indicadores de acompanhamento estratégico e promova alinhamento entre áreas.",
      3: "Aprimore o planejamento estratégico com análise de tendências de mercado e desenvolvimento de cenários futuros. Implemente balanced scorecard e estabeleça gestão de portfólio de projetos estratégicos. Desenvolva capacidades de análise competitiva e promova inovação estratégica.",
      4: "Consolide um sistema de gestão estratégica integrado com monitoramento contínuo e ajustes dinâmicos. Implemente inteligência de mercado e desenvolva estratégias de transformação digital. Estabeleça parcerias estratégicas e promova cultura de inovação organizacional.",
      5: "Mantenha excelência em gestão estratégica e lidere transformações no setor. Desenvolva estratégias disruptivas e estabeleça-se como referência em inovação. Implemente estratégias de sustentabilidade e responsabilidade social, criando valor compartilhado para todos os stakeholders."
    },
    "Processos": {
      1: "Inicie o mapeamento dos processos críticos do negócio e estabeleça documentação básica dos fluxos de trabalho. Implemente controles simples de qualidade e defina responsabilidades claras para cada processo. Estabeleça métricas básicas de desempenho e promova padronização inicial das atividades.",
      2: "Expanda o mapeamento de processos para áreas-chave e implemente melhorias pontuais baseadas em análise de problemas. Desenvolva procedimentos operacionais padrão (POPs) e estabeleça indicadores de eficiência. Promova treinamento em processos e implemente controles de qualidade mais rigorosos.",
      3: "Implemente gestão por processos com foco em otimização e melhoria contínua. Desenvolva automação de processos repetitivos e estabeleça gestão de riscos operacionais. Implemente metodologias como Lean e Six Sigma, promovendo cultura de excelência operacional.",
      4: "Consolide a excelência operacional com processos totalmente integrados e automatizados. Implemente tecnologias avançadas como RPA e IA para otimização. Desenvolva capacidades de análise preditiva e estabeleça benchmarking contínuo com melhores práticas do mercado.",
      5: "Mantenha liderança em excelência operacional e torne-se referência em inovação de processos. Desenvolva processos adaptativos e resilientes, capazes de responder rapidamente a mudanças. Implemente sustentabilidade operacional e compartilhe conhecimento como benchmark do setor."
    },
    "Pessoas": {
      1: "Estabeleça políticas básicas de recursos humanos com processos de recrutamento, seleção e integração estruturados. Implemente avaliações de desempenho simples e desenvolva programas básicos de treinamento. Promova comunicação interna regular e estabeleça canais de feedback com colaboradores.",
      2: "Desenvolva um sistema de gestão de pessoas mais abrangente com planos de carreira e desenvolvimento de competências. Implemente pesquisas de clima organizacional e estabeleça programas de reconhecimento. Promova treinamentos técnicos e comportamentais regulares.",
      3: "Implemente gestão estratégica de pessoas com foco em engajamento e retenção de talentos. Desenvolva programas de liderança interna e estabeleça gestão de sucessão. Promova diversidade e inclusão, criando ambiente de trabalho colaborativo e inovador.",
      4: "Consolide práticas avançadas de gestão de pessoas com analytics de RH e gestão de performance de alta qualidade. Implemente programas de bem-estar e qualidade de vida, desenvolvendo cultura organizacional forte. Estabeleça parcerias para desenvolvimento contínuo e inovação em práticas de RH.",
      5: "Mantenha excelência em gestão de pessoas e torne-se empregador de referência no mercado. Desenvolva práticas inovadoras de engajamento e retenção, promovendo propósito organizacional. Implemente sustentabilidade social e responsabilidade com stakeholders, criando impacto positivo na sociedade."
    },
    "Clientes": {
      1: "Estabeleça processos básicos de atendimento ao cliente com canais de comunicação claros e acessíveis. Implemente sistema simples de gestão de reclamações e desenvolva conhecimento básico sobre necessidades dos clientes. Promova treinamento em atendimento para equipes de contato.",
      2: "Desenvolva estratégia de relacionamento com clientes mais estruturada, implementando CRM básico e segmentação de clientes. Estabeleça pesquisas de satisfação regulares e desenvolva programas de fidelização simples. Promova cultura de foco no cliente em toda organização.",
      3: "Implemente gestão avançada de relacionamento com clientes, utilizando dados para personalização de experiências. Desenvolva jornada do cliente mapeada e estabeleça touchpoints otimizados. Promova inovação em produtos/serviços baseada em insights de clientes.",
      4: "Consolide excelência em experiência do cliente com omnicanalidade e personalização avançada. Implemente analytics de cliente e desenvolva capacidades de antecipação de necessidades. Estabeleça co-criação com clientes e promova advocacy e recomendação espontânea.",
      5: "Mantenha liderança em experiência do cliente e torne-se referência no mercado. Desenvolva relacionamentos de longo prazo baseados em valor mútuo e propósito compartilhado. Implemente sustentabilidade na relação com clientes, criando impacto positivo e duradouro."
    },
    "Sociedade": {
      1: "Estabeleça práticas básicas de responsabilidade social com cumprimento de legislações e normas socioambientais. Implemente ações pontuais de apoio à comunidade local e desenvolva consciência sobre impactos sociais da organização. Promova transparência básica em relatórios e comunicações.",
      2: "Desenvolva programa estruturado de responsabilidade social com projetos regulares de impacto comunitário. Implemente práticas sustentáveis básicas e estabeleça parcerias com organizações sociais. Promova engajamento de colaboradores em ações sociais e ambientais.",
      3: "Implemente estratégia integrada de sustentabilidade com metas claras de impacto social e ambiental. Desenvolva cadeia de fornecedores responsável e estabeleça métricas de sustentabilidade. Promova inovação social e ambiental em produtos e processos.",
      4: "Consolide liderança em sustentabilidade com práticas avançadas de ESG e impacto positivo mensurável. Implemente economia circular e desenvolva soluções inovadoras para desafios socioambientais. Estabeleça parcerias estratégicas para amplificação de impacto.",
      5: "Mantenha excelência em sustentabilidade e torne-se referência em impacto social positivo. Desenvolva modelos de negócio regenerativos e lidere transformações sistêmicas no setor. Implemente propósito organizacional alinhado com objetivos de desenvolvimento sustentável globais."
    },
    "Informações e Conhecimento": {
      1: "Estabeleça sistemas básicos de gestão de informações com organização e armazenamento estruturado de dados críticos. Implemente backup regular de informações e desenvolva políticas básicas de segurança de dados. Promova cultura de documentação e compartilhamento de conhecimento básico.",
      2: "Desenvolva sistema de gestão de conhecimento mais robusto com categorização e indexação de informações. Implemente ferramentas de colaboração e estabeleça processos de captura de conhecimento tácito. Promova treinamentos em gestão de informações e desenvolva repositórios organizados.",
      3: "Implemente gestão estratégica de conhecimento com analytics e inteligência de negócios. Desenvolva sistemas de apoio à decisão e estabeleça gestão de conhecimento organizacional. Promova inovação baseada em conhecimento e implemente learning organization.",
      4: "Consolide gestão avançada de conhecimento com IA e machine learning para insights estratégicos. Implemente data science e desenvolva capacidades preditivas. Estabeleça ecossistema de conhecimento integrado e promova inovação contínua baseada em dados.",
      5: "Mantenha excelência em gestão de conhecimento e torne-se organização de aprendizagem de referência. Desenvolva capacidades de inteligência artificial aplicada e lidere transformação digital baseada em conhecimento. Implemente compartilhamento de conhecimento como vantagem competitiva sustentável."
    },
    "Resultados": {
      1: "Estabeleça sistema básico de medição de resultados com indicadores financeiros e operacionais fundamentais. Implemente relatórios regulares de desempenho e desenvolva cultura de acompanhamento de metas. Promova transparência básica em resultados e estabeleça benchmarks simples.",
      2: "Desenvolva sistema de gestão de resultados mais abrangente com balanced scorecard e indicadores de múltiplas perspectivas. Implemente análises de tendências e estabeleça metas desafiadoras. Promova cultura de alta performance e desenvolva capacidades analíticas.",
      3: "Implemente gestão estratégica de resultados com analytics avançados e correlação entre indicadores. Desenvolva dashboards executivos e estabeleça gestão de valor para stakeholders. Promova melhoria contínua baseada em resultados e implemente benchmarking competitivo.",
      4: "Consolide excelência em gestão de resultados com predictive analytics e gestão de valor integrada. Implemente reporting em tempo real e desenvolva capacidades de simulação de cenários. Estabeleça criação de valor sustentável e promova transparência total com stakeholders.",
      5: "Mantenha liderança em criação de valor e torne-se referência em resultados sustentáveis. Desenvolva modelos de valor compartilhado e lidere práticas de reporting integrado. Implemente criação de valor de longo prazo para todos os stakeholders, estabelecendo-se como benchmark do setor."
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