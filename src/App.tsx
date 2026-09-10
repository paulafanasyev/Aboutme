import { useState } from 'react'

const projects = [
  { n: '01', title: 'Svetlana App', type: 'AI / MOBILE', text: 'AI-ассистент для управления телефоном, моделями ИИ и инструментами разработчика.', tags: ['React Native', 'AI', 'Android'], href: 'https://github.com/paulafanasyev/Svetlana-App' },
  { n: '02', title: 'Мир Самозанятых', type: 'PRODUCT / WEB', text: 'Цифровая платформа для самозанятых: сервисы, AI и финансовые инструменты в одном продукте.', tags: ['React', 'Python', 'AI'], href: 'https://github.com/paulafanasyev/mir-samozanyatykh-' },
  { n: '03', title: 'OX', type: 'AI / AUTOMATION', text: 'Экспериментальная мобильная агентная система с Termux MCP и управлением устройством.', tags: ['Android', 'MCP', 'AI'], href: 'https://github.com/paulafanasyev/mobile-agent-russkiy-termuxMCP-OX' },
  { n: '04', title: 'God’s Eye View', type: 'SIMULATION / 3D', text: 'Стратегическая 3D-система моделирования Земли, кризисов и глобальных сценариев.', tags: ['3D', 'Simulation', 'Web'], href: 'https://github.com/paulafanasyev/-_-' },
  { n: '05', title: 'Я-Зарядка AI', type: 'AI / PRODUCT', text: 'AI-продукт с современным интерфейсом и фокусом на понятный пользовательский опыт.', tags: ['AI', 'React', 'UX'], href: 'https://github.com/paulafanasyev/ya-zaryadka-ai' },
  { n: '06', title: 'CryptoLayer', type: 'WEB3 / BACKEND', text: 'Инфраструктурный эксперимент вокруг безопасных транзакций и Web3.', tags: ['Web3', 'API', 'Security'], href: 'https://github.com/paulafanasyev/cryptolayer' },
]

const services = ['AI-продукты', 'Web & SaaS', 'Mobile Apps', 'Backend & API', 'Архитектура', 'Автоматизация']

function App() {
  const [chat, setChat] = useState(false)
  const [dark, setDark] = useState(true)
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  const send = () => {
    if (!message.trim()) return
    setSent(true)
    setMessage('')
  }

  return (
    <main className={dark ? 'site dark' : 'site light'}>
      <nav className="nav shell">
        <a className="brand" href="#top" aria-label="Pavel Afanasiev">PA<span>.</span></a>
        <div className="navlinks">
          <a href="#work">Работы</a><a href="#services">Услуги</a><a href="#about">Обо мне</a>
        </div>
        <div className="navactions">
          <button className="theme" onClick={() => setDark(!dark)} aria-label="Переключить тему">{dark ? '☼' : '◐'}</button>
          <a className="navcta" href="mailto:pavel.afanadyev@inbox.ru">Связаться <span>↗</span></a>
        </div>
      </nav>

      <section id="top" className="hero shell">
        <div className="eyebrow"><i /> FULL STACK DEVELOPER · AI · PRODUCT</div>
        <h1>Создаю цифровые<br /><em>продукты,</em> а не просто код.</h1>
        <div className="heroBottom">
          <p className="lead">Павел Афанасьев — full-stack разработчик. Проектирую и собираю AI-продукты, web-сервисы и мобильные приложения от идеи до рабочего релиза.</p>
          <a className="roundArrow" href="#work">↓</a>
        </div>
        <div className="heroLine"><span>01 — INTRO</span><span>SCROLL TO EXPLORE</span></div>
      </section>

      <section id="work" className="work shell">
        <div className="sectionHead"><span>02 — SELECTED WORK</span><h2>Проекты<br /><em>в работе.</em></h2></div>
        <div className="projectGrid">
          {projects.map(p => <a className="project" href={p.href} target="_blank" rel="noreferrer" key={p.n}>
            <div className="projectTop"><span>{p.n}</span><span>{p.type}</span></div>
            <div className="projectBody"><h3>{p.title}</h3><p>{p.text}</p><div className="tags">{p.tags.map(t => <span key={t}>{t}</span>)}</div></div>
            <div className="projectArrow">↗</div>
          </a>)}
        </div>
      </section>

      <section id="services" className="services shell">
        <div className="sectionHead"><span>03 — CAPABILITIES</span><h2>Что можно<br /><em>сделать.</em></h2></div>
        <div className="serviceList">{services.map((s, i) => <div className="service" key={s}><span>0{i + 1}</span><strong>{s}</strong><b>↗</b></div>)}</div>
      </section>

      <section id="about" className="about shell">
        <div className="aboutMark">PA</div>
        <div><span className="mini">04 — ABOUT</span><h2>Технологии должны<br />решать <em>задачи.</em></h2><p>Работаю на стыке разработки, AI и продуктового дизайна. Предпочитаю простые интерфейсы, сильную архитектуру и решения, которые можно реально запустить и поддерживать.</p><a className="textLink" href="https://github.com/paulafanasyev" target="_blank" rel="noreferrer">GitHub ↗</a></div>
      </section>

      <footer className="footer shell">
        <div><span className="mini">05 — LET'S BUILD</span><h2>Есть идея?<br /><em>Поговорим.</em></h2></div>
        <a className="footerMail" href="mailto:pavel.afanadyev@inbox.ru">pavel.afanadyev@inbox.ru ↗</a>
        <div className="copyright">© 2026 Pavel Afanasiev · Full Stack Developer</div>
      </footer>

      <button className="chatButton" onClick={() => setChat(true)}>AI <span>Ассистент</span> ↗</button>
      {chat && <div className="chatOverlay" onClick={() => setChat(false)}><div className="chat" onClick={e => e.stopPropagation()}><button className="close" onClick={() => setChat(false)}>×</button><span className="mini">PA / AI ASSISTANT</span><h3>{sent ? 'Сообщение принято.' : 'Что строим?'}</h3>{sent ? <p>Напишите Павлу напрямую — ответит по проекту.</p> : <><p>Спросите о проектах, технологиях или опишите задачу.</p><div className="chatInput"><input value={message} onChange={e => setMessage(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ваш вопрос..." /><button onClick={send}>↗</button></div></>}</div></div>}
    </main>
  )
}

export default App
