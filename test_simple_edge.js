// Teste simples da Edge Function sem autenticação
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testData = {
  userInfo: {
    name: "Teste Usuario",
    email: "teste@exemplo.com",
    company: "Empresa Teste",
    position: "Gerente"
  },
  result: {
    level: 3,
    title: "Nível Intermediário",
    description: "Sua organização está em desenvolvimento"
  },
  totalScore: 500,
  percentage: 50,
  answers: {
    q1: 3,
    q2: 3,
    q3: 3
  },
  dimensionAnalysis: {
    "Liderança": {
      score: 150,
      maxScore: 300,
      percentage: 50,
      level: 3
    }
  }
};

async function testEdgeFunction() {
  try {
    console.log('Enviando dados para Edge Function...');
    
    const response = await fetch('http://localhost:54321/functions/v1/assessment-results', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
      },
      body: JSON.stringify(testData)
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    
    const responseText = await response.text();
    console.log('Response:', responseText);
    
    if (response.ok) {
      console.log('✅ Teste passou!');
    } else {
      console.log('❌ Teste falhou');
    }
    
  } catch (error) {
    console.error('Erro no teste:', error);
  }
}

testEdgeFunction();