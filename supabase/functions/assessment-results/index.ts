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
      1: "Organize uma estrutura básica de liderança estabelecendo hierarquias claras, definindo papéis e responsabilidades específicas para cada nível de gestão e criando organogramas funcionais que facilitem a comunicação e tomada de decisões. Implemente reuniões regulares de liderança com pautas estruturadas, atas documentadas e follow-up de ações definidas. Desenvolva canais formais de comunicação entre líderes e equipes através de briefings, newsletters internas e sistemas de feedback básicos. Invista em treinamento fundamental de liderança focado em competências essenciais como comunicação, delegação e gestão de conflitos.",
      2: "Desenvolva um sistema de liderança mais estruturado implementando políticas de gestão documentadas, procedimentos operacionais padronizados para tomada de decisões e frameworks de governança corporativa básicos. Estabeleça ferramentas de gestão de desempenho como avaliações periódicas, definição de metas SMART e sistemas de acompanhamento de resultados. Promova programas de desenvolvimento de liderança incluindo workshops, seminários e treinamentos em competências técnicas e comportamentais. Crie mecanismos estruturados de feedback 360 graus e implemente sistemas de mentoring interno para desenvolvimento de novos líderes.",
      3: "Fortaleça a cultura de liderança através de programas abrangentes de desenvolvimento contínuo, estabelecendo trilhas de aprendizagem personalizadas, programas de mentoring estruturados e sistemas de coaching interno. Implemente avaliações 360 graus regulares com feedback qualificado e planos de desenvolvimento individual para cada líder. Desenvolva indicadores específicos de eficácia da liderança como engagement das equipes, turnover, produtividade e clima organizacional. Estabeleça programas de sucessão com identificação de talentos, planos de carreira claros e preparação de líderes para posições estratégicas. Promova liderança colaborativa através de projetos cross-funcionais e comitês multidisciplinares.",
      4: "Consolide práticas de liderança de alta performance implementando metodologias avançadas de gestão, utilizando analytics de pessoas para tomada de decisões baseada em dados e desenvolvendo capacidades de liderança digital para navegação em ambientes VUCA. Estabeleça programas de liderança estratégica focados em visão de futuro, pensamento sistêmico e capacidade de transformação organizacional. Promova liderança adaptativa através de simulações, cenários de crise e desenvolvimento de resiliência organizacional. Implemente sistemas de gestão de talentos de classe mundial e desenvolva líderes capazes de inspirar inovação e mudança cultural.",
      5: "Mantenha excelência reconhecida em liderança tornando-se referência no mercado através de práticas inovadoras, metodologias próprias e resultados excepcionais em desenvolvimento humano. Desenvolva líderes visionários que inspirem transformação não apenas na organização, mas em todo o setor, compartilhando conhecimento através de publicações, palestras e benchmarking. Implemente liderança consciente focada em propósito organizacional, sustentabilidade e impacto social positivo. Estabeleça-se como benchmark de liderança organizacional sendo estudado e replicado por outras empresas do setor.",
      6: "Transforme positivamente o conceito de liderança no mercado através de práticas revolucionárias que redefinam padrões de gestão de pessoas e inspirem mudanças sistêmicas em todo o ecossistema empresarial. Torne-se uma referência global em desenvolvimento de liderança, influenciando políticas corporativas, padrões educacionais e práticas de gestão em escala internacional. Desenvolva e compartilhe metodologias inovadoras que elevem os padrões de liderança em toda a indústria. Crie um legado duradouro de líderes transformadores que multipliquem o impacto positivo em suas organizações e na sociedade."
    },
    "Estratégias e Planos": {
      1: "Organize um processo básico de planejamento estratégico estabelecendo missão, visão e valores organizacionais claros e comunicados a todos os colaboradores através de workshops, materiais impressos e reuniões de alinhamento. Defina objetivos estratégicos de curto prazo (1 ano) específicos, mensuráveis e realistas, criando planos de ação simples com responsáveis e prazos definidos. Implemente reuniões mensais de acompanhamento estratégico com análise de indicadores básicos e ajustes necessários. Crie documentação fundamental dos planos estratégicos e estabeleça processos simples de comunicação e desdobramento para as equipes operacionais.",
      2: "Desenvolva um processo de planejamento estratégico mais estruturado implementando metodologias de análise ambiental como SWOT, análise de stakeholders e mapeamento de cenários básicos para fundamentar as decisões estratégicas. Estabeleça objetivos de médio prazo (2-3 anos) com estratégias específicas, planos de ação detalhados e cronogramas de implementação. Implemente sistema de indicadores estratégicos (KPIs) para monitoramento regular do progresso e crie dashboards básicos para acompanhamento. Promova alinhamento estratégico entre diferentes áreas através de reuniões de coordenação e comunicação estruturada dos planos.",
      3: "Estruture um sistema abrangente de gestão estratégica implementando análise de tendências de mercado, estudos de competitividade e desenvolvimento de cenários futuros para fundamentar o planejamento de longo prazo. Implemente balanced scorecard ou metodologia similar para integração de perspectivas financeiras, clientes, processos e aprendizagem. Estabeleça gestão de portfólio de projetos estratégicos com priorização, alocação de recursos e acompanhamento integrado. Desenvolva capacidades internas de inteligência competitiva e análise de mercado. Promova cultura de inovação estratégica através de processos estruturados de geração e avaliação de ideias.",
      4: "Consolide um sistema integrado de gestão estratégica implementando monitoramento contínuo através de business intelligence, análise de big data e sistemas de early warning para antecipação de mudanças no ambiente de negócios. Desenvolva capacidades avançadas de inteligência de mercado utilizando analytics, pesquisa de mercado e monitoramento de tendências globais. Implemente estratégias de transformação digital integradas ao core business e estabeleça parcerias estratégicas para amplificação de capacidades. Promova cultura organizacional de inovação através de labs de inovação, programas de intraempreendedorismo e parcerias com startups.",
      5: "Pratique excelência reconhecida em gestão estratégica tornando-se referência no setor através de metodologias inovadoras, resultados consistentes e capacidade de antecipação de tendências de mercado. Desenvolva estratégias disruptivas que redefinam o setor utilizando tecnologias emergentes, novos modelos de negócio e abordagens inovadoras de criação de valor. Lidere transformações setoriais através de iniciativas que influenciem toda a cadeia de valor e estabeleçam novos padrões competitivos. Implemente estratégias integradas de sustentabilidade e responsabilidade social que criem valor compartilhado para todos os stakeholders.",
      6: "Transforme os padrões estratégicos do mercado através de visões revolucionárias que redefinam indústrias inteiras e criem novos paradigmas de competição e colaboração empresarial. Torne-se uma referência global em pensamento estratégico, influenciando práticas empresariais, políticas setoriais e padrões de inovação em escala internacional. Desenvolva e compartilhe metodologias estratégicas inovadoras que elevem os padrões de toda a indústria. Crie um legado duradouro de transformação que inspire e oriente a evolução estratégica de organizações em todo o mundo."
    },
    "Processos": {
      1: "Organize o mapeamento básico dos processos críticos da organização identificando as principais atividades, fluxos de trabalho e pontos de decisão através de diagramas simples e documentação fundamental. Estabeleça procedimentos operacionais padronizados (POPs) para as atividades mais importantes, definindo passo a passo como executar cada tarefa de forma consistente. Implemente controles básicos de qualidade através de checklists, inspeções visuais e verificações simples para garantir conformidade. Defina responsabilidades claras para cada processo designando proprietários, executores e aprovadores específicos.",
      2: "Desenvolva um sistema estruturado de gestão de processos implementando documentação detalhada com fluxogramas, procedimentos completos e matrizes de responsabilidade para todos os processos organizacionais. Estabeleça indicadores de performance (KPIs) específicos para cada processo crítico, incluindo métricas de tempo, qualidade, custo e satisfação. Implemente ciclos regulares de análise e melhoria contínua através de reuniões de processo, análise de indicadores e identificação de oportunidades de otimização. Promova treinamento sistemático em gestão de processos para todos os colaboradores e crie mecanismos estruturados de monitoramento e controle.",
      3: "Estruture um sistema avançado de gestão de processos implementando automação básica para atividades repetitivas, integração entre diferentes áreas e sistemas de workflow para otimização do fluxo de trabalho. Implemente metodologias estruturadas de melhoria contínua como Lean Manufacturing, Six Sigma ou metodologias ágeis para eliminação de desperdícios e otimização de performance. Estabeleça gestão proativa de riscos de processos através de análise de modo de falha, planos de contingência e controles preventivos. Promova cultura organizacional de excelência operacional através de programas de engajamento, reconhecimento e desenvolvimento de competências em gestão de processos.",
      4: "Consolide processos de alta performance implementando automação avançada através de RPA (Robotic Process Automation), inteligência artificial e integração digital completa entre sistemas e plataformas. Desenvolva capacidades analíticas avançadas utilizando big data, analytics preditivos e dashboards em tempo real para otimização contínua e tomada de decisões baseada em dados. Estabeleça processos ágeis e adaptativos que respondam rapidamente às mudanças do mercado através de metodologias de design thinking, prototipagem rápida e ciclos de feedback contínuo. Implemente gestão de processos end-to-end com visão integrada da cadeia de valor.",
      5: "Pratique excelência reconhecida em gestão de processos tornando-se referência no setor através de inovações metodológicas, resultados excepcionais em eficiência e qualidade, e capacidade de transformação operacional. Desenvolva processos inovadores que criem vantagem competitiva sustentável utilizando tecnologias emergentes, novos modelos operacionais e abordagens disruptivas de criação de valor. Estabeleça benchmarks de eficiência que sirvam de referência para toda a indústria e compartilhe melhores práticas através de publicações e eventos setoriais. Implemente processos sustentáveis e socialmente responsáveis que gerem valor compartilhado para todos os stakeholders.",
      6: "Transforme os padrões de excelência operacional do mercado através de inovações revolucionárias em gestão de processos que redefinam as melhores práticas da indústria e inspirem transformações sistêmicas. Torne-se uma referência global em inovação de processos, influenciando padrões industriais, metodologias de gestão e práticas operacionais em escala internacional. Desenvolva e compartilhe metodologias inovadoras que elevem os padrões de eficiência e qualidade em toda a indústria. Crie um legado duradouro de excelência operacional que inspire e oriente a evolução de processos em organizações ao redor do mundo."
    },
    "Pessoas": {
      1: "Organize políticas fundamentais de recursos humanos estabelecendo processos estruturados de recrutamento e seleção com descrições de cargos claras, critérios objetivos de avaliação e procedimentos de integração que facilitem a adaptação de novos colaboradores. Implemente sistema básico de avaliação de desempenho com critérios claros, feedback regular e planos de desenvolvimento individual. Desenvolva programas essenciais de treinamento focados em competências técnicas e comportamentais necessárias para cada função. Crie canais efetivos de comunicação interna através de reuniões regulares, murais informativos e sistemas de feedback. Estabeleça políticas justas e transparentes de remuneração baseadas em pesquisa de mercado e equidade interna.",
      2: "Desenvolva um sistema abrangente de gestão de pessoas implementando programas estruturados de desenvolvimento de competências com trilhas de aprendizagem personalizadas, planos de carreira claros e oportunidades de crescimento interno. Implemente pesquisas regulares de clima organizacional para monitoramento da satisfação, engajamento e identificação de oportunidades de melhoria. Estabeleça programas de reconhecimento e recompensa que valorizem tanto resultados quanto comportamentos alinhados aos valores organizacionais. Promova ativamente diversidade e inclusão através de políticas específicas, treinamentos e programas de desenvolvimento para grupos sub-representados. Crie políticas abrangentes de bem-estar incluindo benefícios, programas de saúde e equilíbrio vida-trabalho.",
      3: "Estruture gestão avançada de talentos implementando programas de identificação e desenvolvimento de sucessores, mapeamento de competências críticas e planos de retenção para talentos-chave. Implemente gestão de performance baseada em competências com avaliações 360 graus, definição de metas desafiadoras e desenvolvimento de planos de carreira individualizados. Estabeleça cultura de feedback contínuo através de conversas regulares de desenvolvimento, mentoring estruturado e coaching interno. Desenvolva programas abrangentes de engajamento incluindo pesquisas de pulso, grupos de trabalho e iniciativas de melhoria do ambiente organizacional. Promova inovação através das pessoas criando espaços de criatividade, programas de ideias e reconhecimento de iniciativas inovadoras.",
      4: "Consolide práticas de gestão de pessoas de alta performance implementando people analytics para tomada de decisões baseada em dados, utilizando métricas avançadas de engajamento, performance e retenção. Desenvolva gestão de talentos integrada com tecnologia através de plataformas digitais de aprendizagem, sistemas de gestão de performance e ferramentas de desenvolvimento de carreira. Implemente programas de transformação cultural focados em agilidade, inovação e adaptabilidade organizacional. Estabeleça organizações ágeis com estruturas flexíveis, equipes multifuncionais e capacidades de resposta rápida às mudanças do mercado. Desenvolva capacidades digitais através de programas de upskilling e reskilling focados em competências do futuro.",
      5: "Pratique excelência reconhecida em gestão de pessoas tornando-se referência no mercado através de práticas inovadoras, resultados excepcionais em engajamento e desenvolvimento humano, e capacidade de atrair e reter os melhores talentos. Desenvolva culturas organizacionais inovadoras que inspirem criatividade, colaboração e alto desempenho, servindo como modelo para outras organizações. Estabeleça práticas de bem-estar integral que considerem aspectos físicos, mentais, emocionais e sociais dos colaboradores. Implemente responsabilidade social interna através de programas de voluntariado, desenvolvimento comunitário e impacto social positivo. Crie ambientes de trabalho transformadores que desenvolvam não apenas competências profissionais, mas também crescimento pessoal e realização humana.",
      6: "Transforme os padrões de gestão de pessoas no mercado através de práticas revolucionárias que redefinam o conceito de desenvolvimento humano nas organizações e inspirem mudanças sistêmicas em todo o ecossistema empresarial. Torne-se uma referência global em inovação de práticas de RH, influenciando políticas corporativas, padrões educacionais e práticas de gestão de talentos em escala internacional. Desenvolva e compartilhe metodologias inovadoras que elevem os padrões de gestão de pessoas em toda a indústria. Crie um legado duradouro de transformação humana que inspire e oriente a evolução das práticas de gestão de pessoas em organizações ao redor do mundo."
    },
    "Clientes": {
      1: "Organize processos fundamentais de atendimento ao cliente estabelecendo canais de comunicação claros (telefone, email, presencial), procedimentos padronizados de resolução de problemas e protocolos de escalação para situações complexas. Implemente pesquisas básicas de satisfação através de questionários simples e feedback direto para monitoramento da qualidade do atendimento. Crie banco de dados básico de clientes com informações essenciais de contato, histórico de compras e preferências principais. Desenvolva políticas claras de relacionamento com cliente incluindo prazos de resposta, padrões de cortesia e procedimentos de garantia. Estabeleça padrões mínimos de qualidade no atendimento através de treinamento básico da equipe e scripts de atendimento.",
      2: "Desenvolva sistema estruturado de gestão de relacionamento implementando segmentação básica de clientes por perfil, valor e necessidades, criando abordagens diferenciadas para cada grupo. Implemente sistema CRM básico para centralização de informações, histórico de interações e acompanhamento de oportunidades. Estabeleça métricas específicas de satisfação através de pesquisas regulares, NPS (Net Promoter Score) e indicadores de retenção. Promova treinamento abrangente em atendimento ao cliente incluindo técnicas de comunicação, resolução de conflitos e vendas consultivas. Crie processos estruturados de recuperação de clientes através de programas de retenção, ofertas especiais e acompanhamento pós-venda.",
      3: "Estruture gestão avançada de relacionamento implementando análise detalhada de comportamento do cliente através de dados de compra, preferências e padrões de uso para personalização de serviços e ofertas. Implemente CRM avançado com automação de marketing, gestão de pipeline de vendas e análise de lifetime value do cliente. Estabeleça jornada do cliente estruturada mapeando todos os pontos de contato, momentos da verdade e oportunidades de melhoria da experiência. Desenvolva programas abrangentes de experiência do cliente incluindo design de serviços, treinamento em customer experience e métricas de satisfação em tempo real. Promova cultura customer-centric através de treinamentos, indicadores focados no cliente e reconhecimento de práticas centradas na satisfação.",
      4: "Consolide excelência em experiência do cliente implementando analytics avançados para análise preditiva de comportamento, personalização em escala através de inteligência artificial e automação de processos de relacionamento. Desenvolva estratégia omnichannel integrada garantindo experiência consistente em todos os pontos de contato (físico, digital, móvel, social). Estabeleça capacidades de antecipação de necessidades através de análise de dados, pesquisa de mercado e monitoramento de tendências para desenvolvimento proativo de soluções. Implemente inovação centrada no cliente através de labs de inovação, co-criação de produtos e serviços, e programas de feedback contínuo. Promova co-criação de valor através de comunidades de clientes, programas de advocacy e parcerias estratégicas.",
      5: "Pratique excelência reconhecida em experiência do cliente tornando-se referência no mercado através de práticas inovadoras, resultados excepcionais em satisfação e loyalty, e capacidade de criar experiências memoráveis que superem expectativas. Desenvolva experiências únicas e diferenciadas que criem conexão emocional com a marca e gerem advocacy espontâneo dos clientes. Estabeleça programas de advocacy estruturados transformando clientes em promotores ativos da marca através de programas de referência, comunidades exclusivas e benefícios especiais. Implemente sustentabilidade no relacionamento através de práticas responsáveis, transparência total e criação de valor compartilhado. Crie impacto positivo na comunidade através de programas sociais, parcerias com ONGs e iniciativas de responsabilidade social que envolvam os clientes.",
      6: "Transforme os padrões de relacionamento com clientes no mercado através de práticas revolucionárias que redefinam o conceito de experiência do cliente e inspirem mudanças sistêmicas em todo o setor. Torne-se uma referência global em inovação de customer experience, influenciando práticas de mercado, padrões de atendimento e metodologias de relacionamento em escala internacional. Desenvolva e compartilhe metodologias inovadoras que elevem os padrões de experiência do cliente em toda a indústria. Crie um legado duradouro de excelência em relacionamento que inspire e oriente a evolução das práticas de customer experience em organizações ao redor do mundo."
    },
    "Sociedade": {
      1: "Estabeleça práticas fundamentais de responsabilidade social implementando políticas básicas de ética empresarial, conformidade legal rigorosa e transparência nas operações. Desenvolva consciência sobre o impacto social da organização através de mapeamento inicial dos efeitos das atividades na comunidade local. Implemente práticas básicas de sustentabilidade incluindo gestão de resíduos, uso consciente de recursos e redução de desperdícios. Estabeleça relacionamento inicial com a comunidade local através de diálogo aberto, participação em eventos comunitários e apoio a iniciativas locais. Promova cultura de responsabilidade social entre colaboradores através de treinamentos básicos e comunicação sobre valores organizacionais.",
      2: "Desenvolva programa estruturado de responsabilidade social implementando projetos comunitários regulares, parcerias com organizações locais e investimento social privado direcionado. Estabeleça práticas de sustentabilidade mais abrangentes incluindo gestão ambiental, eficiência energética e programas de reciclagem. Implemente métricas específicas de impacto social através de indicadores de resultado, pesquisas de percepção comunitária e relatórios de sustentabilidade básicos. Promova engajamento ativo de colaboradores em ações sociais através de programas de voluntariado, campanhas de arrecadação e projetos de cidadania corporativa. Desenvolva relacionamentos estruturados com stakeholders incluindo fornecedores, clientes e comunidade para alinhamento de valores e práticas.",
      3: "Implemente estratégia integrada de sustentabilidade desenvolvendo programas de longo prazo com impacto mensurável, metas específicas de sustentabilidade e integração com estratégia de negócio. Estabeleça governança robusta de sustentabilidade através de comitês especializados, políticas estruturadas e processos de monitoramento contínuo. Desenvolva parcerias estratégicas com stakeholders incluindo ONGs, governo, academia e outras empresas para amplificação do impacto social. Promova inovação social e ambiental através de desenvolvimento de produtos/serviços sustentáveis, processos eco-eficientes e soluções para desafios socioambientais. Implemente relatórios de sustentabilidade abrangentes seguindo padrões internacionais e comunicação transparente sobre resultados e desafios.",
      4: "Consolide liderança em sustentabilidade implementando programas inovadores que sirvam de referência no setor, com impacto transformador na comunidade e cadeia de valor. Desenvolva e implemente princípios de economia circular através de design regenerativo, reaproveitamento de materiais e criação de valor compartilhado. Estabeleça soluções escaláveis para desafios socioambientais através de inovação tecnológica, parcerias multi-setoriais e investimento em pesquisa e desenvolvimento sustentável. Promova advocacy ativo para mudanças sistêmicas no setor através de liderança em associações, influência em políticas públicas e mobilização de outros atores. Implemente programas de desenvolvimento comunitário que gerem autonomia local, capacitação de lideranças e fortalecimento do tecido social.",
      5: "Pratique excelência reconhecida em sustentabilidade tornando-se referência global em responsabilidade social através de práticas inovadoras que inspirem transformações sistêmicas em escala nacional e internacional. Desenvolva impacto regenerativo que vá além da neutralidade, criando valor positivo para o meio ambiente e sociedade através de restauração de ecossistemas e fortalecimento de comunidades. Estabeleça legado duradouro para futuras gerações através de investimentos em educação, preservação ambiental e desenvolvimento de capacidades locais que perdurem no tempo. Implemente e lidere transformações sistêmicas que influenciem políticas públicas, práticas de mercado e comportamentos sociais em escala ampla. Promova mudanças positivas em escala global através de redes internacionais, transferência de conhecimento e mobilização de recursos para causas planetárias.",
      6: "Transforme os paradigmas de responsabilidade social e sustentabilidade em escala global, estabelecendo novos padrões que redefinam o papel das organizações na sociedade e inspirem mudanças sistêmicas em todo o mundo. Torne-se uma força motriz para a regeneração planetária, liderando iniciativas que restaurem ecossistemas, fortaleçam comunidades e criem um futuro sustentável para toda a humanidade. Desenvolva e implemente soluções revolucionárias que abordem os maiores desafios da humanidade, desde mudanças climáticas até desigualdade social, criando um legado de transformação positiva que transcenda gerações. Inspire e capacite outras organizações, governos e sociedades a adotarem práticas regenerativas que garantam a prosperidade de todas as formas de vida no planeta."
    },
    "Informações e Conhecimento": {
      1: "Organize sistemas fundamentais de gestão de informações estabelecendo estruturas básicas de armazenamento, categorização e acesso a dados críticos da organização. Implemente rotinas regulares de backup e recuperação de informações para garantir continuidade operacional. Desenvolva políticas básicas de segurança de dados incluindo controle de acesso, senhas seguras e proteção contra perda de informações. Promova cultura inicial de documentação através de procedimentos simples de registro de processos, decisões e conhecimentos essenciais. Estabeleça práticas básicas de compartilhamento de conhecimento através de reuniões regulares, comunicação interna estruturada e repositórios simples de informações.",
      2: "Desenvolva sistema estruturado de gestão de conhecimento implementando categorização avançada de informações por tipo, relevância e área de aplicação. Estabeleça ferramentas de colaboração digital para facilitar o compartilhamento de conhecimento entre equipes e departamentos. Implemente processos sistemáticos de captura de conhecimento tácito através de entrevistas, documentação de experiências e registro de lições aprendidas. Promova treinamentos específicos em gestão de informações incluindo técnicas de organização, busca e utilização eficiente de dados. Desenvolva repositórios organizados de conhecimento com sistemas de busca, indexação e controle de versões para facilitar o acesso e a atualização de informações.",
      3: "Implemente gestão estratégica de conhecimento desenvolvendo sistemas de analytics e inteligência de negócios para transformar dados em insights acionáveis. Estabeleça sistemas avançados de apoio à decisão integrando informações de múltiplas fontes para suporte a escolhas estratégicas. Desenvolva gestão organizacional de conhecimento através de mapeamento de competências, identificação de gaps de conhecimento e programas de desenvolvimento de capacidades. Promova inovação sistemática baseada em conhecimento através de processos estruturados de pesquisa, experimentação e aplicação de novos conceitos. Implemente conceitos de learning organization criando cultura de aprendizagem contínua, experimentação segura e adaptação baseada em evidências.",
      4: "Consolide gestão avançada de conhecimento implementando inteligência artificial e machine learning para análise preditiva, reconhecimento de padrões e geração automática de insights estratégicos. Desenvolva capacidades robustas de data science incluindo análise estatística avançada, modelagem preditiva e visualização de dados complexos. Estabeleça capacidades preditivas para antecipação de tendências, identificação de oportunidades e mitigação proativa de riscos baseada em análise de dados históricos e em tempo real. Crie ecossistema integrado de conhecimento conectando todas as fontes de informação da organização em plataforma unificada de gestão e análise. Promova inovação contínua baseada em dados através de laboratórios de inovação, experimentação sistemática e aplicação de insights para desenvolvimento de novos produtos e serviços.",
      5: "Pratique excelência reconhecida em gestão de conhecimento tornando-se organização de aprendizagem de referência no mercado através de práticas inovadoras de captura, processamento e aplicação de conhecimento. Desenvolva capacidades avançadas de inteligência artificial aplicada incluindo processamento de linguagem natural, visão computacional e sistemas de recomendação para otimização de processos e decisões. Lidere transformação digital baseada em conhecimento influenciando práticas de mercado e estabelecendo novos padrões de gestão de informações. Implemente compartilhamento de conhecimento como vantagem competitiva sustentável através de redes de conhecimento, parcerias estratégicas e ecossistemas de inovação colaborativa. Crie impacto transformador através da democratização do conhecimento e desenvolvimento de capacidades em toda a cadeia de valor.",
      6: "Transforme os paradigmas de gestão de conhecimento em escala global, estabelecendo novos padrões que redefinam como as organizações capturam, processam e aplicam informações para criar valor. Torne-se uma referência mundial em inteligência organizacional, influenciando práticas de gestão de conhecimento e estabelecendo metodologias que sejam adotadas por organizações ao redor do mundo. Desenvolva e compartilhe tecnologias e metodologias revolucionárias que elevem os padrões de gestão de conhecimento em toda a indústria. Crie um legado duradouro de inovação em gestão de informações que inspire e oriente a evolução das práticas de conhecimento organizacional globalmente."
    },
    "Resultados": {
      1: "Estabeleça sistema básico de métricas de desempenho definindo indicadores fundamentais para acompanhar resultados operacionais e financeiros essenciais da organização. Implemente rotinas simples de monitoramento através de relatórios básicos de performance que permitam acompanhamento regular dos principais resultados. Desenvolva práticas iniciais de acompanhamento estabelecendo reuniões periódicas para revisão de resultados e identificação de desvios. Promova cultura inicial de resultados através da comunicação clara de metas, responsabilidades e expectativas de performance. Estabeleça responsabilização básica por metas através de definição clara de papéis e acompanhamento individual de contribuições para os resultados organizacionais.",
      2: "Desenvolva sistema estruturado de gestão de resultados implementando KPIs bem definidos que cubram todas as áreas críticas da organização com metas claras e mensuráveis. Implemente dashboards de acompanhamento que permitam visualização em tempo real dos principais indicadores de performance e tendências. Estabeleça análise sistemática de tendências através de relatórios periódicos que identifiquem padrões, variações e oportunidades de melhoria. Implemente benchmarking interno comparando performance entre áreas, períodos e melhores práticas internas para identificar oportunidades de melhoria. Promova gestão efetiva por resultados através de processos estruturados de definição de metas, acompanhamento de progresso e tomada de ações corretivas. Desenvolva capacidades analíticas da equipe através de treinamentos em análise de dados, interpretação de indicadores e tomada de decisões baseada em evidências.",
      3: "Implemente gestão estratégica de resultados desenvolvendo balanced scorecard que integre perspectivas financeiras, clientes, processos internos e aprendizado para visão holística da performance. Desenvolva análise integrada de performance conectando resultados de diferentes áreas e níveis organizacionais para compreensão sistêmica do desempenho. Estabeleça capacidades preditivas através de análise de tendências, modelagem estatística e projeções que permitam antecipação de resultados futuros. Implemente gestão efetiva de valor através de análise de retorno sobre investimento, criação de valor para stakeholders e otimização de recursos. Promova cultura sólida de alta performance estabelecendo padrões de excelência, reconhecimento de resultados excepcionais e desenvolvimento contínuo de capacidades. Desenvolva excelência operacional através de melhoria contínua de processos, eliminação de desperdícios e otimização sistemática de operações.",
      4: "Consolide gestão avançada de resultados implementando analytics preditivos com uso de inteligência artificial, machine learning e análise de big data para otimização contínua de performance. Desenvolva gestão integrada de valor através de análise sofisticada de criação de valor, otimização de portfólio e maximização de retornos para todos os stakeholders. Estabeleça capacidades robustas de transformação através de gestão de mudanças, inovação contínua e adaptação ágil a novas condições de mercado. Implemente benchmarking externo sistemático comparando performance com líderes de mercado, melhores práticas globais e padrões de excelência internacional. Desenvolva liderança reconhecida em resultados através de performance consistentemente superior, inovação em gestão de resultados e influência em práticas de mercado. Crie capacidades de antecipação e resposta rápida a mudanças através de sistemas de alerta precoce, cenários alternativos e planos de contingência.",
      5: "Pratique excelência sustentável em resultados mantendo performance superior consistente ao longo do tempo através de sistemas robustos de gestão, cultura de alta performance e capacidades organizacionais excepcionais. Torne-se referência reconhecida em performance sustentável influenciando práticas de mercado, estabelecendo novos padrões de excelência e sendo benchmark para outras organizações. Desenvolva capacidades inovadoras de gestão de resultados através de metodologias proprietárias, tecnologias avançadas e abordagens revolucionárias que redefinam como organizações criam e medem valor. Lidere transformação de mercado através de resultados que estabeleçam novos paradigmas, influenciem práticas da indústria e criem valor para todo o ecossistema. Implemente criação de valor como vantagem competitiva sustentável através de modelos de negócio inovadores, capacidades únicas e resultados que sejam difíceis de replicar pela concorrência.",
      6: "Redefina os padrões globais de excelência em resultados, estabelecendo novos paradigmas de performance que influenciem organizações ao redor do mundo e elevem os padrões de toda a indústria. Torne-se uma referência mundial em criação de valor sustentável, demonstrando como organizações podem alcançar resultados excepcionais enquanto geram impacto positivo para todos os stakeholders e para a sociedade. Desenvolva e compartilhe metodologias revolucionárias de gestão de resultados que sejam adotadas globalmente e transformem a forma como as organizações medem, gerenciam e otimizam sua performance. Crie um legado duradouro de excelência que inspire e oriente a evolução das práticas de gestão de resultados em escala global."
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