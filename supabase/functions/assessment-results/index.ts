import { serve } from "https://deno.land/std@0.208.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

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

    // Save assessment to database
    const { data, error: dbError } = await supabase
      .from('assessments')
      .insert({
        name: userInfo.name,
        email: userInfo.email,
        company: userInfo.company,
        position: userInfo.position || null,
        total_score: totalScore,
        percentage: percentage,
        maturity_level: result.level,
        level_title: result.title,
        level_description: result.description,
        answers: answers
      })
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar resultado do assessment' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate detailed report for email
    const generateDetailedReport = () => {
      let report = `
        <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
          <h1 style="color: #dc2626;">Relatório de Maturidade Estratégica</h1>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Informações do Participante</h2>
            <p><strong>Nome:</strong> ${userInfo.name}</p>
            <p><strong>Email:</strong> ${userInfo.email}</p>
            <p><strong>Empresa:</strong> ${userInfo.company}</p>
            ${userInfo.position ? `<p><strong>Cargo:</strong> ${userInfo.position}</p>` : ''}
          </div>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h2>Resultado do Assessment</h2>
            <p><strong>Pontuação:</strong> ${Math.round(percentage)}%</p>
            <p><strong>Nível de Maturidade:</strong> ${result.level} - ${result.title}</p>
            <p><strong>Descrição:</strong> ${result.description}</p>
          </div>
          
          <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2>Próximos Passos Recomendados</h2>
      `
      
      // Add recommendations based on maturity level
      if (result.level <= 2) {
        report += `
          <ul>
            <li>Estabelecer processos básicos de planejamento estratégico</li>
            <li>Definir missão, visão e valores organizacionais</li>
            <li>Implementar indicadores básicos de performance</li>
            <li>Capacitar liderança em gestão estratégica</li>
          </ul>
        `
      } else if (result.level === 3) {
        report += `
          <ul>
            <li>Formalizar processos de planejamento estratégico</li>
            <li>Implementar sistema de monitoramento de KPIs</li>
            <li>Desenvolver cultura de execução estratégica</li>
            <li>Melhorar comunicação da estratégia</li>
          </ul>
        `
      } else if (result.level === 4) {
        report += `
          <ul>
            <li>Implementar gestão de portfólio estratégico</li>
            <li>Desenvolver capacidades de inovação</li>
            <li>Fortalecer análise de cenários e riscos</li>
            <li>Integrar sustentabilidade na estratégia</li>
          </ul>
        `
      } else {
        report += `
          <ul>
            <li>Manter excelência e buscar inovação contínua</li>
            <li>Compartilhar melhores práticas no mercado</li>
            <li>Desenvolver ecossistema de parceiros estratégicos</li>
            <li>Liderar transformação digital do setor</li>
          </ul>
        `
      }
      
      report += `
          </div>
          
          <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3>Quer acelerar sua jornada de maturidade estratégica?</h3>
            <p>A Stratica pode ajudar sua empresa a evoluir para o próximo nível.</p>
            <a href="https://stratica.com.br" style="background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; margin-top: 10px;">Agende uma Conversa</a>
          </div>
          
          <hr style="margin: 30px 0;">
          <p style="color: #6b7280; font-size: 14px;">Relatório gerado em: ${new Date().toLocaleString('pt-BR')}</p>
        </div>
      `
      
      return report
    }

    // Send email notifications if Resend API key is configured
    if (RESEND_API_KEY) {
      try {
        // Send email to user with their results
        const userEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Stratica Assessment <onboarding@resend.dev>', // Use o domínio padrão do Resend temporariamente
            to: [userInfo.email],
            subject: `Seu Resultado: Maturidade Estratégica - Nível ${result.level}`,
            html: generateDetailedReport(),
          }),
        })

        // Send notification to Stratica team
        const teamEmailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          // Linha 196 - remover vírgula dupla
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          }, // <- apenas uma vírgula
          body: JSON.stringify({
            from: 'Stratica Assessment <onboarding@resend.dev>',
            to: ['marcelo@ainda.app'], // ALTERADO: era 'stratica@stratica.com.br'
            subject: `Novo Assessment Completado - ${userInfo.company}`,
            html: `
              <h2>Novo Assessment de Maturidade Estratégica</h2>
              <p><strong>Empresa:</strong> ${userInfo.company}</p>
              <p><strong>Participante:</strong> ${userInfo.name} (${userInfo.email})</p>
              <p><strong>Cargo:</strong> ${userInfo.position || 'Não informado'}</p>
              <p><strong>Resultado:</strong> Nível ${result.level} - ${result.title} (${Math.round(percentage)}%)</p>
              <p><strong>Data:</strong> ${new Date().toLocaleString('pt-BR')}</p>
              <hr>
              <p>Acesse o painel administrativo para ver detalhes completos.</p>
            `,
          }),
        })

        if (!userEmailResponse.ok || !teamEmailResponse.ok) {
          console.error('Email sending failed', {
            userEmailStatus: userEmailResponse.status,
            userEmailText: await userEmailResponse.text().catch(() => 'Failed to get response text'),
            teamEmailStatus: teamEmailResponse.status,
            teamEmailText: await teamEmailResponse.text().catch(() => 'Failed to get response text')
          })
        }
      } catch (emailError) {
        console.error('Email error:', emailError)
        // Don't fail the request if email fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Assessment salvo com sucesso! Verifique seu email para o relatório detalhado.',
        data: data[0]
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

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