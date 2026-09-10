import { useState } from 'react'

const projects = [
  { n: '01', title: 'Svetlana', type: 'AI · MOBILE', text: 'Персональный AI-ассистент для телефона, инструментов разработчика и управления устройством.', tags: ['React Native', 'AI', 'Android'], href: 'https://github.com/paulafanasyev/Svetlana-App' },
  { n: '02', title: 'Мир Самозанятых', type: 'PRODUCT · WEB', text: 'Платформа, объединяющая сервисы, AI и финансовые инструменты для самозанятых.', tags: ['React', 'Python', 'AI'], href: 'https://github.com/paulafanasyev/mir-samozanyatykh-' },
  { n: '03', title: 'OX', type: 'AGENTS · AUTOMATION', text: 'Экспериментальная агентная система с Termux MCP и управлением Android.', tags: ['Android', 'MCP', 'AI'], href: 'https://github.com/paulafanasyev/mobile-agent-russkiy-termuxMCP-OX' },
  { n: '04', title: "God’s Eye View", type: 'SIMULATION · 3D', text: '3D-симуляция Земли, кризисов и глобальных сценариев в интерактивной среде.', tags: ['3D', 'Simulation', 'Web'], href: 'https://github.com/paulafanasyev/-_-' },
  { n: '05', title: 'Я-Зарядка AI', type: 'AI · PRODUCT', text: 'AI-продукт с фокусом на простой интерфейс и понятный пользовательский путь.', tags: ['AI', 'React', 'UX'], href: 'https://github.com/paulafanasyev/ya-zaryadka-ai' },
  { n: '06', title: 'CryptoLayer', type: 'WEB3 · BACKEND', text: 'Инфраструктурный эксперимент вокруг API, безопасности и Web3.', tags: ['Web3', 'API', 'Security'], href: 'https://github.com/paulafanasyev/cryptolayer' },
]

const services = ['AI-продукты', 'Web & SaaS', 'Mobile Apps', 'Backend & API', 'Архитектура', 'Автоматизация']

function App() {
  const [menu, setMenu] = useState(false)
  const [chat, setChat] = useState(false)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (!message.trim()) return
    setSent(true)
    setMessage('')
  }

  return (
    <main className="site">
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="Pavel Afanasiev"><span>PA</span><small>/</small>26</a>
        <nav className={menu ? 'navlinks open' : 'navlinks'}>
          <a href="#work" onClick={() => setMenu(false)}>Работы</a>
          <a href="#services" onClick={() => setMenu(false)}>Возможности</a>
          <a href="#about" onClick={() => setMenu(false)}>Обо мне</a>
        </nav>
        <div className="navactions">
          <a className="navcta" href="mailto:pavel.afanadyev@inbox.ru">Связаться <b>↗</b></a>
          <button className="menuButton" onClick={() => setMenu(!menu)} aria-label="Меню">{menu ? '×' : '☰'}</button>
        </div>
      </header>

      <section id="top" className="hero shell">
        <div className="heroGrid">
          <div className="heroCopy">
            <div className="eyebrow"><span>INDEPENDENT DEVELOPER</span><i /></div>
            <h1>Делаю идеи<br /><strong>работающими.</strong></h1>
            <p className="lead">Павел Афанасьев. Full-stack разработчик, создающий AI-продукты, мобильные приложения и web-сервисы.</p>
            <div className="heroActions"><a className="primary" href="#work">Смотреть проекты <b>↓</b></a><a className="secondary" href="https://github.com/paulafanasyev" target="_blank" rel="noreferrer">GitHub ↗</a></div>
          </div>
          <div className="heroVisual">
            <div className="visualCard mainCard"><span>PA</span><div><small>BUILDING</small><strong>AI × PRODUCT</strong></div></div>
            <div className="visualCard noteCard"><span>●</span><p>От идеи<br />до релиза.</p></div>
            <div className="orbit">↗</div>
          </div>
        </div>
        <div className="heroMeta"><span>VIETNAM / REMOTE</span><span>AVAILABLE FOR SELECTED PROJECTS</span><span>SCROLL ↓</span></div>
      </section>

      <section id="work" className="work shell">
        <div className="sectionIntro"><div><span className="kicker">01 / SELECTED WORK</span><h2>Избранные<br /><i>проекты.</i></h2></div><p>Не коллекция концептов. Здесь продукты, системы и эксперименты, которые я действительно строю.</p></div>
        <div className="projectGrid">
          {projects.map((p, i) => <a className={`project project${i + 1}`} href={p.href} target="_blank" rel="noreferrer" key={p.n}>
            <div className="projectTop"><span>{p.n}</span><span>{p.type}</span></div>
            <div className="projectArt"><span>{i === 0 ? 'S' : i === 1 ? 'M' : i === 2 ? 'OX' : i === 3 ? 'G' : i === 4 ? 'Y' : 'C'}</span></div>
            <div className="projectBody"><h3>{p.title}</h3><p>{p.text}</p><div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div></div>
            <div className="projectArrow">↗</div>
          </a>)}
        </div>
      </section>

      <section id="services" className="services shell">
        <div className="sectionIntro"><div><span className="kicker">02 / WHAT I DO</span><h2>От идеи<br /><i>к системе.</i></h2></div><p>Продуктовый подход: сначала задача и пользователь, затем архитектура, интерфейс и код.</p></div>
        <div className="serviceList">{services.map((s, i) => <div className="service" key={s}><span>0{i + 1}</span><strong>{s}</strong><b>↗</b></div>)}</div>
      </section>

      <section id="about" className="about shell">
        <div className="aboutStamp">PA<br /><small>FULL STACK<br />DEVELOPER</small></div>
        <div className="aboutCopy"><span className="kicker">03 / ABOUT</span><h2>Технологии —<br />это <i>инструмент.</i></h2><p>Я работаю на пересечении разработки, AI и продуктового дизайна. Люблю превращать сложные системы в понятные интерфейсы и доводить идеи до состояния, когда ими можно пользоваться.</p><div className="facts"><div><strong>AI</strong><span>agents & products</span></div><div><strong>WEB</strong><span>apps & platforms</span></div><div><strong>MOBILE</strong><span>Android & React Native</span></div></div></div>
      </section>

      <footer className="footer shell">
        <div className="footerTop"><div><span className="kicker">04 / CONTACT</span><h2>Есть идея?<br /><i>Давайте сделаем.</i></h2></div><a className="footerMail" href="mailto:pavel.afanadyev@inbox.ru">pavel.afanadyev@inbox.ru <b>↗</b></a></div>
        <div className="footerBottom"><span>© 2026 Pavel Afanasiev</span><span>AI · PRODUCT · ENGINEERING</span><a href="#top">НАВЕРХ ↑</a></div>
      </footer>

      <button className="chatButton" onClick={() => setChat(true)}><span>AI</span> Ассистент <b>↗</b></button>
      {chat && <div className="chatOverlay" onClick={() => setChat(false)}><div className="chat" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setChat(false)}>×</button><span className="kicker">PA / AI ASSISTANT</span><h3>{sent ? 'Готово.' : 'Что строим?'}</h3>{sent ? <p>Запрос принят. Для реального проекта свяжитесь с Павлом напрямую.</p> : <><p>Опишите задачу — ассистент поможет сориентироваться по проектам и технологиям.</p><div className="chatInput"><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ваш вопрос..." /><button onClick={send}>↗</button></div></>}</div></div>}
    </main>
  )
}

export default App
