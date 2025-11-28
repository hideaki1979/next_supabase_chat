export type Profile = {
    id: string;
    username: string | null;
    created_at: string;
    updated_at: string;
}

export type Message = {
    id: string;
    user_id: string;
    content: string;
    created_at: string;
    updated_at: string;
    is_edited: string;
}

export type MessageWithProfile = Message & {
    profiles: Profile;
}