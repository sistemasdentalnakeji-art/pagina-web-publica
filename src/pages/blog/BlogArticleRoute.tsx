// ─────────────────────────────────────────────────────────────────────────────
// ARTÍCULO "RUTA DEL TEMA": el diseño de los 14 artículos del blog (aprobado por el dueño, 12 nov 2026).
// • Portada: la foto del servicio de fondo y, encima, migas, título, entradilla, fecha, minutos y "Tema · 1 de 4".
// • Debajo, tres columnas: la ruta del tema (los artículos de su categoría, el actual marcado), la hoja de lectura blanca
//   (respuesta breve y las secciones abiertas, sin acordeón) y la tarjeta "Siguiente en el tema".
// • El siguiente es el que sigue en el blog; si el tema se acaba, el primero del tema siguiente ("Siguiente tema").
// • En celular: portada, hoja, siguiente y la ruta al final. Estilos → src/styles/pages/blog-route.css.
// ─────────────────────────────────────────────────────────────────────────────

import '@/styles/pages/blog-route.css'
import { Band } from '@/components/decor/Band'
import { PagePlasma } from '@/components/decor/PagePlasma'
import { Icon } from '@/components/ui/Icon'
import { TextBlurReveal } from '@/components/ui/TextBlurReveal'
import { routeOf, type RouteDef } from '@/config/routes'
import { UI } from '@/data/ui'
import { BlogCrumbs } from '@/pages/blog/BlogCrumbs'
import {
  articlesIn,
  BLOG,
  BLOG_DATE,
  formatDate,
  keyOf,
  linksIn,
  paragraphsOf,
  photoOf,
  photoSrcSetOf,
  readingMinutes,
  type Article,
} from '@/pages/blog/blogData'

/** Nombre corto para la ruta: lo que va antes de los dos puntos ("Implantes dentales: qué son…" → "Implantes dentales"). */
const shortTitle = (title: string) => title.split(':')[0]

export function BlogArticleRoute({ route, article }: { route: RouteDef; article: Article }) {
  const { lang } = route
  const ui = UI[lang].blog
  const key = keyOf(article)
  const categories = BLOG[lang].categories
  const category = categories.find((c) => c.name === article.category)
  const topic = category ? articlesIn(lang, category) : [article]
  const step = topic.findIndex((a) => a.route === article.route) + 1
  const all = categories.flatMap((c) => articlesIn(lang, c))
  const next = all[(all.findIndex((a) => a.route === article.route) + 1) % all.length]
  const nextKey = keyOf(next)
  const stepLabel = ui.step(step, topic.length)
  const trail: { label: string; href?: string }[] = [{ label: 'Blog', href: routeOf('blog', lang).path }]
  if (category) trail.push({ label: category.name, href: category.route })
  trail.push({ label: article.title })

  return (
    <Band tone="gradient" labelledBy="articulo-titulo" className="blog-head blog-dark band--clip art" decor={<PagePlasma />}>
      <header className="container art-hero">
        <img
          className="art-hero__img"
          src={photoOf(key)}
          srcSet={photoSrcSetOf(key)}
          sizes="(max-width: 1400px) 100vw, 1400px"
          alt=""
          fetchPriority="high"
          width={1280}
          height={720}
        />
        <div className="art-hero__text">
          <BlogCrumbs trail={trail} />
          <h1 id="articulo-titulo" className="art-hero__title">
            <TextBlurReveal text={article.title} />
          </h1>
          <p className="art-hero__lead">{article.lead}</p>
          <p className="art-hero__stamp">
            <span>{formatDate(BLOG_DATE, ui.dateLocale)}</span>
            <span className="art-hero__time">
              <Icon name="clock" size={16} />
              {ui.minutes(readingMinutes(article))}
            </span>
            {category && <span className="art-hero__step">{`${category.name} · ${stepLabel}`}</span>}
          </p>
        </div>
      </header>

      <div className="container art-body">
        <nav className="art-path" aria-label={ui.inCategory}>
          <p className="art-path__label">
            {category ? <a href={category.route}>{category.name}</a> : article.category}
            <span>{stepLabel}</span>
          </p>
          <ol className="art-path__list">
            {topic.map((a) => (
              <li key={a.route}>
                <a href={a.route} aria-current={a.route === article.route ? 'page' : undefined}>
                  {shortTitle(a.title)}
                </a>
              </li>
            ))}
          </ol>
        </nav>

        <article className="art-sheet" aria-labelledby="articulo-titulo">
          <section className="art-sheet__answer" aria-labelledby="articulo-respuesta">
            <h2 id="articulo-respuesta">{ui.answer.replace(/\.$/, '')}</h2>
            <p>{article.answer}</p>
          </section>
          {article.sections.map((s, i) => (
            <section key={s.title} className="art-sheet__section" aria-labelledby={`seccion-${i + 1}`}>
              <h2 id={`seccion-${i + 1}`}>{s.title}</h2>
              {paragraphsOf(s).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </section>
          ))}
          <footer className="art-sheet__end">
            <div className="art-sources">
              <h2 className="art-sources__title">{ui.sources.replace(/:$/, '')}</h2>
              <ul className="art-sources__list">
                {linksIn(article.sources).map((l) => {
                  const [org, ...rest] = l.label.split(', ')
                  return (
                    <li key={l.href}>
                      <a className="art-source" href={l.href} target="_blank" rel="noopener noreferrer">
                        <span className="art-source__text">
                          <span className="art-source__org">{org}</span>
                          {rest.length > 0 && <span className="art-source__topic">{rest.join(', ')}</span>}
                          <span className="art-source__host">{new URL(l.href).hostname.replace(/^www./, '')}</span>
                        </span>
                        <Icon name="arrowRight" size={18} className="art-source__go" />
                      </a>
                    </li>
                  )
                })}
              </ul>
            </div>
          </footer>
        </article>

        <aside className="art-next-wrap">
          <a className="art-next" href={next.route}>
            <img className="art-next__img" src={`/images/servicios/640/${photoOf(nextKey).split('/').at(-1)}`} alt="" loading="lazy" width={640} height={360} />
            <span className="art-next__title">{next.title}</span>
            <span className="art-next__label">
              {next.category === article.category ? ui.nextInTopic : ui.nextTopic}
              <Icon name="arrowRight" size={18} />
            </span>
          </a>
        </aside>
      </div>
    </Band>
  )
}
