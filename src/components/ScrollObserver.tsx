import styled from "@emotion/styled";
import React, { useRef, useEffect } from "react";

const Container = styled.div`
  height: 10px;
`;

type ScrollObserverProps = {
  onScrollIntoView: () => void;
};

const ScrollObserver: React.FC<ScrollObserverProps> = ({
  onScrollIntoView,
}) => {
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;

    const handleIntersection: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          onScrollIntoView();
        }
      });
    };

    const observer = new IntersectionObserver(handleIntersection);

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [onScrollIntoView]);

  return <Container ref={elementRef}></Container>;
};

export default ScrollObserver;
