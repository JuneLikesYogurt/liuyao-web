const READING_KEY = "guanyao-ui-latest-reading-v1";
const DRAFT_KEY = "guanyao-ui-draft-v1";
const SERVER_ID_KEY = "guanyao-ui-latest-server-id";

function readAuthToken() {
  const match = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("token="));
  if (match) {
    const raw = match.slice("token=".length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }
  return localStorage.getItem("token");
}

function readCompletedCast() {
  try {
    const latest = JSON.parse(localStorage.getItem(READING_KEY) || "null");
    if (latest && Array.isArray(latest.lines) && latest.lines.length === 6) {
      return latest;
    }

    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    if (!draft || !Array.isArray(draft.lines) || draft.lines.length !== 6) return null;
    if (draft.lines.some((line) => line == null || line === "")) return null;
    return {
      question: draft.question || "未命名卦例",
      dateTime: draft.dateTime || "",
      lines: draft.lines.map(Number)
    };
  } catch {
    return null;
  }
}

function normalizeCastDate(value) {
  const raw = String(value || "").trim().replace("T", " ");
  if (!raw) return "";
  return raw.length === 16 ? `${raw}:00` : raw;
}

async function persistCast() {
  const reading = readCompletedCast();
  if (!reading) throw new Error("尚未取得完整六爻");
  const token = readAuthToken();
  if (!token) {
    top.location.assign("/login?next=%2F");
    return null;
  }

  const response = await fetch("/api/cast", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify({
      title: reading.question || "未命名卦例",
      date: normalizeCastDate(reading.dateTime),
      result: reading.lines.slice().reverse().join("")
    })
  });

  if (!response.ok) {
    throw new Error("排盘接口暂时没有回应");
  }

  const data = await response.json().catch(() => null);
  if (data?.liuyao_id != null) {
    const id = String(data.liuyao_id);
    localStorage.setItem(SERVER_ID_KEY, id);
    return id;
  }
  throw new Error("排盘结果缺少编号");
}

function updateRealIdentity() {
  const label = localStorage.getItem("user_label")?.trim();
  if (!label) return;
  const user = document.querySelector(".top-nav__user");
  const avatar = user?.querySelector(".avatar");
  const name = user?.querySelector("span:not(.avatar)");
  const initial = label.slice(0, 1);
  if (avatar && avatar.textContent !== initial) avatar.textContent = initial;
  if (name && name.textContent !== label) name.textContent = label;
}

new MutationObserver(updateRealIdentity).observe(document.body, {
  childList: true,
  subtree: true
});
updateRealIdentity();

document.addEventListener("click", (event) => {
  const anchor = event.target.closest?.("a[href]");
  const href = anchor?.getAttribute("href");
  const realPath = href === "#/readings" ? "/history" : href === "#/me" ? "/me" : null;
  if (realPath) {
    event.preventDefault();
    event.stopImmediatePropagation();
    top.location.assign(realPath);
    return;
  }

  const trigger = event.target.closest?.('[data-action="open-full-reading"]');
  if (!trigger) return;

  event.preventDefault();
  event.stopImmediatePropagation();
  if (trigger.disabled) return;

  const original = trigger.innerHTML;
  trigger.disabled = true;
  trigger.textContent = "正在排盘…";

  void persistCast()
    .then((id) => {
      if (id) top.location.assign(`/result?liuyao_id=${encodeURIComponent(id)}`);
    })
    .catch((error) => {
      console.error(error);
      trigger.textContent = error instanceof Error ? error.message : "排盘失败，请重试";
      window.setTimeout(() => {
        trigger.disabled = false;
        trigger.innerHTML = original;
      }, 2400);
    });
}, true);
