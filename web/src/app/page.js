import Link from 'next/link';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <>
      <div className={styles.blob1}></div>
      <div className={styles.blob2}></div>

      <header className={styles.header}>
        <div className={styles.logo}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4 2.5 5.5S9 17 9 18h6c0-1 .5-1.5 1.5-3S19 11.5 19 9a7 7 0 0 0-7-7Z"/></svg>
          Nhắc Việc
        </div>
        <Link href="/app" className={styles.webLink}>Mở bản Web</Link>
      </header>

      <main className={styles.main}>
        <div className={styles.heroText}>
          <div className={styles.badge}>🔥 Ứng dụng Android 100% Miễn phí</div>
          <h1>Gõ là nhớ,<br/><span>Không lo trễ hẹn.</span></h1>
          <p className={styles.desc}>Chỉ cần chat với ứng dụng như một người bạn. Hệ thống AI tự động phân tích thời gian và đánh thức bạn đúng giờ bằng chuông báo hệ thống, dù có tắt mạng hay tắt màn hình.</p>
          
          <div className={styles.btnGroup}>
            <a href="app-debug.apk" download="NhacViec.apk" className={styles.btnDownload}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 14.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z"/><path d="M13.5 14.5 10 11"/><path d="M13.5 14.5 16 11"/><path d="M13.5 14.5V18"/><path d="M21.5 14.5a8 8 0 0 1-16 0"/><path d="M5.5 14.5a8 8 0 0 1 16 0"/><path d="M5.5 14.5 5 13"/><path d="M21.5 14.5 22 13"/><path d="M12 2v6"/><path d="m9 5 3-3 3 3"/></svg>
              Tải App Android
            </a>
          </div>
          <p className={styles.note}>* File cài đặt APK an toàn, dung lượng nhẹ &lt; 10MB</p>
        </div>

        <div className={styles.heroVisual}>
          <div className={styles.phone}>
            <div className={styles.notch}></div>
            <div className={styles.pHeader}>
              <div className={styles.pIcon}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-7 7c0 2.5 1.5 4 2.5 5.5S9 17 9 18h6c0-1 .5-1.5 1.5-3S19 11.5 19 9a7 7 0 0 0-7-7Z"/></svg>
              </div>
              <div className={styles.pTitle}>Nhắc Ơi</div>
            </div>
            <div className={styles.pChat}>
              <div className={`${styles.pMsg} ${styles.pMsgUser}`}>Mai lúc 9h sáng nhớ gọi tui dậy nộp báo cáo nha</div>
              <div className={`${styles.pMsg} ${styles.pMsgBot}`}>
                <strong style={{color:'var(--primary)', display:'block', marginBottom:'4px'}}>Đã lên lịch ⏱️</strong>
                Bạn có 1 việc: "nộp báo cáo nha" vào lúc 09:00 ngày mai.
              </div>
            </div>
            <div className={styles.pInput}>
              <span className={styles.pInputText}>Nhập việc cần làm...</span>
              <div className={styles.pSend}></div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
