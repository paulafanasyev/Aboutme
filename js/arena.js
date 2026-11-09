import { pluck, isSoundEnabled } from "./audio.js";

const TEXT = {
  ru: {
    gameIndex: "Игры",
    indexAscent: "Восхождение",
    indexAscentSub: "Тоҕус халлаан · полёт сквозь кольца",
    indexBattle: "Боотур",
    indexBattleSub: "Орто дойду · бой с абаасы",
    indexRescue: "Куттар",
    indexRescueSub: "Светлые духи · защита добра",
    battleKicker: "Орто дойду · добро против зла",
    battleTitle: "Битва за Средний мир",
    battleLead: "Веди богатыря по снежному полю, сокращай дистанцию и рази абаасы мечом. Три волны, в последней — старший дух Нижнего мира.",
    battleOverlay: "Боотур против абаасы",
    battleStart: "Вступить в бой",
    battleReady: "Подойди к духу и нанеси удар. Три волны отделяют тебя от победы.",
    battleAction: "Удар мечом",
    battleWin: (n) => `Средний мир защищён. Побеждено духов: ${n}.`,
    battleLose: (n) => `Боотур пал в бою. Побеждено духов: ${n}. Попробуй ещё раз.`,
    battleWave: (n) => n === 3 ? "Старший абаасы вступает в бой" : `Волна ${n} из 3`,
    battleHit: "Удар достиг цели",
    battleHurt: "Абаасы ранит Боотура",
    battleStage: "3D-игра: Боотур сражается с абаасы",
    battleNote: "Это авторская игра по мотивам эпоса, а не канонический эпизод. 3D-доспех создан по фотографии всадника саха; абаасы — вырезанный из снимка летней сцены актёр олонхо.",
    booturCaption: "Образ доспеха Боотура",
    booturAlt: "Всадник саха в пластинчатом доспехе, с копьём и круглым щитом",
    abaasyCaption: "Абаасы в актёрском образе",
    abaasyAlt: "Актёр олонхо на летней сцене: коричневый халадай с серебряным нагрудником и бляхами пояса, обе руки подняты, над головой — бутафорский меч",
    rescueKicker: "Куттар · свет против тьмы",
    rescueTitle: "Куттары харыстаа",
    rescueSubtitle: "Спаси светлых духов",
    rescueLead: "Белые духи кут теряются в метели. Подойди к ним, чтобы вернуть в мир людей, а тёмных абаасы отгоняй импульсом света. Добро здесь — не число побед, а двенадцать спасённых огней.",
    rescueOverlay: "Не дай огням погаснуть",
    rescueStart: "Начать спасение",
    rescueReady: "Касайся белых огней. Тёмных духов отгоняй импульсом света.",
    rescueAction: "Импульс света",
    rescueWin: (n) => `В метели снова светло. Спасено духов: ${n}.`,
    rescueLose: (n) => `Остались неспасённые огни. Спасено духов: ${n}. Попробуй ещё раз.`,
    rescueSaved: (n) => `Огонь возвращён · ${n} из 12`,
    rescueLost: "Белый огонь погас в метели",
    rescuePulse: "Свет отгоняет тьму",
    rescueStage: "3D-игра: спасение светлых духов кут",
    rescueNote: "Кут в этой игре — художественный образ жизненного огня. Светлые и тёмные существа объёмны: их положение, размер и тень меняются с расстоянием.",
    pause: "Пауза",
    resume: "Продолжить",
    again: "Играть ещё раз",
    paused: "Пауза",
    goalBattle: "Побеждено",
    goalRescue: "Спасено",
    healthBattle: "Кут",
    healthRescue: "Свет",
    wave: "Волна",
    time: "Время",
    best: "Рекорд",
    battleHint: "WASD или палец — движение · пробел или кнопка — удар · Esc — пауза",
    rescueHint: "WASD или палец — движение · пробел или кнопка — свет · Esc — пауза",
    battleHelp: ["Двигайся мышью, пальцем или клавишами WASD и стрелками", "Пробел, щелчок или золотая кнопка — удар мечом", "Победи три волны; красные вспышки предупреждают об атаке духа"],
    rescueHelp: ["Коснись белого духа — его огонь спасён", "Импульс света отгоняет только тёмных абаасы", "Спаси двенадцать духов за 75 секунд и не растеряй собственный свет"],
  },
  en: {
    gameIndex: "Games",
    indexAscent: "The ascent",
    indexAscentSub: "Тоҕус халлаан · fly through the hoops",
    indexBattle: "Bootur",
    indexBattleSub: "Орто дойду · fight the abaahy",
    indexRescue: "The kut",
    indexRescueSub: "Spirits of light · protect the living",
    battleKicker: "Орто дойду · good against evil",
    battleTitle: "The battle for the Middle World",
    battleLead: "Guide the hero across the snow, close the distance and strike the abaahy with your sword. Survive three waves; the eldest spirit of the Lower World leads the last.",
    battleOverlay: "Bootur against the abaahy",
    battleStart: "Enter the battle",
    battleReady: "Approach a spirit and strike. Three waves stand between you and victory.",
    battleAction: "Sword strike",
    battleWin: (n) => `The Middle World is safe. Spirits defeated: ${n}.`,
    battleLose: (n) => `Bootur has fallen. Spirits defeated: ${n}. Try again.`,
    battleWave: (n) => n === 3 ? "The elder abaahy enters the field" : `Wave ${n} of 3`,
    battleHit: "Your strike finds its mark",
    battleHurt: "An abaahy wounds Bootur",
    battleStage: "3D game: Bootur battles the abaahy",
    battleNote: "An original game inspired by the epic, not a canonical episode. The 3D armour follows the Sakha horseman photograph; the abaahy is an Olonkho performer cut from the outdoor stage photograph.",
    booturCaption: "Reference for Bootur's armour",
    booturAlt: "A Sakha horseman in lamellar armour with a spear and a round shield",
    abaasyCaption: "An Abaahy in performance",
    abaasyAlt: "An Olonkho performer on an outdoor stage: brown kheladai robe with a silver chest band and belt plates, both arms raised, a prop sword held overhead",
    rescueKicker: "Kut · light against darkness",
    rescueTitle: "Protect the kut",
    rescueSubtitle: "Rescue the spirits of light",
    rescueLead: "White kut spirits are lost in the blizzard. Reach them to return their fire to the human world, and drive the dark abaahy away with pulses of light. Here good means twelve fires saved, not enemies counted.",
    rescueOverlay: "Do not let the fires go out",
    rescueStart: "Begin the rescue",
    rescueReady: "Touch the white fires. Drive dark spirits away with light.",
    rescueAction: "Pulse of light",
    rescueWin: (n) => `Light returns to the blizzard. Spirits rescued: ${n}.`,
    rescueLose: (n) => `Some fires remain lost. Spirits rescued: ${n}. Try again.`,
    rescueSaved: (n) => `Fire returned · ${n} of 12`,
    rescueLost: "A white fire went out in the blizzard",
    rescuePulse: "The light drives darkness back",
    rescueStage: "3D game: rescue the white kut spirits",
    rescueNote: "Kut is represented here as an artistic fire of life. Light and dark beings occupy three-dimensional space: their position, size and shadow change with distance.",
    pause: "Pause",
    resume: "Resume",
    again: "Play again",
    paused: "Paused",
    goalBattle: "Defeated",
    goalRescue: "Rescued",
    healthBattle: "Kut",
    healthRescue: "Light",
    wave: "Wave",
    time: "Time",
    best: "Best",
    battleHint: "WASD or finger to move · Space or button to strike · Esc pauses",
    rescueHint: "WASD or finger to move · Space or button for light · Esc pauses",
    battleHelp: ["Move with the mouse, a finger, WASD or the arrow keys", "Space, a click or the gold button strikes with the sword", "Defeat three waves; red flashes warn of a spirit's attack"],
    rescueHelp: ["Touch a white spirit to save its fire", "A pulse of light drives away only the dark abaahy", "Rescue twelve spirits in 75 seconds without losing your own light"],
  },
  sah: {
    gameIndex: "Оонньуулар",
    indexAscent: "Үөһээ көтүү",
    indexAscentSub: "Тоҕус халлаан · төҥүрүктэртэн ааһыы",
    indexBattle: "Боотур",
    indexBattleSub: "Орто дойду · абааһылары кытта охсуһуу",
    indexRescue: "Куттар",
    indexRescueSub: "Сырдык куттар · үтүөнү харыстыы",
    battleKicker: "Орто дойду · үтүө куһаҕаны утары",
    battleTitle: "Орто дойду иһин охсуһуу",
    battleLead: "Боотуру сис хаарынан салай, абааһыларга чугаһаа уонна кылыыһынан тардый. Үс тулхай; бүтэһигэр Аллараа дойду улахан абааһыта тахсар.",
    battleOverlay: "Боотур абааһылары утары",
    battleStart: "Охсуһууга киир",
    battleReady: "Абааһыга чугаһаа уонна кылыыһынан тардый. Кыайыыга үс тулхай ааһыахха наада.",
    battleAction: "Кылыыһынан тардыы",
    battleWin: (n) => `Орто дойду харыстанна. Кыайыллыбыт абааһы: ${n}.`,
    battleLose: (n) => `Боотур суох буолла. Кыайыллыбыт абааһы: ${n}. Өссө сатаа.`,
    battleWave: (n) => n === 3 ? "Улахан абааһы тахсыбыт" : `${n}-с тулхай, үстэн`,
    battleHit: "Кылыыс абааһыга таарыйда",
    battleHurt: "Абааһы Боотуру бааһырдат",
    battleStage: "3D оонньуу: Боотур абааһылары кытта охсуһар",
    battleNote: "Бу олоҥхо матыыбыгар оҥоһуллубут авторскай оонньуу, канон событията буолбатах. 3D броня саха атаҕастаах дьонун хаартыскатыгар олоҕурар; абааһы ойуута олоҥхо артыыһын күөх от үрдүгэр уһуллубут хаартыскатыттан быһан ылыллыбыт.",
    booturCaption: "Боотур бронятын ойуута",
    booturAlt: "Саха атаҕастаах киһитэ пластинчатый бронялаах, силистээх уонна төҥүрүк калкаахтаах",
    abaasyCaption: "Абааһы — артыыс көстүүтэ",
    abaasyAlt: "Олоҥхо артыыһа күөх от үрдүгэр: куоҕай халадаайдаах, үрүҥ көмүс киэргэтиилээх, икки илиитин үөһээ көтөҕөн бутафорскай кылыһы тутан турар",
    rescueKicker: "Куттар · сырдык хараҥаны утары",
    rescueTitle: "Куттары харыстаа",
    rescueSubtitle: "Сырдык куттары быыһаа",
    rescueLead: "Үрүҥ куттар хаар тыалга суолларын суох оҥороллор. Кинилэргэ чугаһаа, оттон хара абааһылары сырдык тэллэхинэн ыт. Манна үтүө — уон икки быыһаммыт уот.",
    rescueOverlay: "Уоттар умуорун хааллар",
    rescueStart: "Быыһыыны саҕалаа",
    rescueReady: "Үрүҥ уоттарга чугаһаа. Хара куттары сырдык тэллэхинэн ыт.",
    rescueAction: "Сырдык тэллэҕэ",
    rescueWin: (n) => `Хаар тыалга сырдык төннүбүт. Быыһаммыт кут: ${n}.`,
    rescueLose: (n) => `Сорох уоттар быыһамматах хааллылар. Быыһаммыт кут: ${n}. Өссө сатаа.`,
    rescueSaved: (n) => `Уот төннүбүт · 12-тэн ${n}`,
    rescueLost: "Үрүҥ уот хаар тыалга уммута",
    rescuePulse: "Сырдык хараҥаны ытыбыта",
    rescueStage: "3D оонньуу: үрүҥ куттары быыһыы",
    rescueNote: "Бу оонньууга кут — олох уотун авторскай ойуута. Сырдык уонна хара существолар 3D дойдуга бааллар: кинилэр куйаастара, кээмэйдэрэ уонна сииннэрэ ырааҕынан уларыйар.",
    pause: "Тохтотуу",
    resume: "Салҕаа",
    again: "Өссө оонньоо",
    paused: "Тохтоото",
    goalBattle: "Кыайыллыбыт",
    goalRescue: "Быыһаммыт",
    healthBattle: "Кут",
    healthRescue: "Сырдык",
    wave: "Тулхай",
    time: "Кэм",
    best: "Рекорд",
    battleHint: "WASD эбэтэр тарбах — хамсатыы · пробел эбэтэр тимэх — тардыы · Esc — тохтотуу",
    rescueHint: "WASD эбэтэр тарбах — хамсатыы · пробел эбэтэр тимэх — сырдык · Esc — тохтотуу",
    battleHelp: ["Кутуйахтан, тарбахтан, WASD уонна стрелкаттан хамсаа", "Пробел, баттааһын эбэтэр кыһыл-көмүс тимэх — кылыыһынан тардыы", "Үс тулхаайы кыай; кыһыл тэллэх абааһы тардыарын биллэрэр"],
    rescueHelp: ["Үрүҥ кутка чугаһаа — уота быыһанар", "Сырдык тэллэх хара абааһылары эрэ ытар", "75 сөкүүндэ иһинэн уон икки куту быыһаа уонна бэйэҥ сырдыгын харыстаа"],
  },
  vi: {
    gameIndex: "Trò chơi",
    indexAscent: "Bay lên chín tầng trời",
    indexAscentSub: "Тоҕус халлаан · bay qua các vòng",
    indexBattle: "Bootur",
    indexBattleSub: "Орто дойду · chiến đấu với abaahy",
    indexRescue: "Các kut",
    indexRescueSub: "Linh hồn ánh sáng · bảo vệ điều thiện",
    battleKicker: "Орто дойду · thiện đối đầu ác",
    battleTitle: "Trận chiến giữ gìn Trung giới",
    battleLead: "Dẫn dũng sĩ qua cánh đồng tuyết, áp sát và dùng kiếm đánh abaahy. Ba đợt tấn công; đợt cuối do trưởng linh Hạ giới dẫn đầu.",
    battleOverlay: "Bootur đối đầu abaahy",
    battleStart: "Bước vào trận chiến",
    battleReady: "Áp sát linh hồn và vung kiếm. Ba đợt tấn công ngăn giữa bạn và chiến thắng.",
    battleAction: "Vung kiếm",
    battleWin: (n) => `Trung giới đã được bảo vệ. Số linh hồn bị đánh bại: ${n}.`,
    battleLose: (n) => `Bootur đã ngã xuống. Số linh hồn bị đánh bại: ${n}. Hãy thử lại.`,
    battleWave: (n) => n === 3 ? "Trưởng linh abaahy bước ra" : `Đợt ${n} trên 3`,
    battleHit: "Nhát kiếm trúng đích",
    battleHurt: "Abaahy làm Bootur bị thương",
    battleStage: "Trò chơi 3D: Bootur chiến đấu với abaahy",
    battleNote: "Đây là trò chơi sáng tạo dựa trên sử thi, không phải một tình tiết nguyên tác. Giáp 3D dựa trên ảnh kỵ sĩ Sakha; hình tượng abaahy là một nghệ sĩ sử thi Olonkho được cắt ra từ bức ảnh sân khấu ngoài trời.",
    booturCaption: "Hình tham khảo giáp của Bootur",
    booturAlt: "Kỵ sĩ Sakha mặc giáp lá, cầm giáo và khiên tròn",
    abaasyCaption: "Abaahy trong tạo hình sân khấu",
    abaasyAlt: "Nghệ sĩ sử thi Olonkho trên sân khấu ngoài trời: áo choàng nâu đính bạc trước ngực và thắt lưng, hai tay giơ cao thanh kiếm đạo cụ",
    rescueKicker: "Kut · ánh sáng đối đầu bóng tối",
    rescueTitle: "Bảo vệ các kut",
    rescueSubtitle: "Cứu các linh hồn ánh sáng",
    rescueLead: "Các linh hồn kut trắng lạc trong bão tuyết. Hãy đến gần để đưa lửa của họ về cõi người và xua abaahy bóng tối bằng xung ánh sáng. Điều thiện ở đây là mười hai ngọn lửa được cứu.",
    rescueOverlay: "Đừng để các ngọn lửa tắt",
    rescueStart: "Bắt đầu giải cứu",
    rescueReady: "Chạm vào những ngọn lửa trắng. Xua linh hồn bóng tối bằng ánh sáng.",
    rescueAction: "Xung ánh sáng",
    rescueWin: (n) => `Ánh sáng đã trở lại giữa bão tuyết. Số linh hồn được cứu: ${n}.`,
    rescueLose: (n) => `Vẫn còn những ngọn lửa lạc trong tuyết. Đã cứu: ${n}. Hãy thử lại.`,
    rescueSaved: (n) => `Đã đưa lửa trở về · ${n} trên 12`,
    rescueLost: "Một ngọn lửa trắng đã tắt trong bão tuyết",
    rescuePulse: "Ánh sáng xua lui bóng tối",
    rescueStage: "Trò chơi 3D: giải cứu các linh hồn kut trắng",
    rescueNote: "Kut trong trò chơi là hình tượng nghệ thuật của ngọn lửa sự sống. Các sinh linh sáng và tối tồn tại trong không gian ba chiều: vị trí, kích thước và bóng đổi theo khoảng cách.",
    pause: "Tạm dừng",
    resume: "Tiếp tục",
    again: "Chơi lại",
    paused: "Tạm dừng",
    goalBattle: "Đã đánh bại",
    goalRescue: "Đã cứu",
    healthBattle: "Kut",
    healthRescue: "Ánh sáng",
    wave: "Đợt",
    time: "Thời gian",
    best: "Kỷ lục",
    battleHint: "WASD hoặc ngón tay để di chuyển · Space hoặc nút để vung kiếm · Esc tạm dừng",
    rescueHint: "WASD hoặc ngón tay để di chuyển · Space hoặc nút phát sáng · Esc tạm dừng",
    battleHelp: ["Di chuyển bằng chuột, ngón tay, WASD hoặc phím mũi tên", "Space, nhấp chuột hoặc nút vàng để vung kiếm", "Đánh bại ba đợt; ánh chớp đỏ cảnh báo đòn tấn công của linh hồn"],
    rescueHelp: ["Chạm vào linh hồn trắng để cứu ngọn lửa", "Xung ánh sáng chỉ xua đuổi abaahy bóng tối", "Cứu mười hai linh hồn trong 75 giây và giữ ánh sáng của bạn"],
  },
};

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
const SWORD_HALF_ARC = Math.PI * 0.42;
const RESCUE_PULSE_MAX = 3;
/* Sprites arrive as either a decoded Image or a baked canvas; both carry a size,
   but only the Image calls it naturalWidth. */
const imgW = (img) => img.naturalWidth || img.width;
const imgH = (img) => img.naturalHeight || img.height;
const aspect = (img) => imgW(img) / imgH(img);

function seeded(seed) {
  let n = seed;
  return () => {
    n = (n * 1664525 + 1013904223) >>> 0;
    return n / 4294967296;
  };
}

/* Every figure and plate in the arena is cut from a real photograph or a real
 * artist's drawing of the epic (see assets/img/credits.json) — the renderer only
 * projects, lights and animates them. */
const PLATES = {
  bootur: "assets/img/sprite-bootur.webp",
  abaasy: "assets/img/sprite-abaasy.webp",
  kutter: "assets/img/sprite-kutter.webp",
  larch: "assets/img/sprite-larch.webp",
  ridge: "assets/img/arena-ridge.jpg",
  snow: "assets/img/arena-snow.jpg",
};

function loadPlates() {
  const images = {};
  const waiters = [];
  let pending = Object.keys(PLATES).length;
  const settle = () => {
    pending -= 1;
    if (pending === 0) waiters.splice(0).forEach((fn) => fn());
  };
  for (const [key, src] of Object.entries(PLATES)) {
    const img = new Image();
    img.onload = img.onerror = settle;
    img.decoding = "async";
    img.src = src;
    images[key] = img;
  }
  return { images, whenReady: (fn) => waiters.push(fn) };
}

export function initArena({ getLang }) {
  const labels = () => TEXT[getLang()] || TEXT.ru;

  function paintText() {
    const L = labels();
    document.querySelectorAll("[data-arena-text]").forEach((el) => {
      const value = L[el.dataset.arenaText];
      if (typeof value === "string") el.textContent = value;
      if (el.dataset.arenaText === "rescueTitle") el.setAttribute("lang", getLang() === "ru" || getLang() === "sah" ? "sah" : getLang());
    });
    document.querySelectorAll("[data-arena-aria]").forEach((el) => {
      const value = L[el.dataset.arenaAria];
      if (typeof value === "string") el.setAttribute("aria-label", value);
    });
    document.querySelectorAll("[data-arena-alt]").forEach((el) => {
      const value = L[el.dataset.arenaAlt];
      if (typeof value === "string") el.setAttribute("alt", value);
    });
  }

  paintText();
  window.addEventListener("langchange", paintText);
  document.querySelectorAll("[data-arena]").forEach((stage) => createGame(stage, getLang, labels));
}

function createGame(stage, getLang, labels) {
  const mode = stage.dataset.arena;
  const battle = mode === "battle";
  const canvas = stage.querySelector("canvas");
  let ctx = canvas.getContext("2d");
  if (!ctx) return;
  const mainCtx = ctx;
  const background = document.createElement("canvas");
  const backgroundCtx = background.getContext("2d");
  const vignettePlate = document.createElement("canvas");
  const vignetteCtx = vignettePlate.getContext("2d");
  const plates = loadPlates();
  const art = {};

  const root = stage.closest(".arena-game");
  const overlay = stage.querySelector("[data-arena-overlay]");
  const result = stage.querySelector("[data-arena-result]");
  const startBtn = stage.querySelector("[data-arena-start]");
  const hint = stage.querySelector("[data-arena-hint]");
  const pauseBtn = stage.querySelector("[data-arena-pause]");
  const actionBtn = stage.querySelector("[data-arena-action]");
  const msg = stage.querySelector("[data-arena-msg]");
  const values = Object.fromEntries(Array.from(stage.querySelectorAll("[data-arena-value]")).map((el) => [el.dataset.arenaValue, el]));
  const dts = Object.fromEntries(Array.from(stage.querySelectorAll("[data-arena-dt]")).map((el) => [el.dataset.arenaDt, el]));
  const help = Array.from(root.querySelectorAll("[data-arena-help]"));
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  const random = seeded(battle ? 9417 : 7231);
  const bestKey = `olonkho-${mode}-best`;

  let w = 1;
  let h = 1;
  let dpr = 1;
  let phase = "idle";
  let lastWon = false;
  let visible = true;
  let raf = 0;
  let last = 0;
  let idleTime = 0;
  let messageTime = 0;
  let waveDelay = 0;
  let spawnClock = 0;
  let score = 0;
  let wave = 1;
  let timeLeft = 75;
  let shake = 0;
  let flash = 0;
  let entities = [];
  let particles = [];
  let pointer = { active: false, x: 0, z: 40 };
  let best = readBest();
  const keys = new Set();
  const hero = { x: 0, z: 20, vx: 0, vz: 0, hp: battle ? 5 : 4, maxHp: battle ? 5 : 4, attack: 0, pulse: 0, cooldown: 0, inv: 0, walk: 0, face: 1, aimX: 0, aimZ: 1 };

  const stars = Array.from({ length: 100 }, () => ({ x: random(), y: random() * 0.55, r: 0.35 + random() * 1.2, p: random() * 6.28 }));
  /* Larches at the edge of the clearing, off to the sides so they frame the fight
     instead of walling it in. A real Gmelinii is five times a man, but the camera
     is pitched down and a billboard closer than z≈380 has its crown above the top
     of the frame — a tree cropped at the top reads as a hanging mass, not as wood.
     Every one of these stands head to foot inside the view. */
  const trees = Array.from({ length: 24 }, (_, i) => ({
    x: (i % 2 ? 1 : -1) * (430 + random() * 600),
    z: 380 + random() * 520,
    size: 230 + random() * 150,
  }));
  const flakes = Array.from({ length: 180 }, () => ({ x: random(), y: random(), r: 0.4 + random() * 1.5, speed: 0.25 + random() * 0.75, drift: random() * 6.28 }));
  const snowMarks = Array.from({ length: 150 }, () => ({ x: (random() * 2 - 1) * 850, z: -80 + random() * 1100, r: 0.5 + random() * 1.6 }));

  function readBest() {
    try { return Number(localStorage.getItem(bestKey)) || 0; } catch { return 0; }
  }

  function saveBest() {
    best = Math.max(best, score);
    try { localStorage.setItem(bestKey, String(best)); } catch { /* storage may be unavailable */ }
  }

  /* Tinted copies of the cut-out plates, baked once: the hit flash and the elder
   * abaahy are the same drawing pushed through a different light. */
  function tinted(img, layers) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth || img.width;
    c.height = img.naturalHeight || img.height;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    for (const [fill, alpha] of layers) {
      g.globalCompositeOperation = "source-atop";
      g.globalAlpha = alpha;
      g.fillStyle = fill;
      g.fillRect(0, 0, c.width, c.height);
    }
    return c;
  }

  /* A cut-out photographed in flat daylight reads as a sticker the moment it stands
   * on a lit snowfield. This bakes the scene's own light onto the figure once: a low
   * warm key from the upper left (the arctic sun the sky is graded toward), a cool
   * fill and a thin rim from the right so the silhouette separates from the fog, and
   * a touch of ambient occlusion pooling at the feet. Source-atop keeps every stroke
   * inside the alpha, so the lighting never leaks past the cut-out's edge. */
  function lit(img) {
    const c = document.createElement("canvas");
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = "source-atop";
    const key = g.createLinearGradient(0, 0, c.width * 0.9, c.height * 0.85);
    key.addColorStop(0, "rgba(255, 216, 156, 0.20)");
    key.addColorStop(0.5, "rgba(255, 216, 156, 0.04)");
    key.addColorStop(1, "rgba(255, 216, 156, 0)");
    g.fillStyle = key;
    g.fillRect(0, 0, c.width, c.height);
    const rim = g.createLinearGradient(c.width * 0.55, 0, c.width, 0);
    rim.addColorStop(0, "rgba(190, 224, 255, 0)");
    rim.addColorStop(1, "rgba(190, 224, 255, 0.16)");
    g.fillStyle = rim;
    g.fillRect(0, 0, c.width, c.height);
    const ao = g.createLinearGradient(0, c.height * 0.62, 0, c.height);
    ao.addColorStop(0, "rgba(8, 14, 22, 0)");
    ao.addColorStop(1, "rgba(8, 14, 22, 0.26)");
    g.fillStyle = ao;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  }

  function buildArt() {
    const { bootur, abaasy, kutter, larch } = plates.images;
    art.bootur = lit(bootur);
    art.booturHurt = tinted(art.bootur, [["#ff9a63", 0.5], ["#6d1408", 0.32]]);
    art.spirit = lit(abaasy);
    art.spiritHurt = tinted(art.spirit, [["#ffd9bd", 0.6], ["#a83a22", 0.24]]);
    /* The elder abaasy is red where its minions are cold, but red that still carries
     * the drawing's own light and shade: the first pass pushed it to #4b0f1c at half
     * strength and the boss arrived as an unlit smudge. */
    art.boss = tinted(art.spirit, [["#8e1f2b", 0.42], ["#ff7a4a", 0.16]]);
    art.kutter = lit(kutter);
    art.larch = larch;
    /* Half the grove stands in a colder air than the other half — the difference
       between two photographs of the same wood on different mornings. */
    art.larchFrost = tinted(larch, [["#a8cadb", 0.26]]);
  }

  /* The vignette is the same dark ring every frame, so it is baked once per size
     instead of re-creating a gradient and filling the whole canvas over the scene
     sixty times a second. A full-frame radial fill is the single most expensive
     paint here on software renderers, and it was buying nothing. */
  function paintVignette() {
    if (vignettePlate.width !== canvas.width || vignettePlate.height !== canvas.height) {
      vignettePlate.width = canvas.width;
      vignettePlate.height = canvas.height;
      vignetteCtx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const v = vignetteCtx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.25, w / 2, h / 2, Math.max(w, h) * 0.72);
      v.addColorStop(0, "rgba(2,8,14,0)");
      v.addColorStop(1, "rgba(2,8,14,0.48)");
      vignetteCtx.clearRect(0, 0, w, h);
      vignetteCtx.fillStyle = v;
      vignetteCtx.fillRect(0, 0, w, h);
    }
  }

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = Math.max(1, rect.width);
    h = Math.max(1, rect.height);
    const natural = Math.min(window.devicePixelRatio || 1, 2);
    dpr = clamp(Math.min(natural, Math.sqrt(1300000 / (w * h))), 1, natural);
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    background.width = canvas.width;
    background.height = canvas.height;
    ctx = backgroundCtx;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    paintSky();
    paintGrove();
    ctx = mainCtx;
    paintVignette();
    draw();
  }

  function project(x, y, z) {
    const pitch = 0.24;
    const zc = z + 620;
    const yc = y - 155;
    const depth = Math.max(70, Math.cos(pitch) * zc - Math.sin(pitch) * yc);
    const vertical = Math.sin(pitch) * zc + Math.cos(pitch) * yc;
    const scale = 760 / depth;
    return { x: w * 0.5 + x * scale, y: h * 0.64 - vertical * scale, s: scale, depth };
  }

  function paintLabels() {
    const L = labels();
    dts.goal.textContent = battle ? L.goalBattle : L.goalRescue;
    dts.health.textContent = battle ? L.healthBattle : L.healthRescue;
    dts.wave.textContent = battle ? L.wave : L.time;
    dts.best.textContent = L.best;
    actionBtn.textContent = battle ? L.battleAction : L.rescueAction;
    pauseBtn.setAttribute("aria-label", phase === "pause" ? L.resume : L.pause);
    hint.textContent = battle ? L.battleHint : L.rescueHint;
    help.forEach((el, i) => { el.textContent = (battle ? L.battleHelp : L.rescueHelp)[i]; });
    if (phase === "idle") startBtn.textContent = battle ? L.battleStart : L.rescueStart;
    else if (phase === "pause") startBtn.textContent = L.resume;
    else if (phase === "done") startBtn.textContent = L.again;
    if (phase === "pause") result.textContent = L.paused;
    else if (phase === "done") result.textContent = battle ? (lastWon ? L.battleWin(score) : L.battleLose(score)) : (lastWon ? L.rescueWin(score) : L.rescueLose(score));
    paintHud();
  }

  function paintHud() {
    values.goal.textContent = battle ? String(score).padStart(2, "0") : `${String(score).padStart(2, "0")}/12`;
    values.health.textContent = "●".repeat(Math.max(0, hero.hp)) + "○".repeat(Math.max(0, hero.maxHp - hero.hp));
    values.wave.textContent = battle ? `${wave}/3` : String(Math.max(0, Math.ceil(timeLeft))).padStart(2, "0");
    values.best.textContent = String(best).padStart(2, "0");
  }

  function say(text, seconds = 1.8) {
    msg.textContent = text;
    messageTime = seconds;
  }

  function makeSpirit(kind, boss = false) {
    const angle = random() * Math.PI * 2;
    const radius = kind === "light" ? 130 + random() * 360 : 270 + random() * 340;
    return {
      kind,
      boss,
      x: clamp(hero.x + Math.cos(angle) * radius, -390, 390),
      z: clamp(hero.z + Math.abs(Math.sin(angle)) * radius + 100, 80, 590),
      hp: boss ? 5 : 1,
      speed: (battle ? 36 + wave * 7 : 42) * (boss ? 0.72 : 1),
      attackClock: 0.6 + random(),
      hit: 0,
      phase: random() * Math.PI * 2,
      life: 11 + random() * 8,
      drift: random() * 2 - 1,
      mirror: random() > 0.5,
      bulk: 0.86 + random() * 0.26,
    };
  }

  function reset() {
    score = 0;
    wave = 1;
    timeLeft = 75;
    waveDelay = 0;
    spawnClock = 0;
    shake = 0;
    flash = 0;
    entities = [];
    particles = [];
    hero.x = 0;
    hero.z = 20;
    hero.vx = 0;
    hero.vz = 0;
    hero.hp = hero.maxHp;
    hero.attack = 0;
    hero.pulse = 0;
    hero.cooldown = 0;
    hero.inv = 0;
    hero.walk = 0;
    hero.face = 1;
    hero.aimX = 0;
    hero.aimZ = 1;
    pointer = { active: false, x: 0, z: 40 };
    if (battle) spawnWave();
    else for (let i = 0; i < 4; i += 1) entities.push(makeSpirit("light"));
    paintHud();
  }

  function spawnWave() {
    const count = wave === 1 ? 5 : wave === 2 ? 7 : 5;
    for (let i = 0; i < count; i += 1) entities.push(makeSpirit("dark", wave === 3 && i === 0));
    say(labels().battleWave(wave), 2.2);
  }

  function start() {
    reset();
    phase = "play";
    overlay.hidden = true;
    overlay.classList.remove("is-result");
    stage.classList.add("is-live");
    pauseBtn.setAttribute("aria-label", labels().pause);
    startBtn.textContent = labels().resume;
    say(battle ? labels().battleReady : labels().rescueReady, 3.2);
    stage.focus({ preventScroll: true });
    if (isSoundEnabled()) pluck(battle ? 196 : 293.66, 0.35, 0.07);
    startFrames();
  }

  function pause() {
    if (phase !== "play") return;
    phase = "pause";
    keys.clear();
    overlay.hidden = false;
    overlay.classList.add("is-result");
    result.textContent = labels().paused;
    startBtn.textContent = labels().resume;
    pauseBtn.setAttribute("aria-label", labels().resume);
    stage.classList.remove("is-live");
  }

  function resume() {
    if (phase !== "pause") return;
    phase = "play";
    overlay.hidden = true;
    overlay.classList.remove("is-result");
    stage.classList.add("is-live");
    pauseBtn.setAttribute("aria-label", labels().pause);
    stage.focus({ preventScroll: true });
    startFrames();
  }

  function finish(won) {
    phase = "done";
    lastWon = won;
    keys.clear();
    saveBest();
    paintHud();
    overlay.hidden = false;
    overlay.classList.add("is-result");
    result.textContent = battle ? (won ? labels().battleWin(score) : labels().battleLose(score)) : (won ? labels().rescueWin(score) : labels().rescueLose(score));
    startBtn.textContent = labels().again;
    stage.classList.remove("is-live");
    if (isSoundEnabled()) pluck(won ? 523.25 : 130.81, 0.65, 0.09);
  }

  function burst(x, y, z, color, count = 16) {
    const amount = reduce.matches ? Math.ceil(count / 3) : count;
    for (let i = 0; i < amount; i += 1) {
      const a = random() * Math.PI * 2;
      const speed = 25 + random() * 90;
      particles.push({ x, y, z, vx: Math.cos(a) * speed, vy: 25 + random() * 80, vz: Math.sin(a) * speed, life: 0.45 + random() * 0.55, max: 1, color });
    }
  }

  function setAim(x, z) {
    const length = Math.hypot(x, z);
    if (length < 0.001) return;
    hero.aimX = x / length;
    hero.aimZ = z / length;
  }

  function attack() {
    if (phase !== "play" || hero.cooldown > 0) return;
    if (pointer.active) setAim(pointer.x - hero.x, pointer.z - hero.z);
    if (battle) {
      hero.attack = 0.34;
      hero.cooldown = 0.43;
      let hits = 0;
      entities.forEach((e) => {
        if (e.kind !== "dark") return;
        const dx = e.x - hero.x;
        const dz = e.z - hero.z;
        const dist = Math.hypot(dx, dz);
        const facing = dist < 1 || (dx * hero.aimX + dz * hero.aimZ) / dist >= Math.cos(SWORD_HALF_ARC);
        if (dist < (e.boss ? 205 : 165) && facing) {
          e.hp -= 1;
          e.hit = 0.25;
          hits += 1;
          burst(e.x, 80, e.z, "#f0c978", e.boss ? 12 : 20);
        }
      });
      const dead = entities.filter((e) => e.hp <= 0);
      if (dead.length) {
        score += dead.length;
        entities = entities.filter((e) => e.hp > 0);
        say(labels().battleHit);
      }
      if (isSoundEnabled()) pluck(hits ? 329.63 : 246.94, 0.14, hits ? 0.075 : 0.04);
    } else {
      hero.pulse = 0.62;
      hero.cooldown = 0.85;
      const targets = entities
        .filter((e) => e.kind === "dark" && distance(hero, e) < 245)
        .sort((a, b) => distance(hero, a) - distance(hero, b))
        .slice(0, RESCUE_PULSE_MAX);
      const pushed = targets.length;
      targets.forEach((e) => {
        e.hp = 0;
        burst(e.x, 75, e.z, "#b8f1e7", 18);
      });
      entities = entities.filter((e) => e.hp > 0);
      say(labels().rescuePulse);
      if (isSoundEnabled()) pluck(pushed ? 440 : 349.23, 0.3, 0.065);
    }
  }

  function hurt() {
    if (hero.inv > 0 || phase !== "play") return;
    hero.hp -= 1;
    hero.inv = 1.05;
    shake = 0.35;
    flash = 0.25;
    if (battle) say(labels().battleHurt);
    if (hero.hp <= 0) finish(false);
    paintHud();
  }

  function update(dt) {
    hero.cooldown = Math.max(0, hero.cooldown - dt);
    hero.attack = Math.max(0, hero.attack - dt);
    hero.pulse = Math.max(0, hero.pulse - dt);
    hero.inv = Math.max(0, hero.inv - dt);
    shake = Math.max(0, shake - dt);
    flash = Math.max(0, flash - dt);
    messageTime = Math.max(0, messageTime - dt);
    if (!messageTime) msg.textContent = "";

    let dx = 0;
    let dz = 0;
    if (keys.has("left")) dx -= 1;
    if (keys.has("right")) dx += 1;
    if (keys.has("up")) dz += 1;
    if (keys.has("down")) dz -= 1;
    if (dx || dz) {
      pointer.active = false;
      const n = Math.hypot(dx, dz);
      dx /= n;
      dz /= n;
    } else if (pointer.active) {
      const px = pointer.x - hero.x;
      const pz = pointer.z - hero.z;
      const n = Math.hypot(px, pz);
      if (n > 10) { dx = px / n; dz = pz / n; }
    }
    if (dx || dz) setAim(dx, dz);
    const speed = battle ? 190 : 205;
    const acceleration = speed * 1.3;
    const friction = dx === 0 && dz === 0 ? 0.88 : 0.95;

    // Apply acceleration toward target velocity
    hero.vx += (dx * acceleration - hero.vx) * Math.min(1, dt * 8);
    hero.vz += (dz * acceleration - hero.vz) * Math.min(1, dt * 8);

    // Add friction when no input
    if (dx === 0 && dz === 0) {
      hero.vx *= friction;
      hero.vz *= friction;
    }

    hero.x = clamp(hero.x + hero.vx * dt, -390, 390);
    hero.z = clamp(hero.z + hero.vz * dt, -110, 590);
    hero.walk += Math.hypot(hero.vx, hero.vz) * dt * 0.045;
    if (Math.abs(hero.vx) > 14) hero.face = hero.vx > 0 ? 1 : -1;

    if (!battle) {
      timeLeft -= dt;
      if (timeLeft <= 0) { timeLeft = 0; finish(false); return; }
    }

    for (const e of entities) {
      e.hit = Math.max(0, e.hit - dt);
      e.attackClock -= dt;
      const dist = distance(hero, e);
      if (e.kind === "dark") {
        if (dist > (e.boss ? 90 : 65)) {
          const n = Math.max(1, dist);
          e.x += ((hero.x - e.x) / n) * e.speed * dt;
          e.z += ((hero.z - e.z) / n) * e.speed * dt;
        } else if (e.attackClock <= 0) {
          hurt();
          if (phase !== "play") return;
          e.attackClock = e.boss ? 0.95 : 1.35;
        }
      } else {
        e.life -= dt;
        e.x += Math.sin(idleTime * 0.8 + e.phase) * e.drift * 8 * dt;
        e.z += Math.cos(idleTime * 0.5 + e.phase) * 5 * dt;
        if (dist < 72) {
          e.hp = 0;
          score += 1;
          burst(e.x, 70, e.z, "#f7e7a7", 22);
          say(labels().rescueSaved(score));
          if (isSoundEnabled()) pluck(523.25 + (score % 5) * 44, 0.22, 0.06);
        } else if (e.life <= 0) {
          e.hp = 0;
          hero.hp -= 1;
          flash = 0.18;
          say(labels().rescueLost);
          if (hero.hp <= 0) { finish(false); return; }
        }
      }
    }
    entities = entities.filter((e) => e.hp > 0);

    if (battle) {
      if (!entities.length) {
        if (wave >= 3) { finish(true); return; }
        waveDelay += dt;
        if (waveDelay > 1.5) {
          wave += 1;
          waveDelay = 0;
          spawnWave();
        }
      } else waveDelay = 0;
    } else {
      if (score >= 12) { finish(true); return; }
      spawnClock += dt;
      if (spawnClock > 0.8) {
        spawnClock = 0;
        const lights = entities.filter((e) => e.kind === "light").length;
        const darks = entities.filter((e) => e.kind === "dark").length;
        if (lights < 4) entities.push(makeSpirit("light"));
        if (darks < Math.min(6, 3 + Math.floor(score / 3))) entities.push(makeSpirit("dark"));
      }
    }

    particles.forEach((p) => {
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.z += p.vz * dt;
      p.vy -= 120 * dt;
    });
    particles = particles.filter((p) => p.life > 0);
    paintHud();
  }

  function disc(x, y, z, radius, fill, stroke = null, alpha = 1) {
    const p = project(x, y, z);
    const r = Math.max(0.5, radius * p.s);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    if (fill) {
      if (Array.isArray(fill)) {
        const gradient = ctx.createRadialGradient(p.x - r * 0.35, p.y - r * 0.4, r * 0.08, p.x, p.y, r);
        fill.forEach((color, i) => gradient.addColorStop(i / (fill.length - 1), color));
        ctx.fillStyle = gradient;
      } else ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = Math.max(0.7, p.s * 1.2); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }

  function shadow(x, z, radius, alpha = 0.24) {
    const p = project(x, 0, z);
    ctx.save();
    /* The key sits high and to the left, so the contact shadow pools a little to
       the right of the feet and carries a dark core under the weight-bearing point
       rather than reading as a flat grey decal the figure hovers above. */
    ctx.translate(p.x + radius * p.s * 0.12, p.y);
    ctx.scale(1.12, 0.3);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * p.s);
    g.addColorStop(0, `rgba(1, 5, 12, ${Math.min(0.6, alpha * 1.5)})`);
    g.addColorStop(0.45, `rgba(1, 5, 12, ${alpha * 0.7})`);
    g.addColorStop(1, "rgba(1, 5, 12, 0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, radius * p.s, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* The floor is a strip of real Oymyakon drifts, resampled row by row through
   * the same camera maths as project() so the drifts swell as they approach. */
  function paintGround(horizon) {
    const snow = plates.images.snow;
    if (!snow.naturalWidth) {
      const ground = ctx.createLinearGradient(0, horizon, 0, h);
      ground.addColorStop(0, battle ? "#778b94" : "#6f9998");
      ground.addColorStop(1, battle ? "#d3d8d6" : "#cbded6");
      ctx.fillStyle = ground;
      ctx.fillRect(0, horizon, w, h - horizon);
      return;
    }
    const sw = snow.naturalWidth;
    const sh = snow.naturalHeight;
    const sin = Math.sin(0.24);
    const cos = Math.cos(0.24);
    const depthAt = (y) => {
      const k = (h * 0.64 - y) / 760;
      return (cos * 155 * (cos + k * sin)) / Math.max(0.0008, sin - k * cos) + 155 * sin;
    };
    const near = Math.max(1, depthAt(h));
    /* A base coat under the resampled rows: a source rect that runs off the edge of
       the photograph leaves the destination unpainted, and an unpainted corner of the
       floor reads as a black wedge cut into the snow. The clamp keeps every row inside
       the image; the coat is the belt-and-braces for the sub-pixel seams between rows. */
    ctx.fillStyle = battle ? "#9fb0b6" : "#9fc0bb";
    ctx.fillRect(0, horizon, w, h - horizon);
    for (let y = Math.floor(horizon); y <= h; y += 1) {
      const depth = Math.max(near, depthAt(y));
      const row = clamp((sh * near) / depth - 1, 0, sh - 1.5);
      const half = Math.min(sw / 2, ((w * depth) / 1520) / 0.62);
      const cx = clamp(sw / 2 + Math.sin(depth * 0.004) * sw * 0.08, half, sw - half);
      ctx.drawImage(snow, cx - half, row, half * 2, 1.5, 0, y, w, 1.6);
    }
    const wash = ctx.createLinearGradient(0, horizon, 0, h);
    wash.addColorStop(0, "rgba(18, 32, 44, 0)");
    wash.addColorStop(0.07, battle ? "rgba(18, 34, 46, 0.20)" : "rgba(16, 48, 56, 0.18)");
    wash.addColorStop(0.18, battle ? "rgba(24, 42, 54, 0.30)" : "rgba(20, 58, 66, 0.27)");
    wash.addColorStop(0.46, battle ? "rgba(30, 48, 60, 0.16)" : "rgba(34, 86, 88, 0.12)");
    wash.addColorStop(1, battle ? "rgba(74, 92, 104, 0.05)" : "rgba(104, 148, 138, 0.04)");
    ctx.fillStyle = wash;
    ctx.fillRect(0, horizon, w, h - horizon);
  }

  function paintSky() {
    const horizon = h * 0.41;
    const sky = ctx.createLinearGradient(0, 0, 0, horizon);
    sky.addColorStop(0, battle ? "#040a14" : "#03121b");
    sky.addColorStop(0.6, battle ? "#122434" : "#0c2b34");
    sky.addColorStop(1, battle ? "#5d6f79" : "#4e7f80");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, horizon + 2);

    /* A low sun just off the left of the clearing motivates the warm key the figures
       are lit by, and throws a few soft shafts through the blizzard haze. Baked into
       the sky plate once per size, so the atmosphere costs nothing per frame. */
    const sunX = w * 0.3;
    const sunY = horizon * 0.96;
    const glow = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, w * 0.42);
    glow.addColorStop(0, battle ? "rgba(255, 208, 150, 0.30)" : "rgba(255, 224, 178, 0.26)");
    glow.addColorStop(0.4, "rgba(255, 200, 140, 0.10)");
    glow.addColorStop(1, "rgba(255, 200, 140, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, w, horizon + 2);
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let ray = 0; ray < 4; ray += 1) {
      const spread = (ray - 1.5) * 0.16;
      const grad = ctx.createLinearGradient(sunX, sunY, sunX + Math.sin(spread) * h, sunY + Math.cos(spread) * h);
      grad.addColorStop(0, "rgba(255, 214, 160, 0.05)");
      grad.addColorStop(1, "rgba(255, 214, 160, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(sunX, sunY);
      ctx.lineTo(sunX + Math.sin(spread - 0.05) * h * 1.4, sunY + Math.cos(spread - 0.05) * h * 1.4);
      ctx.lineTo(sunX + Math.sin(spread + 0.05) * h * 1.4, sunY + Math.cos(spread + 0.05) * h * 1.4);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    for (const s of stars) {
      const a = 0.18 + Math.sin(idleTime * 0.6 + s.p) * 0.1;
      ctx.fillStyle = `rgba(224, 237, 236, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.save();
    ctx.globalAlpha = battle ? 0.14 : 0.23;
    ctx.strokeStyle = battle ? "#91b5b2" : "#8de3c9";
    ctx.lineWidth = h * 0.055;
    ctx.filter = `blur(${Math.max(8, h * 0.035)}px)`;
    for (let band = 0; band < 3; band += 1) {
      ctx.beginPath();
      for (let x = -40; x <= w + 40; x += 30) {
        const y = h * (0.16 + band * 0.055) + Math.sin(x * 0.008 + idleTime * 0.15 + band) * h * 0.045;
        if (x === -40) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.restore();

    const ridge = plates.images.ridge;
    if (ridge.naturalWidth) {
      const bandH = Math.min(horizon * 0.74, (w * ridge.naturalHeight) / ridge.naturalWidth);
      const top = horizon - bandH;
      ctx.drawImage(ridge, 0, top, w, bandH);
      const veil = ctx.createLinearGradient(0, top, 0, horizon);
      veil.addColorStop(0, battle ? "rgba(10, 21, 33, 1)" : "rgba(8, 26, 34, 1)");
      veil.addColorStop(0.34, battle ? "rgba(14, 30, 44, 0.72)" : "rgba(12, 43, 54, 0.72)");
      veil.addColorStop(0.7, battle ? "rgba(30, 52, 66, 0.22)" : "rgba(28, 66, 74, 0.22)");
      veil.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = veil;
      ctx.fillRect(0, top, w, bandH);
    }
    paintGround(horizon);

    /* Wind-carved sastrugi: each ridge is a lit crest with a shadowed trough just
       below it, so the snowfield reads as a relief the eye can follow to the horizon
       instead of a flat wash with cracks drawn on it. The pair converges through the
       same projection as the figures, which is what ties the floor to their depth.
       Ridges are finite patches that meander in depth: a line ruled clean across the
       whole field reads as a scanline, not as wind. */
    for (let band = 0; band < 14; band += 1) {
      const z = -100 + band * 86;
      const relief = (0.05 + band * 0.006) * 0.85;
      ctx.lineWidth = 0.8 + band * 0.07;
      for (let seg = 0; seg < 6; seg += 1) {
        const x0 = -900 + seg * 330 + ((band * 97 + seg * 53) % 120);
        const len = 150 + ((band * 31 + seg * 71) % 140);
        const pts = [];
        for (let x = x0; x <= x0 + len; x += 30) {
          const meander = Math.sin(x * 0.010 + band * 1.7) * 46 + Math.sin(x * 0.023 + band * 0.9) * 22;
          pts.push(project(x, 0.3, z + meander));
        }
        ctx.strokeStyle = `rgba(226, 238, 240, ${(relief * 0.9).toFixed(3)})`;
        ctx.beginPath();
        pts.forEach((p, i) => { const y = p.y - ctx.lineWidth * 0.6; if (i === 0) ctx.moveTo(p.x, y); else ctx.lineTo(p.x, y); });
        ctx.stroke();
        ctx.strokeStyle = `rgba(38, 60, 72, ${relief.toFixed(3)})`;
        ctx.beginPath();
        pts.forEach((p, i) => { const y = p.y + ctx.lineWidth * 0.5; if (i === 0) ctx.moveTo(p.x, y); else ctx.lineTo(p.x, y); });
        ctx.stroke();
      }
    }
    for (const mark of snowMarks) {
      const p = project(mark.x, 0.4, mark.z);
      if (p.y < horizon || p.y > h + 4 || p.x < -4 || p.x > w + 4) continue;
      ctx.fillStyle = "rgba(46, 70, 78, 0.18)";
      ctx.beginPath(); ctx.arc(p.x, p.y, Math.max(0.35, mark.r * p.s), 0, Math.PI * 2); ctx.fill();
    }
    const mist = ctx.createLinearGradient(0, horizon - 58, 0, horizon + 96);
    mist.addColorStop(0, "rgba(188, 211, 211, 0)");
    mist.addColorStop(0.42, battle ? "rgba(186, 204, 210, 0.30)" : "rgba(190, 226, 218, 0.30)");
    mist.addColorStop(1, "rgba(188, 211, 211, 0)");
    ctx.fillStyle = mist;
    ctx.fillRect(0, horizon - 58, w, 154);
  }

  /* One photographed larch, planted at the edge of the clearing and repeated with a
     flip, a lean, its own proportions and a shadow, so the grove reads as a wood and
     not a row of stamps. The shadow is not decoration: without something darkening
     the snow under the trunk the billboards float a hand above the ground, which is
     exactly how the first pass read. */
  function drawTree(g, t) {
    const img = art.larch;
    if (!img || !img.naturalWidth) return;
    const p = project(t.x, 0, t.z);
    const height = t.size * p.s;
    if (height < 6 || p.x < -height || p.x > w + height) return;
    const rnd = seeded(Math.round(Math.abs(t.x) * 31 + t.z * 7 + t.size * 13));
    const spread = 0.78 + rnd() * 0.44;
    const stretch = 0.9 + rnd() * 0.2;
    const lean = (rnd() - 0.5) * 0.05;
    const flip = rnd() > 0.5;
    const sprite = rnd() > 0.55 ? art.larchFrost : img;
    const crownW = height * (img.naturalWidth / img.naturalHeight) * spread;

    const shade = g.createRadialGradient(0, 0, 0, 0, 0, crownW * 0.42);
    shade.addColorStop(0, `rgba(26, 42, 56, ${clamp(0.32 - (p.depth - 1000) / 2200, 0.05, 0.32)})`);
    shade.addColorStop(1, "rgba(26, 42, 56, 0)");
    g.save();
    g.translate(p.x, p.y);
    g.scale(1, 0.16);
    g.fillStyle = shade;
    g.beginPath();
    g.arc(0, 0, crownW * 0.42, 0, 6.2832);
    g.fill();
    g.restore();

    g.save();
    g.translate(p.x, p.y);
    g.rotate(lean);
    g.scale(spread * (flip ? -1 : 1), stretch);
    g.globalAlpha = clamp(1.6 - p.depth / 1900, 0.82, 1);
    g.drawImage(sprite, -height * (img.naturalWidth / img.naturalHeight) / 2, -height / stretch,
                height * (img.naturalWidth / img.naturalHeight), height / stretch);
    g.restore();
    g.globalAlpha = 1;
  }

  /* The grove never moves — same camera, same roots — so it is painted once per
     size into a plate and blitted. Twenty-odd photographic billboards a frame is a
     grove or a frame budget, and only one of those is wanted. */
  let grove = null;
  let groveKey = "";
  function paintGrove() {
    const key = `${Math.round(w)}x${Math.round(h)}|${dpr.toFixed(2)}|${battle ? "b" : "p"}`;
    if (!grove || groveKey !== key) {
      grove = document.createElement("canvas");
      grove.width = Math.max(1, Math.round(w * dpr));
      grove.height = Math.max(1, Math.round(h * dpr));
      const plate = grove.getContext("2d");
      plate.setTransform(dpr, 0, 0, dpr, 0, 0);
      const horizon = h * 0.41;
      /* The ridge photograph and the snowfield are cut from one exposure and meet
         on a ruler line, which no drift ever did. This bank heaves, and it is laid
         down before the larches so they grow out of it rather than standing on it
         like a decal. */
      const drift = plate.createLinearGradient(0, horizon - 22, 0, horizon + 46);
      drift.addColorStop(0, "rgba(198, 210, 216, 0)");
      drift.addColorStop(0.34, battle ? "rgba(198, 209, 216, 0.62)" : "rgba(190, 217, 209, 0.62)");
      drift.addColorStop(0.66, battle ? "rgba(184, 197, 206, 0.34)" : "rgba(178, 207, 199, 0.34)");
      drift.addColorStop(1, battle ? "rgba(170, 184, 194, 0)" : "rgba(166, 196, 188, 0)");
      plate.save();
      plate.beginPath();
      plate.rect(0, horizon - 34, w, 86);
      plate.clip();
      plate.filter = `blur(${Math.max(1.2, h * 0.0035)}px)`;
      plate.fillStyle = drift;
      plate.beginPath();
      plate.moveTo(-30, h);
      for (let x = -30; x <= w + 30; x += 14) {
        const t = x * 0.0055;
        plate.lineTo(x, horizon - 8 + Math.sin(t * 1.7) * h * 0.020 + Math.sin(t * 4.4 + 2.1) * h * 0.010 + Math.sin(t * 9.3 + 0.7) * h * 0.005);
      }
      plate.lineTo(w + 30, h);
      plate.closePath();
      plate.fill();
      plate.restore();
      trees.slice().sort((a, b) => b.z - a.z).forEach((t) => drawTree(plate, t));
      /* A little of the same haze over the trunks' feet, or the grove stands in
         cleaner air than the wood behind it. */
      const veil = plate.createLinearGradient(0, horizon - 30, 0, horizon + 130);
      veil.addColorStop(0, "rgba(178, 202, 206, 0)");
      veil.addColorStop(0.42, battle ? "rgba(178, 199, 206, 0.13)" : "rgba(182, 216, 210, 0.13)");
      veil.addColorStop(1, "rgba(178, 202, 206, 0)");
      plate.globalCompositeOperation = "source-atop";
      plate.fillStyle = veil;
      plate.fillRect(0, horizon - 30, w, 160);
      plate.globalCompositeOperation = "source-over";
      groveKey = key;
    }
    ctx.drawImage(grove, 0, 0, w, h);
  }

  function drawSwordArc() {
    if (hero.attack <= 0) return;
    const remaining = hero.attack / 0.34;
    const angle = Math.atan2(hero.aimZ, hero.aimX);
    const origin = project(hero.x, 10, hero.z);
    const radius = 172;
    const points = [];
    for (let i = 0; i <= 14; i += 1) {
      const a = angle - SWORD_HALF_ARC + (i / 14) * SWORD_HALF_ARC * 2;
      points.push(project(hero.x + Math.cos(a) * radius, 10, hero.z + Math.sin(a) * radius));
    }
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    points.forEach((p) => ctx.lineTo(p.x, p.y));
    ctx.closePath();
    ctx.fillStyle = `rgba(240, 201, 120, ${(remaining * 0.12).toFixed(3)})`;
    ctx.fill();
    ctx.beginPath();
    points.forEach((p, i) => { if (i) ctx.lineTo(p.x, p.y); else ctx.moveTo(p.x, p.y); });
    ctx.strokeStyle = `rgba(255, 214, 130, ${(remaining * 0.9).toFixed(3)})`;
    ctx.lineWidth = Math.max(1.2, 5 * origin.s);
    ctx.stroke();
    ctx.strokeStyle = `rgba(255, 252, 235, ${(remaining * 0.7).toFixed(3)})`;
    ctx.lineWidth = Math.max(0.7, 1.6 * origin.s);
    ctx.stroke();
    const sweep = angle - SWORD_HALF_ARC + (1 - remaining) * SWORD_HALF_ARC * 2;
    const tip = project(hero.x + Math.cos(sweep) * radius, 10, hero.z + Math.sin(sweep) * radius);
    ctx.beginPath();
    ctx.moveTo(origin.x, origin.y);
    ctx.lineTo(tip.x, tip.y);
    ctx.stroke();
    ctx.restore();
  }

  function drawHero() {
    const x = hero.x;
    const z = hero.z;
    const img = art.bootur;
    const p = project(x, 0, z);
    shadow(x, z, 68, 0.4);
    drawSwordArc();
    if (!img || !imgW(img)) return;

    const blink = hero.inv > 0 && Math.floor(hero.inv * 12) % 2 === 0;
    const lunge = hero.attack > 0 ? Math.sin((1 - hero.attack / 0.34) * Math.PI) : 0;
    const gait = Math.sin(hero.walk * 2) * 0.02;
    const height = 252 * p.s;
    const width = height * aspect(img);

    ctx.save();
    ctx.globalAlpha = blink ? 0.5 : 1;
    ctx.translate(p.x, p.y - Math.abs(Math.sin(hero.walk)) * 3.4 * p.s);
    ctx.scale(hero.face, 1);
    ctx.rotate(lunge * 0.055 + gait);
    ctx.drawImage(hero.inv > 0.82 ? art.booturHurt : img, -width / 2, -height, width, height);
    ctx.restore();

    if (hero.pulse > 0) {
      const q = project(x, 35, z);
      const k = 1 - hero.pulse / 0.62;
      ctx.strokeStyle = `rgba(201, 255, 235, ${1 - k})`;
      ctx.lineWidth = 5 * q.s;
      ctx.beginPath(); ctx.ellipse(q.x, q.y, (45 + k * 230) * q.s, (15 + k * 75) * q.s, 0, 0, Math.PI * 2); ctx.stroke();
    }
    ctx.globalAlpha = 1;
  }

  function drawSpirit(e) {
    const bob = Math.sin(idleTime * 2 + e.phase) * 9;
    const scale = e.boss ? 1.45 : 1;
    const x = e.x;
    const z = e.z;
    const light = e.kind === "light";
    const r = (light ? 28 : 34) * scale;
    const base = light ? 20 + bob : 8 + bob * 0.6;
    shadow(x, z, r * 1.2, light ? 0.3 : 0.27);

    const warning = e.boss ? 0.78 : 0.42;
    if (!light && e.attackClock < warning && distance(hero, e) < (e.boss ? 140 : 105)) {
      const p = project(x, 2, z);
      const urgency = clamp(1 - e.attackClock / warning, 0, 1);
      const pulse = 0.55 + Math.sin(idleTime * (e.boss ? 22 : 18)) * 0.25;
      const radius = e.boss ? 96 : 65;
      ctx.save();
      ctx.strokeStyle = `rgba(235, 72, 48, ${pulse})`;
      ctx.lineWidth = (e.boss ? 4 : 3) * p.s;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, radius * p.s, radius * 0.29 * p.s, 0, 0, Math.PI * 2);
      ctx.stroke();
      if (e.boss) {
        /* The elder gets a longer warning, a closing second ring and an overhead
           diamond: readable even when the photographed sprites overlap. */
        const closing = 126 - urgency * 38;
        ctx.strokeStyle = `rgba(255, 190, 104, ${0.45 + urgency * 0.45})`;
        ctx.lineWidth = Math.max(1, 2.2 * p.s);
        ctx.beginPath();
        ctx.ellipse(p.x, p.y, closing * p.s, closing * 0.29 * p.s, 0, 0, Math.PI * 2);
        ctx.stroke();
        const marker = project(x, 340, z);
        const size = Math.max(4, 10 * marker.s);
        ctx.fillStyle = `rgba(255, 205, 125, ${0.6 + urgency * 0.35})`;
        ctx.beginPath();
        ctx.moveTo(marker.x, marker.y - size);
        ctx.lineTo(marker.x + size, marker.y);
        ctx.lineTo(marker.x, marker.y + size);
        ctx.lineTo(marker.x - size, marker.y);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
    }

    const p = project(x, base + 70 * scale, z);
    const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 90 * scale * p.s);
    glow.addColorStop(0, light ? "rgba(239,255,213,0.18)" : "rgba(130,31,42,0.24)");
    glow.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(p.x - 100 * scale * p.s, p.y - 100 * scale * p.s, 200 * scale * p.s, 200 * scale * p.s);

    if (light) {
      /* A real Yhyakh dancer in white, cut head to hem out of the meadow. She
         is lit from inside, so the alpha breathes and the bloom sits on the
         chest rather than floating above her head as a ring. */
      const img = art.kutter;
      const sway = Math.sin(idleTime * 1.5 + e.phase) * 0.012;
      const foot = project(x, base, z);
      const height = 206 * scale * foot.s;
      const width = img && imgH(img) ? height * aspect(img) : height * 0.46;
      if (img && imgW(img)) {
        ctx.save();
        ctx.translate(foot.x, foot.y);
        ctx.rotate(sway);
        /* One dancer photographed at Yhyakh, so half of them face the other way
           and the row stops reading as a copy of a copy. */
        if (e.mirror) ctx.scale(-1, 1);
        ctx.globalAlpha = (0.94 + Math.sin(idleTime * 2.2 + e.phase) * 0.05) * clamp(1.3 - foot.depth / 1500, 0.5, 1);
        ctx.drawImage(img, -width / 2, -height, width, height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      const core = project(x, base + 132, z);
      const flame = ctx.createRadialGradient(core.x, core.y, 0, core.x, core.y, 46 * scale * core.s);
      flame.addColorStop(0, "rgba(255, 250, 226, 0.2)");
      flame.addColorStop(0.5, "rgba(255, 232, 164, 0.08)");
      flame.addColorStop(1, "rgba(255, 232, 164, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = flame;
      ctx.beginPath(); ctx.arc(core.x, core.y, 46 * scale * core.s, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
      for (let mote = 0; mote < 5; mote += 1) {
        const a = idleTime * 0.65 + e.phase + mote * Math.PI * 0.4;
        disc(x + Math.cos(a) * 46, base + 45 + Math.sin(a * 1.7) * 40, z + Math.sin(a) * 18, 1.6, "#fff4b5", null, 0.7);
      }
    } else {
      const img = e.boss ? art.boss : e.hit > 0 ? art.spiritHurt : art.spirit;
      const facing = e.x > hero.x ? -1 : 1;
      const flap = Math.sin(idleTime * 2.4 + e.phase) * 0.05;
      const foot = project(x, base, z);
      /* One photograph, four enemies: without a per-entity size and lean the row
         reads as a copy of a copy, so bulk jitters the height and the phase puts
         each one at a different point of the same sway. */
      const tall = (e.boss ? 330 : 226) * (e.boss ? 1 : e.bulk);
      const height = tall * foot.s;
      if (img && imgW(img)) {
        const width = height * aspect(img) * (1 + flap);
        ctx.save();
        ctx.translate(foot.x, foot.y);
        ctx.scale(facing, 1);
        ctx.rotate(flap * 0.6 + e.drift * 0.035);
        ctx.globalAlpha = clamp(1.3 - foot.depth / 1500, 0.5, 1);
        ctx.drawImage(img, -width / 2, -height, width, height);
        ctx.globalAlpha = 1;
        ctx.restore();
      }
      const eye = project(x, base + tall * 0.44, z);
      const pupil = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, 34 * eye.s * scale);
      pupil.addColorStop(0, "rgba(214, 96, 62, 0.3)");
      pupil.addColorStop(0.45, "rgba(150, 44, 40, 0.14)");
      pupil.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = pupil;
      ctx.beginPath(); ctx.arc(eye.x, eye.y, 34 * eye.s * scale, 0, Math.PI * 2); ctx.fill();
      ctx.globalCompositeOperation = "source-over";
    }
  }
  function drawWeather(front) {
    const travel = reduce.matches ? 0 : idleTime;
    ctx.lineCap = "round";
    for (let i = 0; i < flakes.length; i += 1) {
      if ((i % 3 === 0) !== front) continue;
      const f = flakes[i];
      const spanX = w + 80;
      const spanY = h + 60;
      const x = (f.x * spanX + travel * 19 * f.speed + Math.sin(travel * 0.7 + f.drift) * 13) % spanX - 40;
      const y = (f.y * spanY + travel * 47 * f.speed) % spanY - 30;
      const radius = f.r * (front ? 1.35 : 0.75);
      ctx.strokeStyle = `rgba(237, 247, 242, ${front ? 0.5 : 0.25})`;
      ctx.lineWidth = radius;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - radius * 2.2, y - radius * 3.8);
      ctx.stroke();
    }
  }

  function drawParticles() {
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (const particle of particles) {
      const p = project(particle.x, particle.y, particle.z);
      const alpha = clamp(particle.life, 0, 1);
      const radius = Math.max(1, 3 * p.s);
      // Core particle
      ctx.globalAlpha = alpha;
      ctx.fillStyle = particle.color;
      ctx.beginPath(); ctx.arc(p.x, p.y, radius, 0, Math.PI * 2); ctx.fill();
      // Bloom glow
      if (radius > 2) {
        ctx.globalAlpha = alpha * 0.4;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius *3);
        grad.addColorStop(0, particle.color);
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
        ctx.fillRect(p.x - radius * 3, p.y - radius * 3, radius * 6, radius * 6);
      }
    }
    ctx.restore();
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.save();
    if (shake > 0 && !reduce.matches) ctx.translate((random() - 0.5) * 8, (random() - 0.5) * 6);
    ctx.drawImage(background, 0, 0, w, h);
    drawWeather(false);
    const render = entities.map((e) => ({ z: e.z, draw: () => drawSpirit(e) }));
    render.push({ z: hero.z, draw: drawHero });
    render.sort((a, b) => b.z - a.z).forEach((item) => item.draw());
    if (hero.pulse > 0) {
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const pulseX = w / 2 + hero.x * 0.8;
      const pulseY = h * 0.72;
      const pulseRadius = 240 * (1 - hero.pulse);
      const grad = ctx.createRadialGradient(pulseX, pulseY, 0, pulseX, pulseY, pulseRadius);
      grad.addColorStop(0, `rgba(184, 241, 231, ${hero.pulse * 0.3})`);
      grad.addColorStop(0.6, `rgba(184, 241, 231, ${hero.pulse * 0.1})`);
      grad.addColorStop(1, "rgba(184, 241, 231, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(pulseX, pulseY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    drawParticles();
    drawWeather(true);
    if (flash > 0) {
      ctx.fillStyle = `rgba(164, 33, 33, ${flash * 0.65})`;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(vignettePlate, 0, 0, w, h);
    ctx.restore();
  }

  function frame(now) {
    raf = 0;
    if (!visible || document.hidden) return;
    const dt = Math.min(0.034, Math.max(0, (now - last) / 1000 || 0));
    last = now;
    idleTime += dt * (reduce.matches ? 0.15 : 1);
    if (phase === "play") update(dt);
    draw();
    if (visible && !document.hidden) raf = requestAnimationFrame(frame);
  }

  function startFrames() {
    if (raf || !visible || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  function stopFrames() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function setPointer(event) {
    const rect = canvas.getBoundingClientRect();
    const sx = clamp(event.clientX - rect.left, 0, rect.width);
    const sy = clamp(event.clientY - rect.top, 0, rect.height);
    const pitch = 0.24;
    const sin = Math.sin(pitch);
    const cos = Math.cos(pitch);
    const vertical = (h * 0.64 - sy) / 760;
    const denominator = sin - vertical * cos;
    const projectedZ = Math.abs(denominator) < 0.0001 ? 1210 : 155 * (cos + vertical * sin) / denominator;
    pointer.z = clamp(projectedZ - 620, -110, 590);
    const depth = cos * (pointer.z + 620) + sin * 155;
    pointer.x = clamp((sx - w * 0.5) * depth / 760, -390, 390);
    pointer.active = true;
  }

  const keyMap = { ArrowLeft: "left", KeyA: "left", a: "left", ArrowRight: "right", KeyD: "right", d: "right", ArrowUp: "up", KeyW: "up", w: "up", ArrowDown: "down", KeyS: "down", s: "down" };
  stage.addEventListener("keydown", (event) => {
    if (event.code === "Space" && event.target.closest("button")) return;
    const key = keyMap[event.code] || keyMap[event.key] || keyMap[String(event.key).toLowerCase()];
    if (key) { event.preventDefault(); keys.add(key); return; }
    if (event.code === "Space") {
      event.preventDefault();
      if (phase === "play") attack();
      else if (phase === "pause") resume();
      else start();
    } else if (event.key === "Escape" || event.code === "KeyP") {
      event.preventDefault();
      if (phase === "play") pause(); else if (phase === "pause") resume();
    }
  });
  stage.addEventListener("keyup", (event) => {
    const key = keyMap[event.code] || keyMap[event.key] || keyMap[String(event.key).toLowerCase()];
    if (key) keys.delete(key);
  });
  stage.addEventListener("focusout", () => { if (document.activeElement !== stage) keys.clear(); });
  canvas.addEventListener("pointermove", (event) => { if (phase === "play") setPointer(event); });
  canvas.addEventListener("pointerdown", (event) => {
    if (phase !== "play") return;
    event.preventDefault();
    stage.focus({ preventScroll: true });
    setPointer(event);
    attack();
  });
  startBtn.addEventListener("click", () => { if (phase === "pause") resume(); else start(); });
  pauseBtn.addEventListener("click", () => { if (phase === "play") pause(); else if (phase === "pause") resume(); });
  actionBtn.addEventListener("click", () => { stage.focus({ preventScroll: true }); attack(); });
  window.addEventListener("blur", () => { keys.clear(); if (phase === "play") pause(); });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopFrames();
      if (phase === "play") pause();
    } else {
      startFrames();
    }
  });
  window.addEventListener("langchange", () => { paintLabels(); });
  window.addEventListener("resize", resize);
  if ("ResizeObserver" in window) new ResizeObserver(resize).observe(canvas);
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (!visible) {
        stopFrames();
        if (phase === "play") pause();
      } else {
        draw();
        startFrames();
      }
    }, { rootMargin: "120px" }).observe(stage);
  }

  reset();
  msg.textContent = "";
  paintLabels();
  plates.whenReady(() => {
    buildArt();
    resize();
  });
  resize();
  startFrames();

  if ("ResizeObserver" in window) {
    new ResizeObserver(() => {
      resize();
    }).observe(stage);
  }
}
