const businesses: Record<string, string> = {
    "smartcommerce-demo": "a4273c3b-2f62-4b8f-98b0-38e8af4e5085",
    "gaming-store": "8cc9cfa3-8159-462b-bd21-8619d5d82755",
    "home-living-store": "47aa6ef6-16dc-4999-8047-0812012c998b",
};

export function getBusinessId(slug?: string): string | undefined {
    if (!slug) {
        return import.meta.env.VITE_BUSINESS_ID;
    }

    return businesses[slug];
}
