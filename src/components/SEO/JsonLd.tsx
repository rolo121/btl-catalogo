type JsonLdPrimitive = string | number | boolean | null | undefined

type JsonLdValue =
  | JsonLdPrimitive
  | JsonLdObject
  | JsonLdValue[]

type JsonLdObject = {
  [key: string]: JsonLdValue
}

type JsonLdProps = {
  data: JsonLdObject | JsonLdObject[]
}

function safeJsonStringify(data: JsonLdObject) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
}

export default function JsonLd({ data }: JsonLdProps) {
  const jsonLd: JsonLdObject = Array.isArray(data)
    ? {
        '@context': 'https://schema.org',
        '@graph': data,
      }
    : {
        '@context': 'https://schema.org',
        ...data,
      }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonStringify(jsonLd),
      }}
    />
  )
}