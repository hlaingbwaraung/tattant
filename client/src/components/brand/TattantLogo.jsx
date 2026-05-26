import './TattantLogo.css'

export default function TattantLogo({ className = '', markOnly = false }) {
    return (
        <span className={`tattant-logo ${markOnly ? 'tattant-logo--mark-only' : ''} ${className}`.trim()} aria-label="Tattant">
            <svg className="tattant-logo__mark" viewBox="0 0 64 64" role="img" aria-hidden="true">
                <defs>
                    <linearGradient id="tattant-logo-bg" x1="8" y1="5" x2="58" y2="62" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#151a2a" />
                        <stop offset="1" stopColor="#07080d" />
                    </linearGradient>
                    <linearGradient id="tattant-logo-sun" x1="20" y1="12" x2="48" y2="44" gradientUnits="userSpaceOnUse">
                        <stop offset="0" stopColor="#ffe08a" />
                        <stop offset="1" stopColor="#c98f18" />
                    </linearGradient>
                </defs>
                <rect className="tattant-logo__badge" x="5" y="5" width="54" height="54" rx="15" />
                <circle className="tattant-logo__sun" cx="38" cy="27" r="15" />
                <path className="tattant-logo__gate" d="M17 20h30v7h-10v22h-8V27H17z" />
                <path className="tattant-logo__route" d="M17 43c8 5.7 21.5 5.7 30 0" />
                <circle className="tattant-logo__pin" cx="49" cy="16" r="5" />
            </svg>
            {!markOnly && <span className="tattant-logo__word">Tattant</span>}
        </span>
    )
}
