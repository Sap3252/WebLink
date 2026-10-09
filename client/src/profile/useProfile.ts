import type { Profile } from "../lib/types";
import { useApiResource } from "../lib/useApiResource";

export function useProfile(username: string) {
    const { data, setData, loading, error } = useApiResource<Profile>(
        `/users/${encodeURIComponent(username)}`,
    );

    return { profile: data, setProfile: setData, loading, error };
}
