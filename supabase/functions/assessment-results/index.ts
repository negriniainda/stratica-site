import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

// Mapeamento das perguntas do questionário
const questionMapping: Record<string, { text: string; dimension: string; options: Array<{ value: number; text: string }> }> = {
  "q1": {
    text: "A alta direção exerce liderança de forma estruturada e sistemática, promovendo interação regular e efetiva com todas as partes interessadas (colaboradores, clientes, fornecedores, comunidade)?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não fazemos isso - a liderança é exercida de forma informal e esporádica, com pouca ou nenhuma interação estruturada com as partes interessadas" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos algumas práticas básicas de liderança, mas a interação com stakeholders ainda é informal e inconsistente" },
      { value: 3, text: "Fazemos de alguma forma - possuímos práticas de liderança parcialmente estruturadas com interação regular, mas não sistemática, com as principais partes interessadas" },
      { value: 4, text: "Fazemos bem feito - temos práticas de liderança bem estruturadas e sistemáticas, com interação regular e planejada com todas as partes interessadas relevantes" },
      { value: 5, text: "Fazemos muito bem feito - nossa liderança é exemplar e inovadora, com interação estratégica e contínua com stakeholders, servindo como referência no mercado" }
    ]
  },
  "q2": {
    text: "A organização possui um sistema de liderança bem definido e implementado, com estrutura organizacional clara, papéis e responsabilidades estabelecidos, e processos de tomada de decisão documentados?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não fazemos isso - não temos um sistema de liderança definido, a estrutura é informal e os processos de decisão são ad hoc" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos alguns elementos básicos de um sistema de liderança, mas ainda é predominantemente informal" },
      { value: 3, text: "Fazemos de alguma forma - possuímos um sistema de liderança parcialmente implementado, com alguns processos definidos mas não totalmente integrados" },
      { value: 4, text: "Fazemos bem feito - temos um sistema de liderança bem implementado e abrangente, com estrutura clara e processos bem definidos" },
      { value: 5, text: "Fazemos muito bem feito - nosso sistema de liderança é robusto, continuamente aprimorado e serve como modelo para outras organizações" }
    ]
  },
  "q3": {
    text: "A organização realiza análise crítica sistemática e abrangente do seu desempenho global, utilizando indicadores balanceados e comparações com referenciais de excelência para orientar decisões estratégicas?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não fazemos isso - realizamos apenas análises pontuais e informais do desempenho, sem sistematização ou indicadores estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - fazemos análises básicas com alguns indicadores, mas de forma esporádica e não integrada" },
      { value: 3, text: "Fazemos de alguma forma - realizamos análise crítica parcial com indicadores definidos, mas ainda não de forma sistemática e abrangente" },
      { value: 4, text: "Fazemos bem feito - temos análise crítica sistemática e abrangente do desempenho, com indicadores balanceados e revisões regulares" },
      { value: 5, text: "Fazemos muito bem feito - nossa análise crítica é robusta, orientada para melhoria contínua e utiliza benchmarking com as melhores práticas do mercado" }
    ]
  },
  "q4": {
    text: "A alta direção demonstra comprometimento visível e consistente com a excelência e sustentabilidade, promovendo cultura de melhoria contínua e responsabilidade socioambiental em todas as decisões e ações organizacionais?",
    dimension: "Liderança",
    options: [
      { value: 1, text: "Não fazemos isso - o comprometimento com excelência e sustentabilidade é básico e esporádico, sem reflexo nas práticas organizacionais" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - demonstramos comprometimento através de algumas iniciativas isoladas, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos comprometimento parcial mas consistente, com algumas práticas estruturadas de excelência e sustentabilidade" },
      { value: 4, text: "Fazemos bem feito - demonstramos comprometimento claro e sistemático, com práticas bem estabelecidas e cultura organizacional alinhada" },
      { value: 5, text: "Fazemos muito bem feito - nosso comprometimento é exemplar e inspirador, servindo como referência no mercado e influenciando positivamente todo o ecossistema" }
    ]
  },
  "q5": {
    text: "A organização possui um processo estruturado e sistemático para formular suas estratégias, considerando análise de cenários, stakeholders e objetivos de longo prazo, com metodologia definida e participação das lideranças?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não fazemos isso - a formulação estratégica é básica e informal, sem processo estruturado ou metodologia definida" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos um processo com alguns elementos estruturados, mas ainda predominantemente informal" },
      { value: 3, text: "Fazemos de alguma forma - possuímos processo de formulação estratégica parcialmente estruturado, com alguns elementos metodológicos" },
      { value: 4, text: "Fazemos bem feito - temos processo bem estruturado com metodologia definida, análise de cenários e participação das lideranças" },
      { value: 5, text: "Fazemos muito bem feito - nosso processo é robusto, sistemático e continuamente aprimorado, servindo como referência no mercado" }
    ]
  },
  "q6": {
    text: "A organização implementa suas estratégias de forma sistemática e coordenada, com desdobramento claro em planos de ação, responsáveis definidos, prazos estabelecidos e acompanhamento regular do progresso?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não fazemos isso - a implementação das estratégias é básica e informal, sem desdobramento estruturado ou acompanhamento" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - implementamos com alguns controles básicos, mas sem sistematização completa" },
      { value: 3, text: "Fazemos de alguma forma - temos implementação parcial com alguns mecanismos de controle e acompanhamento" },
      { value: 4, text: "Fazemos bem feito - implementamos de forma sistemática com acompanhamento regular, responsáveis definidos e controles estabelecidos" },
      { value: 5, text: "Fazemos muito bem feito - nossa implementação é exemplar com gestão integrada, monitoramento contínuo e ajustes proativos" }
    ]
  },
  "q7": {
    text: "A organização elabora planos de ação detalhados e estruturados, com objetivos específicos, metas mensuráveis, recursos definidos, cronogramas realistas e indicadores de acompanhamento para garantir a execução efetiva das estratégias?",
    dimension: "Estratégias e Planos",
    options: [
      { value: 1, text: "Não fazemos isso - elaboramos planos básicos e informais, sem estruturação adequada ou detalhamento suficiente" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos planos com alguns elementos estruturados, mas ainda incompletos" },
      { value: 3, text: "Fazemos de alguma forma - elaboramos planos parcialmente estruturados, com alguns elementos bem definidos" },
      { value: 4, text: "Fazemos bem feito - nossos planos são bem estruturados e detalhados, com todos os elementos necessários para execução efetiva" },
      { value: 5, text: "Fazemos muito bem feito - elaboramos planos robustos e integrados, com metodologia avançada e alinhamento estratégico total" }
    ]
  },
  "q8": {
    text: "Os principais processos do negócio estão mapeados e documentados, com padrões definidos para garantir consistência?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não fazemos isso - os processos são básicos e informais, sem mapeamento ou documentação estruturada" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - alguns processos estão mapeados, mas sem padronização" },
      { value: 3, text: "Fazemos de alguma forma - processos parcialmente mapeados e documentados com alguns padrões definidos" },
      { value: 4, text: "Fazemos bem feito - processos bem mapeados e documentados com padrões consistentes" },
      { value: 5, text: "Fazemos muito bem feito - processos totalmente mapeados, documentados e otimizados com padrões exemplares" }
    ]
  },
  "q9": {
    text: "Os processos de apoio da organização são gerenciados de forma sistemática e integrada, com procedimentos definidos, indicadores de desempenho e melhoria contínua para garantir eficiência e eficácia?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não fazemos isso - a gestão dos processos de apoio é básica e informal, sem procedimentos estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - gestão com alguns procedimentos básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - gestão parcial com procedimentos definidos e alguns indicadores" },
      { value: 4, text: "Fazemos bem feito - gestão sistemática e bem estruturada com indicadores e melhoria contínua" },
      { value: 5, text: "Fazemos muito bem feito - gestão exemplar com integração total e otimização contínua dos processos" }
    ]
  },
  "q10": {
    text: "A organização possui um sistema estruturado de gestão de fornecedores, incluindo critérios de seleção, avaliação de desempenho, desenvolvimento de parcerias e monitoramento contínuo para garantir qualidade e valor?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não fazemos isso - a gestão de fornecedores é básica e informal, sem critérios estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - gestão com alguns critérios básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - gestão parcial com critérios definidos e avaliação ocasional" },
      { value: 4, text: "Fazemos bem feito - gestão sistemática e bem estruturada com critérios claros e monitoramento regular" },
      { value: 5, text: "Fazemos muito bem feito - gestão exemplar com parcerias estratégicas e desenvolvimento conjunto" }
    ]
  },
  "q11": {
    text: "A organização possui um sistema abrangente de gestão financeira, incluindo planejamento orçamentário, controles internos, análise de indicadores, gestão de riscos e alinhamento com objetivos estratégicos?",
    dimension: "Processos",
    options: [
      { value: 1, text: "Não fazemos isso - a gestão financeira é básica e informal, sem controles estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - gestão com alguns controles básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - gestão parcial com controles definidos e planejamento básico" },
      { value: 4, text: "Fazemos bem feito - gestão sistemática e bem estruturada com controles abrangentes e análise regular" },
      { value: 5, text: "Fazemos muito bem feito - gestão exemplar com planejamento estratégico integrado e gestão avançada de riscos" }
    ]
  },
  "q12": {
    text: "A organização define e estrutura seus sistemas de trabalho considerando a organização do trabalho, métodos e práticas de gestão que promovam alto desempenho, colaboração e bem-estar das pessoas?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não fazemos isso - os sistemas de trabalho são básicos e informais, sem estruturação adequada" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos alguns sistemas básicos, mas sem integração" },
      { value: 3, text: "Fazemos de alguma forma - sistemas parcialmente estruturados com algumas práticas de gestão definidas" },
      { value: 4, text: "Fazemos bem feito - sistemas bem estruturados que promovem alto desempenho e colaboração" },
      { value: 5, text: "Fazemos muito bem feito - sistemas exemplares que maximizam o potencial das pessoas e servem como referência" }
    ]
  },
  "q13": {
    text: "A organização desenvolve sistematicamente as competências das pessoas através de programas estruturados de capacitação, educação continuada, mentoring e outras práticas que promovam o crescimento profissional e pessoal?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não fazemos isso - o desenvolvimento de competências é básico e informal, sem programas estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos alguns programas básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - programas parciais com algumas práticas de desenvolvimento definidas" },
      { value: 4, text: "Fazemos bem feito - programas sistemáticos e abrangentes que promovem o crescimento das pessoas" },
      { value: 5, text: "Fazemos muito bem feito - programas exemplares e inovadores que maximizam o potencial e servem como referência" }
    ]
  },
  "q14": {
    text: "A organização promove ativamente a qualidade de vida das pessoas através de programas de bem-estar, equilíbrio trabalho-vida, saúde ocupacional, ambiente de trabalho saudável e práticas que valorizem a pessoa integral?",
    dimension: "Pessoas",
    options: [
      { value: 1, text: "Não fazemos isso - a promoção da qualidade de vida é básica e informal, sem programas estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos algumas iniciativas básicas, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - programas parciais com algumas práticas de bem-estar definidas" },
      { value: 4, text: "Fazemos bem feito - programas sistemáticos que promovem efetivamente a qualidade de vida" },
      { value: 5, text: "Fazemos muito bem feito - programas exemplares e abrangentes que servem como referência em qualidade de vida" }
    ]
  },
  "q15": {
    text: "A organização identifica e compreende sistematicamente as necessidades e expectativas dos clientes e mercados, utilizando métodos estruturados de pesquisa e análise para orientar o desenvolvimento de produtos e serviços?",
    dimension: "Clientes",
    options: [
      { value: 1, text: "Não fazemos isso - a identificação das necessidades dos clientes é básica e informal, sem métodos estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - utilizamos alguns métodos básicos de identificação, mas de forma esporádica" },
      { value: 3, text: "Fazemos de alguma forma - temos processos parciais de identificação das necessidades, com alguns métodos estruturados" },
      { value: 4, text: "Fazemos bem feito - identificamos sistematicamente as necessidades dos clientes através de métodos bem estruturados e análises regulares" },
      { value: 5, text: "Fazemos muito bem feito - nossa identificação das necessidades é exemplar, utilizando métodos avançados e servindo como referência no mercado" }
    ]
  },
  "q16": {
    text: "A organização desenvolve produtos e serviços de forma estruturada e sistemática, considerando as necessidades dos clientes, requisitos de qualidade, viabilidade técnica e econômica, com processos de inovação e melhoria contínua?",
    dimension: "Clientes",
    options: [
      { value: 1, text: "Não fazemos isso - o desenvolvimento de produtos e serviços é básico e informal, sem processo estruturado" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos desenvolvimento com alguns controles básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - possuímos processo parcial com alguns controles e consideração das necessidades dos clientes" },
      { value: 4, text: "Fazemos bem feito - desenvolvemos de forma sistemática e bem estruturada, considerando todos os aspectos relevantes" },
      { value: 5, text: "Fazemos muito bem feito - nosso processo é exemplar com inovação contínua e serve como referência no mercado" }
    ]
  },
  "q17": {
    text: "A organização mantém relacionamento próximo e efetivo com os clientes, utilizando múltiplos canais de comunicação, coletando feedback regularmente e tratando reclamações de forma sistemática para garantir satisfação e fidelização?",
    dimension: "Clientes",
    options: [
      { value: 1, text: "Não fazemos isso - o relacionamento com clientes é básico e informal, sem canais estruturados ou coleta sistemática de feedback" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - mantemos relacionamento através de alguns canais básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos relacionamento parcial com alguns canais estruturados e coleta ocasional de feedback" },
      { value: 4, text: "Fazemos bem feito - mantemos relacionamento sistemático e multicanal, com coleta regular de feedback e tratamento estruturado de reclamações" },
      { value: 5, text: "Fazemos muito bem feito - nosso relacionamento é exemplar e personalizado, com múltiplos canais integrados e gestão proativa da experiência do cliente" }
    ]
  },
  "q18": {
    text: "A organização identifica e monitora sistematicamente as necessidades e expectativas da sociedade e comunidades onde atua, considerando aspectos sociais, ambientais e econômicos para orientar suas ações de responsabilidade social?",
    dimension: "Sociedade",
    options: [
      { value: 1, text: "Não fazemos isso - a identificação das necessidades da sociedade é básica e informal, sem métodos estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - utilizamos alguns métodos básicos de identificação, mas de forma esporádica" },
      { value: 3, text: "Fazemos de alguma forma - temos identificação parcial com alguns métodos definidos e consideração de aspectos socioambientais" },
      { value: 4, text: "Fazemos bem feito - identificamos sistematicamente as necessidades através de métodos estruturados e monitoramento regular" },
      { value: 5, text: "Fazemos muito bem feito - nossa identificação é exemplar e proativa, servindo como referência em responsabilidade social" }
    ]
  },
  "q19": {
    text: "A organização desenvolve produtos, serviços e processos considerando sistematicamente os impactos ambientais, utilizando critérios de sustentabilidade, ecoeficiência e economia circular para minimizar pegada ecológica e promover desenvolvimento sustentável?",
    dimension: "Sociedade",
    options: [
      { value: 1, text: "Não fazemos isso - a consideração ambiental no desenvolvimento é básica e informal, sem critérios estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - aplicamos alguns critérios ambientais básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos consideração parcial com alguns critérios definidos de sustentabilidade" },
      { value: 4, text: "Fazemos bem feito - consideramos sistematicamente os impactos ambientais com critérios estruturados e práticas de ecoeficiência" },
      { value: 5, text: "Fazemos muito bem feito - nossa abordagem é exemplar e inovadora, servindo como referência em desenvolvimento sustentável" }
    ]
  },
  "q20": {
    text: "A organização promove ativamente o desenvolvimento social das comunidades onde atua, através de programas estruturados, parcerias estratégicas, investimento social privado e ações que geram impacto positivo duradouro na sociedade?",
    dimension: "Sociedade",
    options: [
      { value: 1, text: "Não fazemos isso - a promoção do desenvolvimento social é básica e informal, sem programas estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - realizamos algumas ações sociais básicas, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos promoção parcial com algumas ações definidas e parcerias pontuais" },
      { value: 4, text: "Fazemos bem feito - promovemos sistematicamente o desenvolvimento social através de programas estruturados e parcerias estratégicas" },
      { value: 5, text: "Fazemos muito bem feito - nossa promoção é exemplar e transformadora, gerando impacto social significativo e servindo como referência" }
    ]
  },
  "q21": {
    text: "A organização identifica sistematicamente suas necessidades de informações estratégicas, operacionais e de apoio, desenvolvendo e mantendo sistemas integrados de gestão da informação que garantam qualidade, segurança, disponibilidade e uso efetivo dos dados?",
    dimension: "Informações e Conhecimento",
    options: [
      { value: 1, text: "Não fazemos isso - a gestão de informações é básica e informal, sem identificação sistemática das necessidades" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos gestão com alguns sistemas básicos, mas sem integração" },
      { value: 3, text: "Fazemos de alguma forma - possuímos gestão parcial com alguns sistemas estruturados e identificação de necessidades" },
      { value: 4, text: "Fazemos bem feito - gerenciamos sistematicamente as informações através de sistemas bem estruturados e integrados" },
      { value: 5, text: "Fazemos muito bem feito - nossa gestão é exemplar com integração total e serve como referência em gestão da informação" }
    ]
  },
  "q22": {
    text: "A organização desenvolve e mantém sistemas estruturados de gestão do conhecimento organizacional, promovendo a criação, captura, organização, compartilhamento e aplicação do conhecimento para gerar valor e vantagem competitiva sustentável?",
    dimension: "Informações e Conhecimento",
    options: [
      { value: 1, text: "Não fazemos isso - a gestão do conhecimento é básica e informal, sem sistemas estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - temos gestão com alguns repositórios básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - possuímos gestão parcial com alguns repositórios e processos de compartilhamento" },
      { value: 4, text: "Fazemos bem feito - gerenciamos sistematicamente o conhecimento com processos estruturados de criação e compartilhamento" },
      { value: 5, text: "Fazemos muito bem feito - nossa gestão é exemplar com inovação contínua e serve como referência em gestão do conhecimento" }
    ]
  },
  "q23": {
    text: "A organização monitora e avalia sistematicamente seus resultados econômico-financeiros através de indicadores abrangentes de desempenho, incluindo rentabilidade, liquidez, endividamento e crescimento, comparando-os com metas estabelecidas e benchmarks do mercado?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não fazemos isso - a avaliação dos resultados econômico-financeiros é básica e esporádica, sem indicadores estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - realizamos avaliação com alguns indicadores básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos avaliação parcial com alguns indicadores estruturados e comparação com metas" },
      { value: 4, text: "Fazemos bem feito - monitoramos sistematicamente através de indicadores abrangentes e comparação com benchmarks" },
      { value: 5, text: "Fazemos muito bem feito - nossa avaliação é exemplar com benchmarking avançado e serve como referência no mercado" }
    ]
  },
  "q24": {
    text: "A organização monitora e avalia sistematicamente seus resultados relativos aos clientes e mercado, incluindo satisfação, fidelização, participação de mercado, crescimento da base de clientes e efetividade das estratégias comerciais?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não fazemos isso - a avaliação dos resultados de clientes e mercado é básica e informal, sem indicadores estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - realizamos avaliação com alguns indicadores básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos avaliação parcial com alguns indicadores de satisfação e participação de mercado" },
      { value: 4, text: "Fazemos bem feito - monitoramos sistematicamente através de indicadores abrangentes e análises regulares" },
      { value: 5, text: "Fazemos muito bem feito - nossa avaliação é exemplar com ações de melhoria contínua e serve como referência no mercado" }
    ]
  },
  "q25": {
    text: "A organização monitora e avalia sistematicamente seus resultados e impactos relativos à sociedade, incluindo responsabilidade socioambiental, sustentabilidade, contribuição para o desenvolvimento social e relacionamento com comunidades?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não fazemos isso - a avaliação dos resultados sociais é básica e informal, sem indicadores estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - realizamos avaliação com alguns indicadores básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos avaliação parcial com alguns indicadores de impacto social e ambiental" },
      { value: 4, text: "Fazemos bem feito - monitoramos sistematicamente através de indicadores estruturados e documentação adequada" },
      { value: 5, text: "Fazemos muito bem feito - nossa avaliação é exemplar com impacto positivo comprovado e serve como referência em responsabilidade social" }
    ]
  },
  "q26": {
    text: "A organização monitora e avalia sistematicamente seus resultados relativos às pessoas, incluindo satisfação, engajamento, desenvolvimento, retenção de talentos, clima organizacional e efetividade das práticas de gestão de pessoas?",
    dimension: "Resultados",
    options: [
      { value: 1, text: "Não fazemos isso - a avaliação dos resultados de pessoas é básica e informal, sem indicadores estruturados" },
      { value: 2, text: "Fazemos raramente ou de forma inicial - realizamos avaliação com alguns indicadores básicos, mas sem sistematização" },
      { value: 3, text: "Fazemos de alguma forma - temos avaliação parcial com alguns indicadores de satisfação e clima organizacional" },
      { value: 4, text: "Fazemos bem feito - monitoramos sistematicamente através de indicadores abrangentes e análises regulares" },
      { value: 5, text: "Fazemos muito bem feito - nossa avaliação é exemplar com ações de melhoria contínua e serve como referência em gestão de pessoas" }
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
      let questionText = '';
      
      // Verificar se answerData é um objeto com as propriedades esperadas
      if (typeof answerData === 'object' && answerData !== null) {
        // Os dados vêm do frontend com question, answer_text e score
        questionText = answerData.question || questionInfo.text;
        answerText = answerData.answer_text || '';
      } else if (typeof answerData === 'number') {
        // Fallback para dados numéricos
        questionText = questionInfo.text;
        const option = questionInfo.options.find(opt => opt.value === answerData);
        answerText = option ? option.text : `Pontuação: ${answerData}`;
      } else {
        // Fallback para outros tipos
        questionText = questionInfo.text;
        answerText = String(answerData);
      }
      
      dimensionGroups[dimension].push({
        question: questionText,
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

// Função para obter o nível de uma dimensão específica baseado no seu peso
function getDimensionLevel(dimensionPercentage: number): number {
  // Usar intervalos baseados na porcentagem (0-100%) - Nova escala
  if (dimensionPercentage <= 20) {
    return 1;   // 0-200 pontos (0-20%)
  } else if (dimensionPercentage <= 35) {
    return 2;   // 201-350 pontos (20.1-35%)
  } else if (dimensionPercentage <= 50) {
    return 3;   // 351-500 pontos (35.1-50%)
  } else if (dimensionPercentage <= 65) {
    return 4;   // 501-650 pontos (50.1-65%)
  } else if (dimensionPercentage <= 80) {
    return 5;   // 651-800 pontos (65.1-80%)
  } else {
    return 6;   // 801-1000 pontos (80.1-100%)
  }
}

// Função para obter os detalhes do nível de maturidade Stratica
function getResultDetailsStratica(straticaScore: number): { level: number; title: string; description: string } {
  if (straticaScore <= 200) {
    return {
      level: 1,
      title: "Limitado",
      description: "Maturidade muito baixa (0-200 pontos). Práticas de gestão inexistentes ou ad-hoc, resultados obtidos de forma não estruturada. A organização depende de esforços isolados."
    };
  } else if (straticaScore <= 350) {
    return {
      level: 2,
      title: "Emergente",
      description: "Maturidade baixa (201-350 pontos). Início de implementação básica de algumas práticas, de modo informal e pontual. A empresa reconhece a importância de melhorar, mas não há consistência."
    };
  } else if (straticaScore <= 500) {
    return {
      level: 3,
      title: "Desenvolvido",
      description: "Maturidade intermediária (351-500 pontos). Processos e práticas já formalizados, porém aplicados de maneira parcial ou descoordenada. Os elementos de gestão não são uniformes."
    };
  } else if (straticaScore <= 650) {
    return {
      level: 4,
      title: "Gerenciado",
      description: "Maturidade alta (501-650 pontos). Práticas de gestão bem estabelecidas e coordenadas, aplicadas de forma consistente. A gestão é efetiva e proativa na maior parte da empresa."
    };
  } else if (straticaScore <= 800) {
    return {
      level: 5,
      title: "Integrado",
      description: "Maturidade muito alta (651-800 pontos). Excelência gerencial, com práticas integradas à cultura e melhoria contínua. A empresa é referência e possui desempenho superior e sustentado."
    };
  } else {
    return {
      level: 6,
      title: "Excelente",
      description: "Maturidade excepcional (801-1000 pontos). Organização de classe mundial com práticas inovadoras, resultados excepcionais e reconhecimento como benchmark de mercado."
    };
  }
}

// Função para obter recomendações por dimensão e nível
function getDimensionRecommendations(dimension: string, level: number): string {
  const recommendations: Record<string, Record<number, string>> = {
    "Liderança": {
      1: "Inicie estabelecendo uma visão organizacional clara e valores fundamentais que orientem todas as decisões da empresa. Defina papéis e responsabilidades de liderança em cada nível hierárquico, criando descrições de cargo específicas para posições de gestão. Implemente reuniões regulares de equipe para melhorar a comunicação interna e estabeleça canais formais de feedback. Desenvolva competências básicas de liderança através de treinamentos introdutórios, mentoring informal e leitura de literatura especializada, focando em construir relacionamentos de confiança com os colaboradores.",
      2: "Desenvolva um programa estruturado de capacitação em competências de liderança, incluindo comunicação eficaz, gestão de conflitos e tomada de decisão. Implemente sistemas regulares de comunicação com as equipes através de reuniões one-on-one, newsletters internas e canais digitais de comunicação. Estabeleça processos de avaliação de desempenho para líderes e crie planos de desenvolvimento individual. Invista em ferramentas de gestão de pessoas e comece a monitorar indicadores básicos de clima organizacional e engajamento das equipes.",
      3: "Formalize processos robustos de governança corporativa com comitês de gestão, políticas claras de delegação de autoridade e procedimentos estruturados de tomada de decisão. Estabeleça indicadores específicos de desempenho da liderança, incluindo métricas de engajamento, turnover e produtividade das equipes. Desenvolva programas de sucessão para posições-chave e implemente trilhas de carreira bem definidas. Crie sistemas de reconhecimento e recompensa alinhados aos valores organizacionais e promova a cultura de feedback contínuo em todos os níveis.",
      4: "Implemente práticas avançadas de liderança participativa e colaborativa, envolvendo equipes nas decisões estratégicas e operacionais através de comitês multifuncionais e grupos de trabalho. Desenvolva um pipeline robusto de sucessores através de programas estruturados de mentoring, job rotation e projetos desafiadores. Adote metodologias ágeis de gestão e promova maior autonomia das equipes, estabelecendo centros de excelência em liderança. Crie redes internas de líderes para compartilhamento de melhores práticas e aprendizado colaborativo.",
      5: "Pratique liderança transformacional de alto nível, focada em inspirar e motivar equipes para alcançar resultados excepcionais e superar expectativas. Promova uma cultura organizacional de inovação contínua, experimentação controlada e aprendizado com falhas. Desenvolva líderes capazes de conduzir mudanças complexas e transformações organizacionais profundas. Implemente sistemas avançados de gestão de talentos com foco em diversidade, inclusão e bem-estar, criando um ambiente de alta performance onde as pessoas se sintam valorizadas e engajadas.",
      6: "Torne-se uma referência reconhecida em práticas inovadoras de liderança, compartilhando conhecimento através de publicações especializadas, palestras em eventos do setor e parcerias com universidades renomadas. Desenvolva modelos proprietários de liderança que possam ser estudados e replicados por outras organizações. Lidere iniciativas setoriais de desenvolvimento de lideranças e estabeleça parcerias estratégicas com centros de pesquisa em gestão. Crie um legado duradouro de líderes excepcionais que impactem positivamente todo o ecossistema empresarial e social."
    },
    "Estratégias e Planos": {
      1: "Comece definindo claramente a missão, visão e valores organizacionais através de workshops participativos envolvendo lideranças e colaboradores-chave da empresa. Estabeleça objetivos SMART de curto prazo (3-6 meses) que sejam específicos, mensuráveis, alcançáveis, relevantes e temporais, alinhados com a realidade atual da organização. Crie um documento básico de planejamento estratégico e comunique amplamente para toda a organização através de reuniões, murais e canais digitais. Implemente reuniões mensais de acompanhamento para revisar o progresso dos objetivos e ajustar rumos quando necessário.",
      2: "Desenvolva um processo formal e estruturado de planejamento estratégico anual, utilizando metodologias reconhecidas e estabelecendo um cronograma claro com marcos e responsabilidades definidas. Realize um mapeamento completo de stakeholders internos e externos, identificando suas expectativas, influências e impactos na organização. Implemente análises básicas de mercado, concorrência e ambiente competitivo para fundamentar decisões estratégicas. Estabeleça um comitê estratégico multifuncional e crie sistemas regulares de comunicação sobre o progresso da estratégia para todos os níveis organizacionais.",
      3: "Implemente análises SWOT sistemáticas e outras ferramentas avançadas de diagnóstico estratégico como análise PESTEL, Cinco Forças de Porter e matriz BCG para uma compreensão profunda do ambiente de negócios. Desenvolva planos de ação detalhados e estruturados com responsáveis claramente definidos, prazos específicos, recursos necessários e marcos de controle para cada iniciativa estratégica. Estabeleça um escritório de projetos estratégicos para coordenar a execução e monitoramento contínuo. Crie dashboards interativos de acompanhamento com indicadores-chave de performance estratégica e realize revisões trimestrais rigorosas do plano.",
      4: "Integre completamente o planejamento estratégico com a execução operacional através do desdobramento sistemático de metas e implementação de OKRs (Objectives and Key Results) em todos os níveis organizacionais. Implemente sistemas avançados de monitoramento estratégico com indicadores leading e lagging, utilizando business intelligence e analytics. Desenvolva capacidades robustas de gestão de portfólio de projetos estratégicos e estabeleça processos estruturados de gestão de riscos estratégicos. Crie mecanismos ágeis de feedback contínuo do mercado e stakeholders para permitir ajustes rápidos e eficazes na estratégia.",
      5: "Pratique gestão estratégica de classe mundial utilizando inteligência competitiva avançada, análise sofisticada de cenários futuros e técnicas de war gaming para antecipação de movimentos competitivos. Desenvolva capacidades superiores de antecipação de tendências através de parcerias estratégicas com centros de pesquisa, think tanks e universidades de ponta. Implemente metodologias inovadoras como blue ocean strategy, design thinking estratégico e laboratórios de inovação para identificar e testar novas oportunidades de negócio. Estabeleça processos avançados de strategic foresight e inteligência de mercado.",
      6: "Torne-se um benchmark reconhecido globalmente em estratégia empresarial, desenvolvendo metodologias proprietárias inovadoras e cases de sucesso que sejam estudados e replicados pelo mercado. Influencie ativamente o desenvolvimento do setor através de liderança em associações empresariais, participação em fóruns estratégicos internacionais e publicação de pesquisas relevantes. Estabeleça parcerias estratégicas de longo prazo com universidades de prestígio mundial para pesquisa e desenvolvimento de novas abordagens estratégicas. Crie um centro de excelência em estratégia que sirva como referência e inspire outras organizações a elevar seus padrões de planejamento estratégico."
    },
    "Clientes": {
      1: "Inicie um processo estruturado de identificação e mapeamento dos seus clientes principais através de pesquisas diretas, análise de dados de vendas e observação comportamental. Estabeleça canais básicos de comunicação diretos e acessíveis como telefone, email, WhatsApp Business e redes sociais, garantindo tempos de resposta adequados e atendimento humanizado. Crie um banco de dados básico de clientes com informações essenciais como dados demográficos, histórico de compras e preferências. Implemente um sistema simples de feedback e reclamações, respondendo prontamente a todas as manifestações dos clientes.",
      2: "Implemente pesquisas estruturadas de satisfação utilizando metodologias como NPS (Net Promoter Score), CSAT (Customer Satisfaction Score) e questionários pós-venda para medir sistematicamente a experiência do cliente. Desenvolva um relacionamento mais próximo e personalizado através de ações como newsletters personalizadas, promoções exclusivas e comunicação regular sobre novidades e benefícios. Estabeleça um processo formal de gestão de reclamações com prazos definidos para resolução e acompanhamento pós-resolução. Crie um sistema de CRM básico para centralizar informações e histórico de interações com cada cliente.",
      3: "Implemente segmentação avançada de clientes baseada em valor, comportamento de compra, potencial de crescimento e ciclo de vida, utilizando análises RFM (Recência, Frequência, Valor Monetário) e outras técnicas estatísticas. Desenvolva estratégias personalizadas de atendimento e ofertas para cada segmento, criando campanhas direcionadas e relevantes. Monitore sistematicamente a experiência do cliente através de múltiplos pontos de contato, coletando feedback contínuo e implementando melhorias baseadas em dados. Estabeleça programas de fidelidade diferenciados por segmento e implemente automação de marketing para nutrir relacionamentos de forma escalável.",
      4: "Pratique gestão de relacionamento avançada utilizando analytics e business intelligence para extrair insights profundos sobre comportamento, preferências e padrões de consumo dos clientes. Desenvolva capacidades superiores para antecipar necessidades dos clientes através de análise preditiva, pesquisa de tendências e co-criação com clientes. Implemente uma jornada do cliente verdadeiramente omnichannel, integrando todos os pontos de contato físicos e digitais para proporcionar uma experiência fluida e consistente. Estabeleça sistemas de real-time personalization e recommendation engines para oferecer experiências altamente relevantes.",
      5: "Torne-se uma referência reconhecida em experiência do cliente através da implementação de metodologias de design thinking centradas no cliente e criação de laboratórios de inovação focados em CX. Inove constantemente na proposta de valor através de pesquisa contínua de mercado, análise de tendências emergentes e desenvolvimento de soluções disruptivas que superem expectativas. Implemente programas de customer advocacy e embaixadores da marca, transformando clientes satisfeitos em promotores ativos. Estabeleça centros de excelência em customer experience com equipes dedicadas e processos de melhoria contínua.",
      6: "Lidere a transformação no relacionamento com clientes no seu setor, desenvolvendo metodologias inovadoras de experiência do cliente que sejam estudadas e replicadas por outras organizações do mercado. Influencie ativamente os padrões de customer experience da indústria através de liderança em associações, participação em conferências internacionais e publicação de pesquisas relevantes. Estabeleça parcerias estratégicas com universidades e centros de pesquisa para desenvolvimento de novas abordagens em customer science. Crie um ecossistema de inovação centrado no cliente que inspire e eleve os padrões de toda a indústria."
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
    },
    "Pessoas": {
      1: "Organize uma estrutura básica de recursos humanos estabelecendo políticas fundamentais de contratação, demissão e gestão de pessoal, criando um manual do colaborador com direitos e deveres claramente definidos. Defina descrições detalhadas de cargos e responsabilidades para todas as posições, estabelecendo organogramas claros e linhas de reporte bem definidas. Implemente controles básicos de ponto, folha de pagamento e benefícios obrigatórios. Crie processos simples de integração de novos colaboradores e estabeleça canais básicos de comunicação interna.",
      2: "Implemente processos estruturados de recrutamento e seleção utilizando técnicas modernas de entrevista, testes de competência e verificação de referências para atrair e selecionar os melhores talentos. Desenvolva programas básicos de treinamento e desenvolvimento profissional alinhados com as necessidades da organização e aspirações dos colaboradores. Melhore significativamente a comunicação interna através de reuniões regulares, newsletters, murais informativos e canais digitais. Estabeleça políticas claras de avaliação de desempenho e feedback contínuo.",
      3: "Estruture um sistema abrangente de gestão de competências mapeando as competências técnicas e comportamentais necessárias para cada função e desenvolvendo planos individuais de desenvolvimento. Monitore regularmente o clima organizacional através de pesquisas estruturadas, grupos focais e indicadores de satisfação, implementando ações corretivas baseadas nos resultados. Implemente programas de sucessão e planos de carreira claros. Desenvolva lideranças internas através de programas de mentoring e coaching.",
      4: "Pratique gestão de talentos avançada utilizando analytics de RH, inteligência artificial para recrutamento e sistemas sofisticados de gestão de performance que identifiquem e desenvolvam high performers. Promova ativamente o engajamento e bem-estar dos colaboradores através de programas de qualidade de vida, flexibilidade no trabalho, reconhecimento e recompensas diferenciadas. Implemente cultura de feedback contínuo, diversidade e inclusão. Desenvolva programas inovadores de retenção de talentos e employer branding.",
      5: "Torne-se uma referência reconhecida em gestão de pessoas no seu setor através da implementação de práticas inovadoras de people analytics, employee experience design e future of work. Inove constantemente em práticas de RH desenvolvendo metodologias próprias de desenvolvimento humano, programas de well-being holísticos e modelos de trabalho flexíveis que sirvam de benchmark. Implemente tecnologias de ponta como IA para personalização de experiências e desenvolvimento de competências. Estabeleça parcerias com universidades para pesquisa em gestão de pessoas.",
      6: "Transforme positivamente o mercado de trabalho através de iniciativas disruptivas que redefinam padrões de gestão de pessoas, influenciando políticas públicas e práticas empresariais em escala global. Torne-se um modelo global em gestão de pessoas, sendo estudado e replicado por organizações de todo o mundo. Desenvolva e compartilhe metodologias inovadoras que elevem os padrões da profissão de RH. Crie um legado duradouro de impacto positivo na vida das pessoas e na evolução das práticas de gestão humana."
    },
    "Processos": {
      1: "Mapeie e documente os processos principais da organização identificando as atividades críticas, responsáveis e fluxos de trabalho essenciais para o funcionamento básico do negócio. Estabeleça controles básicos de qualidade através de verificações simples, checklists fundamentais e registros mínimos que garantam a conformidade das operações. Defina claramente as entradas, saídas e responsabilidades de cada processo principal. Identifique e corrija os problemas mais evidentes que impactam diretamente a qualidade e eficiência.",
      2: "Padronize sistematicamente os processos críticos criando procedimentos operacionais padrão (POPs) detalhados, templates e formulários que garantam consistência na execução das atividades. Implemente melhorias pontuais baseadas em análises simples de causa e efeito, eliminando desperdícios óbvios e gargalos identificados. Treine as equipes nos processos padronizados e estabeleça rotinas básicas de verificação e controle. Documente as melhores práticas e crie um sistema simples de gestão do conhecimento.",
      3: "Estruture uma gestão por processos abrangente mapeando todos os processos organizacionais, suas interações e dependências, criando uma visão sistêmica da operação. Monitore continuamente indicadores de desempenho através de métricas específicas, dashboards básicos e relatórios regulares que permitam acompanhar a eficiência e eficácia dos processos. Implemente ciclos de revisão e melhoria contínua. Desenvolva competências internas em gestão de processos e estabeleça responsáveis por cada processo.",
      4: "Otimize processos continuamente utilizando metodologias avançadas como Lean, Six Sigma e BPM para eliminar desperdícios, reduzir variabilidade e melhorar significativamente a performance operacional. Integre efetivamente a cadeia de valor interna e externa, sincronizando processos com fornecedores e clientes para criar fluxos otimizados e reduzir tempos de ciclo. Implemente automação inteligente e tecnologias que aumentem a produtividade. Desenvolva uma cultura de melhoria contínua em toda a organização.",
      5: "Pratique excelência operacional reconhecida no mercado através da implementação de práticas de classe mundial em gestão de processos que sirvam de referência para outras organizações. Inove constantemente em processos e tecnologias desenvolvendo soluções próprias, utilizando inteligência artificial, analytics avançados e tecnologias emergentes para criar vantagens competitivas sustentáveis. Estabeleça centros de excelência e compartilhe conhecimento através de publicações e benchmarking.",
      6: "Torne-se um benchmark reconhecido globalmente em gestão de processos, sendo estudado e replicado por organizações de todo o mundo devido à excelência e inovação de suas práticas operacionais. Lidere a transformação setorial através do desenvolvimento de processos revolucionários que redefinam padrões de eficiência, qualidade e sustentabilidade, influenciando toda a cadeia de valor e ecossistema empresarial. Desenvolva e licencie metodologias inovadoras que elevem os padrões da gestão de processos globalmente."
    },
    "Resultados": {
      1: "Monitore sistematicamente os resultados financeiros básicos através de controles de receitas, custos e fluxo de caixa, estabelecendo relatórios mensais simples que permitam acompanhar a saúde financeira da organização. Estabeleça controles rigorosos de custos implementando orçamentos básicos, análise de variações e aprovações para gastos significativos. Defina indicadores financeiros fundamentais como margem de lucro, ponto de equilíbrio e retorno sobre investimento. Crie rotinas de análise e tomada de decisão baseada em dados financeiros.",
      2: "Implemente um sistema abrangente de indicadores de desempenho (KPIs) que cubra as principais áreas do negócio, incluindo métricas financeiras, operacionais, de qualidade e produtividade. Monitore regularmente a satisfação de clientes através de pesquisas estruturadas, NPS, análise de reclamações e feedback contínuo, implementando ações corretivas baseadas nos resultados. Estabeleça metas claras e acompanhe o progresso através de dashboards e relatórios regulares. Desenvolva uma cultura de orientação por resultados.",
      3: "Estruture um sistema integrado de medição de desempenho que conecte indicadores estratégicos, táticos e operacionais, criando uma visão holística dos resultados organizacionais através de balanced scorecards ou metodologias similares. Analise sistematicamente tendências históricas, comparações setoriais e benchmarking interno para identificar oportunidades de melhoria e padrões de performance. Implemente analytics avançados e relatórios automatizados. Desenvolva competências internas em análise de dados e business intelligence.",
      4: "Pratique gestão por resultados avançada utilizando metodologias sofisticadas de análise de performance, predição de tendências e otimização de recursos que maximizem o retorno sobre investimentos. Implemente benchmarking sistemático com concorrentes e empresas de classe mundial, identificando gaps de performance e oportunidades de diferenciação competitiva. Utilize analytics preditivos e inteligência artificial para antecipar resultados e otimizar decisões. Desenvolva uma cultura de alta performance e accountability.",
      5: "Alcance e sustente resultados superiores reconhecidos no mercado, posicionando a organização como referência de excelência no setor através de performance consistentemente acima da média e práticas inovadoras de gestão. Torne-se referência no setor através de resultados excepcionais em todas as dimensões do negócio, sendo estudado e benchmarkado por outras organizações. Desenvolva capacidades distintivas que gerem vantagens competitivas sustentáveis. Compartilhe conhecimento e melhores práticas através de publicações e eventos.",
      6: "Transforme os padrões de desempenho do mercado através de resultados revolucionários que redefinam o que é possível alcançar no setor, influenciando toda a cadeia de valor e estabelecendo novos benchmarks globais. Torne-se um líder global reconhecido pela excelência em resultados, sendo estudado por organizações de todo o mundo e servindo como modelo de performance excepcional. Desenvolva e compartilhe metodologias inovadoras de gestão de resultados que elevem os padrões de toda a indústria."
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