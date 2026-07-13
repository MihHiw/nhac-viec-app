import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';

/* ============ STORAGE ============ */
const STORE_KEY = 'nhacoi_tasks_v1';
const CHAT_KEY = 'nhacoi_chat_v1';

function loadTasks(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }catch(e){ return []; } }
function saveTasks(t){ localStorage.setItem(STORE_KEY, JSON.stringify(t)); }
function loadChat(){ try{ return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; }catch(e){ return []; } }
function saveChat(c){ localStorage.setItem(CHAT_KEY, JSON.stringify(c)); }

let tasks = loadTasks();
let chatLog = loadChat();

/* ============ DATE/TIME PARSING ============ */
const WEEKDAYS = { 'chủ nhật':0, 'cn':0, 'thứ 2':1,'thứ hai':1,'thứ 3':2,'thứ ba':2,'thứ 4':3,'thứ tư':3,
  'thứ 5':4,'thứ năm':4,'thứ 6':5,'thứ sáu':5,'thứ 7':6,'thứ bảy':6 };
const MONTH_NAMES = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];

function stripAccentsLower(s){
  return s.toLowerCase();
}

function parseDate(text){
  const now = new Date();
  const t = text.toLowerCase();

  if(/\bhôm nay\b/.test(t)) return startOfDay(now);
  if(/\bngày mốt\b|\bmốt\b/.test(t)) return addDays(now,2);
  if(/\bngày mai\b|\bmai\b/.test(t)) return addDays(now,1);
  if(/\bhôm qua\b/.test(t)) return startOfDay(now);

  let m = t.match(/(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/);
  if(m){
    let d = parseInt(m[1],10), mo = parseInt(m[2],10)-1;
    let y = m[3] ? (m[3].length===2 ? 2000+parseInt(m[3],10) : parseInt(m[3],10)) : now.getFullYear();
    let candidate = new Date(y, mo, d);
    if(!m[3] && candidate < startOfDay(now)) candidate.setFullYear(y+1);
    return startOfDay(candidate);
  }

  m = t.match(/\bngày (\d{1,2})\b/);
  if(m){
    let d = parseInt(m[1],10);
    let candidate = new Date(now.getFullYear(), now.getMonth(), d);
    if(candidate < startOfDay(now)) candidate.setMonth(candidate.getMonth()+1);
    return startOfDay(candidate);
  }

  for(const key in WEEKDAYS){
    if(t.includes(key)){
      const target = WEEKDAYS[key];
      let d = addDays(now, ( (target - now.getDay() + 7) % 7 ) || 7);
      if(/tuần sau|tuần tới/.test(t)) d = addDays(d,7);
      else {
        const diff = (target - now.getDay() + 7) % 7;
        d = diff===0 ? startOfDay(now) : addDays(now, diff);
      }
      return startOfDay(d);
    }
  }

  return null;
}

function parseTime(text){
  const t = text.toLowerCase();
  let m = t.match(/(\d{1,2})[h:](\d{2})?/);
  if(!m) return null;
  let h = parseInt(m[1],10);
  let min = m[2] ? parseInt(m[2],10) : 0;
  if(/chiều/.test(t) && h < 12) h += 12;
  else if(/tối/.test(t) && h < 12) h += 12;
  else if(/khuya/.test(t) && h < 12) h += 12;
  else if(/trưa/.test(t) && h < 12) h = 12;
  if(h > 23) h = 23;
  return { h, m: min };
}

function startOfDay(d){ const x = new Date(d); x.setHours(0,0,0,0); return x; }
function addDays(d,n){ const x = new Date(d); x.setDate(x.getDate()+n); return x; }

function formatDateShort(d){
  return `${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}
function formatDateFull(d){
  const days=['CN','Th2','Th3','Th4','Th5','Th6','Th7'];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}
function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }

function cleanLabel(text){
  let s = text;
  s = s.replace(/\b(hôm nay|ngày mai|mai|ngày mốt|mốt|hôm qua)\b/gi,'');
  s = s.replace(/\d{1,2}[\/\-]\d{1,2}([\/\-]\d{2,4})?/g,'');
  s = s.replace(/\bngày \d{1,2}\b/gi,'');
  s = s.replace(/\b(thứ 2|thứ hai|thứ 3|thứ ba|thứ 4|thứ tư|thứ 5|thứ năm|thứ 6|thứ sáu|thứ 7|thứ bảy|chủ nhật|cn)\b(\s*tuần sau|\s*tuần tới)?/gi,'');
  s = s.replace(/\d{1,2}[h:]\d{0,2}\s*(sáng|chiều|tối|khuya|trưa)?/gi,'');
  s = s.replace(/\blúc\b|\bvào\b/gi,'');
  s = s.replace(/\s{2,}/g,' ').trim();
  s = s.replace(/^[,\.\-–\s]+|[,\.\-–\s]+$/g,'');
  if(s.length===0) s = text.trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/* ============ RENDER ============ */
const chatEl = document.getElementById('chat');
const todayStrip = document.getElementById('today-strip');
const todayList = todayStrip.querySelector('.today-list');

function renderEmptyHintIfNeeded(){
  if(chatLog.length===0){
    chatEl.innerHTML = `<div class="empty-hint">👋 Chào bạn! Cứ gõ việc cần làm theo cách tự nhiên, mình sẽ tự hiểu ngày giờ.<br><br>
    <b>Ví dụ:</b><br>"mai tui cần họp lúc 9h"<br>"20/7 nộp báo cáo"<br>"thứ 6 đi khám răng lúc 3h chiều"</div>`;
  }
}

function addBubble(role, text, time){
  const wrap = document.createElement('div');
  wrap.className = 'msg ' + role;
  wrap.innerHTML = `<div class="bubble"></div><div class="time"></div>`;
  wrap.querySelector('.bubble').textContent = text;
  wrap.querySelector('.time').textContent = time;
  chatEl.appendChild(wrap);
}

function addTicket(task){
  const wrap = document.createElement('div');
  wrap.className = 'ticket' + (task.done ? ' done' : '');
  wrap.dataset.id = task.id;
  const d = new Date(task.date);
  wrap.innerHTML = `
    <div class="stub"><div class="d">${String(d.getDate()).padStart(2,'0')}</div><div class="m">${MONTH_NAMES[d.getMonth()]}</div></div>
    <div class="body">
      <div class="txt">${escapeHtml(task.label)}</div>
      <div class="meta">${formatDateFull(d)}${task.time ? ' · ' + String(task.time.h).padStart(2,'0')+':'+String(task.time.m).padStart(2,'0') : ''}</div>
      <div class="actions">
        <button class="done-btn">${task.done ? '↺ Chưa xong' : '✓ Xong rồi'}</button>
        <button class="del-btn">✕ Xoá</button>
      </div>
    </div>`;
  chatEl.appendChild(wrap);
  wrap.querySelector('.done-btn').onclick = () => toggleDone(task.id);
  wrap.querySelector('.del-btn').onclick = () => deleteTask(task.id);
}

function escapeHtml(s){
  return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function nowHHMM(){
  const n = new Date();
  return String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
}

function fullRender(){
  chatEl.innerHTML = '';
  renderEmptyHintIfNeeded();
  chatLog.forEach(entry => {
    if(entry.kind === 'bubble') addBubble(entry.role, entry.text, entry.time);
    else if(entry.kind === 'ticket'){
      const task = tasks.find(x => x.id === entry.taskId);
      if(task) addTicket(task);
    }
  });
  chatEl.scrollTop = chatEl.scrollHeight;
  renderTodayStrip();
}

function renderTodayStrip(){
  const today = tasks.filter(t => isSameDay(new Date(t.date), new Date()));
  if(today.length===0){ todayStrip.classList.remove('show'); return; }
  today.sort((a,b) => (a.time?a.time.h*60+a.time.m:1e9) - (b.time?b.time.h*60+b.time.m:1e9));
  todayList.innerHTML = today.map(t => `
    <div class="today-item ${t.done?'done':''}">
      <span class="t">${t.time ? String(t.time.h).padStart(2,'0')+':'+String(t.time.m).padStart(2,'0') : '—'}</span>
      <span class="txt">${escapeHtml(t.label)}</span>
    </div>`).join('');
  todayStrip.classList.add('show');
}

function toggleDone(id){
  const task = tasks.find(x => x.id === id);
  if(!task) return;
  task.done = !task.done;
  saveTasks(tasks);
  fullRender();
}
function deleteTask(id){
  tasks = tasks.filter(x => x.id !== id);
  chatLog = chatLog.filter(e => !(e.kind==='ticket' && e.taskId===id));
  saveTasks(tasks); saveChat(chatLog);
  fullRender();
}

/* ============ SEND / PARSE FLOW ============ */
const input = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');

function handleSend(){
  const text = input.value.trim();
  if(!text) return;
  chatLog.push({kind:'bubble', role:'user', text, time: nowHHMM()});
  addBubble('user', text, nowHHMM());
  input.value = ''; autoGrow();

  let date = parseDate(text);
  const usedDefaultDate = !date;
  if(!date) date = startOfDay(new Date());
  const time = parseTime(text);
  const label = cleanLabel(text);

  const task = {
    id: 't' + Date.now() + Math.random().toString(36).slice(2,6),
    label, date: date.toISOString(), time, done: false, notified: false
  };
  tasks.push(task);
  saveTasks(tasks);

  let botText = usedDefaultDate
    ? `Mình chưa thấy ngày cụ thể nên đã ghi cho hôm nay nhé. Bạn nhắn lại kèm ngày nếu mình hiểu sai 👇`
    : `Đã ghi nhớ cho bạn rồi 👇`;
  chatLog.push({kind:'bubble', role:'bot', text: botText, time: nowHHMM()});
  addBubble('bot', botText, nowHHMM());

  chatLog.push({kind:'ticket', taskId: task.id});
  addTicket(task);

  saveChat(chatLog);
  chatEl.scrollTop = chatEl.scrollHeight;
  renderTodayStrip();
}

sendBtn.onclick = handleSend;
input.addEventListener('keydown', e => {
  if(e.key === 'Enter' && !e.shiftKey){ e.preventDefault(); handleSend(); }
});
function autoGrow(){ input.style.height='auto'; input.style.height = Math.min(input.scrollHeight,100)+'px'; }
input.addEventListener('input', autoGrow);

/* ============ NOTIFICATIONS ============ */
const notifBtn = document.getElementById('notif-btn');

async function checkNotifPerm() {
  if (Capacitor.isNative) {
    const perm = await LocalNotifications.checkPermissions();
    return perm.display === 'granted';
  } else if ('Notification' in window) {
    return Notification.permission === 'granted';
  }
  return false;
}

async function requestNotifPerm() {
  if (Capacitor.isNative) {
    const perm = await LocalNotifications.requestPermissions();
    return perm.display === 'granted';
  } else if ('Notification' in window) {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  }
  return false;
}

async function setupLockScreenChannel() {
  if (Capacitor.isNative) {
    try {
      await LocalNotifications.createChannel({
        id: 'nhac_oi_alerts',
        name: 'Nhắc Việc',
        description: 'Nhắc nhở công việc, chuông & rung trên màn hình khoá',
        importance: 5,
        visibility: 1,
        vibration: true
      });
    } catch (e) { console.error('Error creating channel:', e); }
  }
}

const stringToId = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

async function syncNativeNotifications() {
  if (!Capacitor.isNative) return;
  const granted = await checkNotifPerm();
  if(!granted) return;

  try {
    const pending = await LocalNotifications.getPending();
    if(pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch(e){}

  const now = new Date();
  const toSchedule = [];
  tasks.forEach(t => {
    if (t.done) return;
    if (!t.time) return;
    
    const d = new Date(t.date);
    d.setHours(t.time.h, t.time.m, 0, 0);

    if (d.getTime() > now.getTime()) {
      toSchedule.push({
        title: '⏰ ' + t.label,
        body: `Đến giờ rồi (${String(t.time.h).padStart(2,'0')}:${String(t.time.m).padStart(2,'0')})`,
        id: stringToId(t.id),
        schedule: { at: d, allowWhileIdle: true },
        channelId: 'nhac_oi_alerts'
      });
    }
  });

  if (toSchedule.length > 0) {
    await LocalNotifications.schedule({ notifications: toSchedule });
  }
}

// Override saveTasks to sync notifications
const oldSaveTasks = saveTasks;
saveTasks = (t) => {
  oldSaveTasks(t);
  syncNativeNotifications();
};

async function fireNotification(title, body) {
  if (Capacitor.isNative) {
    await LocalNotifications.schedule({
      notifications: [
        {
          title: title,
          body: body,
          id: Math.floor(Math.random() * 1000000),
          schedule: { at: new Date(Date.now() + 100) },
          channelId: 'nhac_oi_alerts'
        }
      ]
    });
  } else if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body, icon: 'icon-192.svg' });
  }
}

async function fireWebNotification(title, body) {
  if ('Notification' in window && Notification.permission === 'granted') {
    new Notification(title, { body: body, icon: 'icon-192.svg' });
  }
}

async function refreshNotifBtn(){
  const granted = await checkNotifPerm();
  if (granted) {
    notifBtn.textContent='🔔 Đã bật nhắc'; notifBtn.classList.add('on');
    setupLockScreenChannel();
    syncNativeNotifications();
  } else {
    notifBtn.textContent='🔔 Bật nhắc'; notifBtn.classList.remove('on');
  }
}

notifBtn.onclick = async () => {
  const granted = await requestNotifPerm();
  refreshNotifBtn();
  if(granted){
    setupLockScreenChannel();
    fireNotification('Nhắc Ơi', 'Đã bật nhắc việc! Mình sẽ tự báo ngay cả khi bạn đóng app.');
  }
};
refreshNotifBtn();

// Web-only fallback for real-time checks
async function checkDueTasksWeb(){
  if (Capacitor.isNative) return;
  const granted = await checkNotifPerm();
  if(!granted) return;
  const now = new Date();
  tasks.forEach(t => {
    if(t.done || t.notified) return;
    const d = new Date(t.date);
    if(!isSameDay(d, now)) return;
    if(!t.time){ return; }
    const dueMinutes = t.time.h*60+t.time.m;
    const nowMinutes = now.getHours()*60+now.getMinutes();
    if(nowMinutes >= dueMinutes){
      const late = nowMinutes - dueMinutes > 3;
      const title = '⏰ ' + t.label;
      const body = (late ? 'Trễ mất rồi, lẽ ra là ' : 'Đến giờ rồi (') + String(t.time.h).padStart(2,'0')+':'+String(t.time.m).padStart(2,'0') + (late ? '' : ')');
      fireWebNotification(title, body);
      t.notified = true;
      saveTasks(tasks);
    }
  });
}
setInterval(checkDueTasksWeb, 30000);
checkDueTasksWeb();
document.addEventListener('visibilitychange', () => { if(document.visibilityState === 'visible') checkDueTasksWeb(); });

/* Chào buổi sáng: khi mở app lần đầu trong ngày, tóm tắt việc hôm nay */
(async function greetIfNewDay(){
  const lastOpen = localStorage.getItem('nhacoi_last_open');
  const todayKey = new Date().toDateString();
  if(lastOpen !== todayKey){
    localStorage.setItem('nhacoi_last_open', todayKey);
    const todays = tasks.filter(t => isSameDay(new Date(t.date), new Date()) && !t.done);
    const granted = await checkNotifPerm();
    if(todays.length > 0 && granted){
      const title = 'Nhắc Ơi — hôm nay có ' + todays.length + ' việc';
      const body = todays.slice(0,3).map(t=>t.label).join(', ');
      fireNotification(title, body);
    }
  }
})();

/* ============ INIT ============ */
fullRender();

/* Service worker (offline + cài lên màn hình chính) */
if('serviceWorker' in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
  });
}
