// Teste de comparação das recomendações de dimensão entre site e Edge Function
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Função getDimensionLevel do site (copiada)
function getDimensionLevel(percentage) {
    if (percentage >= 80) return 5;
    if (percentage >= 60) return 4;
    if (percentage >= 40) return 3;
    if (percentage >= 20) return 2;
    return 1;
}

// Função getDimensionRecommendations do site (versão simplificada para teste)
function getDimensionRecommendations(dimension, level) {
    const recommendations = {
        'Liderança': {
            1: 'Estabeleça uma visão clara e comunique-a regularmente à equipe.',
            2: 'Desenvolva habilidades de liderança através de treinamentos específicos.',
            3: 'Implemente um sistema de feedback 360 graus para líderes.',
            4: 'Crie programas de mentoria e desenvolvimento de sucessores.',
            5: 'Estabeleça uma cultura de liderança distribuída e empoderamento.'
        },
        'Estratégias e Planos': {
            1: 'Desenvolva um planejamento estratégico formal com horizonte de 3-5 anos.',
            2: 'Implemente um sistema de monitoramento de indicadores estratégicos.',
            3: 'Estabeleça processos de revisão e ajuste da estratégia.',
            4: 'Integre o planejamento estratégico com o operacional.',
            5: 'Desenvolva cenários alternativos e planos de contingência.'
        },
        'Processos': {
            1: 'Mapeie e documente os processos críticos da organização.',
            2: 'Implemente controles de qualidade nos processos principais.',
            3: 'Estabeleça indicadores de desempenho para processos-chave.',
            4: 'Automatize processos repetitivos e padronize procedimentos.',
            5: 'Implemente melhoria contínua e inovação em processos.'
        },
        'Pessoas': {
            1: 'Desenvolva descrições de cargo claras e critérios de seleção.',
            2: 'Implemente um programa estruturado de treinamento e desenvolvimento.',
            3: 'Estabeleça um sistema de avaliação de desempenho justo.',
            4: 'Crie planos de carreira e programas de retenção de talentos.',
            5: 'Desenvolva uma cultura de alta performance e engajamento.'
        },
        'Clientes': {
            1: 'Implemente um sistema de coleta de feedback dos clientes.',
            2: 'Desenvolva processos de atendimento padronizados.',
            3: 'Estabeleça indicadores de satisfação e fidelização.',
            4: 'Crie programas de relacionamento e fidelização.',
            5: 'Desenvolva inovação baseada nas necessidades dos clientes.'
        },
        'Sociedade': {
            1: 'Desenvolva políticas de responsabilidade social corporativa.',
            2: 'Implemente práticas sustentáveis nas operações.',
            3: 'Estabeleça parcerias com organizações sociais.',
            4: 'Crie programas de impacto social mensuráveis.',
            5: 'Integre sustentabilidade na estratégia de negócio.'
        },
        'Informações e Conhecimento': {
            1: 'Implemente sistemas básicos de gestão da informação.',
            2: 'Desenvolva processos de coleta e análise de dados.',
            3: 'Estabeleça indicadores de desempenho organizacional.',
            4: 'Crie sistemas de gestão do conhecimento.',
            5: 'Desenvolva inteligência competitiva e análise preditiva.'
        },
        'Resultados': {
            1: 'Estabeleça indicadores financeiros básicos de controle.',
            2: 'Implemente relatórios gerenciais regulares.',
            3: 'Desenvolva análises de tendências e comparações.',
            4: 'Crie dashboards executivos e análises preditivas.',
            5: 'Integre resultados financeiros com indicadores estratégicos.'
        }
    };
    
    return recommendations[dimension]?.[level] || 'Recomendação não encontrada';
}

// Casos de teste específicos
const testCases = [
    {
        name: 'Liderança - Nível 3 (50%)',
        dimension: 'Liderança',
        score: 15,
        maxScore: 30,
        percentage: 50
    },
    {
        name: 'Estratégias e Planos - Nível 2 (30%)',
        dimension: 'Estratégias e Planos',
        score: 9,
        maxScore: 30,
        percentage: 30
    },
    {
        name: 'Processos - Nível 4 (70%)',
        dimension: 'Processos',
        score: 21,
        maxScore: 30,
        percentage: 70
    }
];

async function testEdgeFunction(testData) {
    try {
        const response = await fetch('http://localhost:54321/functions/v1/assessment-results', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'
            },
            body: JSON.stringify(testData)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        return await response.json();
    } catch (error) {
        throw new Error(`Erro na Edge Function: ${error.message}`);
    }
}

async function runComparison() {
    console.log('=== COMPARAÇÃO DE RECOMENDAÇÕES DE DIMENSÃO ===\n');

    for (const testCase of testCases) {
        console.log(`\n--- ${testCase.name} ---`);
        
        // Calcular nível no site
        const siteLevel = getDimensionLevel(testCase.percentage);
        const siteRecommendation = getDimensionRecommendations(testCase.dimension, siteLevel);
        
        console.log(`Site - Nível: ${siteLevel}`);
        console.log(`Site - Recomendação: ${siteRecommendation}`);
        
        // Preparar dados para Edge Function
        const edgeTestData = {
            userInfo: {
                name: "Teste Usuario",
                email: "teste@exemplo.com",
                company: "Empresa Teste",
                position: "Gerente"
            },
            result: {
                level: 3,
                title: "Nível Intermediário",
                description: "Teste"
            },
            totalScore: 500,
            percentage: 50,
            answers: { q1: 3, q2: 3, q3: 3 },
            dimensionAnalysis: [{
                dimension: testCase.dimension,
                score: testCase.score,
                maxScore: testCase.maxScore,
                percentage: testCase.percentage,
                level: siteLevel,
                description: `Análise da dimensão ${testCase.dimension}`
            }]
        };
        
        try {
            const edgeResult = await testEdgeFunction(edgeTestData);
            console.log(`Edge Function - Status: ${edgeResult.success ? 'Sucesso' : 'Erro'}`);
            
            if (edgeResult.success) {
                console.log('Edge Function executada com sucesso!');
                // Aqui verificaríamos o e-mail gerado, mas como não temos acesso direto,
                // pelo menos confirmamos que a função executou sem erro
            } else {
                console.log(`Edge Function - Erro: ${edgeResult.message}`);
            }
        } catch (error) {
            console.log(`Edge Function - Erro: ${error.message}`);
        }
        
        console.log('---');
    }
    
    console.log('\n=== CONCLUSÃO ===');
    console.log('Para verificar se as recomendações estão idênticas, seria necessário:');
    console.log('1. Verificar o e-mail gerado pela Edge Function');
    console.log('2. Comparar as recomendações no HTML do e-mail');
    console.log('3. Confirmar se a função getDimensionRecommendations na Edge Function está idêntica');
}

// Executar teste
runComparison().catch(console.error);