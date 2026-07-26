# Astro Error Analysis

## Before

- Command: `npx astro check`
- Exit: 1
- Error code: `TS2322`
- File: `src/pages/วิธีการรับซื้อ.astro`
- Location: line 104, column 3
- Expression: `schemaExtras={schemaExtras}`
- Message: array type still allowed `null`, so it was not assignable to `Record<string, unknown>[]`

Original code:

```ts
const schemaExtras = [createFAQSchema(pageUrl, faqs)].filter(Boolean);
```

`createFAQSchema()` returns a schema object or `null`. In this context TypeScript did not narrow the array element type after `.filter(Boolean)`.

## Exact fix

```ts
const faqSchema = createFAQSchema(pageUrl, faqs);
const schemaExtras = faqSchema ? [faqSchema] : [];
```

The conditional narrows `faqSchema` before array construction. No broad assertion or `as any` is used. The FAQ data, visible content, H1, URL, canonical, internal links, layout and structured-data output remain unchanged.

## After

- Command: `npx astro check`
- Exit: 0
- Errors: 0
- Warnings: 0
- Hints: 46 pre-existing hints outside this recovery scope
