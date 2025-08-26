// Teste direto para comparar cálculos entre site e Edge Function

// Função getDimensionLevel do site (copiada exatamente)
function getDimensionLevel(dimensionPercentage) {
    // Usar intervalos baseados na porcentagem (0-100%) - Nova escala
    if (dimensionPercentage <= 20) {
        return 1;   // 0-200 pontos (0-20%)
    } else if (dimensionPercentage <= 35) {
        return 2;   // 201-350 pontos (20.1-35%)
    } else if (dimensionPercentage <= 50) {
        return 3;   // 351-500 pontos (35.1-50%)
    } else if (dimensionPercentage <= 65) {
        return 4;   // 501-650 pontos (50.1-65%)
    } else if (dimensionPercentage <= 80) {
        return 5;   // 651-800 pontos (65.1-80%)
    } else {
        return 6;   // 801-1000 pontos (80.1-100%)
    }
}

// Função getResultDetailsForDimension do site (copiada exatamente)
function getResultDetailsForDimension(levelNumber) {
    switch(levelNumber) {
        case 1:
            return {
                level: 1,
                title: "Limitado",
                description: "Maturidade muito baixa (0-200 pontos). Práticas de gestão inexistentes ou ad-hoc, resultados obtidos de forma não estruturada. A organização depende de esforços isolados."
            };
        case 2:
            return {
                level: 2,
                title: "Emergente",
                description: "Maturidade baixa (201-350 pontos). Início de implementação básica de algumas práticas, de modo informal e pontual. A empresa reconhece a importância de melhorar, mas não há consistência."
            };
        case 3:
            return {
                level: 3,
                title: "Desenvolvido",
                description: "Maturidade intermediária (351-500 pontos). Processos e práticas já formalizados, porém aplicados de maneira parcial ou descoordenada. Os elementos de gestão não são uniformes."
            };
        case 4:
            return {
                level: 4,
                title: "Gerenciado",
                description: "Maturidade alta (501-650 pontos). Práticas de gestão bem estabelecidas e coordenadas, aplicadas de forma consistente. A gestão é efetiva e proativa na maior parte da empresa."
            };
        case 5:
            return {
                level: 5,
                title: "Integrado",
                description: "Maturidade muito alta (651-800 pontos). Excelência gerencial, com práticas integradas à cultura e melhoria contínua. A empresa é referência e possui desempenho superior e sustentado."
            };
        case 6:
            return {
                level: 6,
                title: "Excelente",
                description: "Maturidade excepcional (801-1000 pontos). Organização de classe mundial com práticas inovadoras, resultados excepcionais e reconhecimento como benchmark de mercado."
            };
        default:
            return {
                level: 1,
                title: "Limitado",
                description: "Maturidade muito baixa (0-200 pontos). Práticas de gestão inexistentes ou ad-hoc, resultados obtidos de forma não estruturada. A organização depende de esforços isolados."
            };
    }
}

// Casos de teste
const testCases = [
    { dimension: "Liderança", score: 100, maxScore: 500, expectedPercentage: 20, expectedLevel: 1 },
    { dimension: "Estratégias e Planos", score: 175, maxScore: 500, expectedPercentage: 35, expectedLevel: 2 },
    { dimension: "Processos", score: 250, maxScore: 500, expectedPercentage: 50, expectedLevel: 3 },
    { dimension: "Pessoas", score: 325, maxScore: 500, expectedPercentage: 65, expectedLevel: 4 },
    { dimension: "Clientes", score: 400, maxScore: 500, expectedPercentage: 80, expectedLevel: 5 }
];

console.log('=== TESTE DE CÁLCULOS DE DIMENSÃO ===\n');

for (const testCase of testCases) {
    const percentage = Math.round((testCase.score / testCase.maxScore) * 100);
    const dimensionPercentage = (testCase.score / testCase.maxScore) * 100;
    const levelNumber = getDimensionLevel(dimensionPercentage);
    const levelDetails = getResultDetailsForDimension(levelNumber);

    console.log(`Teste: ${testCase.dimension}`);
    console.log(`Score: ${testCase.score}/${testCase.maxScore}`);
    console.log(`Percentual Calculado: ${percentage}% (esperado: ${testCase.expectedPercentage}%)`);
    console.log(`Nível Calculado: ${levelNumber} (esperado: ${testCase.expectedLevel})`);
    console.log(`Título: ${levelDetails.title}`);
    console.log(`Descrição: ${levelDetails.description}`);
    
    // Verificar se os cálculos estão corretos
    const percentageCorrect = percentage === testCase.expectedPercentage;
    const levelCorrect = levelNumber === testCase.expectedLevel;
    
    if (percentageCorrect && levelCorrect) {
        console.log('✓ Cálculos corretos no frontend');
    } else {
        console.log('✗ Erro nos cálculos do frontend');
        console.log(`  - Percentual: ${percentageCorrect ? 'OK' : 'ERRO'}`);
        console.log(`  - Nível: ${levelCorrect ? 'OK' : 'ERRO'}`);
    }
    console.log('---\n');
}

console.log('=== TESTE CONCLUÍDO ===');