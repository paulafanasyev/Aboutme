/* AI project consultant: quick topics and free text. Answers come from the
   api/chat backend when one is deployed; on pure static hosting the built-in
   scenario answers instead. Nothing is stored — the dialogue lives in memory. */

const TEXT = {
  ru: {
    open: "Обсудить проект с AI",
    close: "Закрыть чат",
    welcome:
      "Привет! Давайте обсудим наше сотрудничество. Расскажите, какой сайт, приложение или AI-продукт вам нужен — я помогу подобрать решение и ориентировочную стоимость.",
    typing: "Печатаю…",
    fallback:
      "Опишите задачу своими словами — я помогу определить подходящий формат проекта, ориентир стоимости и следующий шаг.",
    answers: {
      services:
        "Могу помочь с лендингом, многостраничным сайтом, веб-системой, AI-продуктом, мобильным приложением или подключением к существующему проекту. Можно заказать полный цикл или отдельный слой.",
      price:
        "Простой лендинг — от 10 000 ₽, без хостинга и постоянного администрирования. Для простого проекта возможна передача исходного кода и прав. Несколько страниц, логотип, индивидуальный дизайн и кастомная анимация увеличивают стоимость; сложный вариант может доходить до медианного уровня рынка РФ.",
      time:
        "Простой лендинг обычно можно оценить примерно в 1–3 недели. Более сложный сайт, AI-продукт или мобильное приложение оцениваются после уточнения объёма.",
      process:
        "Сначала выясняем задачу и объём, затем фиксируем решение, создаём первую версию, подключаем интеграции, тестируем и выпускаем. Анимацию можно сделать практически для любого товара, изображения, логотипа или сцены.",
      contact:
        "Опишите продукт, функции, платформу, желаемый срок и что должно быть на сайте. Я помогу сформировать предварительный вариант и довести разговор до Павла.",
    },
  },
  en: {
    open: "Discuss a project with AI",
    close: "Close chat",
    welcome:
      "Hi! Let's discuss your project. Tell me what website, app or AI product you need — I’ll help find the right solution and an estimated budget.",
    typing: "Thinking…",
    fallback:
      "Describe your project in your own words and I’ll help identify the right format, estimated budget and next step.",
    answers: {
      services:
        "I can help with a landing page, multi-page site, web system, AI product, mobile app or an existing project. Full-cycle delivery or a specific layer is available.",
      price:
        "A simple landing page starts from RUB 10,000, excluding hosting and ongoing administration. Source code and rights can be transferred for a simple project. Extra pages, a logo, custom design and animation increase the budget; a complex version can reach the Russian market median.",
      time:
        "A simple landing page can usually be estimated at about 1–3 weeks. More complex sites, AI products or mobile apps are estimated after scope is clarified.",
      process:
        "We clarify the goal and scope first, then define the solution, build the first version, add integrations, test and release. Animation can be created for almost any product, image, logo or scene.",
      contact:
        "Describe the product, features, platform, desired deadline and what the site should contain. I’ll help shape an initial option and move the conversation to Pavel.",
    },
  },
  sah: {
    open: "Бырайыак туһунан ИИ-ны кытта кэпсэт",
    close: "Чаты сап",
    welcome:
      "Дорообо! Кэпсэтиини ыытыахха. Эн туох сайт, приложение эбэтэр ИИ-продукт наадатын кэпсээ — мин сөп түбэһэр быһаарыыны уонна сыана ориентирин буларга көмөлөһүөм.",
    typing: "Суруйабын…",
    fallback:
      "Задачаҕын бэйэҥ тылгынан ойуулаа — мин сөп түбэһэр формат, сыана ориентира уонна кэлэр хардыыны быһаарарга көмөлөһүөм.",
    answers: {
      services:
        "Лендинг, элбэх страницалаах сайт, веб-система, ИИ-продукт, мобильнай приложение эбэтэр баар бырайыакка холбонуу — барытыгар көмөлөһүөхпүн сөп. Толору цикл эбэтэр туспа слой.",
      price:
        "Простой лендинг — 10 000 ₽-ттан, хостинг уонна администрирование киирбэттэр. Простой бырайыакка исходнай код уонна быраап бэриллиэн сөп. Элбэх страница, логотип, индивидуальный дизайн уонна анимация сыананы үрдэтэллэр; уустук вариант Арассыыйа ырыынагын медианнай таһымыгар дылы тиийиэн сөп.",
      time:
        "Простой лендинг — 1–3 нэдиэлэ курдук. Уустук сайт, ИИ-продукт эбэтэр мобильнай приложение үлэ кээмэйэ чопчуланнаҕына сыаналанар.",
      process:
        "Бастаан задачаны уонна кээмэйи чопчулуурут, ол кэннэ быһаарыыны бигэргэтэбит, бастакы версияны оҥоробут, интеграциялары холбуубут, тестылыыбыт уонна таһаарабыт.",
      contact:
        "Продукт, функциялар, платформа, кэм уонна сайтка туох баар буолуохтааҕын ойуулаа. Мин бастакы варианты оҥорсорго уонна кэпсэтиини Павелга тиэрдэргэ көмөлөһүөм.",
    },
  },
  vi: {
    open: "Trao đổi dự án với AI",
    close: "Đóng chat",
    welcome:
      "Xin chào! Hãy cùng trao đổi về dự án của bạn. Hãy cho tôi biết bạn cần website, ứng dụng hay sản phẩm AI nào — tôi sẽ giúp chọn giải pháp và ước tính chi phí.",
    typing: "Đang trả lời…",
    fallback:
      "Hãy mô tả dự án theo cách của bạn. Tôi sẽ giúp xác định hình thức phù hợp, ngân sách tham khảo và bước tiếp theo.",
    answers: {
      services:
        "Tôi có thể hỗ trợ landing page, website nhiều trang, hệ thống web, sản phẩm AI, ứng dụng mobile hoặc dự án hiện có. Có thể làm trọn gói hoặc một phần riêng.",
      price:
        "Landing page đơn giản có giá từ 10.000 RUB, chưa gồm hosting và quản trị thường xuyên. Với dự án đơn giản có thể bàn giao mã nguồn và quyền. Thêm nhiều trang, logo, thiết kế riêng và animation sẽ tăng chi phí; dự án phức tạp có thể đạt mức trung vị của thị trường Nga.",
      time:
        "Landing page đơn giản thường có thể ước tính khoảng 1–3 tuần. Website phức tạp hơn, sản phẩm AI hoặc mobile sẽ được ước tính sau khi chốt phạm vi.",
      process:
        "Đầu tiên xác định mục tiêu và phạm vi, sau đó chốt giải pháp, xây dựng phiên bản đầu tiên, tích hợp, kiểm thử và phát hành. Animation có thể làm cho gần như mọi sản phẩm, hình ảnh, logo hoặc cảnh.",
      contact:
        "Hãy mô tả sản phẩm, chức năng, nền tảng, thời hạn mong muốn và nội dung website. Tôi sẽ giúp hình thành phương án ban đầu và chuyển cuộc trao đổi tới Pavel.",
    },
  },
};

export function initChat({ getLang }) {
  const launcher = document.getElementById("chatLauncher");
  const panel = document.getElementById("clientChat");
  const body = document.getElementById("chatBody");
  const form = document.getElementById("chatForm");
  const input = document.getElementById("chatInput");
  const closeBtn = document.getElementById("chatClose");
  const quick = document.getElementById("chatQuick");
  const label = launcher?.querySelector(".chat-launcher-label");
  if (!launcher || !panel || !body || !form || !input || !quick) return;

  const t = () => TEXT[getLang()] || TEXT.ru;
  let messages = [{ from: "bot", text: t().welcome }];
  let busy = false;
  let apiAvailable = true;

  function render() {
    body.replaceChildren();
    for (const message of messages) {
      const bubble = document.createElement("div");
      bubble.className = `chat-bubble ${message.from}`;
      bubble.textContent = message.text;
      body.appendChild(bubble);
    }
    if (busy) {
      const bubble = document.createElement("div");
      bubble.className = "chat-bubble bot chat-bubble--typing";
      bubble.textContent = t().typing;
      body.appendChild(bubble);
    }
    body.scrollTop = body.scrollHeight;
  }

  function syncControls() {
    quick.querySelectorAll("button").forEach((button) => {
      button.disabled = busy;
    });
    const submit = form.querySelector('button[type="submit"]');
    if (submit) submit.disabled = busy;
  }

  function setOpen(open) {
    panel.hidden = !open;
    launcher.setAttribute("aria-expanded", String(open));
    launcher.setAttribute("aria-label", open ? t().close : t().open);
    if (label) label.textContent = open ? "×" : "AI";
    if (open) {
      render();
      input.focus({ preventScroll: true });
    } else {
      launcher.focus({ preventScroll: true });
    }
  }

  async function send(preset, topic) {
    const text = (preset ?? input.value).trim();
    if (!text || busy) return;
    messages.push({ from: "user", text });
    input.value = "";
    busy = true;
    syncControls();
    render();

    let answer = null;
    if (apiAvailable) {
      try {
        const response = await fetch("api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            lang: getLang(),
            messages: messages.slice(-12).map((m) => ({
              role: m.from === "bot" ? "assistant" : "user",
              content: m.text,
            })),
            topic,
          }),
        });
        const data = await response.json();
        if (!response.ok || !data.text) throw new Error("AI unavailable");
        answer = String(data.text);
      } catch {
        apiAvailable = false;
      }
    }
    if (answer == null) {
      answer = (topic && t().answers[topic]) || t().fallback;
    }
    messages.push({ from: "bot", text: answer });
    busy = false;
    syncControls();
    render();
  }

  launcher.addEventListener("click", () => setOpen(panel.hidden));
  closeBtn?.addEventListener("click", () => setOpen(false));
  
  const taleCtaBtn = document.getElementById("taleChatBtn");
  taleCtaBtn?.addEventListener("click", () => setOpen(true));
  
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    send();
  });
  quick.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-topic]");
    if (button) send(button.textContent.trim(), button.getAttribute("data-topic"));
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.hidden) {
      event.preventDefault();
      setOpen(false);
    }
  });

  window.addEventListener("langchange", () => {
    messages = [{ from: "bot", text: t().welcome }];
    launcher.setAttribute("aria-label", panel.hidden ? t().open : t().close);
    if (!panel.hidden) render();
  });

  launcher.setAttribute("aria-label", t().open);
  render();
}