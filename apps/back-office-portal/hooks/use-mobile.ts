import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MOBILE_QUERY = `(max-width: ${MOBILE_BREAKPOINT - 1}px)`

function subscribe(onStoreChange: () => void) {
  const mql = window.matchMedia(MOBILE_QUERY)
  mql.addEventListener("change", onStoreChange)
  return () => mql.removeEventListener("change", onStoreChange)
}

/**
 * The viewport is external state, so it is read through useSyncExternalStore rather than
 * useState.
 *
 * A lazy useState initializer calling matchMedia() reads the real viewport on the very
 * first client render, which is the hydration render — on a narrow screen it returned true
 * while the server had already committed to false, so <Sidebar> hydrated its Sheet branch
 * against server HTML holding the desktop <div>, and React threw a hydration mismatch.
 *
 * getServerSnapshot pins the hydration render to false to match the server, and React
 * re-reads getSnapshot immediately afterwards: a phone still lands on the mobile branch,
 * one render later. Desktop, meanwhile, settles in a single render rather than the extra
 * pass an effect-based version costs.
 */
export function useIsMobile() {
  return React.useSyncExternalStore(
    subscribe,
    () => window.matchMedia(MOBILE_QUERY).matches,
    () => false
  )
}
