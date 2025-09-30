# Conteúdo do site da Stratica

Este documento reúne, de forma estruturada, todos os textos encontrados na página inicial do site da **Stratica** (https://stratica-site.vercel.app/index.html). Sempre que possível é indicado o elemento HTML (id ou classe da div/seção) onde o texto está localizado.

## Cabeçalho e navegação

O cabeçalho (<header>) traz o logotipo da Stratica e um menu de navegação principal. Os itens de menu são enlaces (<a>) dentro de um elemento <nav>:

*   **Visão** – link para a seção id="visao.
*   **Serviços** – link para a seção id="servicos.
*   **Diferenciais** – link para a seção id="diferenciais.
*   **Consultores** – link para a seção id="consultores.
*   **Contato** – botão/âncora com estilo de botão que abre a seção id="contato.

No modo móvel existe um menu hambúrguer com esses mesmos itens.

## Seção Hero (home)

**Elemento HTML:** <section id="home">  
Esta primeira seção é destacada pelo fundo claro e apresenta a proposta de valor da Stratica. O conteúdo textual está nas seguintes tags:

*   **Título:** <h1> – _“Estratégia + Tática”_.
*   **Subtítulo:** <h1> – _“Powered by AI”_.
*   **Descrição:** <p> – _“Transforme estratégias, pessoas e processos de gestão em resultados. Nossa metodologia integra expertise em consultoria com recursos de IA, proporcionando análises precisas e soluções eficazes a preços competitivos.”_【156955246138637†L149-L154】.
*   **Chamadas para ação:** dois enlaces (<a>) estilizados como botões:
    *   _“Agende Uma Reunião de Diagnóstico Gratuita”_【156955246138637†L155-L156】.
    *   _“Avalie Online Sua Maturidade em Gestão da Estratégia”_【156955246138637†L155-L157】.

## Seção de Logos de Clientes

**Elemento HTML:** <section class="py‑12" …>  
Esta seção introduz um carrossel de logotipos de clientes. O texto consiste apenas no título <h3>:

*   _“Quem Confia na Stratica”_【156955246138637†L165-L169】.

As imagens dos logos são carregadas via JavaScript e não contêm texto adicional.

## Visão – Augmented Intelligence

**Elemento HTML:** <section id="visao">  
Apresenta a visão da empresa sobre Inteligência Aumentada:

*   **Título:** <h2> – _“Augmented Intelligence”_【156955246138637†L177-L183】.
*   **Descrição:** <p> – A Stratica é uma consultoria estratégica "Powered by AI". Em um ambiente de negócios dinâmico, a integração da IA ao processo de gestão da estratégia é um imperativo. Trabalhamos para melhorar seus processos de gestão e unir a inteligência artificial e a humana – _Augmented Intelligence_ – ajudando nossos clientes a não apenas reagir, mas a se antecipar às mudanças do mercado, com recomendações embasadas, amplas e preditivas【156955246138637†L180-L184】.

## Nosso Portfólio de Serviços

**Elemento HTML:** <section id="servicos">  
Esta seção apresenta os serviços da Stratica. Seu cabeçalho traz:

*   **Título:** <h2> – _“Nosso Portfólio de Serviços”_【156955246138637†L188-L194】.
*   **Subtítulo:** <p> – _“Oferecemos um portfólio completo, da construção da estratégia até gestão da sua implementação e execução, garantindo resultados mensuráveis.”_【156955246138637†L190-L195】.

### Serviços principais

Cada serviço é apresentado em um cartão (div) com ícone, título (<h4>) e descrição (<p>):

1.  **Planejamento Estratégico** – _“Facilitação de todo o ciclo de planejamento, da análise situacional e de mercado à definição das Estratégias e seus desdobramentos em Táticas, incluindo uma definição clara de Responsáveis e Indicadores de Performance Chaves (KPIs) para medir o sucesso da implantação dos planos construídos. Tudo isso com apoio de ferramentas de IA que aceleram todo o processo”_【156955246138637†L196-L203】.
2.  **Execução da Estratégia** – _“Apoio na implantação de uma rigorosa governança operacional, garantindo que as estratégias sejam desdobradas em projetos táticos que avancem conforme o planejado, com ferramentas de gestão e painéis de controle adequados, apoiados por IA.”_【156955246138637†L204-L209】.
3.  **Inteligência de Mercado** – _“Pesquisas de mercado, análise de tendências locais e globais, mapeamento de concorrentes e insights, apoiados por ferramentas de IA, para identificar ameaças e oportunidades, e alimentar melhores decisões estratégicas.”_【156955246138637†L211-L215】.
4.  **Aceleração de Crescimento** – _“Consultoria para empresas que desejam acelerar seu crescimento, identificando e explorando novas oportunidades de mercado e modelos de negócio.”_【156955246138637†L216-L221】.
5.  **Marketing e Go‑To‑Market** – _“Estratégias de marketing e seus desdobramentos em campanhas e atividades de go‑to‑market, para expandir a presença e o alcance de produtos e serviços, nos mercados atuais ou para entrada em novos mercados.”_【156955246138637†L223-L228】.
6.  **Desenvolvimento de Lideranças** – _“Programas para desenvolver líderes eficazes e aumentar a produtividade de suas equipes, com foco em alinhamento, engajamento, comunicação e resultados, com apoio de ferramentas de colaboração digital.”_【156955246138637†L229-L234】.

### Serviços potencializados por IA

Uma subseção do portfólio, apresentada como cards escuros, descreve serviços apoiados por inteligência artificial. Cada item possui título (<h4>) e descrição (<p>):

1.  **AI‑Driven Business Research** – _“Uso de Machine Learning e IA Generativa para analisar dados de mercado, gerando insumos para o planejamento e a execução.”_【156955246138637†L237-L244】.
2.  **Planos Estratégicos com Agentes de IA** – _“Agentes de IA treinados em metodologias de planejamento estratégico que agilizam e enriquecem a construção de planos estratégicos em tempo real.”_【156955246138637†L245-L250】.
3.  **Inteligência Competitiva Automatizada** – _“Agentes de IA que monitoram continuamente o ambiente competitivo, filtrando ruídos, trazendo oportunidades e destacando insights.”_【156955246138637†L253-L257】.
4.  **IA para Vendas e Previsão de Demanda** – _“Algoritmos que geram previsões de demanda acuradas e aceleram vendas com lead scoring inteligente e enriquecimento de informações.”_【156955246138637†L259-L263】.
5.  **AI‑Driven Data Discovery** – _“Descubra respostas para perguntas que você nunca fez sobre seus dados através de análise de padrões e anomalias com IA.”_【156955246138637†L264-L269】.
6.  **Observabilidade de Sistemas com IA** – _“Inteligência Artificial para detectar problemas e gargalos em seus sistemas e processos antes que eles afetem os usuários e clientes.”_【156955246138637†L270-L275】.
7.  **Análise Comportamental com IA** – _“Ciência de Dados e IA para detectar probabilidades de vendas, churn, engajamento, fraudes e outros comportamentos.”_【156955246138637†L277-L281】.
8.  **Desenvolvimento de Aplicações com IA** – _“Aplicativos que usam Inteligência Artificial para cenários internos e externos, potencializando seus negócios com foco em pessoas.”_【156955246138637†L283-L286】.
9.  **Automação e Fluxos com Agentes de IA** – _“Automações adaptativas para atividades como buscar oportunidades de negócios, gerar conteúdos, responder a RFPs.”_【156955246138637†L288-L293】.

## Nossos Diferenciais Competitivos

**Elemento HTML:** <section id="diferenciais">  
Esta seção apresenta os diferenciais estratégicos da empresa, cada um com um ícone e descrição:

1.  **Soluções Sob Medida** – _“Não usamos modelos genéricos. Cada solução é adaptada para a realidade única da sua organização.”_【156955246138637†L310-L315】.
2.  **Agilidade e Velocidade** – _“Estrutura enxuta e sem burocracia para responder rapidamente às mudanças do mercado.”_【156955246138637†L318-L322】.
3.  **Atendimento Sênior** – _“Acesso direto a consultores experientes e sócios, que ‘colocam a mão na massa’ junto com seu time.”_【156955246138637†L323-L329】.
4.  **IA + Expertise Humana** – _“A IA aumenta, não substitui. Unimos a capacidade da IA com o julgamento e a criatividade humana.”_【156955246138637†L330-L335】.
5.  **Foco em Resultados** – _“Nosso sucesso é medido pelos resultados concretos que geramos para o seu negócio.”_【156955246138637†L340-L342】.
6.  **Transferência de Conhecimento** – _“Capacitamos seu time para que se tornem autossuficientes e sustentem os resultados a longo prazo.”_【156955246138637†L346-L349】.

## Nossos Consultores Principais

**Elemento HTML:** <section id="consultores">  
A seção começa com o texto: _“Conheça os especialistas que lideram nossa equipe de consultoria estratégica.”_【156955246138637†L355-L361】. Em seguida, apresenta cartões com foto, nome (<h4>), especialidade (<p> em vermelho) e biografia (<p> em cinza). Os consultores listados são:

1.  **Carlos Ferreira** – _Estratégia e Execução._ Professor de MBA na BSP e membro do IBGC, formado em Administração pela FEA‑USP com MBAs pela ESSEC e Dom Cabral. Possui mais de 30 anos de experiência em Gestão Estratégica e Marketing, tendo trabalhado 13 anos na Microsoft em cargos de direção e passagens pela IBM e Itautec【156955246138637†L365-L372】.
2.  **Marcos Braga** – _Liderança e Gestão._ Administrador pela FEA‑USP com MBA pela ESSEC e mestrado. Conselheiro com mais de 30 anos de experiência. Trabalhou na Deloitte como Diretor de Educação Empresarial, 14 anos na HSM como Diretor Presidente e foi CEO da SBPNL. É especialista em Liderança e Gestão【156955246138637†L374-L381】.
3.  **Reinaldo Roveri** – _Inteligência de Mercado._ Especialista em inteligência de mercado e estratégia com 20 anos de experiência, atendendo Microsoft, IBM, HP, SAP e outras. Trabalhou na Microsoft liderando Inteligência Competitiva. Graduado em Marketing pelo Mackenzie, com pós‑graduação e MBA pela FIA/USP【156955246138637†L383-L390】.
4.  **Anderson Figueiredo** – _Análises e Tendências._ Mais de 40 anos de carreira, sendo um dos analistas mais respeitados do Brasil. Passou por Cobra, Digirede e CPM (CapGemini) e foi gerente sênior na IDC Brasil, focando em tendências de TI e telecom. Graduado em Ciências da Computação pela Unicamp【156955246138637†L393-L400】.
5.  **Marcelo Negrini** – _IA e Transformação Digital._ Formado em Comunicação Social pela Cásper Líbero com especializações na UC Berkeley e no New York Institute of Technology. Possui mais de 30 anos de experiência em transformação digital e IA. Atuou na Microsoft, IBM, eBay e Naspers em posições de liderança global【156955246138637†L402-L408】.
6.  **Rodolfo Miceli** – _Gestão de Vendas._ Formado em Engenharia Eletrônica pela UFRJ com dois MBAs pela FGV e mais de 30 anos de experiência. Representou SAS Institute, IBM/Lotus e outras empresas. Trabalhou 12 anos na Microsoft Brasil e América Latina como responsável por Sales Excellence para 36 países【156955246138637†L411-L417】.
7.  **Hynde Fonseca Neto** – _Transformação Digital._ Mentor, consultor e conselheiro com mais de 30 anos de experiência em Finanças, Varejo e Franchising. Especializado em transformação digital, planejamento e desenvolvimento de negócios. Atua em conselhos consultivos, iniciativas ESG e programas de mentoria executiva. Formado em Computação e Administração, com pós‑graduação em Marketing pela ESPM【156955246138637†L419-L426】.
8.  **Victor Sichero** – _Planejamento Financeiro._ Administrador pela FAAP com MBA pela FGV/OHIO University. Foi VP Senior e CFO para a América Latina na FOX, CFO da Microsoft Brasil e Diretor Financeiro na GE. Atua em finanças, controladoria, planejamento e gestão de riscos. Membro do FEG e diretor do IBEF. Premiado pelo CFO mundial da Microsoft【156955246138637†L429-L435】.
9.  **Ana Venosa** – _Estratégia e Inovação._ Consultora e mentora com 30 anos de experiência executiva em inovação e governança. Trabalhou no Vale do Silício desenvolvendo estratégias para mercados emergentes. Atuou na Intel, Oracle e Bayer. Graduada em Engenharia Civil pela Mackenzie com MBA Executivo pela BSP/Toronto e programas em Stanford e Wharton【156955246138637†L438-L444】.
10.  **Alex Silva** – _US Office._ Diretor da Stratica nos EUA, com vasta experiência em expansão internacional. Vive nos EUA desde 1998 e especializou‑se em lançar operações na América Latina para empresas do Vale do Silício como Alteon, Nortel, NeScaler (Citrix) e Redline (Juniper). Formado em Processamento de Dados pela Mackenzie e em Publicidade pela FAAP【156955246138637†L446-L453】.

## Contato

**Elemento HTML:** <section id="contato">  
A seção de contato convida os visitantes a entrarem em contato com a Stratica e oferece um formulário. Os textos relevantes são:

*   **Título:** <h2> – _“Vamos Conversar?”_【156955246138637†L496-L503】.
*   **Descrição:** <p> – _“Chame a Stratica para um assessment estratégico gratuito. Você vai se surpreender. Preencha o formulário abaixo ou entre em contato diretamente.”_【156955246138637†L496-L504】.
*   **Campos do formulário:** rótulos <label> para _Nome_, _Email_ e _Mensagem_【156955246138637†L509-L518】.
*   **Botão de envio:** <button> – _“Enviar Mensagem”_【156955246138637†L520-L521】.
*   **Informações de contato:** dentro da subseção de contato existem links com ícones indicando:
    *   **Email:** _stratica@stratica.com.br_【156955246138637†L525-L529】.
    *   **Website:** _www.stratica.com.br_【156955246138637†L531-L533】.
*   **Mensagem final:** <p> – _“Estamos prontos para ajudar sua empresa a escrever o próximo capítulo de crescimento e sucesso estratégico.”_【156955246138637†L534-L536】.

## Rodapé

**Elemento HTML:** <footer>  
O rodapé contém dois pequenos parágrafos que fecham a página:

*   _“© 2025 Stratica. Todos os direitos reservados.”_【156955246138637†L544-L547】.
*   _“Consultoria Estratégica Powered by AI”_【156955246138637†L545-L548】.