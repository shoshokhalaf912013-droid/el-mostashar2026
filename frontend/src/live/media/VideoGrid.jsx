import EventBus from "../core/EventBus";

useEffect(() => {
  EventBus.on("USER_JOINED", (user) => {
    console.log("طالب دخل:", user);
  });

  return () => {
    EventBus.off("USER_JOINED");
  };
}, []);