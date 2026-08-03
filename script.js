const track = document.querySelector("#book-track");
const spreads = [...document.querySelectorAll(".spread")];
const currentFolio = document.querySelector("#current-folio");
const totalFolios = document.querySelector("#total-folios");
const navigationButtons = [...document.querySelectorAll("[data-go]")];
const previousButtons = [...document.querySelectorAll("[data-prev]")];
const nextButtons = [...document.querySelectorAll("[data-next]")];
const indexDialog = document.querySelector("#research-index");

let page = 0;
let wheelLocked = false;
let touchStartX = 0;
let touchStartY = 0;

const spreadNames = spreads.map((spread) => spread.dataset.spread);
totalFolios.textContent = String(spreads.length - 1).padStart(2, "0");

const setPage = (nextPage, updateHash = true) => {
  page = Math.max(0, Math.min(spreads.length - 1, nextPage));
  track.style.setProperty("--page", page);
  currentFolio.textContent = String(page).padStart(2, "0");

  spreads.forEach((spread, index) => {
    spread.classList.toggle("is-active", index === page);
    spread.setAttribute("aria-hidden", index === page ? "false" : "true");
  });

  navigationButtons.forEach((button) => {
    button.classList.toggle("is-active", Number(button.dataset.go) === page);
  });

  previousButtons.forEach((button) => { button.disabled = page === 0; });
  nextButtons.forEach((button) => { button.disabled = page === spreads.length - 1; });

  if (updateHash) history.replaceState(null, "", `#${spreadNames[page]}`);
};

navigationButtons.forEach((button) => button.addEventListener("click", () => setPage(Number(button.dataset.go))));
previousButtons.forEach((button) => button.addEventListener("click", () => setPage(page - 1)));
nextButtons.forEach((button) => button.addEventListener("click", () => setPage(page + 1)));

window.addEventListener("keydown", (event) => {
  if (indexDialog.open || event.defaultPrevented) return;
  const activeTag = document.activeElement?.tagName;
  if (["INPUT", "SELECT", "TEXTAREA"].includes(activeTag)) return;

  if (["ArrowRight", "PageDown", " "].includes(event.key)) {
    event.preventDefault();
    setPage(page + 1);
  }
  if (["ArrowLeft", "PageUp"].includes(event.key)) {
    event.preventDefault();
    setPage(page - 1);
  }
});

window.addEventListener("wheel", (event) => {
  if (indexDialog.open || wheelLocked || event.target.closest("dialog, input")) return;
  const amount = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (Math.abs(amount) < 18) return;

  event.preventDefault();
  setPage(page + (amount > 0 ? 1 : -1));
  wheelLocked = true;
  window.setTimeout(() => { wheelLocked = false; }, 760);
}, { passive: false });

window.addEventListener("touchstart", (event) => {
  if (event.target.closest("input, button, dialog")) return;
  touchStartX = event.touches[0].clientX;
  touchStartY = event.touches[0].clientY;
}, { passive: true });

window.addEventListener("touchend", (event) => {
  if (!touchStartX || event.target.closest("input, button, dialog")) return;
  const deltaX = event.changedTouches[0].clientX - touchStartX;
  const deltaY = event.changedTouches[0].clientY - touchStartY;
  if (Math.abs(deltaX) > 55 && Math.abs(deltaX) > Math.abs(deltaY)) setPage(page + (deltaX < 0 ? 1 : -1));
  touchStartX = 0;
  touchStartY = 0;
}, { passive: true });

document.querySelector("[data-open-index]").addEventListener("click", () => indexDialog.showModal());
document.querySelector("[data-close-index]").addEventListener("click", () => indexDialog.close());
indexDialog.addEventListener("click", (event) => {
  const bounds = indexDialog.getBoundingClientRect();
  const outside = event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom;
  if (outside) indexDialog.close();
});

/* The room is still. The cursor reveals where attention and access land. */
const coverSpread = document.querySelector(".cover-spread");
const setCoverLight = (clientX, clientY) => {
  const bounds = coverSpread.getBoundingClientRect();
  const x = Math.max(0, Math.min(100, ((clientX - bounds.left) / bounds.width) * 100));
  const y = Math.max(0, Math.min(100, ((clientY - bounds.top) / bounds.height) * 100));
  coverSpread.style.setProperty("--light-x", `${x}%`);
  coverSpread.style.setProperty("--light-y", `${y}%`);
};
coverSpread.addEventListener("pointermove", (event) => setCoverLight(event.clientX, event.clientY));
coverSpread.addEventListener("pointerleave", () => {
  coverSpread.style.setProperty("--light-x", "72%");
  coverSpread.style.setProperty("--light-y", "30%");
});

/* The access map is a ledger, not a decorative network. */
const accessRows = [...document.querySelectorAll("[data-access-row]")];
let accessIndex = 0;
const activateAccessRow = (row) => {
  accessRows.forEach((item) => item.classList.toggle("is-active", item === row));
  accessIndex = accessRows.indexOf(row);
};
accessRows.forEach((row) => {
  row.addEventListener("mouseenter", () => activateAccessRow(row));
  row.addEventListener("focus", () => activateAccessRow(row));
  row.addEventListener("click", () => activateAccessRow(row));
});

/* Show one spatial precedent at a time so its rule remains legible. */
const historyButtons = [...document.querySelectorAll("[data-history-case]")];
const historyPanels = [...document.querySelectorAll("[data-history-panel]")];
const selectHistoryCase = (key) => {
  historyButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.historyCase === key));
  historyPanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.historyPanel === key));
};
historyButtons.forEach((button) => button.addEventListener("click", () => selectHistoryCase(button.dataset.historyCase)));

/* The same rooms hold different activities and claims across a day. */
const domesticSequence = document.querySelector("#domestic-sequence");
const domesticButtons = [...document.querySelectorAll("[data-domestic-case]")];
const domesticHour = document.querySelector("#domestic-hour");
const domesticDialHand = document.querySelector("#domestic-dial-hand");
const domesticMomentTime = document.querySelector("#domestic-moment-time");
const domesticMomentAction = document.querySelector("#domestic-moment-action");
const domesticMomentPlace = document.querySelector("#domestic-moment-place");
const domesticMomentEntry = document.querySelector("#domestic-moment-entry");
const domesticMomentStake = document.querySelector("#domestic-moment-stake");
const domesticCases = [
  { action: "Sleeping / background sync", place: "bed", entry: "data upload", stake: "sleep + trace" },
  { action: "Sleeping / listening devices", place: "bed", entry: "ambient microphone", stake: "sleep + voice" },
  { action: "Sleeping / automated update", place: "bed", entry: "software service", stake: "rest + access" },
  { action: "Sleeping / energy adjustment", place: "bed", entry: "utility schedule", stake: "comfort + data" },
  { action: "Sleeping / delivery forecast", place: "bed", entry: "platform alert", stake: "rest + timing" },
  { action: "Waking / first light", place: "bed", entry: "alarm schedule", stake: "recovery → attention" },
  { action: "Waking / preparing", place: "bed → table", entry: "the day begins", stake: "recovery → attention" },
  { action: "Preparing / eating", place: "table", entry: "household routine", stake: "time + care" },
  { action: "Receiving / leaving", place: "door", entry: "delivery timer", stake: "space + permission" },
  { action: "Leaving / securing", place: "door", entry: "building access", stake: "timing + entry" },
  { action: "Cleaning / resetting", place: "table", entry: "platform schedule", stake: "maintenance + time" },
  { action: "Care / coordination", place: "table", entry: "care message", stake: "attention + duty" },
  { action: "Eating / replying", place: "table", entry: "work notification", stake: "meal + work" },
  { action: "Eating / working", place: "table", entry: "platform task", stake: "care + attention" },
  { action: "Meeting / listening", place: "table", entry: "camera + microphone", stake: "image + voice" },
  { action: "Housework / tracking", place: "table", entry: "service reminder", stake: "maintenance + data" },
  { action: "Resting / still reachable", place: "bed", entry: "platform alert", stake: "pause + attention" },
  { action: "Returning / receiving", place: "door", entry: "delivery update", stake: "space + timing" },
  { action: "Washing / device wakes", place: "mirror", entry: "camera status", stake: "image + privacy" },
  { action: "Washing / private routine", place: "mirror", entry: "camera request", stake: "image + privacy" },
  { action: "Eating / being logged", place: "table", entry: "consumption record", stake: "routine + data" },
  { action: "Care / closing down", place: "table → bed", entry: "care message", stake: "attention → rest" },
  { action: "Recovering / after hours", place: "bed", entry: "work message", stake: "rest + time" },
  { action: "Sleeping / background sync", place: "bed", entry: "data upload", stake: "sleep + trace" },
];
const domesticSceneByPlace = {
  bed: "bed",
  table: "table",
  door: "door",
  mirror: "mirror",
  "bed → table": "morning",
  "table → bed": "closing",
};

const updateDomesticScene = (hour) => {
  const selectedHour = Math.max(0, Math.min(23, Number(hour)));
  const selected = domesticCases[selectedHour];
  if (!selected) return;
  domesticSequence.dataset.domesticScene = domesticSceneByPlace[selected.place];
  domesticHour.value = selectedHour;
  domesticMomentTime.textContent = `${String(selectedHour).padStart(2, "0")}:00`;
  domesticMomentAction.textContent = selected.action;
  domesticMomentPlace.textContent = selected.place;
  domesticMomentEntry.textContent = selected.entry;
  domesticMomentStake.textContent = selected.stake;
  domesticDialHand.style.transform = `rotate(${selectedHour * 15}deg)`;
  domesticButtons.forEach((button) => button.classList.toggle("is-selected", Number(button.dataset.domesticHour) === selectedHour));
};
domesticHour.addEventListener("input", () => updateDomesticScene(domesticHour.value));
domesticButtons.forEach((button) => button.addEventListener("click", () => updateDomesticScene(button.dataset.domesticHour)));

/* One protocol can produce many object-specific material behaviors. */
const objectIndex = document.querySelector("#object-index");
const objectAction = document.querySelector("#object-action");
const objectDetail = document.querySelector("#object-detail");
const objectFocus = document.querySelector("#object-focus");
const objectButtons = [...document.querySelectorAll("[data-object]")];
const objectCases = {
  mirror: { index: "01 / Mirror", action: "The mirror clouds before an image leaves.", detail: "camera request → surface opacity" },
  bed: { index: "02 / Bed", action: "A screen rises when work reaches the bed.", detail: "after-hours work → sound-absorbing screen" },
  table: { index: "03 / Table", action: "A seam rises when work contests a shared surface.", detail: "incoming task → raised textile seam" },
  lamp: { index: "04 / Lamp", action: "A shade turns notification light inward.", detail: "attention pressure → inward-facing shade" },
  speaker: { index: "05 / Speaker", action: "A shutter closes over the microphone.", detail: "ambient listening → physical microphone cover" },
  fridge: { index: "06 / Refrigerator", action: "A lens cover interrupts food tracking.", detail: "tracking camera → physical lens cover" },
  window: { index: "07 / Window", action: "The window clouds before remote viewing.", detail: "remote camera gaze → privacy film" },
  door: { index: "08 / Door", action: "Unconfirmed entry meets resistance.", detail: "spatial entry → resistant turn" },
};

const selectObjectCase = (key) => {
  const selected = objectCases[key];
  if (!selected) return;
  objectIndex.textContent = selected.index;
  objectAction.textContent = selected.action;
  objectDetail.textContent = selected.detail;
  objectFocus.dataset.objectFocus = key;
  objectFocus.setAttribute("aria-label", `Selected object study: ${selected.index.replace(/^\d+ \/ /, "")}`);
  objectButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.object === key));
};
objectButtons.forEach((button) => {
  button.addEventListener("click", () => selectObjectCase(button.dataset.object));
  button.addEventListener("mouseenter", () => selectObjectCase(button.dataset.object));
});

/* Four object-specific simulations; the door remains the physical sample. */
const knobTest = document.querySelector("#knob-test");
const testObjectButtons = [...document.querySelectorAll(".test-object-tabs [data-test-object]")];
const testObjectImage = document.querySelector("#test-object-image");
const materialInput = document.querySelector("#material-input");
const testControlLabel = document.querySelector("#test-control-label");
const testControlMin = document.querySelector("#test-control-min");
const testControlMax = document.querySelector("#test-control-max");
const turnGlass = document.querySelector("#turn-glass");
const handleModeButtons = [...document.querySelectorAll("[data-handle-mode]")];
const modeFree = document.querySelector("#mode-free");
const modeResist = document.querySelector("#mode-resist");
const modeHold = document.querySelector("#mode-hold");
const testSampleLabel = document.querySelector("#test-sample-label");
const testEvent = document.querySelector("#test-event");
const mechanismA = document.querySelector("#mechanism-a");
const mechanismB = document.querySelector("#mechanism-b");
const mechanismC = document.querySelector("#mechanism-c");
const metricALabel = document.querySelector("#metric-a-label");
const metricBLabel = document.querySelector("#metric-b-label");
const metricCLabel = document.querySelector("#metric-c-label");
const handleInput = document.querySelector("#handle-input");
const handleOutput = document.querySelector("#handle-output");
const handleResistance = document.querySelector("#handle-resistance");
const handleStatement = document.querySelector("#handle-statement");
const recordResponse = document.querySelector("#record-response");
const receipt = document.querySelector("#protocol-receipt");
const receiptId = document.querySelector("#receipt-id");
const receiptState = document.querySelector("#receipt-state");
const receiptCopy = document.querySelector("#receipt-copy");
const receiptTime = document.querySelector("#receipt-time");

let selectedTestObject = "door";
let selectedHandleMode = "resist";
let receiptSequence = 31;
let lastTestReading;

const testCases = {
  door: {
    initial: 58,
    sample: "TEST 01 / PHYSICAL SAMPLE",
    image: "./assets/object-door-hd.png",
    alt: "Glass door handle and controllable resistance study.",
    event: "UNCONFIRMED ENTRY",
    control: "ENTRY PRESSURE",
    ends: ["LIGHT TOUCH", "FULL TURN"],
    modes: ["FREE", "RESIST", "HOLD"],
    mechanism: ["ROTARY SENSOR", "MOTOR BRAKE", "HAND"],
    metrics: ["INPUT", "HANDLE TURN", "RESISTANCE"],
    statements: [
      "The handle follows the hand and entry continues.",
      "The brake slows the turn while entry is unconfirmed.",
      "The brake holds the turn and entry remains outside.",
    ],
    read(raw, mode) {
      const input = Math.round(raw * .9);
      const resistance = [0, 55, 100][mode];
      const output = mode === 0 ? input : mode === 1 ? Math.round(input * .55) : Math.min(Math.round(input * .13), 12);
      return { values: [`${input}°`, `${output}°`, `${resistance}%`], effect: resistance / 100, visual: output / 90 };
    },
  },
  mirror: {
    initial: 64,
    sample: "TEST 02 / DIGITAL STUDY",
    image: "./assets/object-mirror-hd.png",
    alt: "Mirror and variable-opacity surface study.",
    event: "REMOTE CAMERA REQUEST",
    control: "CAMERA EXPOSURE",
    ends: ["ONE FRAME", "CONTINUOUS CAPTURE"],
    modes: ["CLEAR", "VEIL", "CLOUD"],
    mechanism: ["CAMERA SIGNAL", "SWITCHABLE FILM", "SURFACE"],
    metrics: ["CAMERA ACCESS", "CLEAR AREA", "OPACITY"],
    statements: [
      "The surface remains clear and the image can leave.",
      "A partial veil makes camera access visible before capture.",
      "The surface clouds and the image remains in the room.",
    ],
    read(raw, mode) {
      const opacity = mode === 0 ? 0 : mode === 1 ? Math.max(55, Math.round(raw * .72)) : 100;
      return { values: [`${raw}%`, `${100 - opacity}%`, `${opacity}%`], effect: opacity / 100, visual: opacity / 100 };
    },
  },
  bed: {
    initial: 72,
    sample: "TEST 03 / DIGITAL STUDY",
    image: "./assets/object-bed-v2.png",
    alt: "Bed and rising textile boundary study.",
    event: "AFTER-HOURS WORK",
    control: "AFTER-HOURS WORK",
    ends: ["ONE MESSAGE", "WORK FILLS REST"],
    modes: ["OPEN", "FILTER", "SEAL"],
    mechanism: ["TIME RULE", "LINEAR ACTUATOR", "TEXTILE"],
    metrics: ["WORK PRESSURE", "SCREEN RISE", "WORK VISIBLE"],
    statements: [
      "Work remains visible beside the place of recovery.",
      "A textile boundary rises as work enters after hours.",
      "The screen closes and recovery regains the room.",
    ],
    read(raw, mode) {
      const screen = mode === 0 ? 0 : mode === 1 ? Math.max(48, Math.round(raw * .72)) : 100;
      return { values: [`${raw}%`, `${screen}%`, `${100 - screen}%`], effect: screen / 100, visual: screen / 100 };
    },
  },
  speaker: {
    initial: 54,
    sample: "TEST 04 / DIGITAL STUDY",
    image: "./assets/object-speaker-hd.png",
    alt: "Speaker and mechanical microphone aperture study.",
    event: "AMBIENT LISTENING",
    control: "LISTENING EXPOSURE",
    ends: ["ON DEMAND", "ALWAYS LISTENING"],
    modes: ["OPEN", "NARROW", "CLOSE"],
    mechanism: ["MIC STATUS", "SERVO IRIS", "APERTURE"],
    metrics: ["LISTENING", "APERTURE", "CLOSURE"],
    statements: [
      "The microphone stays open and listening remains invisible.",
      "The aperture narrows so listening acquires a visible limit.",
      "The iris closes and ambient speech stays in the room.",
    ],
    read(raw, mode) {
      const closure = mode === 0 ? 0 : mode === 1 ? Math.max(52, Math.round(raw * .74)) : 100;
      return { values: [`${raw}%`, `${100 - closure}%`, `${closure}%`], effect: closure / 100, visual: Math.max(.16, 1 - closure / 119) };
    },
  },
};

const nowStamp = () => new Intl.DateTimeFormat("en-US", {
  hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false,
}).format(new Date());

const updateHandleTest = () => {
  const selected = testCases[selectedTestObject];
  const raw = Number(materialInput.value);
  const modeIndex = { free: 0, resist: 1, hold: 2 }[selectedHandleMode];
  const reading = selected.read(raw, modeIndex);
  lastTestReading = { selected, reading, modeIndex };
  knobTest.dataset.testObject = selectedTestObject;
  knobTest.dataset.handleMode = selectedHandleMode;
  knobTest.style.setProperty("--material-effect", reading.effect);
  knobTest.style.setProperty("--screen-height", `${reading.effect * 100}%`);
  knobTest.style.setProperty("--iris-scale", reading.visual);
  turnGlass.style.setProperty("--handle-angle", `${reading.visual * 90}deg`);
  testObjectImage.src = selected.image;
  testObjectImage.alt = selected.alt;
  testSampleLabel.textContent = selected.sample;
  testEvent.textContent = selected.event;
  testControlLabel.textContent = selected.control;
  testControlMin.textContent = selected.ends[0];
  testControlMax.textContent = selected.ends[1];
  [modeFree, modeResist, modeHold].forEach((button, index) => { button.textContent = selected.modes[index]; });
  [mechanismA, mechanismB, mechanismC].forEach((element, index) => { element.textContent = selected.mechanism[index]; });
  [metricALabel, metricBLabel, metricCLabel].forEach((element, index) => { element.textContent = selected.metrics[index]; });
  [handleInput, handleOutput, handleResistance].forEach((element, index) => { element.textContent = reading.values[index]; });
  handleStatement.textContent = selected.statements[modeIndex];
  receiptState.textContent = `${selectedTestObject.toUpperCase()} / ${selected.modes[modeIndex]}`;
  receiptCopy.textContent = `${selected.metrics.map((metric, index) => `${metric} ${reading.values[index]}`).join(" / ")}.`;
  handleModeButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.handleMode === selectedHandleMode));
  testObjectButtons.forEach((button) => button.classList.toggle("is-selected", button.dataset.testObject === selectedTestObject));
};

materialInput.addEventListener("input", updateHandleTest);
testObjectButtons.forEach((button) => button.addEventListener("click", () => {
  selectedTestObject = button.dataset.testObject;
  materialInput.value = testCases[selectedTestObject].initial;
  selectedHandleMode = "resist";
  updateHandleTest();
}));
handleModeButtons.forEach((button) => button.addEventListener("click", () => {
  selectedHandleMode = button.dataset.handleMode;
  updateHandleTest();
}));

recordResponse.addEventListener("click", () => {
  receiptSequence += 1;
  const { selected, reading, modeIndex } = lastTestReading;
  receipt.classList.remove("is-printed");
  window.setTimeout(() => {
    receiptId.textContent = `TEST RECORD / 2026 / ${String(receiptSequence).padStart(3, "0")}`;
    receiptState.textContent = `${selectedTestObject.toUpperCase()} / ${selected.modes[modeIndex]}`;
    receiptCopy.textContent = `${selected.metrics.map((metric, index) => `${metric} ${reading.values[index]}`).join(" / ")}.`;
    receiptTime.textContent = nowStamp();
    receipt.classList.add("is-printed");
  }, 100);
});

/* The sample moves from found hardware to intervention to exhibition evidence. */
const materialStage = document.querySelector("#material-stage");
const sampleViewButtons = [...document.querySelectorAll(".material-tabs [data-sample-view]")];
const samplePanels = [...document.querySelectorAll("[data-sample-panel]")];
sampleViewButtons.forEach((button) => button.addEventListener("click", () => {
  const view = button.dataset.sampleView;
  materialStage.dataset.sampleView = view;
  sampleViewButtons.forEach((item) => item.classList.toggle("is-selected", item.dataset.sampleView === view));
  samplePanels.forEach((panel) => panel.classList.toggle("is-active", panel.dataset.samplePanel === view));
}));

/* The final page keeps the research open by reading the same room through four lenses. */
const fieldStage = document.querySelector("#field-stage");
const fieldQuestion = document.querySelector("#field-question");
const fieldLensButtons = [...document.querySelectorAll("[data-field-lens]")];
const fieldQuestions = {
  history: "How has the home staged entry and visibility?",
  labor: "Whose time keeps the home available?",
  network: "Where does remote access land?",
  material: "How can a boundary become felt?",
};
fieldLensButtons.forEach((button) => button.addEventListener("click", () => {
  const lens = button.dataset.fieldLens;
  fieldStage.dataset.fieldFocus = lens;
  fieldQuestion.textContent = fieldQuestions[lens];
  fieldLensButtons.forEach((item) => item.classList.toggle("is-selected", item.dataset.fieldLens === lens));
}));

const hashPage = spreadNames.indexOf(window.location.hash.replace("#", ""));
setPage(hashPage >= 0 ? hashPage : 0, false);
window.addEventListener("hashchange", () => {
  const nextHashPage = spreadNames.indexOf(window.location.hash.replace("#", ""));
  if (nextHashPage >= 0 && nextHashPage !== page) setPage(nextHashPage, false);
});
activateAccessRow(accessRows[0]);
selectHistoryCase("roman");
updateDomesticScene(6);
selectObjectCase("mirror");
updateHandleTest();
