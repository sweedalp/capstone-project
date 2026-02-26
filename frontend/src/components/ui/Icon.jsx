/**
 * Icon – thin wrapper around Material Symbols Outlined.
 * @param {string}  name      Material Symbol identifier
 * @param {string}  className Extra Tailwind classes (default: 'text-xl')
 * @param {boolean} filled    Render filled variant
 */
export default function Icon({ name, className = 'text-xl', filled = false }) {
  return (
    <span className={`material-symbols-outlined ${filled ? 'fill-icon' : ''} ${className}`}>
      {name}
    </span>
  )
}