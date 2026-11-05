# Oficina Conexão

Aplicativo de teste construído com React 19, Vite e Supabase.

## Tecnologias

- React 19.3.1
- Vite 8.3.5
- Supabase JS 2.119.0
- Lucide React 1.68.0

## Executar localmente

Requer Node.js 20.19+ ou 22.12+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Preencha `.env.local` com a URL do projeto Supabase e a chave publicável (publishable/anon). Nunca use a chave `service_role` no navegador.

## Banco de dados

Depois de reativar o projeto Supabase, execute o conteúdo de `supabase/schema.sql` no SQL Editor. O aplicativo utiliza a tabela `public.nomes_teste`.

**Atenção:** este é um ambiente de demonstração. As políticas permitem leitura e cadastro públicos sem autenticação. Use apenas nomes fictícios ou dados não sensíveis até implementar login e regras de acesso adequadas.

## Deploy na Vercel

Importe este repositório na Vercel, selecione Vite e configure as variáveis:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

O comando de build é `npm run build` e a pasta de saída é `dist`.
