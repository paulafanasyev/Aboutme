/* Contact form: field-level validation, a prepared mailto and a copy fallback.
   Nothing is submitted anywhere — the visitor's mail client takes over. */

const TEXT = {
  ru: {
    error: "Проверьте выделенные поля.",
    name: "Напишите, как к вам обращаться.",
    contact: "Укажите почту или имя в Telegram.",
    contactFormat: "Похоже на опечатку: нужна почта вида you@example.com или @username.",
    idea: "Добавьте хотя бы одну фразу о замысле.",
    opening: "Открываю почтовый клиент…",
    copied: "Письмо скопировано — вставьте его в почту или мессенджер.",
    copyFailed: "Не удалось скопировать. Выделите текст письма вручную.",
    copyEmpty: "Сначала заполните все три поля.",
    subject: (name) => `Замысел · ${name}`,
    body: (name, contact, idea) =>
      `Здравствуйте, Павел!\n\nМеня зовут ${name}.\nСвязаться со мной: ${contact}\n\nО замысле:\n${idea}\n\n— отправлено с сайта «Олоҥхо цифровых миров»`,
  },
  en: {
    error: "Please check the highlighted fields.",
    name: "Tell me what to call you.",
    contact: "Add an email or a Telegram username.",
    contactFormat: "That looks off: use you@example.com or @username.",
    idea: "Add at least one sentence about the idea.",
    opening: "Opening your email client…",
    copied: "Message copied — paste it into any email or messenger.",
    copyFailed: "Copy failed. Select the message text and copy it manually.",
    copyEmpty: "Fill in all three fields first.",
    subject: (name) => `Project idea · ${name}`,
    body: (name, contact, idea) =>
      `Hello Pavel,\n\nMy name is ${name}.\nYou can reach me at: ${contact}\n\nAbout the idea:\n${idea}\n\n— sent from the “Олоҥхо of Digital Worlds” site`,
  },
  sah: {
    error: "Бэлиэтэммит хонуулары бэрэбиэркэлээ.",
    name: "Эйигин хайдах ааттыырбын кэпсээ.",
    contact: "Email эбэтэр Telegram аатын ый.",
    contactFormat: "Маннык сыыһа курдук: you@example.com эбэтэр @username наада.",
    idea: "Санааҥ туһунан кырата биир этии киллэр.",
    opening: "Email-клиентыҥ аһыллар…",
    copied: "Сурук көһөрүлүннэ — почтаҕа эбэтэр мессенджерга сыһыар.",
    copyFailed: "Көһөрүү сатаммата. Суругу илиигинэн талын уонна көһөр.",
    copyEmpty: "Бастаан үс хонуу толор.",
    subject: (name) => `Санаа · ${name}`,
    body: (name, contact, idea) =>
      `Дорообо, Павел!\n\nМин аатым ${name}.\nСитим: ${contact}\n\nСанааҥ туһунан:\n${idea}\n\n— «Олоҥхо цифровой дойдулара» сайттан ыытылынна`,
  },
  vi: {
    error: "Vui lòng kiểm tra các trường được đánh dấu.",
    name: "Hãy cho tôi biết tên bạn.",
    contact: "Nhập email hoặc tên Telegram.",
    contactFormat: "Có vẻ chưa đúng: dùng you@example.com hoặc @username.",
    idea: "Thêm ít nhất một câu về ý tưởng.",
    opening: "Đang mở ứng dụng email…",
    copied: "Đã sao chép lời nhắn — hãy dán vào email hoặc ứng dụng nhắn tin.",
    copyFailed: "Sao chép thất bại. Hãy chọn văn bản và sao chép thủ công.",
    copyEmpty: "Hãy điền cả ba trường trước.",
    subject: (name) => `Ý tưởng dự án · ${name}`,
    body: (name, contact, idea) =>
      `Chào Pavel,\n\nTôi là ${name}.\nLiên hệ với tôi: ${contact}\n\nVề ý tưởng:\n${idea}\n\n— gửi từ trang “Олоҥхо của những thế giới số”`,
  },
};

const MAIL = "pavel.afanadyev@inbox.ru";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const TELEGRAM_RE = /^@[a-zA-Z][a-zA-Z0-9_]{3,31}$/;
const TELEGRAM_URL_RE = /^(https?:\/\/)?(t\.me|telegram\.me)\//i;

export function initContact({ getLang }) {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const name = document.getElementById("fieldName");
  const contact = document.getElementById("fieldContact");
  const idea = document.getElementById("fieldIdea");
  const status = document.getElementById("formStatus");
  const copyBtn = document.getElementById("formCopy");
  const fields = [name, contact, idea].filter(Boolean);
  const errorFor = {
    name: document.getElementById("fieldNameError"),
    contact: document.getElementById("fieldContactError"),
    idea: document.getElementById("fieldIdeaError"),
  };

  const state = { errors: {}, statusKey: null, statusError: false };
  const t = () => TEXT[getLang()] || TEXT.ru;

  function renderStatus() {
    if (!status) return;
    status.textContent = state.statusKey ? t()[state.statusKey] : "";
    status.classList.toggle("is-error", Boolean(state.statusKey && state.statusError));
  }

  function setStatus(key, error = false) {
    state.statusKey = key;
    state.statusError = Boolean(error);
    renderStatus();
  }

  function setFieldError(field, message) {
    const key = field?.name;
    if (!key) return;
    const span = errorFor[key];
    const invalid = Boolean(message);
    if (span) span.textContent = message || "";
    field.setAttribute("aria-invalid", invalid ? "true" : "false");
    if (invalid) state.errors[key] = true;
    else delete state.errors[key];
  }

  fields.forEach((input) => {
    input.addEventListener("input", () => {
      if (state.errors[input.name]) setFieldError(input, "");
      if (state.statusKey) setStatus(null);
    });
  });

  function contactMessage(value) {
    if (!value) return t().contact;
    if (EMAIL_RE.test(value) || TELEGRAM_RE.test(value) || TELEGRAM_URL_RE.test(value)) return "";
    return t().contactFormat;
  }

  function collect() {
    const values = {
      name: name?.value.trim() || "",
      contact: contact?.value.trim() || "",
      idea: idea?.value.trim() || "",
    };
    if (name) setFieldError(name, values.name ? "" : t().name);
    if (contact) setFieldError(contact, contactMessage(values.contact));
    if (idea) setFieldError(idea, values.idea.length >= 4 ? "" : t().idea);
    return values;
  }

  function buildHref(values) {
    const subject = encodeURIComponent(t().subject(values.name));
    const body = encodeURIComponent(t().body(values.name, values.contact, values.idea.slice(0, 1600)));
    return `mailto:${MAIL}?subject=${subject}&body=${body}`;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const values = collect();
    const firstInvalid = fields.find((input) => input.getAttribute("aria-invalid") === "true");
    if (firstInvalid) {
      setStatus("error", true);
      firstInvalid.focus({ preventScroll: false });
      return;
    }
    setStatus("opening");
    window.location.href = buildHref(values);
  });

  copyBtn?.addEventListener("click", async () => {
    const values = collect();
    const firstInvalid = fields.find((input) => input.getAttribute("aria-invalid") === "true");
    if (firstInvalid) {
      setStatus("copyEmpty", true);
      firstInvalid.focus({ preventScroll: false });
      return;
    }
    const text = t().body(values.name, values.contact, values.idea.slice(0, 1600));
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const ok = document.execCommand("copy");
        area.remove();
        if (!ok) throw new Error("copy");
      }
      setStatus("copied");
    } catch {
      setStatus("copyFailed", true);
    }
  });

  window.addEventListener("langchange", () => {
    fields.forEach((input) => {
      if (!state.errors[input.name]) return;
      if (input.name === "name") setFieldError(input, t().name);
      else if (input.name === "contact") setFieldError(input, contactMessage(input.value.trim()));
      else setFieldError(input, t().idea);
    });
    renderStatus();
  });
}
