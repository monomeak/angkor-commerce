/** Where the favorites list lives. Page 1 stays a clean URL, the way the category grid does it. */
export function favoritesHref(page: number): string {
    return page > 1 ? `/account/favorites?page=${page}` : "/account/favorites";
}
