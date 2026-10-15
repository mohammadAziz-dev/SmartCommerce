import {useState} from "react";

type PasswordInputProps = {
    id: string;
    label: string;
    value: string;
    onChange: (value: string) => void;
    onBlur?: () => void;
    autoComplete: "current-password" | "new-password";
    minLength?: number;
};

export function PasswordInput({id, label, value, onChange, onBlur, autoComplete, minLength}: PasswordInputProps) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="password-field">
            <label htmlFor={id}>{label}</label>
            <div className="password-input-wrapper">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    onBlur={onBlur}
                    autoComplete={autoComplete}
                    minLength={minLength}
                    required
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setVisible((current) => !current)}
                    aria-label={visible ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}
                    aria-pressed={visible}
                >
                    {visible ? (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M3 3l18 18"/>
                            <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8"/>
                            <path d="M9.9 5.2A10 10 0 0 1 12 5c6.5 0 10 7 10 7a16 16 0 0 1-3.2 4"/>
                            <path d="M6.2 6.2C3.5 8.2 2 12 2 12s3.5 7 10 7a10 10 0 0 0 4-.8"/>
                        </svg>
                    ) : (
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor"
                             strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/>
                            <circle cx="12" cy="12" r="3"/>
                        </svg>
                    )}
                </button>
            </div>
        </div>
    );
}
