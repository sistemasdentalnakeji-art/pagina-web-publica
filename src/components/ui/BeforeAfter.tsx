// Comparador antes/después: dos recortes encimados; la línea dorada se arrastra (o se mueve con las flechas, es un
// <input type="range">) y descubre el "después". Datos → src/data/beforeAfter.ts. Estilos → service.css.
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { useLang } from '@/app/lang'
import { motionOff } from '@/lib/motion'
import { BEFORE_AFTER_TEXT, type BeforeAfterCrop, type BeforeAfterPhoto } from '@/data/beforeAfter'

// La foto se escala para que el recorte llene la caja y se desplaza hasta él.
const cropStyle = (c: BeforeAfterCrop): CSSProperties => ({
  width: `${(c.width / c.w) * 100}%`,
  height: `${(c.height / c.h) * 100}%`,
  left: `${(-c.x / c.w) * 100}%`,
  top: `${(-c.y / c.h) * 100}%`,
})

export function BeforeAfter({ photo }: { photo: BeforeAfterPhoto }) {
  const lang = useLang()
  const text = BEFORE_AFTER_TEXT[lang]
  const [pos, setPos] = useState(50)
  const { before, after } = photo
  const fig = useRef<HTMLElement>(null)
  const hold = useRef(false) // true mientras el cursor está encima o el control tiene foco: el barrido espera
  const taken = useRef(false) // la persona ya lo movió (toque o arrastre): el barrido no vuelve a arrancar

  // La línea barre sola de lado a lado (ida y vuelta) mientras se ve en pantalla; al tocarla, la persona toma el control.
  useEffect(() => {
    const el = fig.current
    if (!el || motionOff()) return
    let raf = 0
    let last = 0
    let t = 0
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(now - last, 50)
      last = now
      if (hold.current || taken.current) return
      t += dt
      setPos(50 + 45 * Math.sin((t / 6000) * Math.PI * 2)) // vaivén de 5 % a 95 %, ~6 s por vuelta
    }
    const io = new IntersectionObserver(([e]) => {
      cancelAnimationFrame(raf)
      if (e.isIntersecting) {
        last = performance.now()
        raf = requestAnimationFrame(tick)
      }
    })
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div className="before-after-wrap">
      <figure
        ref={fig}
        className="before-after"
        onPointerDown={() => (taken.current = true)}
        onPointerEnter={() => (hold.current = true)}
        onPointerLeave={() => (hold.current = false)}
        onFocus={() => (hold.current = true)}
        onBlur={() => (hold.current = false)}
        style={{ '--pos': `${pos}%`, aspectRatio: `${before.w} / ${before.h}` } as CSSProperties}>
        <img src={before.src} alt={photo.alt[lang]} style={cropStyle(before)} loading="lazy" decoding="async" />
        <div className="before-after__after" aria-hidden="true">
          <img src={after.src} alt="" style={cropStyle(after)} loading="lazy" decoding="async" />
        </div>
        <span className="before-after__tag before-after__tag--before">{text.before}</span>
        <span className="before-after__tag before-after__tag--after">{text.after}</span>
        <span className="before-after__handle" aria-hidden="true" />
        <input
          type="range"
          min={0}
          max={100}
          value={pos}
          aria-label={text.slider}
          onChange={(e) => {
            taken.current = true
            setPos(Number(e.target.value))
          }}
        />
      </figure>
    </div>
  )
}
