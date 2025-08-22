import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
    
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'RESEND_API_KEY not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }

    console.log('Testing Resend API...')
    console.log('API Key length:', RESEND_API_KEY.length)
    console.log('API Key prefix:', RESEND_API_KEY.substring(0, 8) + '...')

    const emailPayload = {
      from: 'Test <noreply@ainda.app>',
      to: ['marcelo@ainda.app'],
      subject: 'Teste direto do Resend API',
      html: '<h1>Teste de envio direto</h1><p>Este é um teste para verificar se o Resend está funcionando.</p>',
    }

    console.log('Sending email with payload:', JSON.stringify(emailPayload, null, 2))

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    })

    console.log('Response status:', response.status)
    console.log('Response headers:', Object.fromEntries(response.headers.entries()))
    
    const responseText = await response.text()
    console.log('Response body:', responseText)

    let responseData
    try {
      responseData = JSON.parse(responseText)
    } catch {
      responseData = { raw: responseText }
    }

    const result = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      data: responseData,
      apiKeyConfigured: true,
      apiKeyLength: RESEND_API_KEY.length
    }

    console.log('Final result:', JSON.stringify(result, null, 2))

    return new Response(
      JSON.stringify(result),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error testing Resend:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})