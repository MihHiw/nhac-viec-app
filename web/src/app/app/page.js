"use client";
import React, { useState, useEffect, useRef } from 'react';
import styles from './page.module.css';

let Capacitor, LocalNotifications, TextToSpeech;

const STORE_KEY = 'nhacoi_tasks_v2';

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
function isSameDay(a,b){ return a.getFullYear()===b.getFullYear() && a.getMonth()===b.getMonth() && a.getDate()===b.getDate(); }
function formatDateFull(d){
  const days=['CN','Th2','Th3','Th4','Th5','Th6','Th7'];
  return `${days[d.getDay()]}, ${String(d.getDate()).padStart(2,'0')}/${String(d.getMonth()+1).padStart(2,'0')}`;
}

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

export default function TimetableApp() {
  const [tasks, setTasks] = useState([]);
  const [listening, setListening] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [voiceActive, setVoiceActive] = useState(true);
  const [activeAlert, setActiveAlert] = useState(null);
  
  const recognitionRef = useRef(null);

  useEffect(() => {
    // Dynamic imports
    import('@capacitor/core').then(mod => { Capacitor = mod.Capacitor; });
    import('@capacitor-community/text-to-speech').then(mod => { TextToSpeech = mod.TextToSpeech; });
    import('@capacitor/local-notifications').then(mod => { LocalNotifications = mod.LocalNotifications; });

    // Load tasks
    try {
      const stored = JSON.parse(localStorage.getItem(STORE_KEY)) || [];
      setTasks(stored);
    } catch(e) {}

    // Init Speech Recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = 'vi-VN';
        recognitionRef.current.interimResults = false;
        recognitionRef.current.maxAlternatives = 1;

        recognitionRef.current.onresult = (event) => {
          const transcript = event.results[0][0].transcript;
          handleProcessTask(transcript);
        };
        recognitionRef.current.onerror = (e) => {
          console.error("Speech error", e);
          setListening(false);
        };
        recognitionRef.current.onend = () => {
          setListening(false);
        };
      }
    }

    // Tick every 10s to check alarms
    const interval = setInterval(checkAlarms, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const speak = async (text) => {
    if (!voiceActive) return;
    try {
      if (Capacitor?.isNative && TextToSpeech) {
        await TextToSpeech.speak({ text, lang: 'vi-VN', rate: 1.0 });
      } else if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text);
        u.lang = 'vi-VN';
        window.speechSynthesis.speak(u);
      }
    } catch(e) { console.error('TTS Error', e); }
  };

  const handleProcessTask = (text) => {
    if(!text.trim()) return;
    let date = parseDate(text);
    const usedDefaultDate = !date;
    if(!date) date = startOfDay(new Date());
    const time = parseTime(text);
    const label = cleanLabel(text);

    const task = {
      id: Date.now().toString(),
      label, date: date.toISOString(), time, done: false, notified: false
    };
    
    setTasks(prev => [...prev, task]);
    setInputValue('');
    
    if (usedDefaultDate && !time) {
      speak(`Đã ghi nhận công việc: ${label}. Nhưng chưa rõ giờ giấc.`);
    } else {
      speak(`Đã lên lịch: ${label}`);
    }
  };

  const toggleMic = () => {
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setListening(true);
      } catch(e) {
        console.error("Cannot start mic", e);
      }
    }
  };

  const checkAlarms = () => {
    setTasks(prev => {
      let changed = false;
      const now = new Date();
      const updated = prev.map(t => {
        if(t.done || t.notified || !t.time) return t;
        const d = new Date(t.date);
        if(!isSameDay(d, now)) return t;
        
        const dueMinutes = t.time.h*60 + t.time.m;
        const nowMinutes = now.getHours()*60 + now.getMinutes();
        
        if (nowMinutes >= dueMinutes) {
          changed = true;
          // Trigger Alert
          setActiveAlert(t);
          speak(`Chào bạn, đã đến giờ: ${t.label}`);
          return { ...t, notified: true };
        }
        return t;
      });
      return changed ? updated : prev;
    });
  };

  const todayTasks = tasks.filter(t => isSameDay(new Date(t.date), new Date()));
  todayTasks.sort((a,b) => (a.time?a.time.h*60+a.time.m:1e9) - (b.time?b.time.h*60+b.time.m:1e9));

  return (
    <div className={styles.container}>
      {activeAlert && (
        <div className={styles.alertOverlay}>
          <div className={styles.alertBox}>
            <div className={styles.alertIcon}>⏰</div>
            <div className={styles.alertTitle}>Tới Giờ Rồi!</div>
            <div className={styles.alertTask}>{activeAlert.label}</div>
            <button className={styles.alertBtn} onClick={() => setActiveAlert(null)}>
              Đã Rõ
            </button>
          </div>
        </div>
      )}

      <header className={styles.header}>
        <div className={styles.headerTop}>
          <h1 className={styles.title}>Thời Khóa Biểu</h1>
          <div className={styles.date}>{formatDateFull(new Date())}</div>
        </div>
        <button 
          className={`${styles.voiceStatus} ${!voiceActive ? styles.off : ''}`}
          onClick={() => setVoiceActive(!voiceActive)}
        >
          <div className={`${styles.dot} ${voiceActive ? styles.pulse : ''}`}></div>
          {voiceActive ? 'Trợ lý: Đang trực ban' : 'Trợ lý: Tạm nghỉ'}
        </button>
      </header>

      <div className={styles.timeline}>
        {todayTasks.length === 0 ? (
          <div className={styles.emptyHint}>
            Hôm nay bạn chưa có lịch trình nào.<br/>Nhấn Micro và nói "Chiều nay đi mua cafe" để thử nhé.
          </div>
        ) : (
          todayTasks.map((t, idx) => {
            const isDone = t.done;
            const now = new Date();
            let isActive = false;
            let countdown = '';
            
            if (t.time && !isDone) {
              const dueMinutes = t.time.h*60 + t.time.m;
              const nowMinutes = now.getHours()*60 + now.getMinutes();
              if (dueMinutes > nowMinutes && dueMinutes - nowMinutes <= 60) {
                isActive = true;
                countdown = `Còn ${dueMinutes - nowMinutes} phút`;
              } else if (nowMinutes >= dueMinutes) {
                countdown = `Đã qua giờ`;
              }
            }

            return (
              <div key={t.id} className={`${styles.taskItem} ${isDone ? styles.done : ''} ${isActive ? styles.active : ''}`}>
                <div className={styles.timeCol}>
                  <div className={styles.timeText}>{t.time ? `${String(t.time.h).padStart(2,'0')}:${String(t.time.m).padStart(2,'0')}` : '—'}</div>
                  <div className={styles.timeNode}></div>
                </div>
                <div className={styles.cardCol}>
                  <div className={styles.taskTitle}>{t.label}</div>
                  {countdown && <div className={styles.taskCountdown}>{countdown}</div>}
                  <div className={styles.taskActions}>
                    <button 
                      className={`${styles.actionBtn} ${styles.doneBtn}`} 
                      onClick={() => setTasks(prev => prev.map(x => x.id === t.id ? {...x, done: !x.done} : x))}
                    >
                      {t.done ? '↺ Bỏ hoàn thành' : '✓ Xong'}
                    </button>
                    <button 
                      className={styles.actionBtn} 
                      onClick={() => setTasks(prev => prev.filter(x => x.id !== t.id))}
                    >
                      ✕ Xóa
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className={styles.inputArea}>
        <button 
          className={`${styles.micBtn} ${listening ? styles.listening : ''}`}
          onClick={toggleMic}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
            <line x1="12" x2="12" y1="19" y2="22"/>
          </svg>
        </button>
        
        <div className={styles.textInputWrap}>
          <input 
            type="text"
            className={styles.textInput}
            placeholder="Hoặc gõ lịch trình vào đây..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleProcessTask(inputValue);
            }}
          />
          <button className={styles.textSendBtn} onClick={() => handleProcessTask(inputValue)}>
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4 20-7Z"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
