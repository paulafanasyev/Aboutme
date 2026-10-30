import { useRef, useState, type MouseEvent } from 'react'
import { translations } from './i18n'
import { projects } from './portfolioData'

type Lang = 'ru' | 'en' | 'vi'

function ProjectCard({ project, lang }: { project: typeof projects[number]; lang: Lang }) {
  const ref = useRef<HTMLAnchorElement>(null)
  const [spot, setSpot] = useState({ x: 50, y: 50 })
  const t = translations[lang]
  const i = Number(project.number) - 1
  const move = (e: MouseEvent<HTMLAnchorElement>) => {
    const n = ref.current
    const r = n?.getBoundingClientRect()
    if (!n || !r) return
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    setSpot({ x, y })
    n.style.setProperty('--mx', `${(x - 50) / 28}px`)
    n.style.setProperty('--my', `${(y - 50) / 28}px`)
  }
  const localizedCategories = lang === 'en'
    ? ['Education · Children', 'Education · AI', 'Social · Translation', 'Search · Analytics', 'Platform · Public Services', 'AI Agent · Avatar']
    : lang === 'vi'
      ? ['Giáo dục · Trẻ em', 'Giáo dục · AI', 'Xã hội · Dịch thuật', 'Tìm kiếm · Phân tích', 'Nền tảng · Dịch vụ cộng đồng', 'AI Agent · Avatar']
      : projects.map((p) => p.category)
  const localizedTitles = lang === 'en'
    ? ['AI Kids Workout', 'AI English & Math Tutor', 'Bridge · Two Hearts', 'God’s Eye', 'Self-Employed World', 'Svetlana']
    : lang === 'vi'
      ? ['AI Vận động trẻ em', 'Gia sư AI Anh văn & Toán', 'Cầu nối · Hai trái tim', 'God’s Eye', 'Thế giới người tự doanh', 'Svetlana']
      : projects.map((p) => p.title)
  const texts = lang === 'en'
    ? ['A game system for daily workouts for children aged 5–14: world map, missions, rewards and family challenges.', 'Trilingual AI tutor RU / EN / VI with six AI teachers, voice, avatars, lessons and mini-games.', 'Cross-cultural China–Russia platform with voice translation, profile compatibility and three languages.', 'Intelligent search and analytics across open sources: public-data aggregation, fast queries and a clear interface.', 'Product line of the Center for Self-Employed Support: web, mobile and server services with an AI layer.', 'Russian-speaking AI agent and realistic avatar Svetlana for web and Android: device control, memory, files and schedules.'][i]
    : lang === 'vi'
      ? ['Hệ thống trò chơi luyện tập hằng ngày cho trẻ 5–14 tuổi: bản đồ thế giới, nhiệm vụ, phần thưởng và thử thách gia đình.', 'Gia sư AI ba ngôn ngữ RU / EN / VI với sáu giáo viên AI, giọng nói, avatar, bài học và mini-game.', 'Nền tảng kết nối Trung Quốc–Nga với dịch giọng nói, tương thích hồ sơ và ba ngôn ngữ.', 'Tìm kiếm và phân tích thông minh từ nguồn mở: tổng hợp dữ liệu công khai, truy vấn nhanh và giao diện rõ ràng.', 'Hệ sinh thái sản phẩm hỗ trợ người tự doanh: web, mobile, máy chủ và lớp AI.', 'AI agent nói tiếng Nga và avatar Svetlana cho web và Android: điều khiển thiết bị, bộ nhớ, tệp và lịch.'][i]
      : project.text
  const status = project.status === 'Реализован' ? t.statusDone : t.statusWork

  return (
    <a ref={ref} className="projectCard" href={project.href} target="_blank" rel="noreferrer" onMouseMove={move} onMouseLeave={() => setSpot({ x: 50, y: 50 })}>
      <div className="projectIndex">{project.number}</div>
      <div className="projectMain">
        <div className="projectMeta"><span>{localizedCategories[i]}</span><span>{status}</span></div>
        <h3>{localizedTitles[i]}</h3>
        <p>{texts}</p>
        <div className="tags">{project.tags.map((tag) => <span key={tag}>{lang === 'en' && tag === 'Веб' ? 'Web' : lang === 'en' && tag === 'ИИ' ? 'AI' : lang === 'vi' && tag === 'Веб' ? 'Web' : lang === 'vi' && tag === 'ИИ' ? 'AI' : tag}</span>)}</div>
      </div>
      <div className="projectArrow">↗</div>
      <div className="projectLight" style={{ left: `${spot.x}%`, top: `${spot.y}%` }} />
    </a>
  )
}

export { ProjectCard }
