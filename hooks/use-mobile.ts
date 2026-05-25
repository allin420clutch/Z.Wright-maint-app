import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    // Only run on client
    const checkIsMobile = () => window.innerWidth < MOBILE_BREAKPOINT;
    
    // Set initial value inside requestAnimationFrame to avoid synchronous state update in effect body
    let initialUpdateId: number;
    initialUpdateId = requestAnimationFrame(() => {
      setIsMobile(checkIsMobile());
    });

    const onChange = () => {
      setIsMobile(checkIsMobile());
    }
    
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    mql.addEventListener("change", onChange)
    
    return () => {
      cancelAnimationFrame(initialUpdateId);
      mql.removeEventListener("change", onChange)
    }
  }, [])

  return !!isMobile
}
