import './TattantLogo.css'

export default function TattantLogo({ className = '', markOnly = false }) {
    return (
        <span className={`tattant-logo ${markOnly ? 'tattant-logo--mark-only' : ''} ${className}`.trim()} aria-label="Tattant">
            <svg className="tattant-logo__mark" viewBox="0 0 48 48" role="img" aria-hidden="true">
                <circle className="tattant-logo__disc" cx="24" cy="24" r="21" />
                <circle className="tattant-logo__sun" cx="34" cy="14" r="5" />
                <path className="tattant-logo__t" d="M13 14h22v6h-8v18h-6V20h-8z" />
                <path className="tattant-logo__path" d="M15 32c5.7 4.4 12.3 4.4 18 0" />
            </svg>
            {!markOnly && <span className="tattant-logo__word">Tattant</span>}
        </span>
    )
}
