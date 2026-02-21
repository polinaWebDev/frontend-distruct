export const COSMETIC_TYPES = ['profile_background', 'profile_frame', 'avatar_outline'] as const;

export type CosmeticType = (typeof COSMETIC_TYPES)[number];

export type ProfileCosmetic = {
    id: string;
    name: string;
    description: string;
    type: CosmeticType;
    asset_url?: string | null;
    is_active?: boolean;
    source_type?: string | null;
    source_id?: string | null;
    user_id?: string | null;
    is_owned?: boolean;
    is_equipped?: boolean;
};

export type ParsedMyCosmetics = {
    items: ProfileCosmetic[];
    equippedByType: Record<CosmeticType, string | null>;
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

const toStr = (value: unknown): string | undefined =>
    typeof value === 'string' && value.trim() ? value : undefined;

const toBool = (value: unknown): boolean | undefined =>
    typeof value === 'boolean' ? value : undefined;

const toCosmeticType = (value: unknown): CosmeticType | undefined => {
    if (typeof value !== 'string') return undefined;
    const normalized = value.trim().toLowerCase();
    if ((COSMETIC_TYPES as readonly string[]).includes(normalized)) {
        return normalized as CosmeticType;
    }
    return undefined;
};

const extractArrayCandidates = (payload: unknown): unknown[] => {
    if (Array.isArray(payload)) return payload;
    if (!isRecord(payload)) return [];

    const keys = [
        'data',
        'items',
        'list',
        'results',
        'cosmetics',
        'owned',
        'owned_cosmetics',
        'profile_backgrounds',
        'profile_frames',
        'avatar_outlines',
    ];

    const merged: unknown[] = [];
    const unique = new Set<string>();

    for (const key of keys) {
        const value = payload[key];
        if (!Array.isArray(value)) continue;

        for (const item of value) {
            if (!isRecord(item)) {
                merged.push(item);
                continue;
            }

            const id = toStr(item.id) ?? toStr(item.cosmetic_id);
            if (!id) {
                merged.push(item);
                continue;
            }

            if (unique.has(id)) continue;
            unique.add(id);
            merged.push(item);
        }
    }

    return merged;
};

const parseItem = (item: unknown): ProfileCosmetic | null => {
    if (!isRecord(item)) return null;

    const id = toStr(item.id) ?? toStr(item.cosmetic_id);
    const type = toCosmeticType(item.type ?? item.cosmetic_type);
    if (!id || !type) return null;

    return {
        id,
        name: toStr(item.name) ?? toStr(item.title) ?? id,
        description: toStr(item.description) ?? '',
        type,
        asset_url: toStr(item.asset_url ?? item.url ?? item.image_url) ?? null,
        is_active: toBool(item.is_active),
        source_type: toStr(item.source_type) ?? null,
        source_id: toStr(item.source_id) ?? null,
        user_id: toStr(item.user_id) ?? null,
        is_owned: toBool(item.is_owned ?? item.owned),
        is_equipped: toBool(item.is_equipped),
    };
};

const isProfileCosmetic = (item: ProfileCosmetic | null): item is ProfileCosmetic => item !== null;

const extractEquippedIds = (payload: unknown): Record<CosmeticType, string | null> => {
    const equippedByType: Record<CosmeticType, string | null> = {
        profile_background: null,
        profile_frame: null,
        avatar_outline: null,
    };
    if (!isRecord(payload)) return equippedByType;

    equippedByType.profile_background = toStr(payload.equipped_profile_background_id) ?? null;
    equippedByType.profile_frame = toStr(payload.equipped_profile_frame_id) ?? null;
    equippedByType.avatar_outline = toStr(payload.equipped_avatar_outline_id) ?? null;

    const equipped = payload.equipped;
    if (isRecord(equipped)) {
        equippedByType.profile_background =
            toStr(equipped.profile_background_id ?? equipped.profile_background) ??
            equippedByType.profile_background;
        equippedByType.profile_frame =
            toStr(equipped.profile_frame_id ?? equipped.profile_frame) ??
            equippedByType.profile_frame;
        equippedByType.avatar_outline =
            toStr(equipped.avatar_outline_id ?? equipped.avatar_outline) ??
            equippedByType.avatar_outline;
    }

    const user = payload.user;
    if (isRecord(user)) {
        equippedByType.profile_background =
            toStr(user.equipped_profile_background_id) ?? equippedByType.profile_background;
        equippedByType.profile_frame =
            toStr(user.equipped_profile_frame_id) ?? equippedByType.profile_frame;
        equippedByType.avatar_outline =
            toStr(user.equipped_avatar_outline_id) ?? equippedByType.avatar_outline;
    }

    return equippedByType;
};

export const parseMyCosmeticsResponse = (payload: unknown): ParsedMyCosmetics => {
    const items = extractArrayCandidates(payload).map(parseItem).filter(isProfileCosmetic);
    const equippedByType = extractEquippedIds(payload);

    const itemsWithEquipState = items.map((item) => ({
        ...item,
        is_equipped:
            item.is_equipped === true || equippedByType[item.type] === item.id || item.is_equipped,
    }));

    return {
        items: itemsWithEquipState,
        equippedByType,
    };
};

export const parseAdminCosmeticsResponse = (payload: unknown): ProfileCosmetic[] =>
    extractArrayCandidates(payload).map(parseItem).filter(isProfileCosmetic);
