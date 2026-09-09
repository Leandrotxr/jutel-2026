# JUTEL 2026

Aplicação de chaveamento e placar dos Jogos Universitários do Inatel.

## O que já existe

- Home com as 6 atléticas e as modalidades
- Chaveamento mata-mata (duas equipes passam direto às semis)
- Clique no jogo para lançar o placar; o vencedor avança até o campeão
- Persistência local imediata; Supabase pronto para ligar
- Classificação geral, CS2, LoL e Valorant deixados para depois

## Como rodar

```bash
cd jutel-2026
npm install
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000).

## Como ligar o Supabase

1. Crie um projeto em [supabase.com](https://supabase.com)
2. SQL Editor → cole e execute `supabase/schema.sql`
3. Copie `.env.example` para `.env.local` e preencha URL e anon key
4. Reinicie `npm run dev`

Sem essas variáveis o app continua funcionando no navegador (localStorage).

## Próximos passos

1. Classificação geral (pontos 25/18/15… e 13/10/7…)
2. Fase de grupos de CS2, LoL e Valorant
3. Natação (provas) e Xadrez (round-robin)
4. Login da mesa/organização para travar quem lança placar
