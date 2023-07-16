import { Dictionary } from "@reduxjs/toolkit";
import React, { createContext, useCallback, useEffect, useRef } from "react";
import { useAppDispatch } from "../../store";
import { setPostRead } from "../post/postSlice";
import { useIonViewDidEnter, useIonViewWillLeave } from "@ionic/react";

interface IFeedScrollObserverContext {
  // used for determining whether page needs to be scrolled up first
  observe: (feedItem: HTMLElement) => void;
  unobserve: (feedItem: HTMLElement) => void;
}

export const FeedScrollObserverContext =
  createContext<IFeedScrollObserverContext>({
    observe: () => {},
    unobserve: () => {},
  });

interface FeedScrollObserverProps {
  children: React.ReactNode;
}

export default function FeedScrollObserver({
  children,
}: FeedScrollObserverProps) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const intersectingById = useRef<Dictionary<boolean>>({});
  const dispatch = useAppDispatch();

  const visibleRef = useRef(false);

  useIonViewDidEnter(() => {
    visibleRef.current = true;
  });

  useIonViewWillLeave(() => {
    visibleRef.current = false;
  });

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (!visibleRef.current) return;

        for (const entry of entries) {
          const id = entry.target.getAttribute("data-postid");

          if (!id) return;

          if (
            intersectingById.current[id] &&
            intersectingById.current[id] === !entry.isIntersecting
          ) {
            if (!document.body.contains(entry.target)) return;

            // 16 instead of 0 for weird Safari bug where intersection observer reports
            // hidden earlier than expected (usually like 8px)
            if (entry.target.getBoundingClientRect().top > 16) return;

            const idAsNumber = +id;
            if (!isNaN(idAsNumber)) dispatch(setPostRead(idAsNumber));

            // console.log(
            //   entry.target.querySelector('[class*="-Title"]')?.textContent
            // );
          }
          intersectingById.current[id] = entry.isIntersecting;
        }
      },
      {
        rootMargin: "0px",
      }
    );

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [dispatch]);

  const observe = useCallback((element: HTMLElement) => {
    observerRef.current?.observe(element);
  }, []);

  const unobserve = useCallback((element: HTMLElement) => {
    observerRef.current?.unobserve(element);

    const id = element.getAttribute("data-postid");
    if (id) delete intersectingById.current[id];
  }, []);

  return (
    <FeedScrollObserverContext.Provider value={{ observe, unobserve }}>
      {children}
    </FeedScrollObserverContext.Provider>
  );
}
