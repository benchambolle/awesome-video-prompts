"use client"

import { useState, useEffect } from "react"

export default function useWindowWidth() {
  const [windowWidth, setWindowWidth] = useState<number>(0)

  useEffect(() => {
    // Function to update window width
    const updateWindowWidth = () => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial width
    updateWindowWidth()

    // Add event listener
    window.addEventListener("resize", updateWindowWidth)

    // Cleanup
    return () => window.removeEventListener("resize", updateWindowWidth)
  }, [])

  return { windowWidth }
}
