import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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
           
           const emailPayload = {
             from: 'Stratica Website <onboarding@resend.dev>',
             to: ['marcelo@ainda.app'],
             subject: `Novo Assessment Completado - ${userInfo.name} (${userInfo.company})`,
             html: `
               <h2>Novo Assessment de Maturidade Digital Completado</h2>
               <h3>Informações do Usuário</h3>
               <p><strong>Nome:</strong> ${userInfo.name}</p>
               <p><strong>Email:</strong> ${userInfo.email}</p>
               <p><strong>Empresa:</strong> ${userInfo.company}</p>
               ${userInfo.position ? `<p><strong>Cargo:</strong> ${userInfo.position}</p>` : ''}
               
               <h3>Resultado do Assessment</h3>
               <p><strong>Nível de Maturidade:</strong> ${result.level}</p>
               <p><strong>Título:</strong> ${result.title}</p>
               <p><strong>Descrição:</strong> ${result.description}</p>
               <p><strong>Pontuação Total:</strong> ${totalScore}</p>
               <p><strong>Percentual:</strong> ${percentage}%</p>
               
               <h3>Respostas Detalhadas</h3>
               ${answersHtml}
               
               <hr>
               <p><small>Assessment completado em: ${new Date().toLocaleString('pt-BR')}</small></p>
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