import { useRef, useState } from 'react'

const projects = [
  { number: '01', category: 'EdTech · Kids', title: 'Я-Зарядка AI', status: 'Реализован · Веду активно', text: 'Игровая система для ежедневной зарядки детей 5–14 лет: карта мира, миссии, награды и семейные челленджи.', tags: ['HTML', 'AI', 'RuStore'], href: 'https://github.com/paulafanasyev/ya-zaryadka-ai', accent: 'mint' },
  { number: '02', category: 'EdTech · AI', title: 'AI English & Math Teacher', status: 'Реализован · Веду активно', text: 'Триязычный AI-репетитор RU / EN / VI с шестью AI-учителями, голосом, аватарами, уроками и мини-играми.', tags: ['React', 'Node', 'Prisma', 'Capacitor'], href: 'https://github.com/paulafanasyev/ai-english-teacher', accent: 'lavender' },
  { number: '03', category: 'Social · i18n', title: 'Bridge · Два Сердца', status: 'Реализован · Веду активно', text: 'Кросс-культурная платформа Китай — Россия с голосовым переводом, совместимостью анкет и тремя языками.', tags: ['React', 'Express', 'WebSocket', 'Capacitor'], href: 'https://github.com/paulafanasyev/bridges', accent: 'peach' },
  { number: '04', category: 'Search · Analytics', title: 'Глаз Бога', status: 'В разработке · Веду активно', text: 'Интеллектуальный поиск и аналитика по открытым источникам: агрегация публичных данных, быстрые запросы и понятный интерфейс.', tags: ['Python', 'API', 'Telegram'], href: 'https://github.com/paulafanasyev', accent: 'blue' },
  { number: '05', category: 'Platform · Civic', title: 'Мир Самозанятых', status: 'В разработке · Веду активно', text: 'Продуктовая линейка АНО ЦПС: веб, мобильный клиент и backend, сервисы поддержки сообщества и AI-контур.', tags: ['Python', 'TypeScript', 'Flutter'], href: 'https://github.com/paulafanasyev/mir-samozanyatykh-', accent: 'green' },
  { number: '06', category: 'AI Agent · Avatar', title: 'Svetlana App', status: 'В разработке · Веду активно', text: 'Русскоязычный AI-агент и realtime-аватар Светлана для веба и Android: MCP, accessibility, память, файлы и расписания.', tags: ['TypeScript', 'Android', 'MCP', '3D'], href: 'https://github.com/paulafanasyev/Mobile-agent-russkiy-termuxMCP-OX', accent: 'rose' },
]

const services = [
  ['01', 'Full-stack разработка', 'Веб и API под ключ: React, Node, PostgreSQL, PWA, деплой и сопровождение.'],
  ['02', 'AI-продукты', 'AI-агенты, голосовые интерфейсы, LLM-интеграции, MCP, аватары и продуктовые кабинеты.'],
  ['03', 'Мобильные клиенты', 'Capacitor, Flutter и Android: от прототипа до сборки и релиза.'],
  ['04', 'Подключение к существующему проекту', 'Архитектура, новые функции, интеграции, релиз и поддержка команды.'],
]

function ProjectCard({ project }: { project: typeof projects[number] }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 50 })

  const move = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const rect = ref.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setSpot({ x, y })
    ref.current.style.setProperty('--mx', `${(x - 50) / 18}px`)
    ref.current.style.setProperty('--my', `${(y - 50) / 18}px`)
  }

  const leave = () => {
    setSpot({ x: 50, y: 50 })
    if (ref.current) {
      ref.current.style.setProperty('--mx', '0px')
      ref.current.style.setProperty('--my', '0px')
    }
  }

  const symbol = project.title === 'Svetlana App' ? 'S' : project.title === 'Мир Самозанятых' ? 'M' : project.title === 'Глаз Бога' ? 'G' : project.title === 'Bridge · Два Сердца' ? 'B' : project.title === 'AI English & Math Teacher' ? 'AI' : 'Y'

  return (
    <a ref={ref} className="projectCard" href={project.href} target="_blank" rel="noreferrer" onMouseMove={move} onMouseLeave={leave}>
      <div className={`projectVisual ${project.accent}`}>
        <span className="projectNumber">{project.number}</span>
        <div className="projectLight" style={{ left: `${spot.x}%`, top: `${spot.y}%` }} />
        <div className="projectSymbol">{symbol}</div>
        <span className="projectOpen">↗</span>
      </div>
      <div className="projectInfo">
        <div className="projectCategory">{project.category}</div>
        <h3>{project.title}</h3>
        <span className="status">{project.status}</span>
        <p>{project.text}</p>
        <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      </div>
    </a>
  )
}

function App() {
  const [menu, setMenu] = useState(false)

  return (
    <main className="site" id="top">
      <div className="ambient ambientOne" />
      <div className="ambient ambientTwo" />

      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Pavel Afanasyev home">
          <span className="brandMark">PA</span><span>Pavel Afanasyev</span>
        </a>
        <nav className={menu ? 'navlinks open' : 'navlinks'}>
          <a href="#about" onClick={() => setMenu(false)}>Обо мне</a>
          <a href="#services" onClick={() => setMenu(false)}>Услуги</a>
          <a href="#projects" onClick={() => setMenu(false)}>Проекты</a>
          <a href="#contact" onClick={() => setMenu(false)}>Контакты</a>
        </nav>
        <div className="navRight">
          <a className="githubLink" href="https://github.com/paulafanasyev" target="_blank" rel="noreferrer">GitHub ↗</a>
          <a className="contactPill" href="#contact">Обсудить проект</a>
          <button className="menuButton" onClick={() => setMenu(!menu)} aria-label="Меню">{menu ? '×' : '☰'}</button>
        </div>
      </header>

      <section className="hero shell">
        <div className="heroBadge"><span className="pulse" /> Open to collaboration · commercial full-stack</div>
        <div className="heroCopy">
          <p className="micro">FULL-STACK / PRODUCT / AI</p>
          <h1>Создаю цифровые<br /><em>продукты, которые работают.</em></h1>
          <p className="lead">Павел Афанасьев — full-stack разработчик с продуктовым фокусом. Проектирую и собираю веб, API, мобильные клиенты и AI-контуры — от архитектуры до работающего релиза.</p>
          <div className="heroActions">
            <a className="primaryButton" href="#contact">Обсудить сотрудничество <span>↗</span></a>
            <a className="ghostButton" href="#projects">Смотреть проекты <span>↓</span></a>
          </div>
          <div className="heroMeta"><span>VIETNAM · RUSSIA</span><span>REMOTE</span><span>FULL-STACK · AI</span></div>
        </div>
      </section>

      <section id="about" className="section shell about">
        <div className="sectionLabel"><span>01</span><span>ОБО МНЕ</span></div>
        <div className="aboutGrid">
          <div><h2>Павел<br /><em>Афанасьев.</em></h2></div>
          <div className="aboutText">
            <p className="largeText">Full-stack разработчик: проектирую и собираю продукты от интерфейса до сервера, данных и мобильной обёртки.</p>
            <p>Работаю с React, Node, TypeScript, Python, PostgreSQL, PWA и native-обёртками. Работаю в АНО ЦПС «Мир Самозанятых» и веду проекты удалённо между Вьетнамом и Россией.</p>
            <p>На коммерческой основе выполняю full-stack разработку: MVP, развитие существующих систем, AI-модули и интеграции. Могу подключиться к чужому проекту как исполнитель или партнёр по архитектуре.</p>
            <div className="factGrid"><div><b>Организация</b><span>Мир Самозанятых</span></div><div><b>Формат</b><span>Удалённо</span></div><div><b>География</b><span>Вьетнам · Россия</span></div></div>
          </div>
        </div>
      </section>

      <section id="services" className="section shell services">
        <div className="sectionLabel"><span>02</span><span>УСЛУГИ</span></div>
        <div className="sectionHeading"><h2>Коммерческая<br /><em>full-stack разработка.</em></h2><p>Задача, продуктовая логика, архитектура, интерфейс, интеграции и выпуск — в одном контуре.</p></div>
        <div className="serviceList">
          {services.map(([number, title, text]) => <article className="serviceRow" key={number}><span className="serviceNumber">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="serviceArrow">↗</span></article>)}
        </div>
      </section>

      <section id="projects" className="section shell projects">
        <div className="sectionLabel"><span>03</span><span>ПОРТФОЛИО</span></div>
        <div className="sectionHeading"><h2>Проекты<br /><em>в работе.</em></h2><p>Реализованные продукты и системы, которые сейчас развиваются. Каждый блок ведёт в соответствующий репозиторий GitHub.</p></div>
        <div className="projectGrid">
          {projects.map(project => <ProjectCard key={project.number} project={project} />)}
        </div>
      </section>

      <section className="cta shell" id="contact">
        <div className="ctaGlow" />
        <div className="sectionLabel light"><span>04</span><span>КОНТАКТЫ</span></div>
        <div className="ctaInner"><div><p className="micro lightText">OPEN TO COLLABORATION</p><h2>Готов включиться<br /><em>в ваш проект.</em></h2></div><div className="ctaSide"><p>Продукт, стартап, команда или разовая задача. Могу взять full-stack контур целиком или закрыть конкретный слой — фронт, API, мобильную сборку или AI-агента.</p><a className="ctaButton" href="mailto:pavel.afanadyev@inbox.ru">Написать Павлу <span>↗</span></a></div></div>
      </section>

      <footer className="footer shell"><div className="footerBrand"><span className="brandMark">PA</span><span>Pavel Afanasyev</span></div><div>© 2026 · Full-stack · AI · Product</div><div>Вьетнам · Россия · удалённо</div><a href="#top">Наверх ↑</a></footer>
    </main>
  )
}

export default App
