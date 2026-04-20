
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean>(
    // Initialize with a check rather than default false
    typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false
  )

  React.useEffect(() => {
    // Function to check if the window width is below the mobile breakpoint
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    
    // Initial check
    checkIsMobile()
    
    // Add event listener for window resize
    window.addEventListener("resize", checkIsMobile)
    
    // Clean up by removing event listener
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  return isMobile
}
