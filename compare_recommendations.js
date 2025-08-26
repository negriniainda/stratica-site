// Comparação das funções getDimensionRecommendations
// Site vs Edge Function

// Função do site (assessment.html)
function getDimensionRecommendationsSite(dimension, level) {
    const recommendations = {
        'Liderança': {
            1: 'Estabeleça uma visão clara e comunicável para a organização. Defina valores organizacionais e promova uma cultura de liderança participativa.',
            2: 'Desenvolva um sistema de governança mais estruturado. Implemente processos de tomada de decisão mais claros e melhore a comunicação entre líderes.',
            3: 'Fortaleça o desenvolvimento de lideranças em todos os níveis. Implemente programas de mentoria e sucessão de líderes.',
            4: 'Promova uma cultura de inovação e melhoria contínua. Desenvolva líderes transformacionais que inspirem e motivem suas equipes.',
            5: 'Mantenha a excelência em liderança e continue evoluindo as práticas de gestão. Seja referência em liderança para outras organizações.'
        },
        'Estratégias e Planos': {
            1: 'Desenvolva um planejamento estratégico formal com objetivos claros e mensuráveis. Estabeleça indicadores de desempenho básicos.',
            2: 'Melhore o processo de planejamento estratégico com maior participação das partes interessadas. Implemente um sistema de monitoramento mais robusto.',
            3: 'Desenvolva cenários alternativos e planos de contingência. Melhore a integração entre planejamento estratégico e operacional.',
            4: 'Implemente um sistema avançado de gestão estratégica com análise de riscos e oportunidades. Promova a inovação estratégica.',
            5: 'Mantenha a excelência em planejamento estratégico e continue refinando os processos. Seja referência em gestão estratégica.'
        },
        'Clientes': {
            1: 'Implemente pesquisas básicas de satisfação do cliente. Estabeleça canais de comunicação mais efetivos com os clientes.',
            2: 'Desenvolva um sistema mais estruturado de gestão do relacionamento com clientes. Melhore os processos de atendimento.',
            3: 'Implemente programas de fidelização e segmentação de clientes. Desenvolva produtos/serviços baseados nas necessidades dos clientes.',
            4: 'Desenvolva uma estratégia omnichannel e personalização da experiência do cliente. Implemente análise avançada de dados de clientes.',
            5: 'Mantenha a excelência no relacionamento com clientes e continue inovando na experiência oferecida.'
        },
        'Sociedade': {
            1: 'Desenvolva práticas básicas de responsabilidade social. Estabeleça políticas de sustentabilidade e ética empresarial.',
            2: 'Melhore o engajamento com a comunidade local. Implemente programas de voluntariado e responsabilidade ambiental.',
            3: 'Desenvolva parcerias estratégicas com organizações sociais. Implemente práticas avançadas de sustentabilidade.',
            4: 'Torne-se um agente de transformação social positiva. Desenvolva inovações que beneficiem a sociedade.',
            5: 'Mantenha a liderança em responsabilidade social e continue sendo referência em práticas sustentáveis.'
        },
        'Informações e Conhecimento': {
            1: 'Implemente sistemas básicos de gestão da informação. Estabeleça processos de coleta e análise de dados essenciais.',
            2: 'Melhore a qualidade e acessibilidade das informações. Desenvolva competências analíticas na organização.',
            3: 'Implemente sistemas avançados de business intelligence. Promova a cultura de decisões baseadas em dados.',
            4: 'Desenvolva capacidades de análise preditiva e inteligência artificial. Crie uma organização verdadeiramente orientada por dados.',
            5: 'Mantenha a excelência em gestão da informação e conhecimento. Continue inovando em tecnologias de dados.'
        },
        'Pessoas': {
            1: 'Desenvolva políticas básicas de recursos humanos. Implemente processos de recrutamento e seleção mais estruturados.',
            2: 'Melhore os programas de treinamento e desenvolvimento. Implemente sistemas de avaliação de desempenho mais efetivos.',
            3: 'Desenvolva programas de desenvolvimento de carreira e sucessão. Melhore o clima organizacional e engajamento.',
            4: 'Implemente práticas avançadas de gestão de talentos. Promova uma cultura de alta performance e inovação.',
            5: 'Mantenha a excelência em gestão de pessoas e continue sendo um empregador de referência no mercado.'
        },
        'Processos': {
            1: 'Mapeie e documente os processos principais. Implemente controles básicos de qualidade e padronização.',
            2: 'Melhore a eficiência dos processos através de análise e otimização. Implemente indicadores de processo.',
            3: 'Desenvolva uma abordagem sistemática de melhoria de processos. Implemente automação onde apropriado.',
            4: 'Implemente gestão avançada de processos com foco em inovação. Desenvolva processos ágeis e adaptativos.',
            5: 'Mantenha a excelência operacional e continue inovando em gestão de processos.'
        },
        'Resultados': {
            1: 'Estabeleça indicadores básicos de desempenho financeiro e operacional. Implemente relatórios regulares de resultados.',
            2: 'Desenvolva um sistema mais abrangente de medição de resultados. Melhore a análise de tendências e comparações.',
            3: 'Implemente balanced scorecard ou sistema similar. Desenvolva análises mais sofisticadas de causa e efeito.',
            4: 'Desenvolva capacidades avançadas de análise de resultados e benchmarking. Implemente gestão de valor para stakeholders.',
            5: 'Mantenha resultados de excelência e continue sendo referência em performance organizacional.'
        }
    };
    
    return recommendations[dimension] ? recommendations[dimension][level] : 'Recomendação não encontrada';
}

// Função da Edge Function (index.ts)
function getDimensionRecommendationsEdge(dimension, level) {
    const recommendations = {
        'Liderança': {
            1: 'Estabeleça uma visão clara e comunicável para a organização. Defina valores organizacionais e promova uma cultura de liderança participativa.',
            2: 'Desenvolva um sistema de governança mais estruturado. Implemente processos de tomada de decisão mais claros e melhore a comunicação entre líderes.',
            3: 'Fortaleça o desenvolvimento de lideranças em todos os níveis. Implemente programas de mentoria e sucessão de líderes.',
            4: 'Promova uma cultura de inovação e melhoria contínua. Desenvolva líderes transformacionais que inspirem e motivem suas equipes.',
            5: 'Mantenha a excelência em liderança e continue evoluindo as práticas de gestão. Seja referência em liderança para outras organizações.'
        },
        'Estratégias e Planos': {
            1: 'Desenvolva um planejamento estratégico formal com objetivos claros e mensuráveis. Estabeleça indicadores de desempenho básicos.',
            2: 'Melhore o processo de planejamento estratégico com maior participação das partes interessadas. Implemente um sistema de monitoramento mais robusto.',
            3: 'Desenvolva cenários alternativos e planos de contingência. Melhore a integração entre planejamento estratégico e operacional.',
            4: 'Implemente um sistema avançado de gestão estratégica com análise de riscos e oportunidades. Promova a inovação estratégica.',
            5: 'Mantenha a excelência em planejamento estratégico e continue refinando os processos. Seja referência em gestão estratégica.'
        },
        'Processos': {
            1: 'Mapeie e documente os processos principais. Implemente controles básicos de qualidade e padronização.',
            2: 'Melhore a eficiência dos processos através de análise e otimização. Implemente indicadores de processo.',
            3: 'Desenvolva uma abordagem sistemática de melhoria de processos. Implemente automação onde apropriado.',
            4: 'Implemente gestão avançada de processos com foco em inovação. Desenvolva processos ágeis e adaptativos.',
            5: 'Mantenha a excelência operacional e continue inovando em gestão de processos.'
        },
        'Pessoas': {
            1: 'Desenvolva políticas básicas de recursos humanos. Implemente processos de recrutamento e seleção mais estruturados.',
            2: 'Melhore os programas de treinamento e desenvolvimento. Implemente sistemas de avaliação de desempenho mais efetivos.',
            3: 'Desenvolva programas de desenvolvimento de carreira e sucessão. Melhore o clima organizacional e engajamento.',
            4: 'Implemente práticas avançadas de gestão de talentos. Promova uma cultura de alta performance e inovação.',
            5: 'Mantenha a excelência em gestão de pessoas e continue sendo um empregador de referência no mercado.'
        },
        'Clientes': {
            1: 'Implemente pesquisas básicas de satisfação do cliente. Estabeleça canais de comunicação mais efetivos com os clientes.',
            2: 'Desenvolva um sistema mais estruturado de gestão do relacionamento com clientes. Melhore os processos de atendimento.',
            3: 'Implemente programas de fidelização e segmentação de clientes. Desenvolva produtos/serviços baseados nas necessidades dos clientes.',
            4: 'Desenvolva uma estratégia omnichannel e personalização da experiência do cliente. Implemente análise avançada de dados de clientes.',
            5: 'Mantenha a excelência no relacionamento com clientes e continue inovando na experiência oferecida.'
        },
        'Resultados': {
            1: 'Estabeleça indicadores básicos de desempenho financeiro e operacional. Implemente relatórios regulares de resultados.',
            2: 'Desenvolva um sistema mais abrangente de medição de resultados. Melhore a análise de tendências e comparações.',
            3: 'Implemente balanced scorecard ou sistema similar. Desenvolva análises mais sofisticadas de causa e efeito.',
            4: 'Desenvolva capacidades avançadas de análise de resultados e benchmarking. Implemente gestão de valor para stakeholders.',
            5: 'Mantenha resultados de excelência e continue sendo referência em performance organizacional.'
        },
        'Sociedade': {
            1: 'Desenvolva práticas básicas de responsabilidade social. Estabeleça políticas de sustentabilidade e ética empresarial.',
            2: 'Melhore o engajamento com a comunidade local. Implemente programas de voluntariado e responsabilidade ambiental.',
            3: 'Desenvolva parcerias estratégicas com organizações sociais. Implemente práticas avançadas de sustentabilidade.',
            4: 'Torne-se um agente de transformação social positiva. Desenvolva inovações que beneficiem a sociedade.',
            5: 'Mantenha a liderança em responsabilidade social e continue sendo referência em práticas sustentáveis.'
        },
        'Informações e Conhecimento': {
            1: 'Implemente sistemas básicos de gestão da informação. Estabeleça processos de coleta e análise de dados essenciais.',
            2: 'Melhore a qualidade e acessibilidade das informações. Desenvolva competências analíticas na organização.',
            3: 'Implemente sistemas avançados de business intelligence. Promova a cultura de decisões baseadas em dados.',
            4: 'Desenvolva capacidades de análise preditiva e inteligência artificial. Crie uma organização verdadeiramente orientada por dados.',
            5: 'Mantenha a excelência em gestão da informação e conhecimento. Continue inovando em tecnologias de dados.'
        }
    };
    
    return recommendations[dimension] ? recommendations[dimension][level] : 'Recomendação não encontrada';
}

// Função de comparação
function compareRecommendations() {
    const dimensions = ['Liderança', 'Estratégias e Planos', 'Processos', 'Pessoas', 'Clientes', 'Resultados', 'Sociedade', 'Informações e Conhecimento'];
    const levels = [1, 2, 3, 4, 5];
    
    console.log('=== COMPARAÇÃO DAS FUNÇÕES getDimensionRecommendations ===\n');
    
    let totalComparisons = 0;
    let identicalRecommendations = 0;
    let differences = [];
    
    dimensions.forEach(dimension => {
        console.log(`\n--- DIMENSÃO: ${dimension} ---`);
        
        levels.forEach(level => {
            totalComparisons++;
            const siteRec = getDimensionRecommendationsSite(dimension, level);
            const edgeRec = getDimensionRecommendationsEdge(dimension, level);
            
            if (siteRec === edgeRec) {
                identicalRecommendations++;
                console.log(`✓ Nível ${level}: IDÊNTICAS`);
            } else {
                differences.push({
                    dimension,
                    level,
                    site: siteRec,
                    edge: edgeRec
                });
                console.log(`✗ Nível ${level}: DIFERENTES`);
                console.log(`  Site: ${siteRec}`);
                console.log(`  Edge: ${edgeRec}`);
            }
        });
    });
    
    console.log('\n=== RESUMO DA COMPARAÇÃO ===');
    console.log(`Total de comparações: ${totalComparisons}`);
    console.log(`Recomendações idênticas: ${identicalRecommendations}`);
    console.log(`Diferenças encontradas: ${differences.length}`);
    console.log(`Percentual de compatibilidade: ${((identicalRecommendations / totalComparisons) * 100).toFixed(2)}%`);
    
    if (differences.length > 0) {
        console.log('\n=== DIFERENÇAS DETALHADAS ===');
        differences.forEach((diff, index) => {
            console.log(`\n${index + 1}. ${diff.dimension} - Nível ${diff.level}:`);
            console.log(`   Site: "${diff.site}"`);
            console.log(`   Edge: "${diff.edge}"`);
        });
    } else {
        console.log('\n🎉 TODAS AS RECOMENDAÇÕES SÃO IDÊNTICAS!');
    }
    
    return {
        total: totalComparisons,
        identical: identicalRecommendations,
        differences: differences.length,
        compatibility: ((identicalRecommendations / totalComparisons) * 100).toFixed(2)
    };
}

// Executar a comparação
compareRecommendations();