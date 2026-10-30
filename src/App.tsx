import { useEffect, useState } from 'react'
import './theme.css'
import './sakha.css'
import './sakha-light.css'
import SakhaThreeScene from './SakhaSceneLoader'
import { translations } from './i18n'
import { projects, services } from './portfolioData'
import { ProjectCard } from './ProjectCard'

type Lang = 'ru' | 'en' | 'vi'
type Theme = 'dark' | 'light'
type ChatMessage = { from: 'bot' | 'user'; text: string }

function App() {
  const [menu, setMenu] = useState(false)
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('site-lang')
    return saved === 'en' || saved === 'vi' ? saved : 'ru'
  })
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('site-theme')
    return saved === 'light' ? 'light' : 'dark'
  })
  const t = translations[lang]
  const pageTitle =
    lang === 'ru'
      ? 'АЛГЫС КЫТЫЛЫТ — Портфолио Павла Афанасьева'
      : lang === 'en'
        ? 'АЛГЫС КЫТЫЛЫТ — Pavel Afanasyev | Digital Portfolio'
        : 'АЛГЫС КЫТЫЛЫТ — Hồ sơ năng lực Pavel Afanasyev'

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = pageTitle
  }, [lang, pageTitle])

  useEffect(() => {
    document.documentElement.dataset.theme = theme
  }, [theme])

  const [chatOpen, setChatOpen] = useState(false)
  const [chatInput, setChatInput] = useState('')
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { from: 'bot', text: t.chatWelcome },
  ])
  const [chatBusy, setChatBusy] = useState(false)

  const changeLang = (next: Lang) => {
    setLang(next)
    localStorage.setItem('site-lang', next)
    setMenu(false)
    setChatMessages([{ from: 'bot', text: translations[next].chatWelcome }])
  }

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('site-theme', next)
      return next
    })
  }

  const sendChat = async (preset?: string) => {
    const text = (preset ?? chatInput).trim()
    if (!text || chatBusy) return
    const next = [...chatMessages, { from: 'user' as const, text }]
    setChatMessages(next)
    setChatInput('')
    setChatBusy(true)
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lang,
          messages: next.map((m) => ({
            role: m.from === 'bot' ? 'assistant' : 'user',
            content: m.text,
          })),
        }),
      })
      const data = await response.json()
      if (!response.ok || !data.text) throw new Error('AI unavailable')
      setChatMessages((p) => [...p, { from: 'bot', text: String(data.text) }])
    } catch {
      setChatMessages((p) => [...p, { from: 'bot', text: t.chatFallback }])
    } finally {
      setChatBusy(false)
    }
  }

  return (
    <main className={`site lang-${lang}`} data-theme={theme} id="top">
      <iframe
        className="radiantBackground"
        src="https://radiant-shaders.com/flow-field"
        title="Flow Field background"
        loading="eager"
        aria-hidden="true"
        tabIndex={-1}
      />
      <header className="nav shell">
        <a className="brand" href="#top" aria-label="АЛГЫС КЫТЫЛЫТ">
          <span className="brandSakha" lang="sah">АЛГЫС КЫТЫЛЫТ</span>
          <span className="brandSubtitle">
            {lang === 'ru' ? 'Павел Афанасьев' : 'Pavel Afanasyev'}
          </span>
        </a>
        <div className="navRight">
          <button type="button" className="themeToggle" onClick={toggleTheme} aria-label="Theme">
            {theme === 'dark' ? '☀' : '☾'}{' '}
            {theme === 'dark'
              ? lang === 'ru'
                ? 'Светлая'
                : lang === 'vi'
                  ? 'Sáng'
                  : 'Light'
              : lang === 'ru'
                ? 'Тёмная'
                : lang === 'vi'
                  ? 'Tối'
                  : 'Dark'}
          </button>
          <div className="languageSwitch">
            {(['ru', 'en', 'vi'] as Lang[]).map((code) => (
              <button
                key={code}
                type="button"
                className={lang === code ? 'active' : ''}
                onClick={() => changeLang(code)}
              >
                {code.toUpperCase()}
              </button>
            ))}
          </div>
          <button type="button" className="menuButton" onClick={() => setMenu(!menu)} aria-label="Menu">
            ☰
          </button>
        </div>
        <nav className={`navlinks ${menu ? 'open' : ''}`}>
          {t.nav.map((label, i) => (
            <a key={label} href={['#top', '#about', '#projects', '#contact'][i]} onClick={() => setMenu(false)}>
              {label}
            </a>
          ))}
        </nav>
      </header>

      <section className="hero shell">
        <p className="micro">{t.heroMicro}</p>
        <h1>{t.heroTitle}</h1>
        <p className="lead">{t.heroLead}</p>
        <div className="heroActions">
          <a className="primaryButton" href="#projects">{t.viewProjects}</a>
          <a className="ghostButton" href="#contact">{t.discuss}</a>
        </div>
        <div className="heroFoot">
          <span>{t.location}</span>
          <span>{t.remote}</span>
        </div>
      </section>

      <section className="shell alasJourney" id="map">
        <div className="alasIntro">
          <p className="eyebrow">АЛГЫС КЫТЫЛЫТ</p>
          <h2>
            {lang === 'ru' ? (
              <>Интерактивный <em>алас</em></>
            ) : lang === 'en' ? (
              <>Interactive <em>alas</em></>
            ) : (
              <>Alas <em>tương tác</em></>
            )}
          </h2>
          <p>
            {lang === 'ru'
              ? 'Исследуй ландшафт Саха: двигайся, открывай разделы портфолио.'
              : lang === 'en'
                ? 'Explore the Sakha landscape: move around and open portfolio sections.'
                : 'Khám phá cảnh quan Sakha: di chuyển và mở các phần hồ sơ.'}
          </p>
        </div>
        <div className="alasMap">
          <div className="alasSky" aria-hidden="true" />
          <SakhaThreeScene lang={lang} theme={theme} />
        </div>
      </section>

      <section className="about shell" id="about">
        <div className="sectionLabel"><span>02</span><span>{t.aboutLabel}</span></div>
        <div className="aboutIntro">
          <p className="eyebrow">{t.aboutEyebrow}</p>
          <h2>{t.aboutTitle}</h2>
          <p className="aboutLead">{t.aboutLead}</p>
        </div>
      </section>

      <section className="services shell" id="services">
        <div className="sectionLabel"><span>03</span><span>{t.servicesLabel}</span></div>
        <div className="sectionHeading">
          <h2>{t.servicesTitle}</h2>
          <p>{t.servicesLead}</p>
        </div>
        <div className="serviceList">
          {services.map(([num, title, text]) => (
            <div className="serviceRow" key={num}>
              <span className="serviceNumber">{num}</span>
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="projects shell" id="projects">
        <div className="sectionLabel"><span>04</span><span>{t.projectsLabel}</span></div>
        <div className="sectionHeading">
          <h2>{t.projectsTitle}</h2>
          <p>{t.projectsLead}</p>
        </div>
        <div className="projectGrid">
          {projects.map((project) => (
            <ProjectCard key={project.number} project={project} lang={lang} />
          ))}
        </div>
      </section>

      <section className="cta shell" id="contact">
        <div className="sectionLabel light"><span>06</span><span>{t.contactLabel}</span></div>
        <div className="ctaInner">
          <div>
            <p className="micro lightText">{t.contactEyebrow}</p>
            <h2>{t.contactTitle}</h2>
          </div>
          <div className="ctaSide">
            <p>{t.contactText}</p>
            <a className="ctaButton" href="mailto:pavel.afanadyev@inbox.ru">
              {t.write} <span>↗</span>
            </a>
          </div>
        </div>
      </section>

      <footer className="footer shell">
        <div className="footerBrand">
          <span className="footerBrandSakha" lang="sah">АЛГЫС КЫТЫЛЫТ</span>
          <span className="footerBrandName">
            {lang === 'ru' ? 'ПАВЕЛ АФАНАСЬЕВ' : 'PAVEL AFANASYEV'}
          </span>
        </div>
        <div>© 2026 · {t.footer}</div>
        <div>
          {t.location} · {t.remote}
        </div>
        <a href="#top">{t.top}</a>
      </footer>

      <button
        className="chatLauncher"
        onClick={() => setChatOpen(!chatOpen)}
        aria-label={chatOpen ? t.chatClose : t.chatOpen}
      >
        <span className="chatLauncherDot" />
        {chatOpen ? '×' : 'AI'}
      </button>
      {chatOpen && (
        <aside className="clientChat" aria-label={t.chatTitle}>
          <div className="clientChatHead">
            <div>
              <strong>{t.chatTitle}</strong>
              <small>
                {t.location} · {t.remote}
              </small>
            </div>
            <button onClick={() => setChatOpen(false)} aria-label={t.chatClose}>
              ×
            </button>
          </div>
          <div className="clientChatBody">
            {chatMessages.map((m, i) => (
              <div className={`chatBubble ${m.from}`} key={`${i}-${m.text.slice(0, 24)}`}>
                {m.text}
              </div>
            ))}
            {chatBusy && (
              <div className="chatBubble bot">
                {lang === 'ru' ? 'Печатаю…' : lang === 'en' ? 'Thinking…' : 'Đang trả lời…'}
              </div>
            )}
          </div>
          <div className="chatQuick">
            <button disabled={chatBusy} onClick={() => sendChat(t.chatServices)}>
              {t.chatServices}
            </button>
            <button disabled={chatBusy} onClick={() => sendChat(t.chatPrice)}>
              {t.chatPrice}
            </button>
            <button disabled={chatBusy} onClick={() => sendChat(t.chatContact)}>
              {t.chatContact}
            </button>
          </div>
          <form
            className="chatForm"
            onSubmit={(e) => {
              e.preventDefault()
              sendChat()
            }}
          >
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder={t.chatPlaceholder}
              aria-label={t.chatPlaceholder}
            />
            <button type="submit" disabled={chatBusy}>
              {t.chatSend}
            </button>
          </form>
        </aside>
      )}
    </main>
  )
}

export default App
