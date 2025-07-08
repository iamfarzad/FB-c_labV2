"use client"

import { useState, useEffect } from "react"

interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  screenWidth: number
  screenHeight: number
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    screenWidth: 1024,
    screenHeight: 768,
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      setDeviceInfo({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        screenWidth: width,
        screenHeight: height,
      })
    }

    // Initial check
    updateDeviceInfo()

    // Listen for resize events
    window.addEventListener("resize", updateDeviceInfo)

    return () => {
      window.removeEventListener("resize", updateDeviceInfo)
    }
  }, [])

  return deviceInfo
}
