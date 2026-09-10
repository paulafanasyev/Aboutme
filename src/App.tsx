import { useRef, useState, type MouseEvent } from 'react'
import './theme.css'

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
      <iframe className="radiantBackground" src="https://radiant-shaders.com/flow-field" title="Фоновое поле потока" loading="eager" aria-hidden="true" tabIndex={-1} />

      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Pavel Afanasyev — главная">PAVEL AFANASYEV</a>
        <nav className={menu ? 'navlinks open' : 'navlinks'}>
          <a href="#top" onClick={() => setMenu(false)}>Главная</a><a href="#about" onClick={() => setMenu(false)}>Обо мне</a><a href="#projects" onClick={() => setMenu(false)}>Проекты</a><a href="#contact" onClick={() => setMenu(false)}>Контакты</a>
        </nav>
        <div className="navRight"><a className="githubLink" href="https://github.com/paulafanasyev" target="_blank" rel="noreferrer">Код ↗</a><a className="contactPill" href="#contact">Связаться</a><button className="menuButton" onClick={() => setMenu(!menu)} aria-label="Меню">{menu ? '×' : '☰'}</button></div>
      </header>

      <section className="hero shell">
        <div className="heroCopy"><p className="micro">01 — ГЛАВНАЯ</p><h1>Создаю цифровые<br /><em>продукты, которые работают.</em></h1><p className="lead">Павел Афанасьев — разработчик полного цикла с продуктовым фокусом. Проектирую и собираю веб, API, мобильные приложения и системы ИИ — от архитектуры до работающего выпуска.</p><div className="heroActions"><a className="primaryButton" href="#projects">Смотреть проекты <span>↓</span></a><a className="ghostButton" href="#contact">Обсудить проект <span>↗</span></a></div></div>
        <div className="heroFoot"><span>Вьетнам · Россия</span><span>Удалённо</span><span>© 2026</span></div>
      </section>

      <section id="about" className="section shell about">
        <div className="sectionLabel"><span>02</span><span>ОБО МНЕ</span></div>
        <div className="aboutIntro"><p className="eyebrow">РАЗРАБОТЧИК ПОЛНОГО ЦИКЛА · СОЗДАТЕЛЬ ЦИФРОВЫХ ПРОДУКТОВ</p><h2>Работаю на стыке<br /><em>продукта и технологий.</em></h2><p className="aboutLead">Проектирую и собираю продукты от интерфейса до сервера, данных и мобильного приложения. Люблю сложные системы, но делаю их понятными для пользователя.</p></div>
        <div className="aboutGrid"><div className="aboutText"><p>Работаю с React, Node, TypeScript, Python, PostgreSQL, PWA и мобильными технологиями. Веду проекты удалённо между Вьетнамом и Россией.</p><p>На коммерческой основе выполняю разработку полного цикла: первые версии продуктов, развитие существующих систем, модули ИИ и интеграции. Могу подключиться к чужому проекту как исполнитель или партнёр по архитектуре.</p></div><div className="factGrid"><div><b>Организация</b><span>Мир Самозанятых</span></div><div><b>Формат</b><span>Удалённо</span></div><div><b>Фокус</b><span>Веб · ИИ · Мобильные приложения</span></div></div></div>
      </section>

      <section id="services" className="section shell services">
        <div className="sectionLabel"><span>03</span><span>УСЛУГИ</span></div>
        <div className="sectionHeading"><h2>Коммерческая<br /><em>разработка полного цикла.</em></h2><p>Задача, продуктовая логика, архитектура, интерфейс, интеграции и выпуск — в одном контуре.</p></div>
        <div className="serviceList">{services.map(([number, title, text]) => <article className="serviceRow" key={number}><span className="serviceNumber">{number}</span><div><h3>{title}</h3><p>{text}</p></div><span className="serviceArrow">↗</span></article>)}</div>
      </section>

      <section id="projects" className="section shell projects">
        <div className="sectionLabel"><span>04</span><span>ИЗБРАННЫЕ ПРОЕКТЫ</span></div>
        <div className="sectionHeading"><h2>Проекты<br /><em>в работе.</em></h2><p>Не просто карточки портфолио, а живые системы. Открывай репозиторий, чтобы посмотреть код и текущую реализацию.</p></div>
        <div className="projectGrid">{projects.map(project => <ProjectCard key={project.number} project={project} />)}</div>
      </section>

      <section className="section shell learn"><div className="sectionLabel"><span>05</span><span>ИССЛЕДУЮ · СТРОЮ · ПОВТОРЯЮ</span></div><div className="learnGrid"><div><h2>Исследую,<br /><em>строю, повторяю.</em></h2></div><p>Помимо коммерческой разработки, экспериментирую с ИИ-агентами, интерфейсами реального времени, компьютерным зрением, трёхмерной графикой и новыми способами взаимодействия человека с программой.</p></div></section>

      <section className="cta shell" id="contact"><div className="sectionLabel light"><span>06</span><span>КОНТАКТЫ</span></div><div className="ctaInner"><div><p className="micro lightText">ОТКРЫТ К СОТРУДНИЧЕСТВУ</p><h2>Готов включиться<br /><em>в ваш проект.</em></h2></div><div className="ctaSide"><p>Продукт, стартап, команда или разовая задача. Могу взять разработку полного цикла или закрыть конкретный слой — интерфейс, API, мобильную сборку или ИИ-агента.</p><a className="ctaButton" href="mailto:pavel.afanadyev@inbox.ru">Написать Павлу <span>↗</span></a></div></div></section>
      <footer className="footer shell"><div className="footerBrand">PAVEL AFANASYEV</div><div>© 2026 · Разработка · ИИ · Продукты</div><div>Вьетнам · Россия · удалённо</div><a href="#top">Наверх ↑</a></footer>
    </main>
  )
}

export default App
