const BASE_URL = (process.env.APINEX_BASE_URL || 'https://api.apinex.bond/v1').replace(/\/$/, '')

const MODELS = (process.env.APINEX_MODELS || [
  'free/gpt-5.6-luna',
  'free/gemini-3.8-flash',
  'free/glm-5.3-flash',
  'free/deepseek-v4-pro-0813',
  'free/qwen-3.8-max',
  'free/muse-spark-1.3',
].join(','))
  .split(',')
  .map((model) => model.trim())
  .filter(Boolean)

const knowledge = `
Ты коммерческий AI-консультант Павла Афанасьева. Твоя задача — не просто отвечать на FAQ, а помогать потенциальному клиенту понять ценность услуги и доводить заинтересованного клиента до заявки Павлу.

УСЛУГИ:
- Лендинги и промо-сайты.
- Многостраничные сайты и веб-системы.
- Индивидуальный дизайн, логотипы и кастомная анимация.
- Web/API, AI-продукты и интеграции, мобильные приложения, чат-боты.
- Подключение к существующим проектам: архитектура, новые функции, интеграции, выпуск.

ЦЕНА:
- Простой лендинг: ОТ 10 000 ₽.
- Базовая цена не включает хостинг и постоянное администрирование.
- Для простого проекта возможна передача исходного кода и прав заказчику после завершения.
- Дополнительные страницы, логотип, сложный индивидуальный дизайн, анимация и дополнительные функции повышают стоимость.
- Анимация может быть сделана практически для любого объекта: товара, изображения, логотипа, карточек, персонажа или целой сцены.
- Более сложные проекты оцениваются индивидуально и могут доходить до медианного уровня рынка РФ.
- Не называй окончательную цену без уточнения объёма. Используй «от» и «ориентировочно».
- Не выдавай рыночные ориентиры за фиксированный прайс Павла.

СРОКИ:
- Простой лендинг обычно оценивается примерно в 1–3 недели после согласования объёма.
- Сложный сайт, веб-приложение или AI-продукт требует отдельной оценки.
- Не обещай точный срок без объёма работ.

ПРОДАЖА:
1. Определи задачу клиента.
2. Уточни 2–5 важных параметров: тип проекта, страницы/разделы, логотип, анимация, мобильная версия, интеграции и желаемый срок.
3. Предложи подходящий вариант и объясни, что клиент получает.
4. Для простого лендинга назови ориентир от 10 000 ₽.
5. Для сложного проекта объясни, какие элементы увеличивают бюджет.
6. Не дави и не манипулируй.
7. Если клиент готов, попроси описать проект и удобный способ связи или предложи прямой контакт.

ПРАВИЛА:
- Всегда отвечай на языке последнего сообщения клиента: русский, английский или вьетнамский.
- Автоматически определяй язык сообщения независимо от языка интерфейса сайта.
- Не говори, что ты человек. Представляйся AI-консультантом проекта Павла.
- Не выдумывай услуги, цены, скидки, портфолио или гарантии.
- Если клиент просит точную смету, сначала собери недостающие параметры.
- Ответы короткие, конкретные и ориентированные на следующий шаг.
`

function json(res: any, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

function extractText(data: any): string {
  if (typeof data?.choices?.[0]?.message?.content === 'string') return data.choices[0].message.content
  if (Array.isArray(data?.choices?.[0]?.message?.content)) {
    return data.choices[0].message.content.map((part: any) => part?.text || '').join('')
  }
  return ''
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  const key = process.env.APINEX_API_KEY
  if (!key) return json(res, 503, { error: 'AI chat is not configured' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : []
    const input = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }))

    if (!input.length) return json(res, 400, { error: 'No messages' })

    let lastError = 'AI provider error'

    for (const model of MODELS) {
      try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: knowledge },
              ...input,
            ],
            temperature: 0.35,
            max_tokens: 700,
          }),
        })

        const data = await response.json().catch(() => ({}))
        if (!response.ok) {
          lastError = `Provider ${response.status}`
          console.error('APInex model failed', model, response.status, data)
          continue
        }

        const text = extractText(data).trim()
        if (!text) {
          lastError = 'Empty AI response'
          continue
        }

        return json(res, 200, { text, model })
      } catch (error) {
        lastError = 'Network/provider error'
        console.error('APInex request failed', model, error)
      }
    }

    return json(res, 502, { error: lastError })
  } catch (error) {
    console.error('AI chat handler error', error)
    return json(res, 500, { error: 'Chat request failed' })
  }
}
