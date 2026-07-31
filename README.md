# 🎬 SeriesFlix - Recomendações Inteligentes de Séries

**SeriesFlix** é uma plataforma web de recomendação de séries de TV que ajuda você a descobrir sua próxima série favorita. O site utiliza a base de dados do TMDb (The Movie Database), que conta com informações de **milhares de séries de todo o mundo** — incluindo séries brasileiras, americanas, coreanas, europeias e muito mais.

**Acesse agora:** [https://seriesflix.onrender.com](https://seriesflix.onrender.com)

---

## Como Funciona

O SeriesFlix funciona de forma simples e intuitiva:

1. **Busque uma série** que você já assistiu e gostou — pode ser qualquer uma (ex: O Mentalista, Gossip Girl, Breaking Bad, Dark, Bridgerton...)
2. **Veja os detalhes** — sinopse, nota dos usuários, número de temporadas, elenco principal com fotos
3. **Escolha o tipo de recomendação** que deseja receber:

| Tipo | O que faz | Exemplo |
|------|-----------|---------|
| 🎭 **Mesmo Gênero** | Encontra séries que compartilham os mesmos gêneros (Drama, Crime, Comédia, etc.) | Se você gosta de Breaking Bad (Drama/Crime/Thriller), vai receber outras séries de Drama, Crime e Thriller |
| ✨ **Mesmo Estilo** | Usa algoritmo de similaridade para encontrar séries com narrativa, tom e temática parecidos | Se você gosta de Dark, vai receber séries com clima misterioso e complexo similares |
| 🌟 **Mesmo Elenco** | Mostra outras séries onde os mesmos atores e atrizes atuam | Se você gosta de The Last of Us, vai ver outras séries com Pedro Pascal |

4. **Navegue pelas recomendações** — cada resultado é clicável, então você pode explorar infinitamente série após série

---

## Funcionalidades

- **Busca em tempo real** — conforme você digita, os resultados aparecem instantaneamente
- **Base de dados completa** — acesso a todas as séries cadastradas no TMDb (atualizada diariamente)
- **Séries em alta** — a tela inicial já mostra as séries mais populares do momento para você explorar
- **Informações detalhadas** — cada série exibe poster, sinopse em português, nota média, ano de estreia, número de temporadas e status (finalizada ou em andamento)
- **Elenco com fotos** — veja os atores principais e seus personagens
- **3 algoritmos de recomendação** — gênero, estilo e elenco oferecem perspectivas diferentes de descoberta
- **Design moderno e escuro** — interface elegante com tema dark, agradável para navegar
- **Responsivo** — funciona perfeitamente no celular, tablet e desktop
- **Rápido** — as buscas e recomendações carregam em poucos segundos

---

## Tecnologias Utilizadas

| Camada | Tecnologia | Função |
|--------|-----------|--------|
| Backend | Python 3.10 / Flask | Servidor web e proxy para a API do TMDb |
| Frontend | HTML5, CSS3, JavaScript | Interface do usuário interativa |
| Base de dados | [TMDb API](https://www.themoviedb.org/) | Fornece dados de séries, elenco e recomendações |
| Servidor de produção | Gunicorn | Servidor WSGI para deploy |
| Hospedagem | [Render](https://render.com) | Deploy automático na nuvem |
| Versionamento | Git + GitHub | Controle de código fonte |

---

## Como Rodar Localmente

```bash
# 1. Clone o repositório
git clone https://github.com/monica1602/seriesflix.git
cd seriesflix

# 2. Instale as dependências
pip install -r requirements.txt

# 3. Configure a chave da API TMDb (veja instruções abaixo)
# Windows:
set TMDB_API_KEY=sua_chave_aqui
# Linux/Mac:
export TMDB_API_KEY=sua_chave_aqui

# 4. Inicie o servidor
python app.py
```

Acesse: http://localhost:5050

---

## Como Obter a Chave da API TMDb (grátis)

A API do TMDb é gratuita para uso não comercial. Para obter sua chave:

1. Crie uma conta em [themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Confirme seu email
3. Acesse [Configurações > API](https://www.themoviedb.org/settings/api)
4. Clique em "Criar" > escolha "Developer" > preencha o formulário
5. Copie a **API Key (v3 auth)**

---

## Estrutura do Projeto

```
seriesflix/
├── app.py              # Backend Flask - rotas da API e proxy para TMDb
├── requirements.txt    # Dependências Python (Flask, Gunicorn)
├── render.yaml         # Configuração automática de deploy no Render
├── .gitignore          # Arquivos ignorados pelo Git
├── README.md           # Esta documentação
└── static/
    ├── index.html      # Página principal do site
    ├── styles.css      # Estilização completa (tema dark, responsivo)
    └── app.js          # Lógica do frontend (busca, detalhes, recomendações)
```

---

## Deploy no Render

O projeto está configurado para deploy automático via `render.yaml`:

1. Faça fork deste repositório no GitHub
2. Crie uma conta no [Render](https://render.com) (conecte com GitHub)
3. Clique **"New" > "Web Service"** e selecione o repositório
4. Adicione a variável de ambiente `TMDB_API_KEY` com sua chave
5. Clique **"Create Web Service"** — em ~2 minutos o site estará online

---

## Licença e Créditos

Este projeto foi desenvolvido para fins educacionais.

Os dados de séries, imagens e metadados são fornecidos pela [The Movie Database (TMDb)](https://www.themoviedb.org/). Este produto utiliza a API do TMDb mas **não é endossado ou certificado pelo TMDb**.

---

Desenvolvido por [monica1602](https://github.com/monica1602)
