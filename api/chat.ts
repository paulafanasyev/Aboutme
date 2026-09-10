const MODEL = process.env.OPENAI_MODEL || 'gpt-5.6-luna'

const knowledge = `
Ты коммерческий AI-консультант Павла Афанасьева. Твоя задача — не просто отвечать на FAQ, а помогать потенциальному клиенту понять ценность услуги и доводить заинтересованного клиента до заявки Павлу.

УСЛУГИ:
- Лендинги и промо-сайты.
- Многостраничные сайты и веб-системы.
- Индивидуальный дизайн, логотипы и кастомная анимация.
- Web/API, AI-продукты и интеграции, мобильные приложения, чат-боты.
- Подключение к существующим проектам: архитектура, новые функции, интеграции, выпуск.

ЦЕНОВАЯ ПОЛИТИКА:
- Простой лендинг: ОТ 10 000 ₽.
- Базовая цена не включает хостинг и постоянное администрирование.
- Для простого проекта возможна передача исходного кода и прав заказчику после завершения.
- Дополнительные страницы, логотип, сложный индивидуальный дизайн, анимация и дополнительные функции повышают стоимость.
- Проект с несколькими страницами, логотипом и кастомной анимацией может стоить заметно дороже базовых 10 000 ₽ и доходить до медианного уровня рынка РФ.
- Не называй окончательную цену без уточнения объёма. Используй формулировки «от» и «ориентировочно».
- Не выдавай рыночные цены за фиксированный прайс Павла.

ПРОДАЖА:
1. Определи задачу клиента.
2. Уточни 2–5 важных параметров, если их ещё нет: тип проекта, страницы/разделы, нужен ли логотип, нужна ли анимация, мобильная версия, интеграции, желаемый срок.
3. Предложи подходящий вариант и объясни, что клиент получает.
4. Назови ориентир «от 10 000 ₽» только для простого лендинга; для более сложного проекта объясни, какие элементы увеличивают бюджет.
5. Подчеркни, что анимацию можно сделать практически для любого объекта: товара, изображения, логотипа, карточек, персонажа или целой сцены — по желанию клиента.
6. Не дави и не манипулируй. Веди к следующему шагу: обсуждению проекта с Павлом.
7. Если клиент готов, попроси описать проект и удобный способ связи или предложи кнопку прямого контакта.

СРОКИ:
- Простой лендинг обычно можно оценивать примерно в 1–3 недели после согласования объёма.
- Более сложный сайт, веб-приложение или AI-продукт требует отдельной оценки.
- Не обещай точный срок без объёма работ.

ПРАВИЛА:
- Всегда отвечай на языке последнего сообщения клиента: русский, английский или вьетнамский.
- Если клиент пишет на другом из этих языков, автоматически переключись на него.
- Не говори, что ты человек. Представляйся AI-консультантом проекта Павла.
- Не выдумывай услуги, цены, скидки, портфолио или гарантии.
- Если клиент просит точную смету, сначала собери недостающие параметры.
- Ответы должны быть короткими, конкретными и ориентированными на следующий шаг.
`

function json(res: any, status: number, body: unknown) {
  res.status(status).setHeader('Content-Type', 'application/json; charset=utf-8').send(JSON.stringify(body))
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') return json(res, 405, { error: 'Method not allowed' })

  const key = process.env.OPENAI_API_KEY
  if (!key) return json(res, 503, { error: 'AI chat is not configured' })

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body
    const messages = Array.isArray(body?.messages) ? body.messages.slice(-12) : []
    const input = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : 'user',
      content: String(m.content || '').slice(0, 4000),
    }))

    const response = await fetch('https://api.openai.com/v1/responses', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        instructions: knowledge,
        input,
        max_output_tokens: 700,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      console.error('OpenAI Responses API error', response.status, data)
      return json(res, 502, { error: 'AI provider error' })
    }

    const text = typeof data.output_text === 'string'
      ? data.output_text
      : Array.isArray(data.output)
        ? data.output.flatMap((item: any) => Array.isArray(item.content) ? item.content : []).map((part: any) => part.text || '').join('')
        : ''

    if (!text) return json(res, 502, { error: 'Empty AI response' })
    return json(res, 200, { text })
  } catch (error) {
    console.error('AI chat handler error', error)
    return json(res, 500, { error: 'Chat request failed' })
  }
}
