

## Plan: Add More RSS Feed Sources

Add 17 new sites to the `RSS_FEEDS` array in `src/config.ts`. Each site gets a standard RSS/feed URL based on their known feed patterns. No keyword or logic changes.

### Changes: `src/config.ts`

Replace the current 6-feed `RSS_FEEDS` array with an expanded list including all requested sites. Keep the existing working feeds (ET, Us Weekly, Reality Tea, Screen Rant) and replace broken ones (People 403, E! News 404):

**New feeds to add:**
| Site | RSS URL |
|------|---------|
| TMZ | `https://www.tmz.com/rss.xml` |
| Page Six | `https://pagesix.com/feed/` |
| Radar Online | `https://radaronline.com/feed/` |
| Reality Blurb | `https://realityblurb.com/feed/` |
| The Ashley's Reality Roundup | `https://www.theashleysrealityroundup.com/feed/` |
| TV Insider | `https://www.tvinsider.com/feed/` |
| Reality TV World | `https://www.realitytvworld.com/realitytvworld.xml` |
| Nicki Swift | `https://www.nickiswift.com/feed/` |
| Monsters & Critics | `https://www.monstersandcritics.com/feed/` |
| Distractify | `https://www.distractify.com/feed` |
| Soap Dirt | `https://soapdirt.com/feed/` |
| Heavy | `https://heavy.com/feed/` |
| PopCulture | `https://popculture.com/feed/` |
| Showbiz Cheat Sheet | `https://www.cheatsheet.com/feed/` |

**Kept from existing:** Entertainment Tonight, Us Weekly, Reality Tea, Screen Rant

**Removed (broken):** People (403), E! News (404)

That's it -- config-only change, no edge function or UI modifications needed.

