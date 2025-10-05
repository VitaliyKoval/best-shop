# project-template-ua

## Опис

Цей проект — шаблон сучасного інтерфейсу магазину з каталогом, корзиною, деталями товару та іншими сторінками. Використовуються HTML, SCSS, JavaScript, Swiper.js та LocalStorage для інтерактиву.

---

## Структура проекту

- **src/pages/** — окремі сторінки сайту (home, catalog, cart, about, contact, product-details)
- **src/components/** — HTML-компоненти (header, footer, product-card)
- **src/assets/** — зображення, іконки, дані (data.json)
- **src/js/** — основний JavaScript (`main.js`)
- **src/scss/** — SCSS-стилі (структуровані по partials)

---

## Вимоги

- [Node.js](https://nodejs.org/) (версія 16+)
- npm (встановлюється разом з Node.js)

---

## Як запустити проект локально

1. **Клонувати репозиторій або завантажити файли**

2. **Встановити залежності**

   ```sh
   npm install
   ```

3. **Скомпілювати SCSS у CSS**

   - Для одноразової компіляції:
     ```sh
     npm run sass
     ```
   - Для автоматичної компіляції при зміні SCSS:
     ```sh
     npm run sass:watch
     ```

4. **Запустити локальний сервер**
   - Рекомендується використовувати [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) для VS Code, або:
     ```sh
     npm install --save-dev live-server
     npx live-server src
     ```
   - Відкрийте з сервером `src/index.html` у браузері.

---

## Технології

- **HTML5**
- **SCSS (Sass)**
- **JavaScript (ES6+)**
- **Swiper.js**
- **LocalStorage**
- **Fetch API**

---

## Що можна покращити

- Додати збірку через Webpack/Parcel для оптимізації ресурсів
- Реалізувати серверну частину для зберігання даних
- Додати unit-тести
- Покращити адаптивність та accessibility
- Додати багатомовність (i18n)
- Реалізувати реєстрацію/авторизацію користувачів
