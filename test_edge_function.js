// Teste direto da Edge Function para comparar recomendações

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testEdgeFunction() {
    console.log('=== TESTE DA EDGE FUNCTION ===\n');

    // Caso de teste: Dimensão "Liderança" com nível 3 (50%)
    const testData = {
        userInfo: {
            name: "Teste Usuario",
            email: "teste@teste.com",
            company: "Empresa Teste",
            position: "Cargo Teste"
        },
        result: {
            level: 3,
            title: "Desenvolvido",
            description: "Maturidade intermediária"
        },
        totalScore: 500,
        percentage: 50,
        answers: {},
        dimensionAnalysis: {
            "Liderança": {
                score: 250,
                percentage: 50,
                level: {
                    level: 3,
                    title: "Desenvolvido",
                    description: "Maturidade intermediária (351-500 pontos). Processos e práticas já formalizados, porém aplicados de maneira parcial ou descoordenada. Os elementos de gestão não são uniformes."
                }
            }
        }
    };

    try {
        console.log('Enviando dados para Edge Function...');
        console.log('Dados enviados:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://127.0.0.1:54321/functions/v1/assessment-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpmc2RvY25teGRhcXZ6dWFqYnFwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2MDE1MzIsImV4cCI6MjA3MTE3NzUzMn0.uVd_l00SE-icATJEKam9sWJwzMMbblyjAqaMebnIPtM'
            },
            body: JSON.stringify(testData)
        });

        console.log('Status da resposta:', response.status);
        console.log('Headers da resposta:', response.headers.raw());

        if (!response.ok) {
            const errorText = await response.text();
            console.log('Erro na resposta:', errorText);
            return;
        }

        const result = await response.json();
        console.log('\nResposta da Edge Function:');
        console.log(JSON.stringify(result, null, 2));

    } catch (error) {
        console.error('Erro ao testar Edge Function:', error.message);
        console.error('Stack trace:', error.stack);
    }
}

testEdgeFunction();