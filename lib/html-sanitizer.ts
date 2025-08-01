import DOMPurify from "isomorphic-dompurify"

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "div",
      "span",
      "p",
      "br",
      "strong",
      "em",
      "u",
      "i",
      "b",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "ul",
      "ol",
      "li",
      "a",
      "img",
      "button",
      "input",
      "textarea",
      "select",
      "option",
      "table",
      "tr",
      "td",
      "th",
      "thead",
      "tbody",
      "canvas",
      "svg",
      "path",
      "circle",
      "rect",
      "line",
    ],
    ALLOWED_ATTR: [
      "class",
      "id",
      "style",
      "title",
      "alt",
      "src",
      "href",
      "target",
      "data-interaction-id",
      "data-interaction-type",
      "data-interaction-value",
      "data-learning-objective",
      "data-difficulty-level",
      "data-correct-answer",
      "value",
      "placeholder",
      "type",
      "disabled",
      "readonly",
    ],
    ALLOW_DATA_ATTR: true,
    SANITIZE_DOM: true,
    RETURN_DOM: false,
    RETURN_DOM_FRAGMENT: false,
    RETURN_TRUSTED_TYPE: false,
  })
}
