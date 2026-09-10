import { useRef, useState, type MouseEvent } from 'react'
import './theme.css'

const projects = [
  { number: '01', category: 'EdTech · Kids', title: 'Я-Зарядка AI', status: 'Реализован', text: 'Игровая система для ежедневной зарядки детей 5–14 лет: карта мира, миссии, награды и семейные челленджи.', tags: ['HTML', 'AI', 'RuStore'], href: 'https://github.com/paulafanasyev/ya-zaryadka-ai' },
  { number: '02', category: 'EdTech · AI', title: 'AI English & Math Teacher', status: 'Реализован', text: 'Триязычный AI-репетитор RU / EN / VI с шестью AI-учителями, голосом, аватарами, уроками и мини-играми.', tags: ['React', 'Node', 'Prisma'], href: 'https://github.com/paulafanasyev/ai-english-teacher' },
  { number: '03', category: 'Social · i18n', title: 'Bridge · Два Сердца', status: 'Реализован', text: 'Кросс-культурная платформа Китай — Россия с голосовым переводом, совместимостью анкет и тремя языками.', tags: ['React', 'Express', 'WebSocket'], href: 'https://github.com/paulafanasyev/bridges' },
  { number: '04', category: 'Search · Analytics', title: 'Глаз Бога', status: 'В разработке', text: 'Интеллектуальный поиск и аналитика по открытым источникам: агрегация публичных данных, быстрые запросы и понятный интерфейс.', tags: ['Python', 'API', 'Telegram'], href: 'https://github.com/paulafanasyev' },
  { number: '05', category: 'Platform · Civic', title: 'Мир Самозанятых', status: 'В разработке', text: 'Продуктовая линейка АНО ЦПС: веб, мобильный клиент и backend, сервисы поддержки сообщества и AI-контур.', tags: ['Python', 'TypeScript', 'Flutter'], href: 'https://github.com/paulafanasyev/mir-samozanyatykh-' },
  { number: '06', category: 'AI Agent · Avatar', title: 'Svetlana App', status: 'В разработке', text: 'Русскоязычный AI-агент и realtime-аватар Светлана для веба и Android: MCP, accessibility, память, файлы и расписания.', tags: ['TypeScript', 'Android', 'MCP'], href: 'https://github.com/paulafanasyev/Mobile-agent-russkiy-termuxMCP-OX' },
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

  const move = (event: MouseEvent<HTMLAnchorElement>) => {
    const node = ref.current
    const rect = node?.getBoundingClientRect()
    if (!node || !rect) return
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setSpot({ x, y })
    node.style.setProperty('--mx', `${(x - 50) / 28}px`)
    node.style.setProperty('--my', `${(y - 50) / 28}px`)
  }

  const leave = () => {
    setSpot({ x: 50, y: 50 })
    const node = ref.current
    if (node) {
      node.style.setProperty('--mx', '0px')
      node.style.setProperty('--my', '0px')
    }
  }

  return (
    <a ref={ref} className="projectCard" href={project.href} target="_blank" rel="noreferrer" onMouseMove={move} onMouseLeave={leave}>
      <div className="projectIndex">{project.number}</div>
      <div className="projectMain">
        <div className="projectMeta"><span>{project.category}</span><span>{project.status}</span></div>
        <h3>{project.title}</h3>
        <p>{project.text}</p>
        <div className="tags">{project.tags.map(tag => <span key={tag}>{tag}</span>)}</div>
      </div>
      <div className="projectArrow">↗</div>
      <div className="projectLight" style={{ left: `${spot.x}%`, top: `${spot.y}%` }} />
    </a>
  )
}

function App() {
  const [menu, setMenu] = useState(false)

  return (
    <main className="site" id="top">
      <iframe className="radiantBackground" src="https://radiant-shaders.com/flow-field" title="Radiant Flow Field background" loading="eager" aria-hidden="true" tabIndex={-1} />

      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Pavel Afanasyev home">PAVEL AFANASYEV</a>
        <nav className={menu ? 'navlinks open' : 'navlinks'}>
          <a href="#top" onClick={() => setMenu(false)}>Index</a><a href="#about" onClick={() => setMenu(false)}>About</a><a href="#projects" onClick={() => setMenu(false)}>Work</a><a href="#contact" onClick={() => setMenu(false)}>Contact</a>
        </nav>
        <div className="navRight"><a className="githubLink" href="https://github.com/paulafanasyev" target="_blank" rel="noreferrer">GitHub ↗</a><a className="contactPill" href="#contact">Связаться</a><button className="menuButton" onClick={() => setMenu(!menu)} aria-label="Меню">{menu ? '×' : '☰'}</button></div>
      </header>

      <section className="hero shell">
        <div className="heroCopy"><p className="micro">01 — INDEX</p><h1>Создаю цифровые<br /><em>продукты, которые работают.</em></h1><p className="lead">Павел Афанасьев — full-stack разработчик с продуктовым фокусом. Проектирую и собираю веб, API, мобильные клиенты и AI-контуры — от архитектуры до работающего релиза.</p><div className="heroActions"><a className="primaryButton" href="#projects">Смотреть работу <span>↓</span></a><a className="ghostButton" href="#contact">Обсудить проект <span>↗</span></a></div></div>
        <div className="heroFoot"><span>Вьетнам · Россия</span><span>Удалённо</span><span>© 2026</span></div>
      </section>

      <section id="about" className="section shell about">
        <div className="sectionLabel"><span>02</span><span>ABOUT</span></div>
        <div className="aboutIntro"><p className="eyebrow">FULL-STACK DEVELOPER / CREATIVE ENGINEER</p><h2>Работаю на стыке<br /><em>продукта и технологий.</em></h2><p className="aboutLead">Проектирую и собираю продукты от интерфейса до сервера, данных и мобильной обёртки. Люблю сложные системы, но делаю их понятными для пользователя.</p></div>
        <div className="aboutGrid"><div className="aboutText"><p>Работаю с React, Node, TypeScript, Python, PostgreSQL, PWA и native-обёртками. Веду проекты удалённо между Вьетнамом и Россией.</p><p>На коммерческой основе выполняю full-stack разработку: MVP, развитие существующих систем, AI-модули и интеграции. Могу подключиться к чужому проекту как исполнитель или партнёр по архитектуре.</p></div><div className="factGrid"><div><b>Организация</b><span>Мир Самозанятых</span></div><div><b>Формат</b><span>Удалённо</span></div><div><b>Фокус</b><span>Web · AI · Mobile</span></div></div></div>
      </section>

      <section id="services" className="section shell services">
        <div className="sectionLabel"><span>03</span><span>SERVICES</span></div>
        <div className="sectionHeading"><h2>Коммерческая<br /><em>full-stack разработка.</em></h2><p>Задача, продуктовая логика, архитектура, интерфейс, интеграции и выпуск — в одном контуре.</p></div>
        <div className="serviceList">{services.map(([number, title, text]) => <article className="serviceRow" key={number}><span className="serviceNumber">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="serviceArrow">↗</span></article>)}</div>
      </section>

      <section id="projects" className="section shell projects">
        <div className="sectionLabel"><span>04</span><span>SELECTED WORK</span></div>
        <div className="sectionHeading"><h2>Проекты<br /><em>в работе.</em></h2><p>Не просто карточки портфолио, а живые системы. Открывай репозиторий, чтобы посмотреть код и текущую реализацию.</p></div>
        <div className="projectGrid">{projects.map(project => <ProjectCard key={project.number} project={project} />)}</div>
      </section>

      <section className="section shell learn"><div className="sectionLabel"><span>05</span><span>LEARN · BUILD · REPEAT</span></div><div className="learnGrid"><div><h2>Исследую,<br /><em>строю, повторяю.</em></h2></div><p>Помимо коммерческой разработки, экспериментирую с AI-агентами, realtime-интерфейсами, компьютерным зрением, 3D и новыми способами взаимодействия человека с программой.</p></div></section>

      <section className="cta shell" id="contact"><div className="sectionLabel light"><span>06</span><span>CONTACT</span></div><div className="ctaInner"><div><p className="micro lightText">OPEN TO COLLABORATION</p><h2>Готов включиться<br /><em>в ваш проект.</em></h2></div><div className="ctaSide"><p>Продукт, стартап, команда или разовая задача. Могу взять full-stack контур целиком или закрыть конкретный слой — фронт, API, мобильную сборку или AI-агента.</p><a className="ctaButton" href="mailto:pavel.afanadyev@inbox.ru">Написать Павлу <span>↗</span></a></div></div></section>
      <footer className="footer shell"><div className="footerBrand">PAVEL AFANASYEV</div><div>© 2026 · Full-stack · AI · Product</div><div>Вьетнам · Россия · удалённо</div><a href="#top">Наверх ↑</a></footer>
    </main>
  )
}

export default App
