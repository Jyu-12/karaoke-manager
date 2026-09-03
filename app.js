const DB_NAME = "karaokeManagerDB";
const DB_VERSION = 1;
const STORE = "songs";

let db;
let songs = [];
let currentFilter = "all";
let formMode = "add"; // add / edit / continuous / duplicate
let pendingDamScores = [];
let pendingJoysoundScores = [];

const QUICK_TAGS_KEY = "karaokeManagerQuickTagsV1";
const THEME_KEY = "karaokeManagerThemeV1";
const SESSION_HOURS = 12;

const SUPABASE_URL = "https://zrihlqlqgpbmtlhigceb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_9OK0z69_4ZSo_RVX9WXXfQ_x7nMOWEk";
const CLOUD_AUTH_KEY = "karaokeCloudAuthV1";
const CLOUD_DIRTY_KEY = "karaokeCloudDirtyIdsV1";
const CLOUD_TOMBSTONES_KEY = "karaokeCloudTombstonesV1";
const CLOUD_INITIALIZED_KEY = "karaokeCloudInitializedV1";
const CLOUD_LAST_SYNC_KEY = "karaokeCloudLastSyncV1";

let cloudAuth = null;
let cloudSyncInProgress = false;
let suppressCloudWrite = false;
const DEFAULT_QUICK_TAGS = [
  "バラード",
  "盛り上がる",
  "しっとり",
  "高音",
  "低音",
  "オク下",
  "練習中",
  "得意"
];

const els = {
  songCount: document.querySelector("#songCount"),
  songList: document.querySelector("#songList"),
  searchInput: document.querySelector("#searchInput"),
  sortSelect: document.querySelector("#sortSelect"),
  sortSelect2: document.querySelector("#sortSelect2"),
  resetFiltersBtn: document.querySelector("#resetFiltersBtn"),
  artistFilterSelect: document.querySelector("#artistFilterSelect"),
  tagFilterSelect: document.querySelector("#tagFilterSelect"),
  recentFilterSelect: document.querySelector("#recentFilterSelect"),
  themeSelect: document.querySelector("#themeSelect"),
  addSongBtn: document.querySelector("#addSongBtn"),
  continuousAddBtn: document.querySelector("#continuousAddBtn"),
  cloudBtn: document.querySelector("#cloudBtn"),
  cloudBtnText: document.querySelector("#cloudBtnText"),
  cloudDialog: document.querySelector("#cloudDialog"),
  closeCloudDialogBtn: document.querySelector("#closeCloudDialogBtn"),
  cloudLoggedOutPanel: document.querySelector("#cloudLoggedOutPanel"),
  cloudLoggedInPanel: document.querySelector("#cloudLoggedInPanel"),
  cloudEmailInput: document.querySelector("#cloudEmailInput"),
  cloudPasswordInput: document.querySelector("#cloudPasswordInput"),
  cloudLoginError: document.querySelector("#cloudLoginError"),
  cloudLoginBtn: document.querySelector("#cloudLoginBtn"),
  cloudUserEmail: document.querySelector("#cloudUserEmail"),
  cloudSyncState: document.querySelector("#cloudSyncState"),
  cloudLastSync: document.querySelector("#cloudLastSync"),
  cloudSyncMessage: document.querySelector("#cloudSyncMessage"),
  cloudSyncNowBtn: document.querySelector("#cloudSyncNowBtn"),
  cloudLogoutBtn: document.querySelector("#cloudLogoutBtn"),
  manageTagsBtn: document.querySelector("#manageTagsBtn"),
  statsBtn: document.querySelector("#statsBtn"),
  sessionHistoryBtn: document.querySelector("#sessionHistoryBtn"),
  randomBtn: document.querySelector("#randomBtn"),
  exportBtn: document.querySelector("#exportBtn"),
  importInput: document.querySelector("#importInput"),
  exportCsvBtn: document.querySelector("#exportCsvBtn"),
  importCsvInput: document.querySelector("#importCsvInput"),

  songDialog: document.querySelector("#songDialog"),
  songForm: document.querySelector("#songForm"),
  dialogTitle: document.querySelector("#dialogTitle"),
  songId: document.querySelector("#songId"),
  titleInput: document.querySelector("#titleInput"),
  artistInput: document.querySelector("#artistInput"),
  titleSuggestions: document.querySelector("#titleSuggestions"),
  artistSuggestions: document.querySelector("#artistSuggestions"),
  keyInput: document.querySelector("#keyInput"),
  confidenceInput: document.querySelector("#confidenceInput"),
  favoriteInput: document.querySelector("#favoriteInput"),
  stapleInput: document.querySelector("#stapleInput"),
  practiceInput: document.querySelector("#practiceInput"),
  tagsInput: document.querySelector("#tagsInput"),
  memoInput: document.querySelector("#memoInput"),
  deleteSongBtn: document.querySelector("#deleteSongBtn"),
  duplicateSongBtn: document.querySelector("#duplicateSongBtn"),
  saveSongBtn: document.querySelector("#saveSongBtn"),
  formError: document.querySelector("#formError"),
  closeDialogBtn: document.querySelector("#closeDialogBtn"),
  cancelBtn: document.querySelector("#cancelBtn"),
  keepArtistInput: document.querySelector("#keepArtistInput"),
  continuousKeepArtistRow: document.querySelector("#continuousKeepArtistRow"),
  songStats: document.querySelector("#songStats"),
  playCountText: document.querySelector("#playCountText"),
  lastSungText: document.querySelector("#lastSungText"),
  damScoreInput: document.querySelector("#damScoreInput"),
  addDamScoreBtn: document.querySelector("#addDamScoreBtn"),
  damScoreList: document.querySelector("#damScoreList"),
  damScoreCount: document.querySelector("#damScoreCount"),
  joysoundScoreInput: document.querySelector("#joysoundScoreInput"),
  addJoysoundScoreBtn: document.querySelector("#addJoysoundScoreBtn"),
  joysoundScoreList: document.querySelector("#joysoundScoreList"),
  joysoundScoreCount: document.querySelector("#joysoundScoreCount"),

  quickTagButtons: document.querySelector("#quickTagButtons"),
  editQuickTagsBtn: document.querySelector("#editQuickTagsBtn"),
  quickTagDialog: document.querySelector("#quickTagDialog"),
  quickTagForm: document.querySelector("#quickTagForm"),
  quickTagsInput: document.querySelector("#quickTagsInput"),
  closeQuickTagDialogBtn: document.querySelector("#closeQuickTagDialogBtn"),
  cancelQuickTagsBtn: document.querySelector("#cancelQuickTagsBtn"),
  resetQuickTagsBtn: document.querySelector("#resetQuickTagsBtn"),

  tagManagerDialog: document.querySelector("#tagManagerDialog"),
  tagManagerList: document.querySelector("#tagManagerList"),
  closeTagManagerBtn: document.querySelector("#closeTagManagerBtn"),
  tagManagerDoneBtn: document.querySelector("#tagManagerDoneBtn"),

  songDetailDialog: document.querySelector("#songDetailDialog"),
  closeDetailBtn: document.querySelector("#closeDetailBtn"),
  detailTitle: document.querySelector("#detailTitle"),
  detailArtist: document.querySelector("#detailArtist"),
  detailBadges: document.querySelector("#detailBadges"),
  detailTags: document.querySelector("#detailTags"),
  detailPlayCount: document.querySelector("#detailPlayCount"),
  detailLastSung: document.querySelector("#detailLastSung"),
  detailDamCount: document.querySelector("#detailDamCount"),
  detailDamAvg: document.querySelector("#detailDamAvg"),
  detailDamBest: document.querySelector("#detailDamBest"),
  detailDamHistory: document.querySelector("#detailDamHistory"),
  detailJoyCount: document.querySelector("#detailJoyCount"),
  detailJoyAvg: document.querySelector("#detailJoyAvg"),
  detailJoyBest: document.querySelector("#detailJoyBest"),
  detailJoyHistory: document.querySelector("#detailJoyHistory"),
  detailMemo: document.querySelector("#detailMemo"),
  detailEditBtn: document.querySelector("#detailEditBtn"),

  sessionHistoryDialog: document.querySelector("#sessionHistoryDialog"),
  closeSessionHistoryBtn: document.querySelector("#closeSessionHistoryBtn"),
  sessionHistoryDoneBtn: document.querySelector("#sessionHistoryDoneBtn"),
  sessionHistoryList: document.querySelector("#sessionHistoryList"),

  statsDialog: document.querySelector("#statsDialog"),
  closeStatsBtn: document.querySelector("#closeStatsBtn"),
  statsDoneBtn: document.querySelector("#statsDoneBtn"),
  statsOverview: document.querySelector("#statsOverview"),
  statsDam: document.querySelector("#statsDam"),
  statsJoy: document.querySelector("#statsJoy"),
  statsTopSongs: document.querySelector("#statsTopSongs"),

  template: document.querySelector("#songCardTemplate"),
  randomDialog: document.querySelector("#randomDialog"),
  randomTitle: document.querySelector("#randomTitle"),
  randomArtist: document.querySelector("#randomArtist"),
  randomMeta: document.querySelector("#randomMeta"),
  randomAgainBtn: document.querySelector("#randomAgainBtn"),
  randomCloseBtn: document.querySelector("#randomCloseBtn"),
};


function loadCloudAuth() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CLOUD_AUTH_KEY) || "null");
    if (parsed?.access_token && parsed?.refresh_token && parsed?.user?.id) {
      cloudAuth = parsed;
      return parsed;
    }
  } catch {}
  cloudAuth = null;
  return null;
}

function saveCloudAuth(auth) {
  cloudAuth = auth || null;
  if (auth) {
    localStorage.setItem(CLOUD_AUTH_KEY, JSON.stringify(auth));
  } else {
    localStorage.removeItem(CLOUD_AUTH_KEY);
  }
  updateCloudUI();
}

function getDirtyIds() {
  try {
    const data = JSON.parse(localStorage.getItem(CLOUD_DIRTY_KEY) || "[]");
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

function saveDirtyIds(set) {
  localStorage.setItem(CLOUD_DIRTY_KEY, JSON.stringify([...set]));
}

function markDirty(id) {
  if (!id) return;
  const dirty = getDirtyIds();
  dirty.add(id);
  saveDirtyIds(dirty);
}

function clearDirty(id) {
  const dirty = getDirtyIds();
  dirty.delete(id);
  saveDirtyIds(dirty);
}

function getTombstones() {
  try {
    const data = JSON.parse(localStorage.getItem(CLOUD_TOMBSTONES_KEY) || "{}");
    return data && typeof data === "object" ? data : {};
  } catch {
    return {};
  }
}

function saveTombstones(data) {
  localStorage.setItem(CLOUD_TOMBSTONES_KEY, JSON.stringify(data || {}));
}

function addTombstone(id) {
  if (!id) return;
  const data = getTombstones();
  data[id] = new Date().toISOString();
  saveTombstones(data);
}

function clearTombstone(id) {
  const data = getTombstones();
  delete data[id];
  saveTombstones(data);
}

function cloudHeaders(accessToken = null) {
  const headers = {
    "apikey": SUPABASE_PUBLISHABLE_KEY,
    "Content-Type": "application/json"
  };
  const token = accessToken || cloudAuth?.access_token;
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function cloudFetch(path, options = {}, allowRefresh = true) {
  const response = await fetch(`${SUPABASE_URL}${path}`, {
    ...options,
    headers: {
      ...cloudHeaders(),
      ...(options.headers || {})
    }
  });

  if (response.status === 401 && allowRefresh && cloudAuth?.refresh_token) {
    const refreshed = await refreshCloudSession();
    if (refreshed) return cloudFetch(path, options, false);
  }

  return response;
}

async function loginCloud(email, password) {
  const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: cloudHeaders(null),
    body: JSON.stringify({ email, password })
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.msg || data?.error_description || data?.message || "ログインできませんでした。");
  }

  saveCloudAuth(data);
  return data;
}

async function refreshCloudSession() {
  if (!cloudAuth?.refresh_token) return false;

  try {
    const response = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: cloudHeaders(null),
      body: JSON.stringify({ refresh_token: cloudAuth.refresh_token })
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok || !data?.access_token) {
      saveCloudAuth(null);
      return false;
    }

    saveCloudAuth(data);
    return true;
  } catch {
    return false;
  }
}

async function validateCloudSession() {
  if (!cloudAuth?.access_token) return false;

  try {
    const response = await cloudFetch("/auth/v1/user", { method: "GET" });
    if (!response.ok) {
      if (response.status === 401) saveCloudAuth(null);
      return false;
    }
    const user = await response.json();
    if (user?.id) {
      cloudAuth.user = user;
      localStorage.setItem(CLOUD_AUTH_KEY, JSON.stringify(cloudAuth));
      updateCloudUI();
      return true;
    }
  } catch {}
  return false;
}

function cloudSongFromLocal(song) {
  return {
    id: song.id,
    user_id: cloudAuth.user.id,
    title: song.title,
    artist: song.artist,
    key: song.key === "" || song.key === null || song.key === undefined ? null : Number(song.key),
    confidence: song.confidence || null,
    favorite: !!song.favorite,
    staple: !!song.staple,
    practice: !!song.practice,
    tags: parseTags(song.tags),
    memo: song.memo || "",
    dam_scores: damScoresOf(song),
    joysound_scores: joysoundScoresOf(song),
    created_at: song.createdAt || new Date().toISOString(),
    updated_at: song.updatedAt || new Date().toISOString()
  };
}

function localSongFromCloud(row) {
  return {
    id: row.id,
    title: row.title || "",
    artist: row.artist || "",
    key: row.key === null || row.key === undefined ? "" : Number(row.key),
    confidence: row.confidence || "",
    favorite: !!row.favorite,
    staple: !!row.staple,
    practice: !!row.practice,
    tags: parseTags(row.tags),
    memo: row.memo || "",
    damScores: normalizeScoreEntries(row.dam_scores),
    joysoundScores: normalizeScoreEntries(row.joysound_scores),
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString()
  };
}

async function cloudUpsertSong(song) {
  if (!cloudAuth?.user?.id) return false;

  const response = await cloudFetch("/rest/v1/songs?on_conflict=id", {
    method: "POST",
    headers: {
      "Prefer": "resolution=merge-duplicates,return=minimal"
    },
    body: JSON.stringify(cloudSongFromLocal(song))
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `同期エラー (${response.status})`);
  }

  clearDirty(song.id);
  clearTombstone(song.id);
  return true;
}

async function cloudDeleteSong(id) {
  if (!cloudAuth?.user?.id) return false;

  const response = await cloudFetch(`/rest/v1/songs?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { "Prefer": "return=minimal" }
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `削除同期エラー (${response.status})`);
  }

  clearDirty(id);
  clearTombstone(id);
  return true;
}

async function fetchCloudSongs() {
  if (!cloudAuth?.user?.id) return [];

  const response = await cloudFetch(
    "/rest/v1/songs?select=*&order=updated_at.asc",
    { method: "GET" }
  );

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(text || `クラウド取得エラー (${response.status})`);
  }

  const rows = await response.json();
  return Array.isArray(rows) ? rows.map(localSongFromCloud) : [];
}

async function putSongLocalOnly(song) {
  suppressCloudWrite = true;
  try {
    await storeRequest("readwrite", store => store.put(song));
  } finally {
    suppressCloudWrite = false;
  }
}

async function removeSongLocalOnly(id) {
  suppressCloudWrite = true;
  try {
    await storeRequest("readwrite", store => store.delete(id));
  } finally {
    suppressCloudWrite = false;
  }
}

async function replaceLocalSongs(cloudSongs) {
  suppressCloudWrite = true;
  try {
    await new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, "readwrite");
      const store = tx.objectStore(STORE);
      store.clear();
      for (const song of cloudSongs) store.put(song);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } finally {
    suppressCloudWrite = false;
  }
  songs = await getAllSongs();
  render();
}

async function uploadAllLocalSongs() {
  const localSongs = await getAllSongs();
  for (const song of localSongs) {
    await cloudUpsertSong(song);
  }
  return localSongs.length;
}

async function syncCloud({ silent = false } = {}) {
  if (!cloudAuth?.user?.id || cloudSyncInProgress) return false;

  cloudSyncInProgress = true;
  updateCloudUI("syncing");

  try {
    let cloudSongs = await fetchCloudSongs();
    const localSongs = await getAllSongs();

    // 初回同期:
    // ・クラウドが空なら現在端末のデータをそのままアップロード
    // ・端末が空ならクラウドをそのままダウンロード
    // ・両方にある場合は union merge
    const initialized = localStorage.getItem(CLOUD_INITIALIZED_KEY) === "1";

    if (!initialized) {
      if (cloudSongs.length === 0 && localSongs.length > 0) {
        await uploadAllLocalSongs();
        cloudSongs = await fetchCloudSongs();
      } else if (localSongs.length === 0 && cloudSongs.length > 0) {
        await replaceLocalSongs(cloudSongs);
      } else if (localSongs.length > 0 && cloudSongs.length > 0) {
        const cloudMap = new Map(cloudSongs.map(song => [song.id, song]));
        for (const local of localSongs) {
          const remote = cloudMap.get(local.id);
          if (!remote) {
            await cloudUpsertSong(local);
            continue;
          }
          const localTime = new Date(local.updatedAt || 0).getTime();
          const remoteTime = new Date(remote.updatedAt || 0).getTime();
          if (localTime > remoteTime) await cloudUpsertSong(local);
        }
        cloudSongs = await fetchCloudSongs();
        await replaceLocalSongs(cloudSongs);
      }

      localStorage.setItem(CLOUD_INITIALIZED_KEY, "1");
    } else {
      // 通常同期。クラウド側の削除も尊重するため dirty flag を利用。
      const dirty = getDirtyIds();
      const tombstones = getTombstones();

      // 自端末で未同期の削除を先に反映。
      for (const id of Object.keys(tombstones)) {
        await cloudDeleteSong(id);
      }

      cloudSongs = await fetchCloudSongs();
      const latestLocal = await getAllSongs();
      const localMap = new Map(latestLocal.map(song => [song.id, song]));
      const cloudMap = new Map(cloudSongs.map(song => [song.id, song]));

      // Local -> cloud for unsynced edits/new songs.
      for (const id of dirty) {
        const local = localMap.get(id);
        if (local) await cloudUpsertSong(local);
      }

      cloudSongs = await fetchCloudSongs();
      const refreshedCloudMap = new Map(cloudSongs.map(song => [song.id, song]));

      // Cloud is authoritative for records not marked dirty.
      for (const local of latestLocal) {
        if (getDirtyIds().has(local.id)) continue;
        if (!refreshedCloudMap.has(local.id)) {
          await removeSongLocalOnly(local.id);
        }
      }

      // Download cloud rows, but don't overwrite a still-dirty local row.
      for (const remote of cloudSongs) {
        if (getDirtyIds().has(remote.id)) continue;
        const current = localMap.get(remote.id);
        if (!current) {
          await putSongLocalOnly(remote);
          continue;
        }
        const localTime = new Date(current.updatedAt || 0).getTime();
        const remoteTime = new Date(remote.updatedAt || 0).getTime();
        if (remoteTime >= localTime) await putSongLocalOnly(remote);
      }

      songs = await getAllSongs();
      render();
    }

    const now = new Date().toISOString();
    localStorage.setItem(CLOUD_LAST_SYNC_KEY, now);
    updateCloudUI("synced");

    if (!silent) {
      setCloudMessage("同期が完了しました。");
    }
    return true;
  } catch (error) {
    console.error("Cloud sync failed:", error);
    updateCloudUI("error");
    setCloudMessage(`同期できませんでした：${readableCloudError(error)}`);
    return false;
  } finally {
    cloudSyncInProgress = false;
  }
}

function readableCloudError(error) {
  const raw = String(error?.message || error || "");
  try {
    const parsed = JSON.parse(raw);
    return parsed?.message || parsed?.details || parsed?.hint || raw;
  } catch {
    return raw.slice(0, 300);
  }
}

function setCloudMessage(text) {
  if (els.cloudSyncMessage) els.cloudSyncMessage.textContent = text || "";
}

function updateCloudUI(state = null) {
  const loggedIn = !!cloudAuth?.user?.id;
  els.cloudLoggedOutPanel?.classList.toggle("hidden", loggedIn);
  els.cloudLoggedInPanel?.classList.toggle("hidden", !loggedIn);

  if (loggedIn) {
    els.cloudBtnText.textContent = "同期";
    els.cloudBtn.classList.add("cloud-connected");
    els.cloudUserEmail.textContent = cloudAuth.user.email || "ログイン中";

    const last = localStorage.getItem(CLOUD_LAST_SYNC_KEY);
    els.cloudLastSync.textContent = last ? formatDateTime(last) : "まだ";
  } else {
    els.cloudBtnText.textContent = "クラウド";
    els.cloudBtn.classList.remove("cloud-connected");
  }

  if (state === "syncing") {
    els.cloudSyncState.textContent = "同期中…";
    els.cloudSyncNowBtn.disabled = true;
  } else if (state === "error") {
    els.cloudSyncState.textContent = "要確認";
    els.cloudSyncNowBtn.disabled = false;
  } else if (loggedIn) {
    const dirty = getDirtyIds().size + Object.keys(getTombstones()).length;
    els.cloudSyncState.textContent = dirty ? `未同期 ${dirty}件` : "同期済み";
    els.cloudSyncNowBtn.disabled = false;
  }
}

function openCloudDialog() {
  updateCloudUI();
  els.cloudLoginError.textContent = "";
  els.cloudDialog.showModal();
  if (!cloudAuth?.user?.id) {
    setTimeout(() => els.cloudEmailInput.focus(), 0);
  }
}

async function logoutCloud() {
  if (cloudAuth?.access_token) {
    try {
      await cloudFetch("/auth/v1/logout", { method: "POST" }, false);
    } catch {}
  }
  saveCloudAuth(null);
  localStorage.removeItem(CLOUD_INITIALIZED_KEY);
  setCloudMessage("");
}

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const database = req.result;
      if (!database.objectStoreNames.contains(STORE)) {
        const store = database.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt");
      }
    };

    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function storeRequest(mode, callback) {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, mode);
    const store = tx.objectStore(STORE);
    const result = callback(store);
    tx.oncomplete = () => resolve(result?.result);
    tx.onerror = () => reject(tx.error);
  });
}

async function getAllSongs() {
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, "readonly");
    const req = tx.objectStore(STORE).getAll();
    req.onsuccess = () => resolve(req.result || []);
    req.onerror = () => reject(req.error);
  });
}

async function putSong(song) {
  await storeRequest("readwrite", store => store.put(song));

  if (suppressCloudWrite) return;

  markDirty(song.id);
  updateCloudUI();

  if (cloudAuth?.user?.id && navigator.onLine) {
    try {
      await cloudUpsertSong(song);
      updateCloudUI();
    } catch (error) {
      console.warn("Cloud upsert pending:", error);
    }
  }
}

async function removeSong(id) {
  await storeRequest("readwrite", store => store.delete(id));

  if (suppressCloudWrite) return;

  addTombstone(id);
  clearDirty(id);
  updateCloudUI();

  if (cloudAuth?.user?.id && navigator.onLine) {
    try {
      await cloudDeleteSong(id);
      updateCloudUI();
    } catch (error) {
      console.warn("Cloud delete pending:", error);
    }
  }
}

function makeId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ").toLocaleLowerCase("ja");
}

function parseTags(value) {
  const items = Array.isArray(value)
    ? value
    : String(value ?? "").split(/[,、]/);

  const seen = new Set();
  const result = [];

  for (const item of items) {
    const tag = String(item ?? "").trim().replace(/\s+/g, " ");
    if (!tag) continue;
    const key = normalizeText(tag);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(tag);
  }

  return result;
}

function parseQuickTags(value) {
  if (Array.isArray(value)) return parseTags(value);
  return parseTags(String(value ?? "").replace(/\r?\n/g, ","));
}

function getQuickTags() {
  try {
    const saved = JSON.parse(localStorage.getItem(QUICK_TAGS_KEY) || "null");
    if (Array.isArray(saved)) return parseQuickTags(saved);
  } catch {}
  return [...DEFAULT_QUICK_TAGS];
}

function saveQuickTags(tags) {
  localStorage.setItem(QUICK_TAGS_KEY, JSON.stringify(parseQuickTags(tags)));
}

function formatKey(value) {
  if (value === "" || value === null || value === undefined) return "";
  const n = Number(value);
  if (Number.isNaN(n)) return String(value);
  if (n === 0) return "原曲";
  return n > 0 ? `+${n}` : String(n);
}

function confidenceScore(value) {
  return ({ A: 5, B: 4, C: 3, D: 2, E: 1 })[value] || 0;
}

function normalizeScoreEntries(value) {
  if (!Array.isArray(value)) return [];

  return value
    .map(item => {
      if (typeof item === "number" || typeof item === "string") {
        const score = Number(item);
        return Number.isFinite(score) && score >= 0 && score <= 100
          ? { score, recordedAt: null }
          : null;
      }

      const score = Number(item?.score);
      if (!Number.isFinite(score) || score < 0 || score > 100) return null;

      return {
        score,
        recordedAt: item?.recordedAt || null
      };
    })
    .filter(Boolean);
}

function damScoresOf(song) {
  return normalizeScoreEntries(song?.damScores);
}

function joysoundScoresOf(song) {
  return normalizeScoreEntries(song?.joysoundScores);
}

function playCountOf(song) {
  return damScoresOf(song).length + joysoundScoresOf(song).length;
}

function latestScoreDate(song) {
  const dates = [...damScoresOf(song), ...joysoundScoresOf(song)]
    .map(entry => entry.recordedAt)
    .filter(Boolean)
    .sort();
  return dates.length ? dates[dates.length - 1] : null;
}

function allScoreEvents() {
  const events = [];

  for (const song of songs) {
    for (const entry of damScoresOf(song)) {
      if (!entry.recordedAt) continue;
      events.push({
        songId: song.id,
        title: song.title,
        artist: song.artist,
        service: "DAM",
        score: entry.score,
        recordedAt: entry.recordedAt
      });
    }

    for (const entry of joysoundScoresOf(song)) {
      if (!entry.recordedAt) continue;
      events.push({
        songId: song.id,
        title: song.title,
        artist: song.artist,
        service: "JOYSOUND",
        score: entry.score,
        recordedAt: entry.recordedAt
      });
    }
  }

  return events.sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
}

function buildSessions() {
  const events = allScoreEvents();
  const sessions = [];

  for (const event of events) {
    const eventTime = new Date(event.recordedAt).getTime();
    if (!Number.isFinite(eventTime)) continue;

    let session = sessions[sessions.length - 1];

    if (!session) {
      session = {
        id: `session-1`,
        index: 1,
        startAt: event.recordedAt,
        endAt: event.recordedAt,
        events: []
      };
      sessions.push(session);
    } else {
      const startTime = new Date(session.startAt).getTime();
      const within12Hours = eventTime - startTime <= SESSION_HOURS * 60 * 60 * 1000;

      if (!within12Hours) {
        session = {
          id: `session-${sessions.length + 1}`,
          index: sessions.length + 1,
          startAt: event.recordedAt,
          endAt: event.recordedAt,
          events: []
        };
        sessions.push(session);
      }
    }

    session.events.push(event);
    session.endAt = event.recordedAt;
  }

  return sessions;
}

function sessionIndexesForSong(songId) {
  const sessions = buildSessions();
  const indexes = [];

  for (const session of sessions) {
    if (session.events.some(event => event.songId === songId)) {
      indexes.push(session.index);
    }
  }

  return indexes;
}

function missedSessionsForSong(song) {
  const sessions = buildSessions();
  if (!sessions.length) return 0;

  const indexes = sessionIndexesForSong(song.id);
  if (!indexes.length) return sessions.length;

  const lastSungIndex = Math.max(...indexes);
  return sessions.length - lastSungIndex;
}

function hasEverSung(song) {
  return playCountOf(song) > 0;
}

function missedLabel(song) {
  const missed = missedSessionsForSong(song);
  if (!hasEverSung(song)) {
    return buildSessions().length ? `未歌唱 ${missed}回` : "未歌唱";
  }
  return missed > 0 ? `${missed}回未歌唱` : "";
}

function serviceBestBefore(entries) {
  const values = normalizeScoreEntries(entries).map(entry => Number(entry.score)).filter(Number.isFinite);
  return values.length ? Math.max(...values) : null;
}

function formatDateTime(iso) {
  if (!iso) return "なし";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "なし";
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(d);
}

function formatScore(score) {
  const n = Number(score);
  if (!Number.isFinite(n)) return "";
  return n.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

function scoreStats(entries) {
  const values = normalizeScoreEntries(entries).map(entry => Number(entry.score)).filter(Number.isFinite);
  if (!values.length) return { count: 0, average: null, best: null };
  return {
    count: values.length,
    average: values.reduce((sum, value) => sum + value, 0) / values.length,
    best: Math.max(...values)
  };
}

function formatStatScore(value) {
  return Number.isFinite(value) ? `${formatScore(value)}点` : "—";
}


function applyTheme(theme) {
  const allowed = ["system", "light", "dark"];
  const next = allowed.includes(theme) ? theme : "system";
  document.documentElement.dataset.theme = next;
  els.themeSelect.value = next;
  localStorage.setItem(THEME_KEY, next);
}

function refreshAutocomplete() {
  const titles = [...new Set(songs.map(song => String(song.title || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ja"));
  const artists = [...new Set(songs.map(song => String(song.artist || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ja"));

  els.titleSuggestions.innerHTML = "";
  for (const title of titles) {
    const option = document.createElement("option");
    option.value = title;
    els.titleSuggestions.append(option);
  }

  els.artistSuggestions.innerHTML = "";
  for (const artist of artists) {
    const option = document.createElement("option");
    option.value = artist;
    els.artistSuggestions.append(option);
  }
}

function csvEscape(value) {
  const text = String(value ?? "");
  if (/[",\r\n]/.test(text)) return `"${text.replace(/"/g, '""')}"`;
  return text;
}

function parseCSV(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (quoted) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cell += '"';
          i++;
        } else {
          quoted = false;
        }
      } else {
        cell += ch;
      }
      continue;
    }

    if (ch === '"') {
      quoted = true;
    } else if (ch === ",") {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell.length || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }

  return rows.filter(row => row.some(cell => String(cell).length));
}

function safeJsonArray(value) {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return normalizeScoreEntries(parsed);
  } catch {
    return [];
  }
}

function scoreEntryFromInput(input) {
  const raw = input.value.trim();
  if (!raw) return null;
  const score = Number(raw);

  if (!Number.isFinite(score) || score < 0 || score > 100) {
    alert("点数は0〜100の範囲で入力してください。");
    return null;
  }

  return {
    score: Math.round(score * 1000) / 1000,
    recordedAt: new Date().toISOString()
  };
}

function renderScoreHistory() {
  const renderList = (target, entries, service) => {
    target.innerHTML = "";

    if (!entries.length) {
      const empty = document.createElement("span");
      empty.className = "score-empty";
      empty.textContent = "点数未登録";
      target.append(empty);
      return;
    }

    entries.forEach((entry, index) => {
      const row = document.createElement("div");
      row.className = "score-history-row";

      const main = document.createElement("div");
      main.className = "score-history-main";

      const score = document.createElement("strong");
      score.textContent = `${formatScore(entry.score)}点`;

      const date = document.createElement("span");
      date.textContent = entry.recordedAt ? formatDateTime(entry.recordedAt) : "登録日時なし";

      main.append(score, date);

      const del = document.createElement("button");
      del.type = "button";
      del.className = "score-delete-btn";
      del.textContent = "削除";
      del.addEventListener("click", () => {
        if (service === "dam") pendingDamScores.splice(index, 1);
        else pendingJoysoundScores.splice(index, 1);
        renderScoreHistory();
      });

      row.append(main, del);
      target.append(row);
    });
  };

  renderList(els.damScoreList, pendingDamScores, "dam");
  renderList(els.joysoundScoreList, pendingJoysoundScores, "joysound");

  els.damScoreCount.textContent = `${pendingDamScores.length}件`;
  els.joysoundScoreCount.textContent = `${pendingJoysoundScores.length}件`;

  const total = pendingDamScores.length + pendingJoysoundScores.length;
  const latestDates = [...pendingDamScores, ...pendingJoysoundScores]
    .map(entry => entry.recordedAt)
    .filter(Boolean)
    .sort();

  els.playCountText.textContent = `歌唱 ${total}回`;
  els.lastSungText.textContent = `最終歌唱：${formatDateTime(latestDates.length ? latestDates[latestDates.length - 1] : null)}`;
}

function duplicateKey(song) {
  return [
    normalizeText(song.title),
    normalizeText(song.artist),
    song.key === "" || song.key === null || song.key === undefined ? "" : String(song.key),
  ].join("||");
}

function refreshFilters() {
  refreshAutocomplete();
  const selectedArtist = els.artistFilterSelect.value;
  const selectedTag = els.tagFilterSelect.value;

  const artists = [...new Set(songs.map(song => String(song.artist || "").trim()).filter(Boolean))]
    .sort((a, b) => a.localeCompare(b, "ja"));

  els.artistFilterSelect.innerHTML = '<option value="">すべてのアーティスト</option>';
  for (const artist of artists) {
    const option = document.createElement("option");
    option.value = artist;
    option.textContent = artist;
    els.artistFilterSelect.append(option);
  }
  if (artists.includes(selectedArtist)) els.artistFilterSelect.value = selectedArtist;

  const tags = [...new Set(songs.flatMap(song => parseTags(song.tags)))]
    .sort((a, b) => a.localeCompare(b, "ja"));

  els.tagFilterSelect.innerHTML = '<option value="">すべてのタグ</option>';
  for (const tag of tags) {
    const option = document.createElement("option");
    option.value = tag;
    option.textContent = tag;
    els.tagFilterSelect.append(option);
  }
  if (tags.includes(selectedTag)) els.tagFilterSelect.value = selectedTag;
}

function getVisibleSongs() {
  const q = normalizeText(els.searchInput.value);
  const artistFilter = els.artistFilterSelect.value;
  const tagFilter = els.tagFilterSelect.value;
  const recentFilter = els.recentFilterSelect.value;

  let result = songs.filter(song => {
    if (currentFilter === "favorite" && !song.favorite) return false;
    if (currentFilter === "staple" && !song.staple) return false;
    if (currentFilter === "practice" && !song.practice) return false;
    if (currentFilter === "hasKey" && (song.key === "" || song.key === null || song.key === undefined)) return false;
    if (currentFilter === "noKey" && !(song.key === "" || song.key === null || song.key === undefined)) return false;

    if (artistFilter && normalizeText(song.artist) !== normalizeText(artistFilter)) return false;

    const songTags = parseTags(song.tags);
    if (tagFilter && !songTags.some(tag => normalizeText(tag) === normalizeText(tagFilter))) return false;

    if (recentFilter === "never" && hasEverSung(song)) return false;
    if (["1", "2", "3", "5", "10"].includes(recentFilter)) {
      const threshold = Number(recentFilter);
      if (missedSessionsForSong(song) < threshold) return false;
    }

    if (!q) return true;

    return [
      song.title,
      song.artist,
      song.memo,
      songTags.join(" "),
      formatKey(song.key),
      song.confidence,
      `歌唱${playCountOf(song)}回`,
    ].some(value => normalizeText(value).includes(q));
  });

  const primarySort = els.sortSelect.value;
  const secondarySort = els.sortSelect2.value;

  const compareBy = (sort, a, b) => {
    if (!sort) return 0;

    if (sort === "createdAsc") {
      return (a.createdAt || "").localeCompare(b.createdAt || "");
    }

    if (sort === "createdDesc") {
      return (b.createdAt || "").localeCompare(a.createdAt || "");
    }

    if (sort === "favoriteFirst") {
      return Number(!!b.favorite) - Number(!!a.favorite);
    }

    if (sort === "title") {
      return a.title.localeCompare(b.title, "ja");
    }

    if (sort === "artist") {
      return a.artist.localeCompare(b.artist, "ja");
    }

    if (sort === "confidence") {
      return confidenceScore(b.confidence) - confidenceScore(a.confidence);
    }

    if (sort === "keyDesc") {
      const aKey = a.key === "" || a.key === null || a.key === undefined ? -999 : Number(a.key);
      const bKey = b.key === "" || b.key === null || b.key === undefined ? -999 : Number(b.key);
      return bKey - aKey;
    }

    if (sort === "playCountDesc") {
      return playCountOf(b) - playCountOf(a);
    }

    if (sort === "lastSungDesc") {
      return (latestScoreDate(b) || "").localeCompare(latestScoreDate(a) || "");
    }

    if (sort === "missedSessionsDesc") {
      return missedSessionsForSong(b) - missedSessionsForSong(a);
    }

    return 0;
  };

  result.sort((a, b) => {
    const first = compareBy(primarySort, a, b);
    if (first !== 0) return first;

    const second = compareBy(secondarySort, a, b);
    if (second !== 0) return second;

    // 完全同順位のときだけ、表示を安定させるため曲名→アーティストで固定。
    return a.title.localeCompare(b.title, "ja")
      || a.artist.localeCompare(b.artist, "ja");
  });

  return result;
}

function render() {
  refreshFilters();
  const visible = getVisibleSongs();

  els.songCount.textContent = songs.length.toLocaleString("ja-JP");
  els.songList.innerHTML = "";

  if (!visible.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state";
    empty.textContent = songs.length
      ? "条件に合う曲がありません。"
      : "まだ曲がありません。「＋ 曲を追加」または「連続追加」から登録できます。";
    els.songList.append(empty);
    return;
  }

  for (const song of visible) {
    const node = els.template.content.firstElementChild.cloneNode(true);
    node.dataset.id = song.id;

    const fav = node.querySelector(".favorite-btn");
    fav.textContent = song.favorite ? "★" : "☆";
    fav.addEventListener("click", async event => {
      event.stopPropagation();
      song.favorite = !song.favorite;
      song.updatedAt = new Date().toISOString();
      await putSong(song);
      render();
    });

    node.querySelector(".song-title").textContent = song.title;
    node.querySelector(".song-artist").textContent = song.artist;
    node.querySelector(".key-badge").textContent = formatKey(song.key);

    node.querySelector(".confidence-badge").textContent =
      song.key !== "" && song.key !== null && song.key !== undefined && song.confidence
        ? `自信 ${song.confidence}`
        : "";

    node.querySelector(".play-count-badge").textContent = `歌唱 ${playCountOf(song)}回`;
    node.querySelector(".missed-badge").textContent = missedLabel(song);
    node.querySelector(".memo-preview").textContent = song.memo || "";

    const tagRow = node.querySelector(".tag-row");
    for (const tag of parseTags(song.tags)) {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.textContent = tag;
      chip.title = `タグ「${tag}」で絞り込み`;
      chip.addEventListener("click", event => {
        event.stopPropagation();
        els.tagFilterSelect.value = tag;
        render();
      });
      tagRow.append(chip);
    }

    node.querySelector(".song-main").addEventListener("click", () => openSongDetail(song.id));

    els.songList.append(node);
  }
}

let detailSongId = null;

function renderDetailHistory(target, entries) {
  target.innerHTML = "";
  const normalized = normalizeScoreEntries(entries)
    .slice()
    .sort((a, b) => (b.recordedAt || "").localeCompare(a.recordedAt || ""));

  if (!normalized.length) {
    const empty = document.createElement("span");
    empty.className = "detail-history-empty";
    empty.textContent = "点数履歴なし";
    target.append(empty);
    return;
  }

  for (const entry of normalized) {
    const row = document.createElement("div");
    row.className = "detail-history-row";

    const score = document.createElement("strong");
    score.textContent = `${formatScore(entry.score)}点`;

    const date = document.createElement("span");
    date.textContent = entry.recordedAt ? formatDateTime(entry.recordedAt) : "日時なし";

    row.append(score, date);
    target.append(row);
  }
}

function openSongDetail(id) {
  const song = songs.find(item => item.id === id);
  if (!song) return;

  detailSongId = id;
  els.detailTitle.textContent = song.title;
  els.detailArtist.textContent = song.artist;
  els.detailBadges.innerHTML = "";
  els.detailTags.innerHTML = "";

  if (formatKey(song.key)) {
    const badge = document.createElement("span");
    badge.className = "key-badge";
    badge.textContent = formatKey(song.key);
    els.detailBadges.append(badge);
  }

  if (song.confidence && song.key !== "") {
    const badge = document.createElement("span");
    badge.className = "confidence-badge";
    badge.textContent = `自信 ${song.confidence}`;
    els.detailBadges.append(badge);
  }

  if (song.favorite) {
    const badge = document.createElement("span");
    badge.className = "detail-favorite-badge";
    badge.textContent = "★ お気に入り";
    els.detailBadges.append(badge);
  }

  if (song.staple) {
    const badge = document.createElement("span");
    badge.className = "detail-status-badge";
    badge.textContent = "定番曲";
    els.detailBadges.append(badge);
  }

  if (song.practice) {
    const badge = document.createElement("span");
    badge.className = "detail-status-badge";
    badge.textContent = "練習中";
    els.detailBadges.append(badge);
  }

  const missed = missedSessionsForSong(song);
  if (missed > 0 || !hasEverSung(song)) {
    const badge = document.createElement("span");
    badge.className = "detail-status-badge";
    badge.textContent = hasEverSung(song) ? `${missed}回のカラオケで未歌唱` : `まだ一度も歌っていない`;
    els.detailBadges.append(badge);
  }

  for (const tag of parseTags(song.tags)) {
    const chip = document.createElement("span");
    chip.className = "tag-chip";
    chip.textContent = tag;
    els.detailTags.append(chip);
  }

  const dam = scoreStats(damScoresOf(song));
  const joy = scoreStats(joysoundScoresOf(song));

  els.detailPlayCount.textContent = `${playCountOf(song)}回`;
  els.detailLastSung.textContent = formatDateTime(latestScoreDate(song));
  els.detailDamCount.textContent = `${dam.count}回`;
  els.detailDamAvg.textContent = formatStatScore(dam.average);
  els.detailDamBest.textContent = formatStatScore(dam.best);
  els.detailJoyCount.textContent = `${joy.count}回`;
  els.detailJoyAvg.textContent = formatStatScore(joy.average);
  els.detailJoyBest.textContent = formatStatScore(joy.best);
  els.detailMemo.textContent = song.memo || "メモなし";

  renderDetailHistory(els.detailDamHistory, damScoresOf(song));
  renderDetailHistory(els.detailJoyHistory, joysoundScoresOf(song));

  els.songDetailDialog.showModal();
}

function sessionTitle(session) {
  const start = new Date(session.startAt);
  const end = new Date(session.endAt);

  if (Number.isNaN(start.getTime())) return `カラオケ ${session.index}`;

  const sameDay =
    start.getFullYear() === end.getFullYear() &&
    start.getMonth() === end.getMonth() &&
    start.getDate() === end.getDate();

  const startText = new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(start);

  const endText = new Intl.DateTimeFormat("ja-JP", sameDay ? {
    hour: "2-digit",
    minute: "2-digit"
  } : {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(end);

  return `${startText} 〜 ${endText}`;
}

function openSessionHistory() {
  const sessions = buildSessions().slice().reverse();
  els.sessionHistoryList.innerHTML = "";

  if (!sessions.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact";
    empty.textContent = "まだ点数履歴がないため、カラオケセッションもありません。";
    els.sessionHistoryList.append(empty);
    els.sessionHistoryDialog.showModal();
    return;
  }

  for (const session of sessions) {
    const section = document.createElement("section");
    section.className = "session-item";

    const head = document.createElement("div");
    head.className = "session-item-head";

    const titleWrap = document.createElement("div");
    const num = document.createElement("strong");
    num.textContent = `カラオケ #${session.index}`;
    const time = document.createElement("span");
    time.textContent = sessionTitle(session);
    titleWrap.append(num, time);

    const uniqueSongs = new Set(session.events.map(event => event.songId)).size;
    const counts = document.createElement("span");
    counts.className = "session-counts";
    counts.textContent = `${uniqueSongs}曲 / ${session.events.length}採点`;

    head.append(titleWrap, counts);
    section.append(head);

    const songGroups = new Map();
    for (const event of session.events) {
      if (!songGroups.has(event.songId)) {
        songGroups.set(event.songId, {
          songId: event.songId,
          title: event.title,
          artist: event.artist,
          events: []
        });
      }
      songGroups.get(event.songId).events.push(event);
    }

    const body = document.createElement("div");
    body.className = "session-song-list";

    for (const group of songGroups.values()) {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "session-song-row";
      row.addEventListener("click", () => {
        els.sessionHistoryDialog.close();
        openSongDetail(group.songId);
      });

      const text = document.createElement("div");
      text.className = "session-song-main";
      const songTitle = document.createElement("strong");
      songTitle.textContent = group.title;
      const artist = document.createElement("span");
      artist.textContent = group.artist;
      text.append(songTitle, artist);

      const scores = document.createElement("div");
      scores.className = "session-score-list";
      for (const event of group.events) {
        const badge = document.createElement("span");
        badge.className = "session-score-badge";
        badge.textContent = `${event.service} ${formatScore(event.score)}`;
        scores.append(badge);
      }

      row.append(text, scores);
      body.append(row);
    }

    section.append(body);
    els.sessionHistoryList.append(section);
  }

  els.sessionHistoryDialog.showModal();
}

function openStatistics() {
  const allDam = songs.flatMap(song => damScoresOf(song));
  const allJoy = songs.flatMap(song => joysoundScoresOf(song));
  const dam = scoreStats(allDam);
  const joy = scoreStats(allJoy);
  const totalPlays = songs.reduce((sum, song) => sum + playCountOf(song), 0);
  const favorites = songs.filter(song => song.favorite).length;
  const never = songs.filter(song => playCountOf(song) === 0).length;
  const sessionCount = buildSessions().length;
  const stapleCount = songs.filter(song => song.staple).length;
  const practiceCount = songs.filter(song => song.practice).length;

  const overview = [
    ["登録曲", `${songs.length}曲`],
    ["カラオケ回数", `${sessionCount}回`],
    ["総歌唱回数", `${totalPlays}回`],
    ["未採点", `${never}曲`],
    ["お気に入り", `${favorites}曲`],
    ["定番曲", `${stapleCount}曲`],
    ["練習中", `${practiceCount}曲`]
  ];

  els.statsOverview.innerHTML = "";
  for (const [label, value] of overview) {
    const tile = document.createElement("div");
    tile.className = "stat-tile";
    const labelEl = document.createElement("span");
    labelEl.textContent = label;
    const valueEl = document.createElement("strong");
    valueEl.textContent = value;
    tile.append(labelEl, valueEl);
    els.statsOverview.append(tile);
  }

  const renderService = (target, stats) => {
    target.innerHTML = "";
    const items = [
      ["採点回数", `${stats.count}回`],
      ["平均点", formatStatScore(stats.average)],
      ["最高点", formatStatScore(stats.best)]
    ];
    for (const [label, value] of items) {
      const row = document.createElement("div");
      row.className = "stats-service-row";
      const l = document.createElement("span");
      l.textContent = label;
      const v = document.createElement("strong");
      v.textContent = value;
      row.append(l, v);
      target.append(row);
    }
  };

  renderService(els.statsDam, dam);
  renderService(els.statsJoy, joy);

  const top = songs
    .filter(song => playCountOf(song) > 0)
    .slice()
    .sort((a, b) => playCountOf(b) - playCountOf(a) || a.title.localeCompare(b.title, "ja"))
    .slice(0, 10);

  els.statsTopSongs.innerHTML = "";
  if (!top.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact";
    empty.textContent = "まだ点数履歴がありません。";
    els.statsTopSongs.append(empty);
  } else {
    top.forEach((song, index) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "ranking-row";
      row.addEventListener("click", () => {
        els.statsDialog.close();
        openSongDetail(song.id);
      });

      const rank = document.createElement("span");
      rank.className = "ranking-number";
      rank.textContent = String(index + 1);

      const text = document.createElement("div");
      text.className = "ranking-main";
      const title = document.createElement("strong");
      title.textContent = song.title;
      const artist = document.createElement("span");
      artist.textContent = song.artist;
      text.append(title, artist);

      const count = document.createElement("strong");
      count.className = "ranking-count";
      count.textContent = `${playCountOf(song)}回`;

      row.append(rank, text, count);
      els.statsTopSongs.append(row);
    });
  }

  els.statsDialog.showModal();
}

function syncConfidenceAvailability() {
  const hasKey = els.keyInput.value !== "";
  els.confidenceInput.disabled = !hasKey;
  if (!hasKey) els.confidenceInput.value = "";
}

function renderQuickTagButtons() {
  const selected = new Set(parseTags(els.tagsInput.value).map(normalizeText));
  const quickTags = getQuickTags();

  els.quickTagButtons.innerHTML = "";

  if (!quickTags.length) {
    const empty = document.createElement("span");
    empty.className = "quick-tag-empty";
    empty.textContent = "よく使うタグが未登録です。";
    els.quickTagButtons.append(empty);
    return;
  }

  for (const tag of quickTags) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "quick-tag-btn";
    button.textContent = tag;
    button.classList.toggle("selected", selected.has(normalizeText(tag)));

    button.addEventListener("click", () => {
      const current = parseTags(els.tagsInput.value);
      const key = normalizeText(tag);
      const exists = current.some(item => normalizeText(item) === key);
      const next = exists
        ? current.filter(item => normalizeText(item) !== key)
        : [...current, tag];

      els.tagsInput.value = next.join(", ");
      renderQuickTagButtons();
    });

    els.quickTagButtons.append(button);
  }
}

function setFormMode(mode) {
  formMode = mode;
  const isEdit = mode === "edit";
  const isContinuous = mode === "continuous";

  els.deleteSongBtn.classList.toggle("hidden", !isEdit);
  els.duplicateSongBtn.classList.toggle("hidden", !isEdit);
  els.songStats.classList.remove("hidden");
  els.continuousKeepArtistRow.classList.toggle("hidden", !isContinuous);

  if (mode === "edit") {
    els.dialogTitle.textContent = "曲を編集";
    els.saveSongBtn.textContent = "保存";
  } else if (mode === "continuous") {
    els.dialogTitle.textContent = "連続追加";
    els.saveSongBtn.textContent = "保存して次へ";
  } else if (mode === "duplicate") {
    els.dialogTitle.textContent = "曲を複製";
    els.saveSongBtn.textContent = "複製して保存";
  } else {
    els.dialogTitle.textContent = "曲を追加";
    els.saveSongBtn.textContent = "保存";
  }
}

function clearSongForm({ keepArtist = false } = {}) {
  const artist = keepArtist ? els.artistInput.value : "";
  els.songForm.reset();
  els.songId.value = "";
  els.artistInput.value = artist;
  els.tagsInput.value = "";
  pendingDamScores = [];
  pendingJoysoundScores = [];
  els.formError.textContent = "";
  els.formError.classList.remove("best-message");
  syncConfidenceAvailability();
  renderQuickTagButtons();
  renderScoreHistory();
}

function openAddDialog() {
  setFormMode("add");
  clearSongForm();
  els.songDialog.showModal();
  setTimeout(() => els.titleInput.focus(), 0);
}

function openContinuousAddDialog() {
  setFormMode("continuous");
  clearSongForm();
  els.keepArtistInput.checked = false;
  els.songDialog.showModal();
  setTimeout(() => els.titleInput.focus(), 0);
}

function openEditDialog(id) {
  const song = songs.find(s => s.id === id);
  if (!song) return;

  setFormMode("edit");
  els.songId.value = song.id;
  els.titleInput.value = song.title;
  els.artistInput.value = song.artist;
  els.keyInput.value = song.key === null || song.key === undefined ? "" : String(song.key);
  els.confidenceInput.value = song.confidence || "";
  els.favoriteInput.checked = !!song.favorite;
  els.stapleInput.checked = !!song.staple;
  els.practiceInput.checked = !!song.practice;
  els.tagsInput.value = parseTags(song.tags).join(", ");
  els.memoInput.value = song.memo || "";
  pendingDamScores = damScoresOf(song);
  pendingJoysoundScores = joysoundScoresOf(song);
  renderScoreHistory();
  els.formError.textContent = "";
  els.formError.classList.remove("best-message");
  syncConfidenceAvailability();
  renderQuickTagButtons();
  els.songDialog.showModal();
}

function duplicateCurrentSong() {
  const source = songs.find(s => s.id === els.songId.value);
  if (!source) return;

  setFormMode("duplicate");
  els.songId.value = "";
  els.titleInput.value = source.title;
  els.artistInput.value = source.artist;
  els.keyInput.value = source.key === null || source.key === undefined ? "" : String(source.key);
  els.confidenceInput.value = source.confidence || "";
  els.favoriteInput.checked = !!source.favorite;
  els.stapleInput.checked = !!source.staple;
  els.practiceInput.checked = !!source.practice;
  els.tagsInput.value = parseTags(source.tags).join(", ");
  els.memoInput.value = source.memo || "";
  pendingDamScores = [];
  pendingJoysoundScores = [];
  els.formError.textContent = "キーなどを変更して保存してください。点数履歴は複製されません。";
  syncConfidenceAvailability();
  renderQuickTagButtons();
  renderScoreHistory();
}

async function saveForm() {
  const now = new Date().toISOString();
  const id = els.songId.value || makeId();
  const existing = songs.find(s => s.id === id);

  const song = {
    id,
    title: els.titleInput.value.trim(),
    artist: els.artistInput.value.trim(),
    key: els.keyInput.value === "" ? "" : Number(els.keyInput.value),
    confidence: els.keyInput.value === "" ? "" : els.confidenceInput.value,
    favorite: els.favoriteInput.checked,
    staple: els.stapleInput.checked,
    practice: els.practiceInput.checked,
    tags: parseTags(els.tagsInput.value),
    memo: els.memoInput.value.trim(),
    damScores: normalizeScoreEntries(pendingDamScores),
    joysoundScores: normalizeScoreEntries(pendingJoysoundScores),
    createdAt: existing?.createdAt || now,
    updatedAt: now,
  };

  if (!song.title || !song.artist) {
    els.formError.textContent = "曲名とアーティスト名を入力してください。";
    return;
  }

  const targetDuplicateKey = duplicateKey(song);
  const duplicate = songs.find(s => s.id !== id && duplicateKey(s) === targetDuplicateKey);
  if (duplicate) {
    els.formError.textContent = "同じ「曲名＋アーティスト＋キー」の曲がすでに登録されています。";
    return;
  }

  await putSong(song);
  songs = await getAllSongs();

  if (formMode === "continuous") {
    const keepArtist = els.keepArtistInput.checked;
    const artist = keepArtist ? song.artist : "";
    clearSongForm();
    els.artistInput.value = artist;
    els.keepArtistInput.checked = keepArtist;
    setFormMode("continuous");
    render();
    setTimeout(() => els.titleInput.focus(), 0);
    return;
  }

  els.songDialog.close();
  render();
}

async function deleteCurrentSong() {
  const id = els.songId.value;
  if (!id) return;
  const song = songs.find(s => s.id === id);
  if (!song) return;

  if (!confirm(`「${song.title}」を削除しますか？`)) return;

  await removeSong(id);
  songs = await getAllSongs();
  els.songDialog.close();
  render();
}

function chooseRandom() {
  const pool = getVisibleSongs();
  if (!pool.length) {
    alert("現在の条件に合う曲がありません。");
    return;
  }

  const song = pool[Math.floor(Math.random() * pool.length)];
  els.randomTitle.textContent = song.title;
  els.randomArtist.textContent = song.artist;
  els.randomMeta.innerHTML = "";

  if (formatKey(song.key)) {
    const key = document.createElement("span");
    key.className = "key-badge";
    key.textContent = formatKey(song.key);
    els.randomMeta.append(key);
  }

  if (song.confidence && song.key !== "") {
    const confidence = document.createElement("span");
    confidence.className = "confidence-badge";
    confidence.textContent = `自信 ${song.confidence}`;
    els.randomMeta.append(confidence);
  }

  const count = document.createElement("span");
  count.className = "play-count-badge";
  count.textContent = `歌唱 ${playCountOf(song)}回`;
  els.randomMeta.append(count);

  if (!els.randomDialog.open) els.randomDialog.showModal();
}

function openQuickTagDialog() {
  els.quickTagsInput.value = getQuickTags().join("\n");
  els.quickTagDialog.showModal();
}

function closeQuickTagDialog() {
  els.quickTagDialog.close();
}

function getTagUsage() {
  const map = new Map();

  for (const song of songs) {
    for (const tag of parseTags(song.tags)) {
      const key = normalizeText(tag);
      const entry = map.get(key) || { name: tag, count: 0 };
      entry.count++;
      map.set(key, entry);
    }
  }

  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, "ja"));
}

function openTagManager() {
  renderTagManager();
  els.tagManagerDialog.showModal();
}

function renderTagManager() {
  const usage = getTagUsage();
  els.tagManagerList.innerHTML = "";

  if (!usage.length) {
    const empty = document.createElement("div");
    empty.className = "empty-state compact";
    empty.textContent = "まだタグが使われていません。";
    els.tagManagerList.append(empty);
    return;
  }

  for (const entry of usage) {
    const row = document.createElement("div");
    row.className = "tag-manager-row";

    const info = document.createElement("div");
    info.className = "tag-manager-info";

    const name = document.createElement("strong");
    name.textContent = entry.name;

    const count = document.createElement("span");
    count.textContent = `${entry.count}曲`;

    info.append(name, count);

    const actions = document.createElement("div");
    actions.className = "tag-manager-actions";

    const renameBtn = document.createElement("button");
    renameBtn.type = "button";
    renameBtn.className = "ghost-btn small-btn";
    renameBtn.textContent = "名前変更";
    renameBtn.addEventListener("click", () => renameTag(entry.name));

    const deleteBtn = document.createElement("button");
    deleteBtn.type = "button";
    deleteBtn.className = "danger-btn small-btn";
    deleteBtn.textContent = "削除";
    deleteBtn.addEventListener("click", () => deleteTag(entry.name));

    actions.append(renameBtn, deleteBtn);
    row.append(info, actions);
    els.tagManagerList.append(row);
  }
}

async function renameTag(oldName) {
  const nextRaw = prompt(`「${oldName}」の新しいタグ名を入力してください。`, oldName);
  if (nextRaw === null) return;

  const nextName = String(nextRaw).trim().replace(/\s+/g, " ");
  if (!nextName) {
    alert("タグ名を空にはできません。");
    return;
  }

  const oldKey = normalizeText(oldName);
  const nextKey = normalizeText(nextName);

  for (const song of songs) {
    const original = parseTags(song.tags);
    if (!original.some(tag => normalizeText(tag) === oldKey)) continue;

    const replaced = original.map(tag => normalizeText(tag) === oldKey ? nextName : tag);
    song.tags = parseTags(replaced);
    song.updatedAt = new Date().toISOString();
    await putSong(song);
  }

  const quick = getQuickTags();
  if (quick.some(tag => normalizeText(tag) === oldKey)) {
    const replacedQuick = quick.map(tag => normalizeText(tag) === oldKey ? nextName : tag);
    saveQuickTags(replacedQuick);
  }

  songs = await getAllSongs();
  render();
  renderTagManager();
  renderQuickTagButtons();

  if (oldKey !== nextKey) {
    els.tagFilterSelect.value = "";
  }
}

async function deleteTag(tagName) {
  const count = getTagUsage().find(entry => normalizeText(entry.name) === normalizeText(tagName))?.count || 0;
  if (!confirm(`タグ「${tagName}」を${count}曲から削除しますか？\n曲そのものは削除されません。`)) return;

  const target = normalizeText(tagName);

  for (const song of songs) {
    const original = parseTags(song.tags);
    const next = original.filter(tag => normalizeText(tag) !== target);
    if (next.length === original.length) continue;

    song.tags = next;
    song.updatedAt = new Date().toISOString();
    await putSong(song);
  }

  const quick = getQuickTags().filter(tag => normalizeText(tag) !== target);
  saveQuickTags(quick);

  songs = await getAllSongs();
  els.tagFilterSelect.value = "";
  render();
  renderTagManager();
  renderQuickTagButtons();
}

function exportJSON() {
  const data = {
    app: "Karaoke Manager",
    version: 12,
    exportedAt: new Date().toISOString(),
    songs,
    settings: {
      quickTags: getQuickTags(),
      theme: localStorage.getItem(THEME_KEY) || "system"
    }
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  a.href = url;
  a.download = `karaoke-backup-${date}.json`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importJSON(file) {
  try {
    const raw = await file.text();
    const parsed = JSON.parse(raw);
    const incoming = Array.isArray(parsed) ? parsed : parsed.songs;

    if (!Array.isArray(incoming)) throw new Error("songs array not found");
    if (!confirm(`${incoming.length}件のデータを現在の曲一覧に統合しますか？`)) return;

    const currentById = new Map(songs.map(s => [s.id, s]));
    const duplicateKeys = new Set(songs.map(duplicateKey));
    let added = 0, updated = 0, skipped = 0;

    for (const rawSong of incoming) {
      if (!rawSong || !String(rawSong.title || "").trim() || !String(rawSong.artist || "").trim()) {
        skipped++;
        continue;
      }

      const song = {
        id: rawSong.id || makeId(),
        title: String(rawSong.title).trim(),
        artist: String(rawSong.artist).trim(),
        key: rawSong.key === "" || rawSong.key === null || rawSong.key === undefined ? "" : Number(rawSong.key),
        confidence: rawSong.key === "" || rawSong.key === null || rawSong.key === undefined ? "" : String(rawSong.confidence || ""),
        favorite: !!rawSong.favorite,
        staple: !!rawSong.staple,
        practice: !!rawSong.practice,
        tags: parseTags(rawSong.tags),
        memo: String(rawSong.memo || ""),
        damScores: normalizeScoreEntries(rawSong.damScores),
        joysoundScores: normalizeScoreEntries(rawSong.joysoundScores),
        createdAt: rawSong.createdAt || new Date().toISOString(),
        updatedAt: rawSong.updatedAt || new Date().toISOString(),
      };

      const sameId = currentById.get(song.id);
      if (sameId) {
        await putSong(song);
        currentById.set(song.id, song);
        duplicateKeys.add(duplicateKey(song));
        updated++;
        continue;
      }

      const dKey = duplicateKey(song);
      if (duplicateKeys.has(dKey)) {
        skipped++;
        continue;
      }

      await putSong(song);
      currentById.set(song.id, song);
      duplicateKeys.add(dKey);
      added++;
    }

    if (parsed?.settings?.quickTags && Array.isArray(parsed.settings.quickTags)) {
      saveQuickTags(parsed.settings.quickTags);
    }
    if (parsed?.settings?.theme) {
      applyTheme(parsed.settings.theme);
    }

    songs = await getAllSongs();
    render();
    renderQuickTagButtons();
    alert(`読み込み完了\n追加: ${added}件\n更新: ${updated}件\n重複などでスキップ: ${skipped}件`);
  } catch (error) {
    console.error(error);
    alert("JSONを読み込めませんでした。バックアップファイルを確認してください。");
  } finally {
    els.importInput.value = "";
  }
}


function exportCSV() {
  const headers = [
    "id","title","artist","key","confidence","favorite","staple","practice","tags","memo",
    "dam_scores","joysound_scores","created_at","updated_at"
  ];

  const rows = songs.map(song => [
    song.id,
    song.title,
    song.artist,
    song.key === "" || song.key === null || song.key === undefined ? "" : song.key,
    song.confidence || "",
    song.favorite ? "1" : "0",
    song.staple ? "1" : "0",
    song.practice ? "1" : "0",
    parseTags(song.tags).join(" | "),
    song.memo || "",
    JSON.stringify(damScoresOf(song)),
    JSON.stringify(joysoundScoresOf(song)),
    song.createdAt || "",
    song.updatedAt || ""
  ]);

  const csv = "\uFEFF" + [headers, ...rows]
    .map(row => row.map(csvEscape).join(","))
    .join("\r\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const d = new Date();
  const date = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;
  a.href = url;
  a.download = `karaoke-data-${date}.csv`;
  document.body.append(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

async function importCSV(file) {
  try {
    const text = (await file.text()).replace(/^\uFEFF/, "");
    const rows = parseCSV(text);
    if (rows.length < 2) throw new Error("CSV is empty");

    const headers = rows[0].map(value => normalizeText(value));
    const indexOf = name => headers.indexOf(normalizeText(name));

    const titleIndex = indexOf("title");
    const artistIndex = indexOf("artist");
    if (titleIndex < 0 || artistIndex < 0) {
      throw new Error("title/artist columns required");
    }

    const incoming = rows.slice(1).map(row => {
      const get = name => {
        const i = indexOf(name);
        return i >= 0 ? (row[i] ?? "") : "";
      };

      const keyRaw = get("key");
      return {
        id: get("id") || makeId(),
        title: String(get("title")).trim(),
        artist: String(get("artist")).trim(),
        key: keyRaw === "" ? "" : Number(keyRaw),
        confidence: String(get("confidence") || ""),
        favorite: ["1","true","yes","on"].includes(normalizeText(get("favorite"))),
        staple: ["1","true","yes","on"].includes(normalizeText(get("staple"))),
        practice: ["1","true","yes","on"].includes(normalizeText(get("practice"))),
        tags: parseTags(String(get("tags") || "").replace(/\s*\|\s*/g, ",")),
        memo: String(get("memo") || ""),
        damScores: safeJsonArray(get("dam_scores")),
        joysoundScores: safeJsonArray(get("joysound_scores")),
        createdAt: get("created_at") || new Date().toISOString(),
        updatedAt: get("updated_at") || new Date().toISOString()
      };
    }).filter(song => song.title && song.artist);

    if (!confirm(`${incoming.length}件のCSVデータを現在の曲一覧に統合しますか？`)) return;

    const currentById = new Map(songs.map(song => [song.id, song]));
    const duplicateKeys = new Set(songs.map(duplicateKey));
    let added = 0, updated = 0, skipped = 0;

    for (const song of incoming) {
      const sameId = currentById.get(song.id);
      if (sameId) {
        await putSong(song);
        currentById.set(song.id, song);
        duplicateKeys.add(duplicateKey(song));
        updated++;
        continue;
      }

      const key = duplicateKey(song);
      if (duplicateKeys.has(key)) {
        skipped++;
        continue;
      }

      await putSong(song);
      currentById.set(song.id, song);
      duplicateKeys.add(key);
      added++;
    }

    songs = await getAllSongs();
    render();
    alert(`CSV読み込み完了\n追加: ${added}件\n更新: ${updated}件\n重複などでスキップ: ${skipped}件`);
  } catch (error) {
    console.error(error);
    alert("CSVを読み込めませんでした。v6から書き出したCSV形式を使用してください。");
  } finally {
    els.importCsvInput.value = "";
  }
}


function resetSearchAndFilters() {
  els.searchInput.value = "";
  currentFilter = "all";

  document.querySelectorAll(".filter-chip").forEach(button => {
    button.classList.toggle("active", button.dataset.filter === "all");
  });

  els.artistFilterSelect.value = "";
  els.tagFilterSelect.value = "";
  els.recentFilterSelect.value = "";

  // 並べ替え優先度1・2は現在の選択をそのまま保持する。
  render();
}

function bindEvents() {
  els.addSongBtn.addEventListener("click", openAddDialog);
  els.continuousAddBtn.addEventListener("click", openContinuousAddDialog);
  els.themeSelect.addEventListener("change", () => applyTheme(els.themeSelect.value));

  els.cloudBtn.addEventListener("click", openCloudDialog);
  els.closeCloudDialogBtn.addEventListener("click", () => els.cloudDialog.close());

  els.cloudLoginBtn.addEventListener("click", async () => {
    const email = els.cloudEmailInput.value.trim();
    const password = els.cloudPasswordInput.value;

    els.cloudLoginError.textContent = "";
    if (!email || !password) {
      els.cloudLoginError.textContent = "メールアドレスとパスワードを入力してください。";
      return;
    }

    els.cloudLoginBtn.disabled = true;
    els.cloudLoginBtn.textContent = "ログイン中…";

    try {
      await loginCloud(email, password);
      els.cloudPasswordInput.value = "";
      setCloudMessage("ログインしました。初回同期を開始します…");
      updateCloudUI("syncing");
      await syncCloud({ silent: true });
      setCloudMessage("クラウド同期の準備ができました。");
    } catch (error) {
      els.cloudLoginError.textContent = readableCloudError(error);
    } finally {
      els.cloudLoginBtn.disabled = false;
      els.cloudLoginBtn.textContent = "ログインして同期";
      updateCloudUI();
    }
  });

  els.cloudPasswordInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      els.cloudLoginBtn.click();
    }
  });

  els.cloudSyncNowBtn.addEventListener("click", () => syncCloud());
  els.cloudLogoutBtn.addEventListener("click", async () => {
    if (!confirm("クラウドからログアウトしますか？\n端末内の曲データは削除されません。")) return;
    await logoutCloud();
  });

  window.addEventListener("online", () => {
    if (cloudAuth?.user?.id) syncCloud({ silent: true });
  });

  els.closeDialogBtn.addEventListener("click", () => els.songDialog.close());
  els.cancelBtn.addEventListener("click", () => els.songDialog.close());
  els.deleteSongBtn.addEventListener("click", deleteCurrentSong);
  els.duplicateSongBtn.addEventListener("click", duplicateCurrentSong);

  els.keyInput.addEventListener("change", syncConfidenceAvailability);
  els.tagsInput.addEventListener("input", renderQuickTagButtons);

  els.addDamScoreBtn.addEventListener("click", () => {
    const entry = scoreEntryFromInput(els.damScoreInput);
    if (!entry) return;

    const previousBest = serviceBestBefore(pendingDamScores);
    pendingDamScores.push(entry);
    els.damScoreInput.value = "";
    renderScoreHistory();

    if (previousBest !== null && Number(entry.score) > previousBest) {
      els.formError.textContent = `🎉 DAM自己ベスト更新！ ${formatScore(previousBest)}点 → ${formatScore(entry.score)}点`;
      els.formError.classList.add("best-message");
    } else if (previousBest === null) {
      els.formError.textContent = `DAM初回スコア ${formatScore(entry.score)}点を登録しました。`;
      els.formError.classList.remove("best-message");
    }

    els.damScoreInput.focus();
  });

  els.addJoysoundScoreBtn.addEventListener("click", () => {
    const entry = scoreEntryFromInput(els.joysoundScoreInput);
    if (!entry) return;

    const previousBest = serviceBestBefore(pendingJoysoundScores);
    pendingJoysoundScores.push(entry);
    els.joysoundScoreInput.value = "";
    renderScoreHistory();

    if (previousBest !== null && Number(entry.score) > previousBest) {
      els.formError.textContent = `🎉 JOYSOUND自己ベスト更新！ ${formatScore(previousBest)}点 → ${formatScore(entry.score)}点`;
      els.formError.classList.add("best-message");
    } else if (previousBest === null) {
      els.formError.textContent = `JOYSOUND初回スコア ${formatScore(entry.score)}点を登録しました。`;
      els.formError.classList.remove("best-message");
    }

    els.joysoundScoreInput.focus();
  });

  els.damScoreInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      els.addDamScoreBtn.click();
    }
  });

  els.joysoundScoreInput.addEventListener("keydown", event => {
    if (event.key === "Enter") {
      event.preventDefault();
      els.addJoysoundScoreBtn.click();
    }
  });

  els.songForm.addEventListener("submit", async event => {
    event.preventDefault();
    await saveForm();
  });

  els.searchInput.addEventListener("input", render);
  els.sortSelect.addEventListener("change", render);
  els.sortSelect2.addEventListener("change", render);
  els.resetFiltersBtn.addEventListener("click", resetSearchAndFilters);
  els.artistFilterSelect.addEventListener("change", render);
  els.tagFilterSelect.addEventListener("change", render);
  els.recentFilterSelect.addEventListener("change", render);

  document.querySelectorAll(".filter-chip").forEach(btn => {
    btn.addEventListener("click", () => {
      currentFilter = btn.dataset.filter;
      document.querySelectorAll(".filter-chip").forEach(b => b.classList.toggle("active", b === btn));
      render();
    });
  });

  els.randomBtn.addEventListener("click", chooseRandom);
  els.randomAgainBtn.addEventListener("click", chooseRandom);
  els.randomCloseBtn.addEventListener("click", () => els.randomDialog.close());

  els.editQuickTagsBtn.addEventListener("click", openQuickTagDialog);
  els.closeQuickTagDialogBtn.addEventListener("click", closeQuickTagDialog);
  els.cancelQuickTagsBtn.addEventListener("click", closeQuickTagDialog);
  els.resetQuickTagsBtn.addEventListener("click", () => {
    els.quickTagsInput.value = DEFAULT_QUICK_TAGS.join("\n");
  });

  els.quickTagForm.addEventListener("submit", event => {
    event.preventDefault();
    saveQuickTags(parseQuickTags(els.quickTagsInput.value));
    closeQuickTagDialog();
    renderQuickTagButtons();
  });

  els.manageTagsBtn.addEventListener("click", openTagManager);
  els.closeTagManagerBtn.addEventListener("click", () => els.tagManagerDialog.close());
  els.tagManagerDoneBtn.addEventListener("click", () => els.tagManagerDialog.close());

  els.sessionHistoryBtn.addEventListener("click", openSessionHistory);
  els.closeSessionHistoryBtn.addEventListener("click", () => els.sessionHistoryDialog.close());
  els.sessionHistoryDoneBtn.addEventListener("click", () => els.sessionHistoryDialog.close());

  els.statsBtn.addEventListener("click", openStatistics);
  els.closeStatsBtn.addEventListener("click", () => els.statsDialog.close());
  els.statsDoneBtn.addEventListener("click", () => els.statsDialog.close());

  els.closeDetailBtn.addEventListener("click", () => els.songDetailDialog.close());
  els.detailEditBtn.addEventListener("click", () => {
    const id = detailSongId;
    els.songDetailDialog.close();
    if (id) openEditDialog(id);
  });

  els.exportBtn.addEventListener("click", exportJSON);
  els.importInput.addEventListener("change", () => {
    const file = els.importInput.files?.[0];
    if (file) importJSON(file);
  });

  els.exportCsvBtn.addEventListener("click", exportCSV);
  els.importCsvInput.addEventListener("change", () => {
    const file = els.importCsvInput.files?.[0];
    if (file) importCSV(file);
  });

  document.addEventListener("keydown", event => {
    if (event.key === "Insert" && !els.songDialog.open && !els.randomDialog.open) {
      event.preventDefault();
      openAddDialog();
    }

    if (event.ctrlKey && event.key.toLowerCase() === "f") {
      event.preventDefault();
      els.searchInput.focus();
      els.searchInput.select();
    }

    if (event.key === "Escape" && els.cloudDialog.open) {
      els.cloudDialog.close();
      return;
    }

    if (event.key === "Escape" && els.sessionHistoryDialog.open) {
      els.sessionHistoryDialog.close();
      return;
    }

    if (event.key === "Escape" && els.statsDialog.open) {
      els.statsDialog.close();
      return;
    }

    if (event.key === "Escape" && els.songDetailDialog.open) {
      els.songDetailDialog.close();
      return;
    }

    if (event.key === "Escape" && els.tagManagerDialog.open) {
      els.tagManagerDialog.close();
      return;
    }

    if (event.key === "Escape" && els.quickTagDialog.open) {
      els.quickTagDialog.close();
      return;
    }

    if (event.key === "Escape" && els.songDialog.open) {
      els.songDialog.close();
    }
  });
}

async function init() {
  db = await openDB();
  songs = await getAllSongs();
  bindEvents();
  applyTheme(localStorage.getItem(THEME_KEY) || "system");

  // 初回表示の既定値
  currentFilter = "all";
  els.artistFilterSelect.value = "";
  els.tagFilterSelect.value = "";
  els.recentFilterSelect.value = "";
  els.sortSelect.value = "title";
  els.sortSelect2.value = "";

  loadCloudAuth();
  updateCloudUI();
  render();

  if (cloudAuth?.access_token) {
    const valid = await validateCloudSession();
    if (valid && navigator.onLine) {
      syncCloud({ silent: true });
    }
  }

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    try {
      await navigator.serviceWorker.register("./service-worker.js");
    } catch (error) {
      console.warn("Service worker registration failed:", error);
    }
  }
}

init().catch(error => {
  console.error(error);
  document.body.innerHTML = `
    <main class="container">
      <div class="empty-state">
        データベースを開始できませんでした。ブラウザのプライベートモードや保存設定を確認してください。
      </div>
    </main>`;
});
