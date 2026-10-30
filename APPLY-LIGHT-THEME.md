# Apply light theme (branch design/yakut-3d-light-v3)

## Already on this branch

- `src/SakhaSceneLoader.tsx` — `theme` prop
- `src/sakha-light.css` — full light UI
- `patches/assemble.py` — helper (optional)

## 1. Wire App.tsx (copy-paste these edits)

```ts
// after import './sakha.css'
import './sakha-light.css'

// next to type Lang
type Theme = 'dark' | 'light'

// inside App(), after lang state:
const [theme, setTheme] = useState<Theme>(() => {
  const saved = localStorage.getItem('site-theme')
  return saved === 'light' ? 'light' : 'dark'
})
useEffect(() => {
  document.documentElement.dataset.theme = theme
}, [theme])
const toggleTheme = () => {
  setTheme((prev) => {
    const next = prev === 'dark' ? 'light' : 'dark'
    localStorage.setItem('site-theme', next)
    return next
  })
}
```

Root element:
```tsx
className={`site lang-${lang}`} data-theme={theme}
```

Scene:
```tsx
<SakhaThreeScene lang={lang} theme={theme} />
```

Button near languageSwitch:
```tsx
<button type="button" className="themeToggle" onClick={toggleTheme}>
  {theme === 'dark' ? '☀' : '☾'} {theme === 'dark' ? 'Светлая' : 'Тёмная'}
</button>
```

## 2. SakhaThreeScene.tsx — daytime graphics

```ts
export default function SakhaThreeScene({ lang = 'ru', theme = 'dark' }) {
  const isLight = theme === 'light'
  // fog:
  scene.fog = new THREE.Fog(isLight ? 0xc8e4dc : 0x071923, isLight ? 11 : 8.5, isLight ? 28 : 23)
  // sun instead of moon when light:
  // DirectionalLight(isLight ? 0xfff4e0 : 0xd0f8ed, isLight ? 2.05 : 1.55)
  // ground center: isLight ? 0x3d8a6a : 0x1b5147
  // water deep: isLight ? 0x1a7a8a : 0x0c3b45
  // stars opacity: isLight ? 0 : 0.82
  // useEffect deps: [theme]
}
```

Full improved scene is prepared locally; large-file API limits blocked a single-blob push.
Apply the App edits above, then we can continue the scene push in smaller surgical commits if needed.
