import type { ComponentProps } from "react";
import styles from "./FormField.module.css";

interface FormFieldProps extends ComponentProps<"input"> {
    label: string;
    hint?: string;
}

export function FormField({ label, hint, ...inputProps }: FormFieldProps) {
    return (
        <label className={styles.field}>
            <span>{label}</span>
            <input {...inputProps} />
            {hint && <small className={styles.hint}>{hint}</small>}
        </label>
    );
}
