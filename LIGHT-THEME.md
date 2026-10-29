# Light theme + graphics upgrade

Branch: `design/yakut-3d-light-v2`

## Already on this branch

- `src/SakhaSceneLoader.tsx` — accepts `theme: 'dark' | 'light'` and passes it to the scene
- `src/sakha-light.css` — full light UI (paper/cream, teal accents, gold, map, controls, chat)

## Finish in App.tsx (small edits)

1. Import light CSS after sakha.css:
```ts
import './sakha.css'
import './sakha-light.css'
```

2. Add type and state:
```ts
type Theme = 'dark' | 'light'
// inside App():
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

3. On root element:
```tsx
className={`site lang-${lang}`} data-theme={theme}
```

4. Pass theme to scene:
```tsx
<SakhaThreeScene lang={lang} theme={theme} />
```

5. Theme toggle button (near languageSwitch):
```tsx
<button
  type="button"
  className="themeToggle"
  onClick={toggleTheme}
  aria-label={theme === 'dark' ? 'Light theme' : 'Dark theme'}
>
  {theme === 'dark' ? '☀ Light' : '☾ Dark'}
</button>
```

## SakhaThreeScene.tsx graphics upgrade

Add prop `theme = 'dark'`, then `const isLight = theme === 'light'`.

Key visual changes when `isLight`:

| Area | Dark | Light |
|------|------|-------|
| Fog | `0x071923` | `0xc8e4dc` |
| Key light | cool moon | warm sun `0xfff4e0` |
| Ground center | `0x1b5147` | `0x3d8a6a` |
| Water deep | `0x0c3b45` | `0x1a7a8a` |
| Mountains | `0x123e43` | `0x2a5f5a` |
| Stars | visible | opacity 0 |
| Aurora | strong | soft |
| Rim light | none | soft teal fill |

Also set `useEffect` deps to `[theme]` so the scene rebuilds on toggle.

## Broken branch

Do **not** use `design/yakut-3d-light-theme` — several files were emptied during an earlier push. Prefer `design/yakut-3d-light-v2`.
