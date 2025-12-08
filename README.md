

# BackEnd


my-app/

│   ├── assets/               # Imagens, fontes, ícones usados no app

│   ├── components/           # Componentes reutilizáveis (botões, inputs, cards, etc.)

│   ├── constants/            # Cores, tamanhos de fonte, textos fixos, etc.

│   ├── context/              # Centralizar e compartilhar o estado global do app

│   ├── firebase/              # Ligação com o banco e configuração

│   ├── hooks/                # Hooks customizados (ex: useAuth, useFetch)

│   ├── jsons/              # alguns dados falsos usados no desenvolvimento do front-end

│   ├── navigation/           # Navegação do app (ex: stacks, tabs, etc.)

│   ├── pages/                # Telas do app, organizadas por funcionalidade

│   │   ├── Home/             # Página/tela inicial

│   │   ├── SignIn/           # Página de login

│   │   └── SignUp/           # Página de cadastro

│   │   └── E outras páginas...

│   ├── services/             # Integração com APIs (ex: api.js com axios, auth.js com Firebase)

│   └── utils/                # Funções auxiliares (ex: validações, formatadores)

│

├── .env                      # Variáveis de ambiente do frontend (ex: URL da API)

├── App.js                    # Arquivo principal que inicia o app React Native

├── package.json              # Dependências e scripts do frontend

└── babel.config.js           # Configuração do Babel para transformar código moderno JS
