// Supabase database wakeup service
// Pings the database every 3 days to prevent pause after 15 days of inactivity

if (typeof window !== 'undefined') {
  const INTERVAL = 3 * 24 * 60 * 60 * 1000; // 3 days in milliseconds
  const LAST_PING_KEY = 'notylist_last_db_ping';

  function shouldPing(): boolean {
    const last = localStorage.getItem(LAST_PING_KEY);
    if (!last) return true;
    return Date.now() - parseInt(last, 10) > INTERVAL;
  }

  function ping() {
    if (shouldPing()) {
      fetch('/api/db-ping')
        .then(() => localStorage.setItem(LAST_PING_KEY, Date.now().toString()))
        .catch(() => {});
    }
  }

  // Ping on first load after 2 seconds
  setTimeout(ping, 2000);

  // Check every hour if a ping is needed
  setInterval(ping, 60 * 60 * 1000);
}

export {};
