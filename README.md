# Bíblia CCB - PWA

Uma Progressive Web App para ler a Bíblia.

## Funcionalidades

- Leitura offline
- Lista de livros (Antigo e Novo Testamento)
- Navegação por capítulos
- Capítulo do dia aleatório
- Instalável como app nativo

## Como usar

Abra o arquivo `index.html` em um servidor web local ou online.

Para testar localmente com Python:
```bash
python3 -m http.server 8000
```
Acesse: `http://localhost:8000`

## Instalação como App

No navegador, procure pelo ícone de instalação na barra de endereços ou use o menu "Adicionar à tela inicial".

## Estrutura

```
/biblia-pwa
├── index.html              # Página inicial
├── pages/                  # Páginas do app
│   ├── book_selection.html
│   ├── chapter_selection.html
│   └── chapter_read.html
├── biblia_json/            # Dados da Bíblia
├── css/                    # Estilos (Materialize)
├── js/                     # Scripts
├── service_worker.js       # Cache offline
└── manifest.json           # Manifesto PWA
```

## Tecnologias

- HTML, CSS, JavaScript (Vanilla)
- Materialize CSS
- Service Worker (PWA)
