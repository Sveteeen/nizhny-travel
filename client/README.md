# Клиент

React + TypeScript, сборка через Vite. Это фронт гида: места, маршруты, карта, планировщик и аккаунт.

Сервер должен быть запущен на `localhost:5000`, иначе данные не подтянутся. Карты тоже не заведутся без ключа Яндекса на бэке.

## Запуск

Из этой папки:

```bash
npm install
npm run dev
```

Откроется http://localhost:5173.

`build` / `preview` / `lint` — обычные vite-скрипты.

Удобнее поднимать всё сразу из корня репозитория: `npm run dev`. Там и клиент, и сервер.

## Где что лежит

```
src/
  App.tsx          вкладки и общая обвязка
  api/             запросы к /api
  components/      UI
    account/       логин, регистрация, кабинет
    maps/          яндекс-карты
    planner/       свой маршрут
  hooks/           useTravelData — места, маршруты, избранное
  styles/          css по кускам (фильтры, карточки, модалки, карта, planner)
  utils/
  types.ts
```

Токен сессии кладётся в `localStorage` (`components/account/storage.ts`).
