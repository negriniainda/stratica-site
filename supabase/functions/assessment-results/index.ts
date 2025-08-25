import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

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
           const answersHtml = Object.entries(answers).map(([key, value]) => {
             return `<p><strong>${key}:</strong> ${JSON.stringify(value)}</p>`
           }).join('')
           
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