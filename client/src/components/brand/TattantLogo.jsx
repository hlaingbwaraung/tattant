import './TattantLogo.css'

export default function TattantLogo({ className = '', markOnly = false }) {
    return (
        <span className={`tattant-logo ${markOnly ? 'tattant-logo--mark-only' : ''} ${className}`.trim()} aria-label="Tattant">
            <svg className="tattant-logo__mark" viewBox="0 0 48 48" role="img" aria-hidden="true">
                <rect className="tattant-logo__frame" x="4" y="4" width="40" height="40" rx="13" />
                <rect className="tattant-logo__plate" x="6.5" y="6.5" width="35" height="35" rx="11" />
                <circle className="tattant-logo__sun" cx="35" cy="13" r="5.5" />
                <path className="tattant-logo__route" d="M14 32c5.6-6.9 14.4-6.9 20 0" />
                <path className="tattant-logo__t" d="M15 15h19v5.3h-6.5V34h-6V20.3H15z" />
                <path className="tattant-logo__spark" d="M18.8 36.2h10.4" />
            </svg>
            {!markOnly && <span className="tattant-logo__word">Tattant</span>}
        </span>
    )
}
