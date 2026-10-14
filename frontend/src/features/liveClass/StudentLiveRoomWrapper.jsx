import React, {
  useEffect,
  useState,
} from "react";

import {
  useAuth,
} from "../../contexts/AuthContext";

import LiveClassroom from "../../live/pages/LiveClassroom";

export default function StudentLiveRoomWrapper() {

  const {
    user,
    loading: authLoading,
  } = useAuth();

  const [token, setToken] = useState(null);
  const [url, setUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {

    if (authLoading) {
      return;
    }

    let mounted = true;


    async function getToken() {

      try {

        if (!user?.uid) {

          if (mounted) {
            setError("Student authentication is required");
            setLoading(false);
          }

          return;
        }


        /*
        =====================================================
        IMPORTANT

        Every student MUST have a unique LiveKit identity.

        Before:
        student1

        Now:
        Firebase Auth UID
        =====================================================
        */

        const identity = String(
          user.uid
        );


        const tokenUrl =
          `http://localhost:5000/api/live/token` +
          `?room=test-room` +
          `&username=${encodeURIComponent(identity)}`;


        console.log(
          "LIVEKIT STUDENT IDENTITY:",
          identity
        );


        const res =
          await fetch(tokenUrl);


        const data =
          await res.json();


        if (!mounted) {
          return;
        }


        if (
          !res.ok ||
          !data.token ||
          !data.url
        ) {

          console.error(
            "Token API error:",
            data
          );

          setError(
            "Failed to get live classroom token"
          );

          return;
        }


        setToken(
          data.token
        );


        setUrl(
          data.url
        );

      } catch (err) {

        console.error(
          "LiveKit connection error:",
          err
        );

        if (mounted) {

          setError(
            "Live server connection failed"
          );

        }

      } finally {

        if (mounted) {

          setLoading(
            false
          );

        }

      }

    }


    getToken();


    return () => {

      mounted = false;

    };

  }, [
    authLoading,
    user,
  ]);


  if (authLoading) {

    return (
      <div>
        Loading classroom...
      </div>
    );

  }


  if (loading) {

    return (
      <div>
        Loading classroom...
      </div>
    );

  }


  if (error) {

    return (
      <div>
        {error}
      </div>
    );

  }


  if (!token || !url) {

    return (
      <div>
        Live classroom unavailable
      </div>
    );

  }


  return (

    <LiveClassroom
      token={token}
      url={url}
      readOnly={true}
    />

  );

}

