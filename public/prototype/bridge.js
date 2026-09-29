const READING_KEY = "guanyao-ui-latest-reading-v1";

function readCompletedCast() {
  try {
    const reading = JSON.parse(localStorage.getItem(READING_KEY) || "null");
    if (!reading || !Array.isArray(reading.lines) || reading.lines.length !== 6) return null;
    return reading;
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
  if (!reading) return;
  const token = localStorage.getItem("token");
  if (!token) return;

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

  if (!response.ok) return;
  const data = await response.json();
  if (data?.liuyao_id != null) {
    localStorage.setItem("guanyao-ui-latest-server-id", String(data.liuyao_id));
  }
}

document.addEventListener("click", (event) => {
  const trigger = event.target.closest?.('[data-action="open-full-reading"]');
  if (!trigger) return;
  queueMicrotask(() => void persistCast().catch(console.error));
});
