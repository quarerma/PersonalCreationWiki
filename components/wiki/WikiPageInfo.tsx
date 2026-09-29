import { InfoFieldValue, PageInfo } from "@/lib/wiki/load-page-info"
import { WikiLinkText } from "@/components/wiki/WikiLinkText"

interface WikiPageInfoProps {
  info: PageInfo
}

function InfoFieldContent({ value }: { value: InfoFieldValue }) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-0.5 pl-4">
        {value.map((item, index) => (
          <li key={index}>
            <WikiLinkText text={item} />
          </li>
        ))}
      </ul>
    )
  }

  if (typeof value === "number") {
    return <>{value}</>
  }

  return <WikiLinkText text={value} />
}

export function WikiPageInfo({ info }: WikiPageInfoProps) {
  return (
    <div className="space-y-4">
      {info.sections.map((section) => (
        <section
          key={section.title}
          className="overflow-hidden border border-border"
        >
          <h2 className="bg-muted px-3 py-2 text-center text-sm font-semibold">
            {section.title}
          </h2>
          <dl>
            {section.fields.map((field, index) => (
              <div key={field.key}>
                {index > 0 && (
                  <div className="border-t border-border" aria-hidden />
                )}
                <div className="grid grid-cols-[minmax(0,42%)_minmax(0,1fr)] gap-x-3 px-3 py-2 text-sm">
                  <dt className="font-bold">{field.key}</dt>
                  <dd>
                    <InfoFieldContent value={field.value} />
                  </dd>
                </div>
              </div>
            ))}
          </dl>
        </section>
      ))}
    </div>
  )
}
