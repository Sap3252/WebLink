import { useState } from "react";

// Asks for confirmation, runs the delete and keeps track of its state.
// On success the item usually disappears (its component unmounts), so `deleting`
// only goes back to false when the delete fails.
export function useConfirmedDelete(
    onDelete: (() => Promise<void>) | undefined,
    confirmMessage: string,
) {
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<unknown>(null);

    async function confirmAndDelete() {
        if (!onDelete || !window.confirm(confirmMessage)) {
            return;
        }

        setDeleting(true);
        setError(null);

        try {
            await onDelete();
        } catch (err) {
            setError(err);
            setDeleting(false);
        }
    }

    return { deleting, error, confirmAndDelete };
}
