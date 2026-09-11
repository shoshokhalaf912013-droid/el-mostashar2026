import React, { useEffect, useState } from "react"

import LiveClassroom from "../../live/pages/LiveClassroom"

export default function StudentLiveRoomWrapper() {

  const [token, setToken] = useState(null)
  const [url, setUrl] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {

    let mounted = true

    async function getToken() {

      try {

        const res = await fetch(
          "http://localhost:5000/api/live/token?room=test-room&username=student1"
        )

        const data = await res.json()

        if (!mounted) return

        if (!data.token || !data.url) {

          console.error("Token API error:", data)
          setError("Failed to get live classroom token")
          return

        }

        setToken(data.token)
        setUrl(data.url)

      } catch (err) {

        console.error("LiveKit connection error:", err)

        if (mounted) {
          setError("Live server connection failed")
        }

      } finally {

        if (mounted) {
          setLoading(false)
        }

      }

    }

    getToken()

    return () => {
      mounted = false
    }

  }, [])

  if (loading) {
    return <div>Loading classroom...</div>
  }

  if (error) {
    return <div>{error}</div>
  }

  if (!token || !url) {
    return <div>Live classroom unavailable</div>
  }

  return (

    <LiveClassroom 
      token={token}
      url={url}
    />

  )

}