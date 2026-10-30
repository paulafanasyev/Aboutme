// Portfolio data
const projects = [
  { number: '01', category: 'Образование · Дети', title: 'Я-Зарядка ИИ', status: 'Реализован', text: 'Игровая система для ежедневной зарядки детей 5–14 лет: карта мира, миссии, награды и семейные челленджи.', tags: ['Веб', 'ИИ', 'RuStore'], href: 'https://github.com/paulafanasyev/ya-zaryadka-ai' },
  { number: '02', category: 'Образование · ИИ', title: 'ИИ-репетитор английского и математики', status: 'Реализован', text: 'Триязычный ИИ-репетитор RU / EN / VI с шестью ИИ-учителями, голосом, аватарами, уроками и мини-играми.', tags: ['React', 'Node', 'Prisma'], href: 'https://github.com/paulafanasyev/ai-english-teacher' },
  { number: '03', category: 'Социальное · Перевод', title: 'Мост · Два Сердца', status: 'Реализован', text: 'Кросс-культурная платформа Китай — Россия с голосовым переводом, совместимостью анкет и тремя языками.', tags: ['React', 'Express', 'WebSocket'], href: 'https://github.com/paulafanasyev/bridges' },
  { number: '04', category: 'Поиск · Аналитика', title: 'Глаз Бога', status: 'В разработке', text: 'Интеллектуальный поиск и аналитика по открытым источникам: агрегация публичных данных, быстрые запросы и понятный интерфейс.', tags: ['Python', 'API', 'Telegram'], href: 'https://github.com/paulafanasyev' },
  { number: '05', category: 'Платформа · Общественные сервисы', title: 'Мир Самозанятых', status: 'В разработке', text: 'Продуктовая линейка АНО ЦПС: веб, мобильный клиент и серверная часть, сервисы поддержки сообщества и контур ИИ.', tags: ['Python', 'TypeScript', 'Flutter'], href: 'https://github.com/paulafanasyev/mir-samozanyatykh-' },
  { number: '06', category: 'ИИ-агент · Аватар', title: 'Светлана', status: 'В разработке', text: 'Русскоязычный ИИ-агент и реалистичный аватар Светлана для веба и Android: управление устройством, память, файлы и расписания.', tags: ['TypeScript', 'Android', 'MCP'], href: 'https://github.com/paulafanasyev/Mobile-agent-russkiy-termuxMCP-OX' },
]

const services = [
  ['01', 'Разработка веб-систем', 'Веб и API под ключ: React, Node, PostgreSQL, PWA, размещение и сопровождение.'],
  ['02', 'Продукты с ИИ', 'ИИ-агенты, голосовые интерфейсы, языковые модели, MCP, аватары и продуктовые кабинеты.'],
  ['03', 'Мобильные приложения', 'Capacitor, Flutter и Android: от прототипа до сборки и выпуска.'],
  ['04', 'Подключение к существующему проекту', 'Архитектура, новые функции, интеграции, выпуск и поддержка команды.'],
]

export { projects, services }
