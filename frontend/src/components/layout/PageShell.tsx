import { usePageTitle } from '../../hooks/usePageTitle'
import { Container } from './Container'
import { ButtonLink } from '../ui/Button'

type PageShellProps = {
  title: string
  documentTitle: string
  description: string
  action: {
    to: string
    label: string
  }
}

export function PageShell({
  title,
  documentTitle,
  description,
  action,
}: PageShellProps) {
  usePageTitle(documentTitle)

  return (
    <main
      id="main"
      className="relative z-10 pt-[calc(var(--header-h)+48px)] pb-20"
    >
      <Container>
        <h1 className="font-heading text-3xl font-bold md:text-4xl">{title}</h1>
        <p className="mt-4 max-w-2xl text-text-muted">{description}</p>
        <div className="mt-8">
          <ButtonLink to={action.to}>{action.label}</ButtonLink>
        </div>
      </Container>
    </main>
  )
}
