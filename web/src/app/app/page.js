"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

let Capacitor, LocalNotifications;

const STORE_KEY = 'nhacoi_tasks_v1';
const CHAT_KEY = 'nhacoi_chat_v1';
const MONTH_NAMES = ['Th1','Th2','Th3','Th4','Th5','Th6','Th7','Th8','Th9','Th10','Th11','Th12'];

function loadTasks(){ try{ return JSON.parse(localStorage.getItem(STORE_KEY)) || []; }catch(e){ return []; } }
function saveTasks(t){ localStorage.setItem(STORE_KEY, JSON.stringify(t)); }
function loadChat(){ try{ return JSON.parse(localStorage.getItem(CHAT_KEY)) || []; }catch(e){ return []; } }
function saveChat(c){ localStorage.setItem(CHAT_KEY, JSON.stringify(c)); }

const WEEKDAYS = { 'chủ nhật':0, 'cn':0, 'thứ 2':1,'thứ hai':1,'thứ 3':2,'thứ ba':2,'thứ 4':3,'thứ tư':3,
  'thứ 5':4,'thứ năm':4,'thứ 6':5,'thứ sáu':5,'thứ 7':6,'thứ bảy':6 };

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
function nowHHMM(){
  const n = new Date();
  return String(n.getHours()).padStart(2,'0')+':'+String(n.getMinutes()).padStart(2,'0');
}
const stringToId = s => Math.abs(s.split('').reduce((a,b)=>{a=((a<<5)-a)+b.charCodeAt(0);return a&a},0));

export default function ChatApp() {
  const [tasks, setTasks] = useState([]);
  const [chatLog, setChatLog] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [notifState, setNotifState] = useState(false);
  const [toasts, setToasts] = useState([]);
  const chatEndRef = useRef(null);

  useEffect(() => {
    import('@capacitor/core').then(mod => { Capacitor = mod.Capacitor; });
    import('@capacitor/local-notifications').then(mod => {
      LocalNotifications = mod.LocalNotifications;
      setupNativeListeners();
      checkNotifPerm().then(granted => {
        setNotifState(granted);
        if (granted) syncNativeNotifications(tasks);
      });
    });

    const t = loadTasks();
    const c = loadChat();
    setTasks(t);
    setChatLog(c);

    const lastOpen = localStorage.getItem('nhacoi_last_open');
    const todayKey = new Date().toDateString();
    if(lastOpen !== todayKey){
      localStorage.setItem('nhacoi_last_open', todayKey);
      const todays = t.filter(x => isSameDay(new Date(x.date), new Date()) && !x.done);
      checkNotifPerm().then(granted => {
        if(todays.length > 0 && granted){
          const title = 'Nhắc Ơi — hôm nay có ' + todays.length + ' việc';
          const body = todays.slice(0,3).map(x=>x.label).join(', ');
          fireNotification(title, body);
        }
      });
    }

    const interval = setInterval(() => checkDueTasksWeb(t), 15000);
    const visHandler = () => { if(document.visibilityState === 'visible') checkDueTasksWeb(tasks); };
    document.addEventListener('visibilitychange', visHandler);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', visHandler);
    };
  }, []);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatLog]);

  useEffect(() => {
    saveTasks(tasks);
    if(Capacitor && LocalNotifications) { syncNativeNotifications(tasks); }
  }, [tasks]);

  useEffect(() => { saveChat(chatLog); }, [chatLog]);

  const setupNativeListeners = () => {
    if (Capacitor?.isNative && LocalNotifications) {
      LocalNotifications.addListener('localNotificationReceived', (notification) => {
        showToast(notification.title, notification.body, 'nat_' + notification.id);
      });
    }
  };

  const checkNotifPerm = async () => {
    if (Capacitor?.isNative && LocalNotifications) {
      const perm = await LocalNotifications.checkPermissions();
      return perm.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      return Notification.permission === 'granted';
    }
    return false;
  };

  const requestNotifPerm = async () => {
    if (Capacitor?.isNative && LocalNotifications) {
      const perm = await LocalNotifications.requestPermissions();
      return perm.display === 'granted';
    } else if (typeof window !== 'undefined' && 'Notification' in window) {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  };

  const setupLockScreenChannel = async () => {
    if (Capacitor?.isNative && LocalNotifications) {
      try {
        await LocalNotifications.createChannel({
          id: 'nhac_oi_alerts',
          name: 'Nhắc Việc',
          description: 'Nhắc nhở công việc, chuông & rung trên màn hình khoá',
          importance: 5, visibility: 1, vibration: true
        });
      } catch (e) { console.error('Error creating channel:', e); }
    }
  };

  const syncNativeNotifications = async (currentTasks) => {
    if (!Capacitor?.isNative || !LocalNotifications) return;
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
    currentTasks.forEach(t => {
      if (t.done || !t.time) return;
      const d = new Date(t.date);
      d.setHours(t.time.h, t.time.m, 0, 0);

      if (d.getTime() > now.getTime()) {
        toSchedule.push({
          title: '⏰ ' + t.label,
          body: `Đến giờ rồi (${String(t.time.h).padStart(2,'0')}:${String(t.time.m).padStart(2,'0')})`,
          id: stringToId(t.id),
          schedule: { at: d, allowWhileIdle: true },
          channelId: 'nhac_oi_alerts',
          group: t.id, groupSummary: false
        });
      }
    });

    if (toSchedule.length > 0) {
      await LocalNotifications.schedule({ notifications: toSchedule });
    }
  };

  const showToast = (title, body, id) => {
    setToasts(prev => {
      if(prev.find(x => x.id === id)) return prev;
      return [...prev, {id, title, body}];
    });
    setTimeout(() => { setToasts(prev => prev.filter(x => x.id !== id)); }, 15000);
  };

  const closeToast = (id) => { setToasts(prev => prev.filter(x => x.id !== id)); };

  const fireNotification = async (title, body) => {
    if (Capacitor?.isNative && LocalNotifications) {
      await LocalNotifications.schedule({
        notifications: [{
          title: title, body: body,
          id: Math.floor(Math.random() * 1000000),
          schedule: { at: new Date(Date.now() + 100) },
          channelId: 'nhac_oi_alerts', group: 'test_' + Date.now()
        }]
      });
    } else if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body: body, icon: '/icon-192.svg' });
    }
    showToast(title, body, 'sys_'+Date.now());
  };

  const checkDueTasksWeb = async (currentTasks) => {
    const granted = await checkNotifPerm();
    if(!granted) return;
    const now = new Date();
    let changed = false;
    const updatedTasks = currentTasks.map(t => {
      if(t.done || t.notified) return t;
      const d = new Date(t.date);
      if(!isSameDay(d, now) || !t.time) return t;
      
      const dueMinutes = t.time.h*60+t.time.m;
      const nowMinutes = now.getHours()*60+now.getMinutes();
      if(nowMinutes >= dueMinutes){
        const late = nowMinutes - dueMinutes > 3;
        const title = '⏰ ' + t.label;
        const body = (late ? 'Trễ mất rồi, lẽ ra là ' : 'Đến giờ rồi (') + String(t.time.h).padStart(2,'0')+':'+String(t.time.m).padStart(2,'0') + (late ? '' : ')');
        showToast(title, body, 'due_' + t.id);
        if(!Capacitor?.isNative && typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification(title, { body: body, icon: '/icon-192.svg' });
        }
        changed = true;
        return { ...t, notified: true };
      }
      return t;
    });
    if (changed) setTasks(updatedTasks);
  };

  const handleToggleNotif = async () => {
    const granted = await requestNotifPerm();
    setNotifState(granted);
    if(granted){
      setupLockScreenChannel();
      fireNotification('Nhắc Ơi', 'Đã bật nhắc việc! Mình sẽ tự báo ngay cả khi bạn đóng app.');
      syncNativeNotifications(tasks);
    }
  };

  const handleSend = () => {
    const text = inputValue.trim();
    if(!text) return;
    
    setInputValue('');
    
    const newChatLog = [...chatLog, {kind:'bubble', role:'user', text, time: nowHHMM()}];
    
    let date = parseDate(text);
    const usedDefaultDate = !date;
    if(!date) date = startOfDay(new Date());
    const time = parseTime(text);
    const label = cleanLabel(text);

    const task = {
      id: 't' + Date.now() + Math.random().toString(36).slice(2,6),
      label, date: date.toISOString(), time, done: false, notified: false
    };
    
    setTasks(prev => [...prev, task]);
    
    let botText = usedDefaultDate
      ? `Mình chưa thấy ngày cụ thể nên đã ghi cho hôm nay nhé. Bạn nhắn lại kèm ngày nếu mình hiểu sai 👇`
      : `Đã ghi nhớ cho bạn rồi 👇`;
      
    newChatLog.push({kind:'bubble', role:'bot', text: botText, time: nowHHMM()});
    newChatLog.push({kind:'ticket', taskId: task.id});
    
    setChatLog(newChatLog);
  };

  const toggleDone = (id) => { setTasks(prev => prev.map(t => t.id === id ? {...t, done: !t.done} : t)); };
  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setChatLog(prev => prev.filter(e => !(e.kind==='ticket' && e.taskId===id)));
  };

  const todayTasks = tasks.filter(t => isSameDay(new Date(t.date), new Date()));
  todayTasks.sort((a,b) => (a.time?a.time.h*60+a.time.m:1e9) - (b.time?b.time.h*60+b.time.m:1e9));

  return (
    <>
      <div className={styles.toastContainer}>
        {toasts.map(t => (
          <div key={t.id} className={styles.toast}>
            <div className={styles.tIcon}>🔔</div>
            <div className={styles.tContent}>
              <div className={styles.tTitle}>{t.title}</div>
              <div className={styles.tBody}>{t.body}</div>
            </div>
            <button className={styles.tClose} onClick={() => closeToast(t.id)}>✕</button>
          </div>
        ))}
      </div>
      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.lamp}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4 2.5 5.5S9 17 9 18h6c0-1 .5-1.5 1.5-3S19 11.5 19 9a7 7 0 0 0-7-7Z"/></svg>
          </div>
          <div className={styles.headerInfo}>
            <h1>Nhắc Ơi</h1>
            <p>Gõ việc cần làm, mình nhớ giúp bạn</p>
          </div>
          <button className={`${styles.notifBtn} ${notifState ? styles.on : ''}`} onClick={handleToggleNotif}>
            {notifState ? '🔔 Đã bật nhắc' : '🔔 Bật nhắc'}
          </button>
        </header>

        {todayTasks.length > 0 && (
          <div className={styles.todayStrip}>
            <div className={styles.todayLabel}>Hôm nay</div>
            <div className={styles.todayList}>
              {todayTasks.map(t => (
                <div key={t.id} className={`${styles.todayItem} ${t.done ? styles.done : ''}`}>
                  <span className={styles.t}>{t.time ? String(t.time.h).padStart(2,'0')+':'+String(t.time.m).padStart(2,'0') : '—'}</span>
                  <span className={styles.txt}>{t.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles.chat}>
          {chatLog.length === 0 && (
            <div className={styles.emptyHint}>
              👋 Chào bạn! Cứ gõ việc cần làm theo cách tự nhiên, mình sẽ tự hiểu ngày giờ.<br/><br/>
              <b>Ví dụ:</b><br/>"mai tui cần họp lúc 9h"<br/>"20/7 nộp báo cáo"<br/>"thứ 6 đi khám răng lúc 3h chiều"
            </div>
          )}
          
          {chatLog.map((entry, i) => {
            if(entry.kind === 'bubble') {
              const isUser = entry.role === 'user';
              return (
                <div key={i} className={`${styles.msg} ${isUser ? styles.msgUser : styles.msgBot}`}>
                  <div className={styles.bubble}>{entry.text}</div>
                  <div className={styles.time}>{entry.time}</div>
                </div>
              );
            } else if (entry.kind === 'ticket') {
              const task = tasks.find(x => x.id === entry.taskId);
              if(!task) return null;
              
              let extraClass = '';
              if (task.done) extraClass = styles.done;
              else if (task.time) {
                const d = new Date(task.date);
                d.setHours(task.time.h, task.time.m, 0, 0);
                if (d.getTime() < Date.now()) extraClass = styles.late;
              }
              const d = new Date(task.date);
              
              return (
                <div key={i} className={`${styles.ticket} ${extraClass}`}>
                  <div className={styles.stub}>
                    <div className={styles.d}>{String(d.getDate()).padStart(2,'0')}</div>
                    <div className={styles.m}>{MONTH_NAMES[d.getMonth()]}</div>
                  </div>
                  <div className={styles.body}>
                    <div className={styles.txt}>{task.label}</div>
                    <div className={styles.meta}>
                      {formatDateFull(d)}{task.time ? ' · ' + String(task.time.h).padStart(2,'0')+':'+String(task.time.m).padStart(2,'0') : ''}
                    </div>
                    <div className={styles.actions}>
                      <button className={styles.doneBtn} onClick={() => toggleDone(task.id)}>
                        {task.done ? '↺ Chưa xong' : '✓ Xong rồi'}
                      </button>
                      <button className={styles.delBtn} onClick={() => deleteTask(task.id)}>✕ Xoá</button>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })}
          <div ref={chatEndRef} />
        </div>

        <div className={styles.inputBar}>
          <textarea 
            rows="1" 
            placeholder="vd: mai tui cần họp lúc 9h..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if(e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <button className={styles.sendBtn} onClick={handleSend}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/></svg>
          </button>
        </div>
      </div>
    </>
  );
}
