"use client"

import { useState, useEffect } from "react"

export interface DeviceInfo {
  isMobile: boolean
  isTablet: boolean
  isDesktop: boolean
  width: number
  height: number
}

export function useDevice(): DeviceInfo {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: 1024,
    height: 768,
  })

  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      const isMobile = width < 768
      const isTablet = width >= 768 && width < 1024
      const isDesktop = width >= 1024

      setDeviceInfo({
        isMobile,
        isTablet,
        isDesktop,
        width,
        height,
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
