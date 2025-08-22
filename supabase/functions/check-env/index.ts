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
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    const envInfo = {
      hasResendKey: !!resendApiKey,
      keyLength: resendApiKey ? resendApiKey.length : 0,
      keyPrefix: resendApiKey ? resendApiKey.substring(0, 8) + '...' : 'N/A',
      allEnvVars: Object.keys(Deno.env.toObject()).sort()
    }

    console.log('Environment check:', envInfo)

    return new Response(
      JSON.stringify(envInfo),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error checking environment:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})