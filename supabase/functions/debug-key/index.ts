import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY')
    
    console.log('=== DEBUG KEY INFO ===')
    console.log('Key exists:', !!resendApiKey)
    console.log('Key length:', resendApiKey?.length || 0)
    console.log('Key prefix:', resendApiKey?.substring(0, 10) || 'N/A')
    console.log('Key suffix:', resendApiKey?.substring(-10) || 'N/A')
    console.log('Full key (masked):', resendApiKey ? `${resendApiKey.substring(0, 8)}...${resendApiKey.substring(-4)}` : 'N/A')
    
    // Test with a known valid format example
    const exampleValidKey = 're_c1tpEyD8_NKFusih9vKVQknRAQfmFcWCv' // From Resend docs
    console.log('Example valid key length:', exampleValidKey.length)
    console.log('Current key matches expected length:', resendApiKey?.length === exampleValidKey.length)
    
    return new Response(
      JSON.stringify({
        keyExists: !!resendApiKey,
        keyLength: resendApiKey?.length || 0,
        keyPrefix: resendApiKey?.substring(0, 10) || 'N/A',
        expectedLength: exampleValidKey.length,
        isValidLength: resendApiKey?.length === exampleValidKey.length,
        keyFormat: resendApiKey ? `${resendApiKey.substring(0, 8)}...${resendApiKey.substring(-4)}` : 'N/A'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in debug-key function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})