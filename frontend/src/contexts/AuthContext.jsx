import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getAuth,
  onAuthStateChanged,
} from "firebase/auth";

import {
  doc,
  onSnapshot,
  enableNetwork,
} from "firebase/firestore";

import { db } from "../firebase";

const AuthContext =
  createContext(null);


export function AuthProvider({
  children,
}) {

  const [
    user,
    setUser,
  ] =
    useState(null);

  const [
    role,
    setRole,
  ] =
    useState(null);

  const [
    permissions,
    setPermissions,
  ] =
    useState(null);

  const [
    subscriptionStatus,
    setSubscriptionStatus,
  ] =
    useState(null);

  const [
    subscriptionEnd,
    setSubscriptionEnd,
  ] =
    useState(null);

  const [
    loading,
    setLoading,
  ] =
    useState(true);


  useEffect(() => {

    const auth =
      getAuth();

    let unsubscribeUserDoc = null;

    const unsubscribeAuth =
      onAuthStateChanged(
        auth,
        async (
          firebaseUser
        ) => {

          if (unsubscribeUserDoc) {
            unsubscribeUserDoc();
            unsubscribeUserDoc = null;
          }

          if (!firebaseUser) {

            setUser(null);
            setRole(null);
            setPermissions(null);
            setSubscriptionStatus(null);
            setSubscriptionEnd(null);
            setLoading(false);

            return;
          }

          try {

            setLoading(true);
            setUser(firebaseUser);

            const userRef =
              doc(
                db,
                "users",
                firebaseUser.uid
              );

            /*
             * IMPORTANT
             * -----------------------------------------------
             * Make sure Firestore networking is enabled before
             * subscribing to the live user document.
             */
            try {

              await enableNetwork(
                db
              );

            } catch (
              networkError
            ) {

              console.warn(
                "⚠️ Firestore network enable warning:",
                networkError
              );

            }

            /*
             * IMPORTANT
             * -----------------------------------------------
             * Use a realtime Firestore listener here instead of
             * reading the subscription only once at login.
             *
             * When Super Admin activates/cancels a student's
             * subscription, the student's current page receives
             * the change automatically without requiring a manual
             * Firebase edit or logout/login.
             */
            unsubscribeUserDoc =
              onSnapshot(
                userRef,
                (snap) => {

                  if (!snap.exists()) {

                    console.warn(
                      "User document not found"
                    );

                    setRole(null);
                    setPermissions(null);
                    setSubscriptionStatus(null);
                    setSubscriptionEnd(null);
                    setLoading(false);

                    return;
                  }

                  const userData =
                    snap.data() ||
                    {};

                  const firestoreRole =
                    userData.role ||
                    null;

                  if (!firestoreRole) {

                    console.warn(
                      "Role not found in Firestore"
                    );

                  }

                  const perms = {
                    role:
                      firestoreRole,

                    isSuperAdmin:
                      firestoreRole ===
                      "super-admin",

                    isAdmin:
                      firestoreRole ===
                      "admin",

                    isTeacher:
                      firestoreRole ===
                      "teacher",

                    isStudent:
                      firestoreRole ===
                      "student",
                  };

                  setRole(
                    firestoreRole
                  );

                  setPermissions(
                    perms
                  );

                  setSubscriptionStatus(
                    userData.subscriptionStatus ||
                      null
                  );

                  setSubscriptionEnd(
                    userData.subscriptionEnd ||
                      null
                  );

                  setLoading(false);
                },
                (error) => {

                  console.error(
                    "Auth Firestore listener error:",
                    error
                  );

                  setRole(null);
                  setPermissions(null);
                  setSubscriptionStatus(null);
                  setSubscriptionEnd(null);
                  setLoading(false);
                }
              );

          } catch (
            error
          ) {

            console.error(
              "Auth error:",
              error
            );

            setUser(
              firebaseUser
            );

            setRole(
              null
            );

            setPermissions(
              null
            );

            setSubscriptionStatus(
              null
            );

            setSubscriptionEnd(
              null
            );

            setLoading(
              false
            );

          }

        }
      );

    return () => {
      if (unsubscribeUserDoc) {
        unsubscribeUserDoc();
        unsubscribeUserDoc = null;
      }
      unsubscribeAuth();
    };

  }, []);


  const subscriptionEndDate =
    useMemo(
      () => {

        if (
          !subscriptionEnd
        ) {

          return null;
        }


        try {

          if (
            typeof subscriptionEnd.toDate ===
            "function"
          ) {

            return subscriptionEnd.toDate();

          }


          const date =
            subscriptionEnd instanceof Date
              ? subscriptionEnd
              : new Date(
                  subscriptionEnd
                );


          return Number.isNaN(
            date.getTime()
          )
            ? null
            : date;


        } catch {

          return null;

        }

      },
      [
        subscriptionEnd,
      ]
    );


  const [
    now,
    setNow,
  ] =
    useState(
      () =>
        Date.now()
    );


  useEffect(() => {

    const timer =
      setInterval(
        () =>
          setNow(
            Date.now()
          ),
        60000
      );


    return () =>
      clearInterval(
        timer
      );

  }, []);


  const isSubscriptionActive =
    role !==
      "student"
      ? true
      : subscriptionStatus ===
          "active" &&
        !!subscriptionEndDate &&
        subscriptionEndDate.getTime() >
          now;


  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        permissions,
        loading,
        subscriptionStatus,
        subscriptionEnd,
        subscriptionEndDate,
        isSubscriptionActive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}


export const useAuth =
  () =>
    useContext(
      AuthContext
    );
