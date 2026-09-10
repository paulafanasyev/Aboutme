import { useState } from 'react'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
}

interface Project {
  title: string
  description: string
  tech: string[]
  link?: string
}

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Привет! Я AI-ассистент Павла Афанасьева. Помогу вам с вопросами о сотрудничестве, рассчитаю стоимость проекта и отвечу на любые вопросы. Чем могу помочь?",
      sender: 'bot'
    }
  ])
  const [inputValue, setInputValue] = useState('')

  // Обновлённые цены по рынку России (2024) - сниженные минимальные значения
  const pricingInfo = {
    landingPage: { min: 15000, max: 60000, median: 35000 },
    corporateSite: { min: 40000, max: 150000, median: 80000 },
    ecommerce: { min: 80000, max: 350000, median: 180000 },
    webApp: { min: 100000, max: 500000, median: 250000 },
    mobileApp: { min: 150000, max: 700000, median: 400000 },
    apiDevelopment: { min: 50000, max: 250000, median: 120000 },
    consultation: { perHour: 3000 }
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user'
    }

    setMessages([...messages, userMessage])
    const userInput = inputValue.toLowerCase()
    setInputValue('')

    setTimeout(() => {
      let botResponse = ""
      
      // Логика ответов бота
      if (userInput.includes('цена') || userInput.includes('стоимость') || userInput.includes('сколько стоит')) {
        if (userInput.includes('лендинг') || userInput.includes('landing')) {
          botResponse = `📊 Лендинг пейдж:\n• Эконом: ${pricingInfo.landingPage.min.toLocaleString()}₽\n• Стандарт: ${pricingInfo.landingPage.median.toLocaleString()}₽ (рекомендую)\n• Премиум: ${pricingInfo.landingPage.max.toLocaleString()}₽\n\nСрок: 3-7 дней. Включает дизайн, вёрстку, адаптивность.`
        } else if (userInput.includes('корпоратив') || userInput.includes('сайт компании')) {
          botResponse = `🏢 Корпоративный сайт:\n• Базовый: ${pricingInfo.corporateSite.min.toLocaleString()}₽\n• Оптимальный: ${pricingInfo.corporateSite.median.toLocaleString()}₽\n• Полный: ${pricingInfo.corporateSite.max.toLocaleString()}₽\n\nСрок: 2-4 недели. Многостраничный сайт с CMS.`
        } else if (userInput.includes('интернет-магазин') || userInput.includes('ecommerce') || userInput.includes('магазин')) {
          botResponse = `🛒 Интернет-магазин:\n• Старт: ${pricingInfo.ecommerce.min.toLocaleString()}₽\n• Бизнес: ${pricingInfo.ecommerce.median.toLocaleString()}₽\n• Enterprise: ${pricingInfo.ecommerce.max.toLocaleString()}₽\n\nСрок: 3-6 недель. Каталог, корзина, оплата, интеграции.`
        } else if (userInput.includes('приложени') || userInput.includes('web app') || userInput.includes('веб-приложени')) {
          botResponse = `⚡ Веб-приложение:\n• MVP: ${pricingInfo.webApp.min.toLocaleString()}₽\n• Полноценное: ${pricingInfo.webApp.median.toLocaleString()}₽\n• Сложное: ${pricingInfo.webApp.max.toLocaleString()}₽\n\nСрок: 4-10 недель. Индивидуальная разработка под ключ.`
        } else if (userInput.includes('мобильн') || userInput.includes('app') || userInput.includes('ios') || userInput.includes('android')) {
          botResponse = `📱 Мобильное приложение:\n• Cross-platform: от ${pricingInfo.mobileApp.min.toLocaleString()}₽\n• Native iOS/Android: от ${pricingInfo.mobileApp.median.toLocaleString()}₽\n• Complex: до ${pricingInfo.mobileApp.max.toLocaleString()}₽\n\nСрок: 6-14 недель. React Native / Flutter / Swift / Kotlin.`
        } else if (userInput.includes('api') || userInput.includes('backend')) {
          botResponse = `🔌 API / Backend:\n• Простой: ${pricingInfo.apiDevelopment.min.toLocaleString()}₽\n• Средний: ${pricingInfo.apiDevelopment.median.toLocaleString()}₽\n• Сложный: ${pricingInfo.apiDevelopment.max.toLocaleString()}₽\n\nСрок: 2-6 недель. REST/GraphQL, базы данных, документация.`
        } else {
          botResponse = `💰 Доступные цены на разработку:\n\n• Лендинг: от ${pricingInfo.landingPage.min.toLocaleString()}₽\n• Корпоративный сайт: от ${pricingInfo.corporateSite.min.toLocaleString()}₽\n• Интернет-магазин: от ${pricingInfo.ecommerce.min.toLocaleString()}₽\n• Веб-приложение: от ${pricingInfo.webApp.min.toLocaleString()}₽\n• Мобильное приложение: от ${pricingInfo.mobileApp.min.toLocaleString()}₽\n• API/Backend: от ${pricingInfo.apiDevelopment.min.toLocaleString()}₽\n• Консультация: ${pricingInfo.consultation.perHour.toLocaleString()}₽/час\n\nНапишите тип проекта для детального расчёта!`
        }
      } else if (userInput.includes('сроки') || userInput.includes('время') || userInput.includes('как долго')) {
        botResponse = `⏱️ Типичные сроки разработки:\n\n• Лендинг: 5-10 дней\n• Корпоративный сайт: 2-4 недели\n• Интернет-магазин: 4-8 недель\n• Веб-приложение: 6-12 недель\n• Мобильное приложение: 8-16 недель\n\nТочные сроки зависят от сложности и требований проекта.`
      } else if (userInput.includes('контакт') || userInput.includes('связать') || userInput.includes('написать') || userInput.includes('позвонить')) {
        botResponse = `📞 Контакты Павла Афанасьева:\n\n✉️ Email: pavel.afanadyev@inbox.ru\n✈️ Telegram: @PaulPavel_it_dev\n📱 WhatsApp: +7 (914) 828-99-64\n\nНапишите напрямую — Павел ответит в ближайшее время!`
      } else if (userInput.includes('проект') || userInput.includes('портфолио') || userInput.includes('работы')) {
        botResponse = `🎯 Ключевые проекты Павла:\n\n• Глаз Бога — https://github.com/paulafanasyev/-_-\n• Mobile Harness — фреймворк для мобильной разработки\n• CryptoLayer — блокчейн решения\n• MCP — протокол интеграции AI\n• GenOffice — генеративные офисные инструменты\n• Cross-platform LLM Client — универсальный AI клиент\n• Mobile Agent — автономные мобильные агенты\n\nПосмотрите детали на GitHub: github.com/paulafanasyev`
      } else if (userInput.includes('технологии') || userInput.includes('стек') || userInput.includes('что использует')) {
        botResponse = `🛠️ Технологический стек:\n\nFrontend: React, TypeScript, Next.js, Tailwind CSS, Vue.js\nBackend: Node.js, Python, Go, PostgreSQL, MongoDB\nMobile: React Native, Flutter, Swift, Kotlin\nAI/ML: LLM integration, LangChain, TensorFlow\nDevOps: Docker, Kubernetes, AWS, CI/CD`
      } else if (userInput.includes('опыт') || userInput.includes('стаж') || userInput.includes('лет')) {
        botResponse = `👨‍💻 Опыт Павла:\n\n• 5+ лет в коммерческой разработке\n• 50+ успешных проектов\n• 30+ довольных клиентов\n• Экспертиза в Full-stack разработке\n• Специализация: веб-приложения, мобильные приложения, AI-интеграции\n\nРаботал с стартапами и enterprise-клиентами.`
      } else if (userInput.includes('сотрудничеств') || userInput.includes('заказать') || userInput.includes('начать')) {
        botResponse = `🤝 Как начать сотрудничество:\n\n1. Опишите ваш проект (тип, функции, бюджет)\n2. Получите оценку стоимости и сроков\n3. Обсудим детали в Telegram/WhatsApp\n4. Заключаем договор и начинаем работу\n\nНапишите мне тип проекта — рассчитаю точную стоимость!`
      } else if (userInput.includes('привет') || userInput.includes('здравствуй') || userInput.includes('hello')) {
        botResponse = `👋 Здравствуйте! Я AI-ассистент Павла Афанасьева.\n\nМогу помочь с:\n• Расчётом стоимости проекта\n• Оценкой сроков разработки\n• Информацией о технологиях\n• Организацией связи с Павлом\n\nЧто вас интересует?`
      } else if (userInput.includes('спасибо') || userInput.includes('благодарю')) {
        botResponse = `😊 Всегда рад помочь! Если появятся ещё вопросы — обращайтесь. Павел готов обсудить ваш проект в любое время!`
      } else {
        botResponse = `🤔 Интересный вопрос! \n\nЯ могу помочь вам с:\n• 💰 Расчётом стоимости проекта (спросите \"цена лендинга\" или \"сколько стоит интернет-магазин\")\n• ⏱️ Оценкой сроков разработки\n• 📞 Контактами Павла для связи\n• 🎯 Информацией о проектах и технологиях\n\nНапишите, что именно вас интересует!`
      }

      const botMessage: Message = {
        id: messages.length + 2,
        text: botResponse,
        sender: 'bot'
      }
      setMessages(prev => [...prev, botMessage])
    }, 800)
  }

  const projects: Project[] = [
    {
      title: "Глаз Бога",
      description: "Мощный инструмент для анализа и обработки данных с использованием современных технологий",
      tech: ["Python", "AI/ML", "Data Processing"],
      link: "https://github.com/paulafanasyev/-_-"
    },
    {
      title: "Mobile Harness",
      description: "Универсальный фреймворк для кроссплатформенной мобильной разработки с поддержкой горячего обновления",
      tech: ["React Native", "TypeScript", "Mobile"]
    },
    {
      title: "CryptoLayer",
      description: "Блокчейн-решение для безопасных транзакций и смарт-контрактов с интеграцией Web3",
      tech: ["Solidity", "Web3.js", "Blockchain"]
    },
    {
      title: "MCP (Model Context Protocol)",
      description: "Протокол интеграции AI-моделей для унифицированного взаимодействия с различными LLM",
      tech: ["Python", "AI", "API Design"]
    },
    {
      title: "GenOffice",
      description: "Генеративные офисные инструменты на базе AI для автоматизации документооборота",
      tech: ["React", "LLM", "Productivity"]
    },
    {
      title: "Cross-platform LLM Client",
      description: "Универсальный клиент для работы с различными языковыми моделями на всех платформах",
      tech: ["Electron", "TypeScript", "AI Integration"]
    },
    {
      title: "Mobile Agent",
      description: "Автономные мобильные агенты с возможностью выполнения задач без постоянного подключения",
      tech: ["React Native", "Edge Computing", "AI"]
    }
  ]

  const services = [
    {
      title: "Веб-разработка",
      description: "Создание современных веб-приложений и сайтов любой сложности: от лендингов до enterprise-систем",
      price: "от 25 000 ₽"
    },
    {
      title: "Мобильная разработка",
      description: "Кроссплатформенные и нативные приложения для iOS и Android с современным UX/UI",
      price: "от 250 000 ₽"
    },
    {
      title: "AI-интеграции",
      description: "Внедрение языковых моделей, чат-ботов и автоматизация процессов на базе AI",
      price: "от 100 000 ₽"
    },
    {
      title: "Backend & API",
      description: "Разработка масштабируемых backend-систем, REST/GraphQL API и баз данных",
      price: "от 80 000 ₽"
    },
    {
      title: "Консультации",
      description: "Экспертные консультации по архитектуре, кодревью и техническим решениям",
      price: "5 000 ₽/час"
    },
    {
      title: "Блокчейн решения",
      description: "Смарт-контракты, Web3 интеграции и децентрализованные приложения",
      price: "от 200 000 ₽"
    }
  ]

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <header className="bg-slate-800 shadow-lg sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-400">Павел Афанасьев</h1>
            <ul className="hidden md:flex space-x-6">
              <li><a href="#about" className="hover:text-purple-400 transition-colors">Обо мне</a></li>
              <li><a href="#projects" className="hover:text-purple-400 transition-colors">Проекты</a></li>
              <li><a href="#services" className="hover:text-purple-400 transition-colors">Услуги</a></li>
              <li><a href="#contact" className="hover:text-purple-400 transition-colors">Контакты</a></li>
            </ul>
            <a 
              href="https://t.me/PaulPavel_it_dev" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg font-semibold transition-colors text-sm"
            >
              Связаться
            </a>
          </nav>
        </div>
      </header>

      <section className="py-20 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Привет, я <span className="text-purple-400">Павел Афанасьев</span>
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Full-stack разработчик с экспертизой в создании веб-приложений, мобильных решений и AI-интеграций.
            Специализируюсь на React, TypeScript, Node.js и современных технологиях.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="#contact" className="bg-purple-600 hover:bg-purple-700 px-8 py-4 rounded-lg font-semibold transition-colors text-lg">
              Обсудить проект
            </a>
            <a href="#projects" className="border border-purple-400 hover:bg-purple-600 px-8 py-4 rounded-lg font-semibold transition-colors text-lg">
              Смотреть проекты
            </a>
            <a 
              href="https://github.com/paulafanasyev" 
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-400 hover:bg-gray-700 px-8 py-4 rounded-lg font-semibold transition-colors text-lg flex items-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.481 1.236-3.354-.24-.603-.535-3.065.116-6.39 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 3.326.349 5.787.108 6.39.77.873 1.235 2.042 1.235 3.353 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
          </div>
        </div>
      </section>

      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Обо мне</h2>
          <div className="max-w-4xl mx-auto text-gray-300 space-y-4">
            <p className="text-lg">
              Я опытный Full-stack разработчик с более чем 5-летним стажем в создании высоконагруженных 
              веб-приложений, мобильных решений и интеграции AI-технологий.
            </p>
            <p className="text-lg">
              Моя специализация — JavaScript/TypeScript экосистема (React, Node.js, Next.js), 
              мобильная разработка (React Native, Flutter), а также работа с большими языковыми моделями 
              и блокчейн-технологиями.
            </p>
            <p className="text-lg">
              Разрабатываю решения от идеи до продакшена, уделяя особое внимание качеству кода, 
              производительности и пользовательскому опыту.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
              <div className="bg-slate-800 p-6 rounded-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl font-bold text-purple-400 mb-2">5+</div>
                <div className="text-sm text-gray-400">Лет опыта</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl font-bold text-purple-400 mb-2">50+</div>
                <div className="text-sm text-gray-400">Проектов</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl font-bold text-purple-400 mb-2">30+</div>
                <div className="text-sm text-gray-400">Клиентов</div>
              </div>
              <div className="bg-slate-800 p-6 rounded-lg text-center hover:shadow-xl transition-shadow">
                <div className="text-4xl font-bold text-purple-400 mb-2">100%</div>
                <div className="text-sm text-gray-400">Удовлетворённость</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="projects" className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Мои проекты</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            portfolio включает разнообразные проекты — от AI-интеграций до блокчейн-решений. 
            Исходный код большинства проектов доступен на GitHub.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <div key={index} className="bg-slate-900 p-6 rounded-lg hover:shadow-xl transition-shadow border border-slate-700">
                <h3 className="text-xl font-semibold mb-3 text-purple-400">{project.title}</h3>
                <p className="text-gray-300 mb-4">{project.description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {project.tech.map((tech, techIndex) => (
                    <span key={techIndex} className="bg-slate-700 px-3 py-1 rounded-full text-sm text-gray-300">
                      {tech}
                    </span>
                  ))}
                </div>
                {project.link && (
                  <a 
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 transition-colors text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.481 1.236-3.354-.24-.603-.535-3.065.116-6.39 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 3.326.349 5.787.108 6.39.77.873 1.235 2.042 1.235 3.353 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                    Посмотреть на GitHub
                  </a>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <a 
              href="https://github.com/paulafanasyev"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Больше проектов на GitHub
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      <section id="services" className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Услуги и цены</h2>
          <p className="text-center text-gray-400 mb-12 max-w-2xl mx-auto">
            Цены указаны ориентировочные и могут меняться в зависимости от сложности проекта. 
            Точную оценку рассчитаю после обсуждения деталей.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {services.map((service, index) => (
              <div key={index} className="bg-slate-800 p-6 rounded-lg hover:shadow-xl transition-shadow border border-slate-700">
                <div className="w-14 h-14 bg-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-3 text-white">{service.title}</h3>
                <p className="text-gray-300 mb-4">{service.description}</p>
                <div className="text-purple-400 font-bold text-lg">{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="contact" className="py-16 bg-slate-800">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">Контакты</h2>
          <p className="text-center text-gray-300 mb-12 max-w-2xl mx-auto">
            Готов обсудить ваш проект! Свяжитесь со мной любым удобным способом — 
            отвечаю быстро и всегда открыт к новым интересным задачам.
          </p>
          <div className="max-w-3xl mx-auto">
            <div className="grid md:grid-cols-3 gap-6">
              <a 
                href="mailto:pavel.afanadyev@inbox.ru"
                className="bg-slate-900 p-6 rounded-lg text-center hover:shadow-xl transition-shadow border border-slate-700 group"
              >
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Email</h3>
                <p className="text-purple-400 text-sm break-all">pavel.afanadyev@inbox.ru</p>
              </a>
              
              <a 
                href="https://t.me/PaulPavel_it_dev"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 p-6 rounded-lg text-center hover:shadow-xl transition-shadow border border-slate-700 group"
              >
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.44-.42-1.38-.88.03-.24.38-.49 1.03-.74 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.89 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.07-.01.13-.02.25z"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">Telegram</h3>
                <p className="text-purple-400 text-sm">@PaulPavel_it_dev</p>
              </a>
              
              <a 
                href="https://wa.me/79148289964"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 p-6 rounded-lg text-center hover:shadow-xl transition-shadow border border-slate-700 group"
              >
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                </div>
                <h3 className="font-semibold mb-2">WhatsApp</h3>
                <p className="text-purple-400 text-sm">+7 (914) 828-99-64</p>
              </a>
            </div>
            
            <div className="mt-8 text-center">
              <p className="text-gray-400 mb-4">Или напишите мне напрямую:</p>
              <div className="flex flex-wrap justify-center gap-4">
                <a 
                  href="https://t.me/PaulPavel_it_dev"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-blue-500 hover:bg-blue-600 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.52-1.4.51-.46-.01-1.35-.26-2.01-.48-.81-.27-1.44-.42-1.38-.88.03-.24.38-.49 1.03-.74 4.04-1.76 6.74-2.92 8.09-3.48 3.85-1.6 4.64-1.89 5.17-1.89.11 0 .37.03.54.17.14.12.18.28.2.45-.01.07-.01.13-.02.25z"/>
                  </svg>
                  Написать в Telegram
                </a>
                <a 
                  href="https://wa.me/79148289964"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                  </svg>
                  Написать в WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-slate-900 py-8 border-t border-slate-700">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>&copy; 2024 Павел Афанасьев. Все права защищены.</p>
          <p className="mt-2 text-sm">Full-stack разработка • AI-интеграции • Мобильные приложения</p>
        </div>
      </footer>

      {/* Chat Button */}
      <button
        onClick={() => setIsChatOpen(!isChatOpen)}
        className="fixed bottom-6 right-6 bg-purple-600 hover:bg-purple-700 w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all z-50 hover:scale-110"
        aria-label="Открыть чат"
      >
        {isChatOpen ? (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isChatOpen && (
        <div className="fixed bottom-24 right-6 w-96 bg-slate-800 rounded-xl shadow-2xl z-50 border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white">AI Ассистент</h3>
                <p className="text-xs text-purple-200">Помощник по сотрудничеству</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                <span className="text-xs text-purple-200">Онлайн</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 space-y-3 bg-slate-800">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-line ${
                    message.sender === 'user' 
                      ? 'bg-purple-600 text-white rounded-br-md' 
                      : 'bg-slate-700 text-gray-100 rounded-bl-md'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
          </div>
          
          <div className="p-4 border-t border-slate-700 bg-slate-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Спросите о цене, сроках или услугах..."
                className="flex-1 bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 placeholder-gray-400"
              />
              <button 
                onClick={handleSendMessage} 
                className="bg-purple-600 hover:bg-purple-700 px-4 py-3 rounded-xl transition-colors flex items-center justify-center"
                aria-label="Отправить сообщение"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Бот отвечает на вопросы о ценах, сроках и услугах
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
