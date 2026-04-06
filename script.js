// ── Elemen ──
const inputTask    = document.getElementById("inputTask");
const btnTambah    = document.getElementById("tambah");
const listTask     = document.getElementById("listTask");
const filterButtons = document.querySelectorAll(".btn-filter");

// ── State ──
let tasks = JSON.parse(localStorage.getItem("todo")) || [];
let currentFilter = "semua";
let saveTimer = null;

// ── Render ──
function renderTasks() {
  listTask.innerHTML = "";

  // FIX #4: filter logic yang benar
  const filtered = tasks.filter(t => {
    if (currentFilter === "semua")   return t.status === "baru";
    if (currentFilter === "belum")   return t.status === "pending"; // was broken before
    if (currentFilter === "selesai") return t.status === "selesai";
    return false;
  });

  filtered.forEach((task) => {
    // FIX #2: gunakan id, bukan findIndex O(n)
    const li = document.createElement("li");
    li.className = "task-item status-" + task.status;

    // FIX #1: pakai class CSS, bukan inline style
    li.innerHTML = `
      <h3 class="${task.status === 'selesai' ? 'selesai' : ''}">${task.text}</h3>
      <div class="task-actions">
        <button class="btn-done">✅ Selesai</button>
        <button class="btn-delay">⏳ Pending</button>
        <button class="btn-delete">🗑️ Hapus</button>
      </div>
    `;

    li.querySelector(".btn-done").onclick = () => {
      const t = tasks.find(x => x.id === task.id);
      if (t) { t.status = "selesai"; saveAndRefresh(); }
    };

    li.querySelector(".btn-delay").onclick = () => {
      const t = tasks.find(x => x.id === task.id);
      if (t) { t.status = "pending"; saveAndRefresh(); }
    };

    li.querySelector(".btn-delete").onclick = () => {
      if (confirm("Hapus tugas ini secara permanen?")) {
        tasks = tasks.filter(x => x.id !== task.id);
        saveAndRefresh();
      }
    };

    listTask.appendChild(li);
  });

  updateEmptyState(filtered.length);
}

// ── FIX #3: debounce save ──
function saveAndRefresh() {
  localStorage.setItem("todo", JSON.stringify(tasks));
  clearTimeout(saveTimer);
  saveTimer = setTimeout(renderTasks, 50);
}

// ── Tambah tugas ──
function addTask() {
  const text = inputTask.value.trim();
  if (!text) {
    alert("Write your schedule first!");
    return;
  }
  tasks.push({ id: Date.now(), text, status: "baru" }); // FIX #2: id unik
  inputTask.value = "";
  inputTask.focus();
  saveAndRefresh();
}

// ── Event listeners ──
if (btnTambah) btnTambah.onclick = addTask;

if (inputTask) {
  inputTask.onkeypress = (e) => {
    if (e.key === "Enter") addTask();
  };
}

filterButtons.forEach(btn => {
  btn.onclick = () => {
    filterButtons.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    renderTasks();
  };
});

// ── Empty state ──
function updateEmptyState(count) {
  const el = document.getElementById("empty-state");
  if (el) el.style.display = count === 0 ? "block" : "none";
}

// ── Init ──
window.onload = () => {
  // FIX #6: tampilkan tanggal hari ini
  const dateEl = document.getElementById("date-today");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("id-ID", {
      weekday: "long", year: "numeric", month: "long", day: "numeric"
    });
  }
  renderTasks();
  if (inputTask) inputTask.focus();
};