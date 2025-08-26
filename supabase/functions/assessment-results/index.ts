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
      1: "Estabeleça uma visão clara e valores organizacionais bem definidos. Desenvolva competências básicas de liderança através de treinamentos e mentoring. Implemente reuniões regulares de equipe e canais de comunicação eficazes.",
      2: "Desenvolva um programa estruturado de capacitação em liderança. Implemente sistemas de comunicação regular com as equipes. Estabeleça processos de avaliação de desempenho e planos de desenvolvimento.",
      3: "Formalize processos de governança corporativa. Estabeleça indicadores de desempenho da liderança. Desenvolva programas de sucessão e trilhas de carreira bem definidas.",
      4: "Implemente práticas avançadas de liderança participativa. Desenvolva um pipeline robusto de sucessores. Adote metodologias ágeis de gestão e promova autonomia das equipes.",
      5: "Pratique liderança transformacional de alto nível. Promova uma cultura de inovação contínua. Desenvolva líderes capazes de conduzir mudanças complexas.",
      6: "Torne-se uma referência reconhecida em práticas inovadoras de liderança. Desenvolva modelos proprietários de liderança. Lidere iniciativas setoriais de desenvolvimento de lideranças."
    },
    "Estratégias e Planos": {
      1: "Defina claramente missão, visão e valores organizacionais. Estabeleça objetivos SMART de curto prazo. Crie um documento básico de planejamento estratégico.",
      2: "Desenvolva um processo formal de planejamento estratégico anual. Realize mapeamento de stakeholders. Implemente análises básicas de mercado e concorrência.",
      3: "Implemente análises SWOT sistemáticas e ferramentas avançadas de diagnóstico estratégico. Desenvolva planos de ação detalhados. Estabeleça um escritório de projetos estratégicos.",
      4: "Integre completamente o planejamento estratégico com a execução operacional. Implemente sistemas avançados de monitoramento estratégico. Desenvolva capacidades de gestão de portfólio de projetos.",
      5: "Pratique gestão estratégica de classe mundial utilizando inteligência competitiva avançada. Desenvolva capacidades de antecipação de tendências. Implemente metodologias inovadoras como blue ocean strategy.",
      6: "Torne-se um benchmark reconhecido globalmente em estratégia empresarial. Influencie ativamente o desenvolvimento do setor. Estabeleça parcerias estratégicas com universidades de prestígio mundial."
    },
    "Clientes": {
      1: "Identifique e mapeie seus clientes principais. Estabeleça canais básicos de comunicação. Crie um banco de dados básico de clientes. Implemente um sistema simples de feedback.",
      2: "Implemente pesquisas estruturadas de satisfação (NPS, CSAT). Desenvolva relacionamento mais próximo e personalizado. Estabeleça processo formal de gestão de reclamações.",
      3: "Implemente segmentação avançada de clientes. Desenvolva estratégias personalizadas por segmento. Monitore sistematicamente a experiência do cliente.",
      4: "Pratique gestão de relacionamento avançada utilizando analytics. Desenvolva capacidades para antecipar necessidades dos clientes. Implemente jornada omnichannel.",
      5: "Torne-se uma referência em experiência do cliente. Inove constantemente na proposta de valor. Implemente programas de customer advocacy.",
      6: "Lidere a transformação no relacionamento com clientes no seu setor. Influencie ativamente os padrões de customer experience da indústria. Estabeleça parcerias estratégicas para desenvolvimento de novas abordagens."
    },
    "Sociedade": {
      1: "Identifique e mapeie os impactos sociais básicos da organização. Estabeleça programa de cumprimento da legislação ambiental e social. Implemente práticas básicas de responsabilidade social.",
      2: "Desenvolva programas estruturados de responsabilidade social corporativa alinhados com os ODS. Engaje ativamente a comunidade local. Implemente políticas de diversidade e inclusão.",
      3: "Implemente sistema de gestão ambiental estruturado (ISO 14001). Monitore sistematicamente os impactos socioambientais. Desenvolva programas de economia circular.",
      4: "Integre completamente a sustentabilidade à estratégia organizacional. Promova desenvolvimento social ativo. Implemente sistemas avançados de gestão de riscos socioambientais.",
      5: "Torne-se uma referência reconhecida em sustentabilidade no seu setor. Lidere iniciativas setoriais de sustentabilidade. Desenvolva tecnologias próprias para soluções sustentáveis.",
      6: "Transforme positivamente a sociedade através de iniciativas disruptivas. Torne-se um modelo global de sustentabilidade. Estabeleça parcerias estratégicas com governos e organizações multilaterais."
    },
    "Informações e Conhecimento": {
      1: "Organize as informações básicas da empresa através de repositórios centralizados. Estabeleça sistemas básicos de comunicação interna. Implemente controles básicos de segurança da informação.",
      2: "Implemente sistemas estruturados de gestão de informações. Desenvolva uma base de conhecimento organizacional. Estabeleça políticas claras de gestão da informação.",
      3: "Estruture um sistema abrangente de gestão do conhecimento. Monitore sistematicamente a qualidade das informações. Implemente ferramentas avançadas de business intelligence.",
      4: "Integre completamente os sistemas de informação da organização. Promova ativamente o compartilhamento de conhecimento. Implemente analytics avançados e inteligência artificial.",
      5: "Pratique gestão avançada do conhecimento utilizando tecnologias de ponta. Use analytics sofisticados para fundamentar decisões estratégicas. Estabeleça parcerias com universidades e centros de pesquisa.",
      6: "Torne-se uma referência global em gestão da informação e conhecimento. Influencie o desenvolvimento de padrões e melhores práticas da indústria. Estabeleça ecossistemas de conhecimento globais."
    },
    "Pessoas": {
      1: "Estabeleça práticas básicas de gestão de pessoas. Implemente programas básicos de integração (onboarding). Crie descrições claras de cargos e responsabilidades.",
      2: "Desenvolva um sistema formal de gestão de pessoas. Implemente programas de treinamento e capacitação. Estabeleça processos de avaliação de desempenho.",
      3: "Implemente práticas avançadas de gestão de talentos utilizando people analytics. Estabeleça programas robustos de desenvolvimento de liderança. Desenvolva uma cultura organizacional forte.",
      4: "Integre completamente a gestão de pessoas com a estratégia organizacional. Desenvolva programas avançados de employee experience. Implemente práticas de diversidade e inclusão.",
      5: "Pratique gestão de pessoas de classe mundial. Desenvolva capacidades superiores de inovação em práticas de RH. Estabeleça benchmarking sistemático com organizações líderes mundiais.",
      6: "Torne-se um benchmark reconhecido globalmente em gestão de pessoas. Influencie ativamente o desenvolvimento de novas práticas de gestão de talentos. Estabeleça um centro de excelência mundial."
    },
    "Processos": {
      1: "Identifique e mapeie os processos mais críticos da organização. Estabeleça procedimentos operacionais padrão (POPs) simples. Implemente controles básicos de qualidade.",
      2: "Desenvolva um sistema formal de gestão de processos. Implemente indicadores básicos de performance (KPIs). Estabeleça procedimentos de melhoria contínua baseados no PDCA.",
      3: "Implemente metodologias avançadas de melhoria de processos como Lean Manufacturing. Estabeleça sistemas robustos de gestão da qualidade (ISO 9001). Desenvolva dashboards de monitoramento em tempo real.",
      4: "Integre completamente a gestão de processos com a estratégia organizacional através de BPM. Desenvolva capacidades avançadas de análise de dados. Implemente práticas de gestão ágil de processos.",
      5: "Pratique excelência operacional de classe mundial através de Lean Six Sigma. Desenvolva capacidades superiores de inovação em processos. Estabeleça benchmarking sistemático com organizações líderes mundiais.",
      6: "Torne-se um benchmark reconhecido globalmente em excelência operacional. Influencie ativamente o desenvolvimento de novas práticas de gestão de processos. Estabeleça um centro de excelência mundial."
    },
    "Resultados": {
      1: "Estabeleça sistemas básicos de monitoramento de resultados. Monitore indicadores operacionais básicos. Implemente controles básicos de processos críticos.",
      2: "Desenvolva um sistema estruturado de indicadores de performance (KPIs). Implemente dashboards básicos e relatórios gerenciais. Estabeleça metas específicas e mensuráveis.",
      3: "Implemente um sistema abrangente de gestão de resultados utilizando balanced scorecard. Desenvolva capacidades de análise de dados e business intelligence. Estabeleça processos sistemáticos de benchmarking.",
      4: "Integre completamente a gestão de resultados com o planejamento estratégico. Desenvolva capacidades de análise preditiva. Implemente sistemas de monitoramento em tempo real.",
      5: "Pratique gestão de resultados de classe mundial através de sistemas integrados de performance management. Desenvolva capacidades superiores de business intelligence e analytics preditivo. Estabeleça benchmarking sistemático com organizações líderes mundiais.",
      6: "Torne-se um benchmark reconhecido globalmente em gestão de resultados. Influencie ativamente o desenvolvimento de novas práticas de performance management. Estabeleça um centro de excelência mundial."
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