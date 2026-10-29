import { lazy, Suspense, useEffect, useRef, useState } from 'react'

type SceneLanguage = 'ru' | 'en' | 'vi'
type SceneTheme = 'dark' | 'light'

const DeferredSakhaThreeScene = lazy(() => import('./SakhaThreeScene'))

export default function SakhaSceneLoader({
  lang = 'ru',
  theme = 'dark',
}: {
  lang?: SceneLanguage
  theme?: SceneTheme
}) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    const map = host?.closest('.alasMap')
    if (!map) {
      setShouldLoad(true)
      return
    }
    if (!('IntersectionObserver' in window)) {
      setShouldLoad(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true)
          observer.disconnect()
        }
      },
      { rootMargin: '240px 0px', threshold: 0.01 },
    )

    observer.observe(map)
    return () => observer.disconnect()
  }, [])

  const loadingLabel =
    lang === 'ru'
      ? 'Подготовка сцены Саха…'
      : lang === 'vi'
        ? 'Đang chuẩn bị cảnh Saha…'
        : 'Preparing the Sakha scene…'

  return (
    <div ref={hostRef} className="sakhaSceneLoader" data-theme={theme}>
      {shouldLoad && (
        <Suspense
          fallback={
            <div className="sceneLoading" role="status">
              <img src={import.meta.env.BASE_URL + 'logo-pavel.svg'} alt="" />
              <span>{loadingLabel}</span>
            </div>
          }
        >
          <DeferredSakhaThreeScene lang={lang} theme={theme} />
        </Suspense>
      )}
    </div>
  )
}
