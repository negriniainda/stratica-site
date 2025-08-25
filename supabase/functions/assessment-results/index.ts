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

// Função para obter recomendações por dimensão e nível
function getDimensionRecommendations(dimension: string, level: number): string {
  const recommendations: Record<string, Record<number, string>> = {
    "Liderança": {
      1: "Estabeleça os fundamentos da liderança organizacional definindo claramente a missão, visão e valores que orientarão todas as decisões e ações da empresa, comunicando-os de forma consistente a todos os colaboradores. Crie uma estrutura básica de liderança com papéis e responsabilidades bem definidos, estabelecendo hierarquias claras e canais de comunicação efetivos. Implemente reuniões regulares de liderança para alinhamento estratégico e operacional, garantindo que as informações fluam adequadamente por toda a organização. Desenvolva competências fundamentais de liderança através de treinamentos básicos e mentoring.",
      2: "Desenvolva um sistema estruturado de liderança implementando políticas de gestão documentadas que padronizem processos decisórios e estabeleçam diretrizes claras para a atuação dos líderes em diferentes situações. Crie ferramentas robustas de gestão de desempenho que permitam acompanhar o desenvolvimento dos colaboradores e identificar oportunidades de melhoria. Estabeleça programas abrangentes de treinamento em liderança que desenvolvam competências técnicas e comportamentais. Implemente sistemas de feedback 360 graus para promover autoconhecimento e desenvolvimento contínuo dos líderes.",
      3: "Fortaleça a cultura de liderança organizacional através da implementação de programas de desenvolvimento contínuo que preparem líderes para desafios futuros e promovam a excelência na gestão de pessoas. Estabeleça indicadores específicos de eficácia da liderança que permitam mensurar o impacto das práticas de gestão nos resultados organizacionais. Crie programas estruturados de sucessão que identifiquem e desenvolvam talentos internos para posições de liderança. Promova liderança colaborativa através de metodologias que incentivem o trabalho em equipe e a tomada de decisões participativa.",
      4: "Consolide práticas de liderança de alta performance através da implementação de metodologias avançadas de gestão que integrem analytics de pessoas, inteligência artificial e ferramentas digitais para otimizar a gestão de talentos. Desenvolva capacidades de liderança digital que preparem os gestores para liderar em ambientes tecnológicos complexos e em constante transformação. Estabeleça programas estratégicos de liderança que alinhem o desenvolvimento de competências com os objetivos de longo prazo da organização. Promova liderança adaptativa que permita responder rapidamente a mudanças do mercado e do ambiente de negócios.",
      5: "Mantenha e expanda a excelência reconhecida em liderança tornando-se uma referência no mercado através da implementação de práticas inovadoras que sirvam de benchmark para outras organizações. Desenvolva líderes visionários capazes de antecipar tendências, inspirar equipes e conduzir transformações organizacionais significativas. Implemente práticas de liderança consciente que integrem responsabilidade social, sustentabilidade e ética em todas as decisões de gestão. Estabeleça a organização como um centro de excelência em desenvolvimento de liderança, compartilhando conhecimento e influenciando positivamente o ecossistema empresarial."
    },
    "Estratégias e Planos": {
      1: "Estabeleça os fundamentos do planejamento organizacional definindo objetivos claros e mensuráveis que orientem todas as atividades da empresa, criando um planejamento anual estruturado que contemple metas de curto e médio prazo. Desenvolva uma estrutura básica de acompanhamento que permita monitorar o progresso das iniciativas e identificar desvios precocemente. Implemente reuniões regulares de planejamento que envolvam as principais lideranças e garantam alinhamento entre as diferentes áreas. Crie indicadores fundamentais de desempenho que reflitam os objetivos estratégicos e permitam avaliar o sucesso das iniciativas implementadas.",
      2: "Desenvolva um processo estruturado de planejamento estratégico que integre análise do ambiente interno e externo, definição de direcionamento estratégico e elaboração de planos de ação detalhados. Estabeleça uma metodologia robusta de desdobramento de metas que traduza os objetivos estratégicos em metas específicas para cada área e colaborador. Implemente um sistema abrangente de monitoramento de indicadores que permita acompanhar o desempenho em tempo real e tomar decisões baseadas em dados. Desenvolva capacidades de análise de cenários que preparem a organização para diferentes situações futuras e implementem revisões periódicas da estratégia.",
      3: "Fortaleça o processo de planejamento estratégico através da implementação de metodologias avançadas que integrem gestão de portfólio de projetos, análise de riscos e oportunidades, e sistemas de inteligência competitiva. Estabeleça processos sistemáticos de análise do ambiente competitivo que identifiquem tendências, ameaças e oportunidades de mercado. Crie sistemas integrados de gestão estratégica que conectem planejamento, execução e monitoramento em um ciclo contínuo de melhoria. Promova alinhamento estratégico organizacional através de comunicação efetiva e engajamento de todos os níveis hierárquicos na implementação da estratégia.",
      4: "Consolide a excelência em gestão estratégica através da implementação de metodologias de planejamento de cenários avançado que considerem múltiplas variáveis e incertezas do ambiente de negócios. Desenvolva capacidades organizacionais de inovação estratégica que permitam identificar e explorar novas oportunidades de crescimento e diferenciação competitiva. Estabeleça práticas de gestão de ecossistemas que integrem parceiros, fornecedores e stakeholders na criação de valor compartilhado. Promova agilidade estratégica através de estruturas organizacionais flexíveis e processos adaptativos que permitam resposta rápida a mudanças do mercado.",
      5: "Mantenha a liderança em planejamento estratégico tornando-se uma referência no mercado através da implementação de práticas inovadoras que sirvam de benchmark para outras organizações. Desenvolva e implemente estratégias disruptivas que transformem mercados e criem novas categorias de valor para clientes e stakeholders. Integre princípios de sustentabilidade e responsabilidade social em todos os aspectos do planejamento estratégico, criando valor de longo prazo para a sociedade. Estabeleça a organização como um centro de excelência em gestão estratégica, influenciando positivamente o desenvolvimento de melhores práticas no setor."
    },
    "Processos": {
      1: "Inicie o desenvolvimento da gestão de processos mapeando os processos principais da organização para compreender como o trabalho flui através das diferentes áreas e identificar oportunidades de melhoria. Estabeleça procedimentos básicos documentados que padronizem as atividades mais críticas e garantam consistência na execução. Implemente controles de qualidade simples que permitam identificar e corrigir problemas antes que afetem os resultados finais. Crie fluxos de trabalho padronizados que eliminem redundâncias e otimizem o uso de recursos. Desenvolva indicadores básicos de processo que permitam monitorar eficiência, qualidade e tempo de execução das atividades principais.",
      2: "Desenvolva um sistema estruturado de gestão de processos implementando metodologias reconhecidas de melhoria contínua que envolvam colaboradores na identificação e solução de problemas. Estabeleça um sistema robusto de controle de qualidade que integre verificações em pontos críticos dos processos e garanta conformidade com padrões estabelecidos. Inicie a automação básica de processos repetitivos e de baixo valor agregado para liberar recursos humanos para atividades mais estratégicas. Implemente práticas de gestão de riscos operacionais que identifiquem, avaliem e mitiguem riscos que possam impactar a continuidade dos negócios.",
      3: "Fortaleça o sistema de gestão de processos através da implementação de metodologias avançadas como Lean e Six Sigma que eliminem desperdícios e reduzam variabilidade nos resultados. Estabeleça uma visão integrada da cadeia de valor que otimize o fluxo de valor desde fornecedores até clientes finais. Crie um centro de excelência em processos que concentre conhecimento, metodologias e ferramentas para apoiar a melhoria contínua em toda a organização. Promova uma cultura organizacional de melhoria contínua que engaje todos os colaboradores na busca constante por eficiência e qualidade.",
      4: "Consolide a excelência operacional através da implementação de automação inteligente que utilize tecnologias como RPA, IA e machine learning para otimizar processos complexos e melhorar a tomada de decisões. Desenvolva processos adaptativos que possam se ajustar automaticamente a mudanças nas condições de negócio e demandas do mercado. Estabeleça práticas avançadas de gestão de ecossistemas que integrem processos internos com parceiros, fornecedores e clientes em uma cadeia de valor otimizada. Promova a transformação digital abrangente dos processos, criando operações totalmente integradas e orientadas por dados.",
      5: "Mantenha a liderança em excelência operacional tornando-se uma referência no mercado através da implementação de processos inovadores que sirvam de benchmark para outras organizações. Desenvolva e implemente processos revolucionários que transformem a forma como o trabalho é realizado no setor, criando vantagens competitivas sustentáveis. Integre princípios de sustentabilidade em todos os processos organizacionais, criando operações que gerem valor econômico, social e ambiental. Estabeleça a organização como um centro de excelência operacional que influencie positivamente o desenvolvimento de melhores práticas na indústria."
    },
    "Pessoas": {
      1: "Organize uma estrutura básica de recursos humanos estabelecendo políticas fundamentais de contratação, demissão e gestão de pessoal, criando um manual do colaborador com direitos e deveres claramente definidos. Defina descrições detalhadas de cargos e responsabilidades para todas as posições, estabelecendo organogramas claros e linhas de reporte bem definidas. Implemente controles básicos de ponto, folha de pagamento e benefícios obrigatórios. Crie processos simples de integração de novos colaboradores e estabeleça canais básicos de comunicação interna.",
      2: "Implemente processos estruturados de recrutamento e seleção utilizando técnicas modernas de entrevista, testes de competência e verificação de referências para atrair e selecionar os melhores talentos. Desenvolva programas básicos de treinamento e desenvolvimento profissional alinhados com as necessidades da organização e aspirações dos colaboradores. Melhore significativamente a comunicação interna através de reuniões regulares, newsletters, murais informativos e canais digitais. Estabeleça políticas claras de avaliação de desempenho e feedback contínuo.",
      3: "Estruture um sistema abrangente de gestão de competências mapeando as competências técnicas e comportamentais necessárias para cada função e desenvolvendo planos individuais de desenvolvimento. Monitore regularmente o clima organizacional através de pesquisas estruturadas, grupos focais e indicadores de satisfação, implementando ações corretivas baseadas nos resultados. Implemente programas de sucessão e planos de carreira claros. Desenvolva lideranças internas através de programas de mentoring e coaching.",
      4: "Pratique gestão de talentos avançada utilizando analytics de RH, inteligência artificial para recrutamento e sistemas sofisticados de gestão de performance que identifiquem e desenvolvam high performers. Promova ativamente o engajamento e bem-estar dos colaboradores através de programas de qualidade de vida, flexibilidade no trabalho, reconhecimento e recompensas diferenciadas. Implemente cultura de feedback contínuo, diversidade e inclusão. Desenvolva programas inovadores de retenção de talentos e employer branding.",
      5: "Torne-se uma referência reconhecida em gestão de pessoas no seu setor através da implementação de práticas inovadoras de people analytics, employee experience design e future of work. Inove constantemente em práticas de RH desenvolvendo metodologias próprias de desenvolvimento humano, programas de well-being holísticos e modelos de trabalho flexíveis que sirvam de benchmark. Implemente tecnologias de ponta como IA para personalização de experiências e desenvolvimento de competências. Estabeleça parcerias com universidades para pesquisa em gestão de pessoas."
    },
    "Clientes": {
      1: "Desenvolva o conhecimento fundamental sobre seus clientes identificando os segmentos principais e compreendendo suas necessidades, expectativas e comportamentos básicos de compra. Estabeleça canais básicos de comunicação que permitam interação efetiva com clientes através de múltiplos pontos de contato. Implemente um sistema simples de atendimento que garanta respostas rápidas e soluções adequadas para as demandas mais comuns. Crie processos básicos de coleta de feedback que permitam capturar a voz do cliente e identificar oportunidades de melhoria. Desenvolva competências fundamentais de relacionamento que coloquem o cliente no centro das decisões organizacionais.",
      2: "Implemente um sistema estruturado de CRM que centralize informações de clientes e permita gestão eficaz do relacionamento ao longo de todo o ciclo de vida. Estabeleça pesquisas regulares de satisfação que forneçam insights quantitativos e qualitativos sobre a experiência do cliente. Crie programas estruturados de relacionamento que fortaleçam vínculos emocionais e aumentem a lealdade dos clientes. Desenvolva segmentação avançada de mercado que permita ofertas personalizadas e comunicação direcionada. Implemente análises sistemáticas de comportamento do cliente que identifiquem padrões, preferências e oportunidades de cross-selling e up-selling.",
      3: "Fortaleça a gestão da experiência do cliente através da implementação de metodologias que mapeiem e otimizem todos os pontos de contato na jornada do cliente. Desenvolva uma jornada do cliente estruturada que identifique momentos da verdade e oportunidades de criação de valor em cada etapa. Estabeleça programas robustos de fidelização que reconheçam e recompensem clientes leais, criando incentivos para relacionamentos de longo prazo. Implemente sistemas eficazes de gestão de reclamações que transformem problemas em oportunidades de fortalecimento do relacionamento. Promova uma cultura organizacional customer-centric que coloque a satisfação do cliente como prioridade em todas as decisões.",
      4: "Consolide a excelência em experiência do cliente através da implementação de analytics avançado que utilize big data e inteligência artificial para compreender profundamente comportamentos e predizer necessidades futuras. Desenvolva capacidades de personalização em massa que permitam ofertas individualizadas em escala, criando experiências únicas para cada cliente. Estabeleça estratégias omnicanal que integrem perfeitamente todos os pontos de contato, proporcionando experiências consistentes e fluidas. Promova inovação centrada no cliente através de metodologias de design thinking e co-criação que envolvam clientes no desenvolvimento de produtos e serviços.",
      5: "Mantenha a liderança em experiência do cliente tornando-se uma referência no mercado através da criação de experiências memoráveis que superem consistentemente as expectativas e gerem advocacy espontâneo. Desenvolva soluções inovadoras que antecipem necessidades não expressas dos clientes e criem novas categorias de valor. Implemente experiências transformadoras que não apenas satisfaçam, mas inspirem e emocionem clientes, criando conexões profundas e duradouras. Estabeleça a organização como benchmark de excelência em atendimento e relacionamento, influenciando positivamente as práticas de mercado e servindo de referência para outras empresas."
    },
    "Resultados": {
      1: "Estabeleça um sistema básico de métricas organizacionais através da definição de indicadores fundamentais que permitam acompanhar o desempenho das principais atividades da empresa. Implemente rotinas regulares de monitoramento que incluam coleta sistemática de dados, análise básica de tendências e comunicação dos resultados para as equipes. Desenvolva práticas estruturadas de acompanhamento que envolvam reuniões periódicas de análise, definição de planos de ação corretivos e documentação das lições aprendidas. Promova uma cultura inicial orientada a resultados através de treinamentos básicos, comunicação clara das metas organizacionais e reconhecimento de conquistas. Estabeleça mecanismos simples de responsabilização por metas que incluam definição clara de responsáveis, prazos específicos e consequências por não cumprimento.",
      2: "Desenvolva um sistema estruturado de gestão de resultados implementando metodologias consolidadas como BSC (Balanced Scorecard) básico, definindo indicadores nas perspectivas financeira, clientes, processos internos e aprendizado. Implemente KPIs bem definidos e mensuráveis que estejam alinhados com os objetivos estratégicos da organização, incluindo metas específicas, prazos claros e responsáveis designados. Estabeleça dashboards de acompanhamento que apresentem informações de forma visual e acessível, permitindo análise rápida do desempenho e identificação de desvios. Crie processos sistemáticos de análise de tendências que incluam comparações históricas, benchmarking setorial e projeções futuras. Promova uma gestão efetiva por resultados através de reuniões estruturadas de análise, planos de ação detalhados e acompanhamento rigoroso da implementação.",
      3: "Implemente uma gestão estratégica de resultados integrando completamente os indicadores de desempenho com o planejamento estratégico da organização, criando um sistema coeso que conecte objetivos de longo prazo com metas operacionais. Desenvolva um balanced scorecard abrangente que inclua todas as perspectivas relevantes para o negócio, com indicadores leading e lagging que permitam tanto o acompanhamento de resultados quanto a antecipação de tendências. Estabeleça capacidades preditivas através da implementação de ferramentas de análise avançada, modelagem estatística e inteligência de negócios que permitam projeções confiáveis e tomada de decisões proativas. Crie sistemas efetivos de gestão de valor que monitorem não apenas resultados financeiros, mas também valor para stakeholders, impacto social e sustentabilidade ambiental. Promova uma cultura de alta performance através de programas de desenvolvimento, sistemas de reconhecimento baseados em mérito e criação de ambiente que estimule a excelência.",
      4: "Consolide uma gestão avançada de resultados através da implementação de sistemas integrados que conectem todos os níveis organizacionais, desde indicadores estratégicos até métricas operacionais, criando visibilidade completa do desempenho. Implemente analytics preditivos utilizando big data, machine learning e inteligência artificial para identificar padrões, antecipar tendências e otimizar a tomada de decisões estratégicas. Desenvolva uma gestão integrada de valor que considere múltiplas dimensões como valor econômico, social, ambiental e para stakeholders, criando uma visão holística do impacto organizacional. Estabeleça capacidades de transformação através de metodologias ágeis, gestão de mudanças e inovação contínua que permitam adaptação rápida a mudanças de mercado. Crie liderança reconhecida em resultados através da excelência operacional, benchmarking setorial e compartilhamento de melhores práticas que posicionem a organização como referência.",
      5: "Pratique excelência sustentável em resultados através da implementação de sistemas de gestão de classe mundial que integrem performance financeira, impacto social, sustentabilidade ambiental e inovação contínua, criando valor de longo prazo para todos os stakeholders. Torne-se uma referência reconhecida no mercado através da consistência na entrega de resultados superiores, liderança em práticas de gestão e contribuição para o desenvolvimento do setor. Desenvolva capacidades inovadoras que incluam pesquisa e desenvolvimento, parcerias estratégicas com universidades e centros de pesquisa, e criação de soluções disruptivas que transformem o mercado. Lidere a transformação do mercado através da definição de novos padrões de excelência, influência em políticas setoriais e criação de ecossistemas de valor que beneficiem toda a cadeia. Implemente criação de valor sustentável que vá além dos resultados financeiros, incluindo regeneração ambiental, desenvolvimento social e criação de legado positivo para futuras gerações."
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