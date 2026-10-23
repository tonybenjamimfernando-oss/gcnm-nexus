import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { unreadCount } from "./messaging";
import { useSession } from "./session";

export function useUnreadMessages(): number {
  const { user } = useSession();
  const location = useLocation();
  const [count, setCount] = useState(0);

  useEffect(
    function watch() {
      if (!user) {
        setCount(0);
        return;
      }
      const userId = user.id;
      let active = true;
      async function run() {
        try {
          const value = await unreadCount(userId);
          if (active) setCount(value);
        } catch {
          if (active) setCount(0);
        }
      }
      run();
      const timer = window.setInterval(run, 45000);
      return function stop() {
        active = false;
        window.clearInterval(timer);
      };
    },
    [user, location.pathname],
  );

  return count;
}
