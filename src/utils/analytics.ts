
import ReactGA from "react-ga4";

const TRACKING_ID = import.meta.env.VITE_GA_TRACKING_ID || "";

export const initGA = () => {
  if (TRACKING_ID) {
    ReactGA.initialize(TRACKING_ID);
    console.log("GA4 Initialized");
  } else {
    // Just a log, no warning to avoid console clutter for dev environments
    console.log("GA4 Tracking ID not found. Analytics disabled.");
  }
};

export const logPageView = () => {
  ReactGA.send({ hitType: "pageview", page: window.location.pathname + window.location.search });
};

export const logEvent = (category: string, action: string, label?: string) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};
