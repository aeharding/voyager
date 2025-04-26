import { render, screen } from "@testing-library/react";
import { Provider } from "react-redux";
import { expect, it } from "vitest";

import store from "#/store";

import Markdown from "./Markdown";

// Test case to verify subscript link rendering
it("renders a subscript link with the correct href", () => {
  const link = "https://example.com/link";
  const markdownContent = `~${link}~`;

  render(
    <Provider store={store}>
      <Markdown id="test">{markdownContent}</Markdown>
    </Provider>,
  );

  // Query for the link element
  const linkElement = screen.getByRole("link", { name: link });

  // Assert that the link has the correct href
  expect(linkElement.getAttribute("href")).toBe(link);
});
