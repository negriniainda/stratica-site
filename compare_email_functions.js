// Comparação entre generateDimensionAnalysisForEmail (site) e generateDimensionAnalysisHtml (Edge Function)

// Função do site (assessment.html)
function generateDimensionAnalysisForEmailSite(dimensionAnalysis, assessmentData) {
    let analysisHtml = '';
    
    Object.keys(dimensionAnalysis).forEach(dimension => {
        const analysis = dimensionAnalysis[dimension];
        const recommendations = getDimensionRecommendations(dimension, analysis.level.level);
        
        analysisHtml += `
        <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px;">${dimension}</h3>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>Pontuação:</strong> ${analysis.score} pontos</p>
                <p style="margin: 5px 0;"><strong>Percentual:</strong> ${Math.round(analysis.percentage)}%</p>
                <p style="margin: 5px 0;"><strong>Nível de Maturidade:</strong> ${analysis.level.level} - ${analysis.level.title}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">Descrição do Nível:</h4>
                <p style="margin: 0; line-height: 1.6; color: #555;">${analysis.level.description}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60; margin-top: 15px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">Recomendações Específicas:</h4>
                <p style="margin: 0; line-height: 1.6; color: #555;">${recommendations}</p>
            </div>
        </div>`;
    });
    
    return analysisHtml;
}

// Função da Edge Function (index.ts)
function generateDimensionAnalysisHtmlEdge(dimensionAnalysis) {
    let analysisHtml = '';
    
    Object.keys(dimensionAnalysis).forEach(dimension => {
        const analysis = dimensionAnalysis[dimension];
        const recommendations = getDimensionRecommendations(dimension, analysis.level.level);
        
        analysisHtml += `
        <div style="margin-bottom: 30px; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #f9f9f9;">
            <h3 style="color: #2c3e50; margin-bottom: 15px; font-size: 18px;">${dimension}</h3>
            
            <div style="margin-bottom: 15px;">
                <p style="margin: 5px 0;"><strong>Pontuação:</strong> ${analysis.score} pontos</p>
                <p style="margin: 5px 0;"><strong>Percentual:</strong> ${Math.round(analysis.percentage)}%</p>
                <p style="margin: 5px 0;"><strong>Nível de Maturidade:</strong> ${analysis.level.level} - ${analysis.level.title}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border-left: 4px solid #3498db;">
                <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">Descrição do Nível:</h4>
                <p style="margin: 0; line-height: 1.6; color: #555;">${analysis.level.description}</p>
            </div>
            
            <div style="background-color: #ffffff; padding: 15px; border-radius: 5px; border-left: 4px solid #27ae60; margin-top: 15px;">
                <h4 style="color: #2c3e50; margin-bottom: 10px; font-size: 16px;">Recomendações Específicas:</h4>
                <p style="margin: 0; line-height: 1.6; color: #555;">${recommendations}</p>
            </div>
        </div>`;
    });
    
    return analysisHtml;
}

// Função para comparar as duas implementações
function compareEmailFunctions() {
    console.log('=== COMPARAÇÃO DAS FUNÇÕES DE GERAÇÃO DE EMAIL ===\n');
    
    // Diferenças identificadas:
    const differences = [
        {
            aspect: 'Parâmetros da função',
            site: 'generateDimensionAnalysisForEmail(dimensionAnalysis, assessmentData)',
            edge: 'generateDimensionAnalysisHtml(dimensionAnalysis)',
            impact: 'BAIXO - assessmentData não é usado na função do site'
        },
        {
            aspect: 'Nome da função',
            site: 'generateDimensionAnalysisForEmail',
            edge: 'generateDimensionAnalysisHtml',
            impact: 'NENHUM - apenas nomenclatura diferente'
        },
        {
            aspect: 'Lógica interna',
            site: 'Idêntica - mesmo loop, mesmas variáveis, mesmo HTML',
            edge: 'Idêntica - mesmo loop, mesmas variáveis, mesmo HTML',
            impact: 'NENHUM - lógica completamente idêntica'
        },
        {
            aspect: 'Uso de getDimensionRecommendations',
            site: 'getDimensionRecommendations(dimension, analysis.level.level)',
            edge: 'getDimensionRecommendations(dimension, analysis.level.level)',
            impact: 'NENHUM - chamada idêntica'
        },
        {
            aspect: 'Estrutura HTML gerada',
            site: 'HTML idêntico com mesmos estilos e estrutura',
            edge: 'HTML idêntico com mesmos estilos e estrutura',
            impact: 'NENHUM - output HTML completamente idêntico'
        }
    ];
    
    console.log('DIFERENÇAS ENCONTRADAS:');
    differences.forEach((diff, index) => {
        console.log(`\n${index + 1}. ${diff.aspect}:`);
        console.log(`   Site: ${diff.site}`);
        console.log(`   Edge: ${diff.edge}`);
        console.log(`   Impacto: ${diff.impact}`);
    });
    
    console.log('\n=== CONCLUSÃO ===');
    console.log('✅ As funções são FUNCIONALMENTE IDÊNTICAS');
    console.log('✅ Geram o mesmo HTML de saída');
    console.log('✅ Usam a mesma lógica de cálculo');
    console.log('✅ Chamam getDimensionRecommendations da mesma forma');
    console.log('\n❌ PROBLEMA NÃO ESTÁ nas funções de geração de email');
    console.log('\n🔍 PRÓXIMOS PASSOS:');
    console.log('1. Verificar se os dados de entrada (dimensionAnalysis) são idênticos');
    console.log('2. Verificar se há diferenças no processamento antes da geração do email');
    console.log('3. Testar com dados reais para confirmar se o problema persiste');
    
    return {
        functionallyIdentical: true,
        differences: differences.filter(d => d.impact !== 'NENHUM'),
        recommendation: 'Investigar dados de entrada e processamento anterior'
    };
}

// Executar comparação
const result = compareEmailFunctions();
console.log('\nResultado da comparação:', result);