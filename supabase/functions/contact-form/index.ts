import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

interface ContactFormData {
  name: string
  email: string
  message: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Método não permitido' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }

  try {
    // Parse request body
    const { name, email, message }: ContactFormData = await req.json()

    // Validate required fields
    if (!name || !email || !message) {
      return new Response(
        JSON.stringify({ error: 'Todos os campos são obrigatórios' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({ error: 'Email inválido' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Save contact to database
    const { data, error: dbError } = await supabase
      .from('contacts')
      .insert({
        name,
        email,
        message
      })
      .select()

    if (dbError) {
      console.error('Database error:', dbError)
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar contato' }),
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
        console.log('Attempting to send email to Resend...')
        const emailPayload = {
          from: 'Stratica Website <noreply@ainda.app>',
          to: ['marcelo@ainda.app'], // ALTERADO: era 'stratica@stratica.com.br'
          subject: `Novo contato do site - ${name}`,
          html: `
            <h2>Novo contato recebido pelo site</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Mensagem:</strong></p>
            <p>${message.replace(/\n/g, '<br>')}</p>
            <hr>
            <p><small>Enviado em: ${new Date().toLocaleString('pt-BR')}</small></p>
          `,
        }
        
        console.log('Email payload:', JSON.stringify(emailPayload, null, 2))
        
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(emailPayload),
        })

        console.log('Email response status:', emailResponse.status)
        const responseText = await emailResponse.text()
        console.log('Email response body:', responseText)
        
        if (!emailResponse.ok) {
          console.error('Email sending failed with status:', emailResponse.status)
          console.error('Email error response:', responseText)
        } else {
          console.log('Email sent successfully!')
        }
      } catch (emailError) {
        console.error('Email error caught:', emailError)
        console.error('Email error stack:', emailError.stack)
        // Don't fail the request if email fails
      }
    } else {
      console.log('RESEND_API_KEY not configured - skipping email send')
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Contato enviado com sucesso!',
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