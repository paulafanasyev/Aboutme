# Олоҥхо цифровых миров

Портфолио Павла Афанасьева, рассказанные как олоҥхо — героический эпос саха.
Три мира, девять небес и шесть деяний мастера: веб, API, мобильные приложения и ИИ-продукты.

Сайт говорит на четырёх языках: **русском, английском, саха и вьетнамском**.

## Запуск

Сайт статический: сборка не нужна. Достаточно любого HTTP-сервера.

```bash
cd Олоҥхо
python -m http.server 4173
```

Откройте `http://localhost:4173`.

> Открывать `index.html` напрямую через `file://` не стоит: ES-модули и локальные
> шрифты требуют HTTP-протокола.

## Что внутри

- `index.html` — вся разметка: шесть глав, SVG-графика, доступные элементы управления.
- `css/` — базовые токены, «хром» (навигация, меню, футер), секции и адаптив.
- `js/` — ES-модули без зависимостей: i18n, звёздное небо, три мира, круг ремесла,
  чтение сказания, синтезированный хомус, форма и общий аудиодвижок.
- `js/content.js` — английский словарь и структуры миров/ремесла; `js/lang-sah.js`
  и `js/lang-vi.js` — словари саха и вьетнамского (по 243 ключа каждый).
- `assets/fonts/` — самохостинг Cormorant Garamond, Manrope и JetBrains Mono
  с кириллицей, кириллицей-расширением (буквы саха: ҕ ҥ ө ү һ) и вьетнамским подсетом.

## Возможности

- RU / EN / SAH / VI с запоминанием выбора; контент генерируется из одного источника.
- Прямые ссылки на язык: `?lang=ru`, `?lang=en`, `?lang=sah`, `?lang=vi`
  (плюс `hreflang` и `og:locale:alternate` в `<head>`).
- Интерактивная схема трёх миров с клавиатурной навигацией (tablist).
- 24 инструмента на трёх орбитах с живой подписью.
- Чтение восьми строк синтезом речи браузера; для саха и вьетнамского подбирается
  голос нужного языка (`sah-RU`, `vi-VN`) с понятным фолбэком, если его нет.
- Играбельный хомус: указатель или Space, высота тона по вертикали.
- Форма контакта собирает `mailto:` — ничего не отправляется без почтового клиента.
- `prefers-reduced-motion`, видимый фокус, skip-link, aria-атрибуты, `lang` на вставках саха.

## Культурная справка

Олоҥхо — героический эпос саха. ЮНЕСКО провозгласила его шедевром устного
нематериального наследия в 2005 году и включила в Репрезентативный список в 2008-м.
Эпос исполняют олоҥхоһуты, чередуя пение и речитатив; миры держатся на древе
Аал Луук Мас, а небо делится на девять ярусов.

Текст сказания на сайте — авторский, по мотивам олоҥхо, а не цитата и не научный
пересказ. Схемы миров — авторская интерпретация. Хомус — отдельная традиция саха,
в олоҥхо он не участвует; инструмент добавлен как самостоятельный эксперимент.

Подробнее: [UNESCO — Олоҥхо, Yakut heroic epos](https://ich.unesco.org/en/RL/olonkho-yakut-heroic-epos-00145)

## Стек

HTML, CSS, JavaScript (ES-модули), Canvas 2D, Web Audio API, Speech Synthesis API.
Без фреймворков, без сборщика, без внешних запросов в рантайме.

---

# Олоҥхо of Digital Worlds *(English)*

Pavel Afanasyev's portfolio told as an Олоҥхо — the heroic epic of the Sakha people.
Three worlds, nine heavens and six deeds of a maker: web, API, mobile and AI products.

The site speaks four languages: **Russian, English, Sakha and Vietnamese** —
`?lang=ru` · `?lang=en` · `?lang=sah` · `?lang=vi`.

Static and dependency-free: run any HTTP server inside `Олоҥхо/`
(`python -m http.server 4173`) and open `http://localhost:4173`. No build step,
no framework, no runtime requests to third parties.

About Олоҥхо: proclaimed by UNESCO in 2005 a masterpiece of the oral and
intangible heritage of humanity and inscribed in 2008 on the Representative List.
The epic is performed by олоҥхоһутs, alternating song and narration; the worlds
rest on the Aal Luuk Mas tree and the sky has nine tiers. The verse on this site
is original, written *after* Олоҥхо — it is not a quotation and not a scholarly
retelling, and the world diagram is an author's interpretation.

---

# Олоҥхо цифровой дойдулара *(саха тыла)*

Павел Афанасьев портфолиота — саха норуотун героическай эпоһун, олоҥхону,
курдук кэпсэнэр. Үс дойду, тоҕус халлаан уонна маастар алта айымньыта:
веб, API, мобильнай приложениелар уонна ИИ-продукт.

Сайт түөрт тыллаах: **нууччалыы, ааҥлыы, саха уонна вьетнамныы** —
`?lang=ru` · `?lang=en` · `?lang=sah` · `?lang=vi`.

Сайт статическай: хомуйуу наада суох. Ханнык баҕарар HTTP-сервер сөп:

```bash
cd Олоҥхо
python -m http.server 4173
```

`http://localhost:4173` аһыҥ. Фреймворк, сборщик уонна туора сервердарга
сыһыаннаһыы суох — HTML, CSS уонна ES-модульларынан JS эрэ.

Олоҥхо — саха норуотун героическай эпоһа. UNESCO 2005 с. кини тыыннаах
уонна материалга киирбэт нэһилиэстибэтин шедеврынан биллэрбитэ, 2008 с.
Представительнай тиһиликкэ киллэрбитэ. Ситимнээх хоһоон — авторскай,
олоҥхоттон тыын ылбыт; эпостан цитата буолбатах. Дойду схемата —
авторскай быһаарыы. Хомус — туспа үгэс, олоҥхоҕо кыттыспат.

---

# Олоҥхо của những thế giới số *(Tiếng Việt)*

Hồ sơ của Pavel Afanasyev, kể theo lối sử thi Олоҥхо của người Sakha.
Ba thế giới, chín tầng trời và sáu chiến công của người kiến tạo:
web, API, ứng dụng di động và sản phẩm AI.

Trang có bốn ngôn ngữ: **tiếng Nga, tiếng Anh, tiếng Sakha và tiếng Việt** —
`?lang=ru` · `?lang=en` · `?lang=sah` · `?lang=vi`.

Trang tĩnh, không cần build: chạy một HTTP server bất kỳ trong thư mục
`Олоҥхо/` (`python -m http.server 4173`) rồi mở `http://localhost:4173`.
Không framework, không bundler, không gọi bên thứ ba lúc chạy — chỉ HTML,
CSS và JavaScript (ES module).

Về Олоҥхо: UNESCO công nhận là kiệt tác di sản truyền khẩu và phi vật thể
của nhân loại năm 2005 và ghi vào Danh sách Đại diện năm 2008. Sử thi do các
олоҥхоһут trình diễn, luân phiên giữa hát và kể; các thế giới tựa trên cây
Aal Luuk Mas và bầu trời chia chín tầng. Bài thơ trên trang là sáng tác
nguyên tác theo tinh thần Олоҥхо, không phải trích dẫn hay bản kể học thuật;
sơ đồ ba thế giới là cách diễn giải riêng. Khomus là một truyền thống khác,
không đệm cho Олоҥхо.
