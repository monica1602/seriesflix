# SeriesFlix - Recomendações de Séries

Site que recomenda séries de TV com base na série que você gosta. Busque qualquer série e escolha o tipo de recomendação.

**Acesse agora:** [seriesflix.onrender.com](https://seriesflix.onrender.com)

---

## Funcionalidades

- **Busca completa** — acesso a todas as séries já publicadas via TMDb
- **Séries em alta** — mostra as séries mais populares do momento na tela inicial
- **3 tipos de recomendação:**
  - 🎭 **Mesmo Gênero** — séries que compartilham os mesmos gêneros
  - ✨ **Mesmo Estilo** — séries com temática e narrativa similar
  - 🌟 **Mesmo Elenco** — séries com atores/atrizes em comum
- **Detalhes completos** — sinopse, nota, elenco, número de temporadas
- **Design responsivo** — funciona no desktop e no celular

---

## Tecnologias

| Camada   | Tecnologia |
|----------|-----------|
| Backend  | Python / Flask |
| Frontend | HTML5, CSS3, JavaScript |
| API      | [TMDb](https://www.themoviedb.org/) (The Movie Database) |
| Deploy   | [Render](https://render.com) |
| Servidor | Gunicorn |

---

## Como rodar localmente

```bash
# Clone o repositório
git clone https://github.com/monica1602/seriesflix.git
cd seriesflix

# Instale as dependências
pip install -r requirements.txt

# Configure a chave da API TMDb
# Windows:
set TMDB_API_KEY=sua_chave_aqui
# Linux/Mac:
export TMDB_API_KEY=sua_chave_aqui

# Inicie o servidor
python app.py
```

Acesse: http://localhost:5050

---

## Como obter a chave da API TMDb (grátis)

1. Crie uma conta em [themoviedb.org/signup](https://www.themoviedb.org/signup)
2. Confirme o email
3. Vá em [Configurações > API](https://www.themoviedb.org/settings/api)
4. Clique "Criar" > "Developer" > preencha o formulário
5. Copie a **API Key (v3 auth)**

---

## Estrutura do Projeto

```
seriesflix/
├── app.py              # Backend Flask (rotas e proxy TMDb)
├── requirements.txt    # Dependências Python
├── render.yaml         # Configuração de deploy no Render
├── .gitignore
└── static/
    ├── index.html      # Página principal
    ├── styles.css      # Estilização
    └── app.js          # Lógica do frontend
```

---

## Deploy no Render

O projeto já está configurado para deploy automático:

1. Faça fork ou clone este repositório no GitHub
2. No [Render](https://render.com), crie um novo **Web Service**
3. Conecte ao repositório do GitHub
4. Adicione a variável de ambiente `TMDB_API_KEY` com sua chave
5. O Render detecta o `render.yaml` e faz o deploy automaticamente

---

## Licença

Este projeto é de uso educacional. Os dados de séries são fornecidos pelo [TMDb](https://www.themoviedb.org/) e estão sujeitos aos seus termos de uso.

Este produto usa a API do TMDb mas não é endossado ou certificado pelo TMDb.
