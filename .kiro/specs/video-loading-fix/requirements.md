# Requirements: Video Loading Fix

## Problem Statement
Users report that anime videos do not load properly in the web application. Instead of showing the actual anime videos, the system displays "watch video on YouTube" messages or redirects to YouTube links.

## Current State
Based on code inspection:
1. The anime-api backend has a video resolution system in `/src/utils/resolvers.js`
2. The system supports multiple video hosting providers (StreamWish, VOE, StreamTape, Mixdrop, Doodstream, etc.)
3. The `/resolve` endpoint in `/src/routes/anime.routes.js` is supposed to resolve embed URLs to direct streaming URLs
4. The frontend web application appears to be receiving invalid or unresolved video URLs

## Desired State
1. Anime videos should load correctly from supported video hosting providers
2. The video resolution system should properly extract direct streaming URLs
3. The web application should display actual anime videos, not YouTube fallbacks
4. All video resolution providers should work reliably

## User Stories

### Primary User Story
As an anime viewer, I want to watch anime videos directly on the website so that I don't have to use YouTube or other external platforms.

### Technical User Story
As the system administrator, I want the video resolution system to work reliably across all supported providers so that users have a consistent viewing experience.

## Acceptance Criteria

### Must Have
1. ✅ The `/api/v1/anime/episode` endpoint returns valid video server links
2. ✅ The `/api/v1/anime/resolve` endpoint successfully resolves embed URLs to direct streaming URLs
3. ✅ At least 3 major video providers (StreamWish, VOE, StreamTape) work reliably
4. ✅ The web application displays actual video players, not YouTube fallbacks

### Should Have
1. ⚠️ Error handling for failed video resolution provides meaningful error messages
2. ⚠️ System logs provide debugging information for video resolution failures
3. ⚠️ Performance improvements for video resolution (parallel resolution attempts)

### Could Have
1. 🔲 Support for additional video providers
2. 🔲 Video quality selection options
3. 🔲 Caching of resolved video URLs

## Constraints
1. Must maintain backward compatibility with existing API endpoints
2. Cannot break existing search and catalog functionality
3. Must work within the existing Express.js and Puppeteer architecture
4. Must handle various anti-scraping measures from video hosting sites

## Dependencies
1. Existing anime service architecture
2. Puppeteer for JavaScript-heavy video sites
3. Current video provider patterns and regexes
4. Frontend web application expecting specific response formats

## Success Metrics
1. Video loading success rate > 90%
2. Average video resolution time < 5 seconds
3. Reduction in "YouTube fallback" reports to zero
4. All major video providers working consistently

## Technical Notes
1. The bug may be related to:
   - Changes in video provider website structures
   - Anti-bot detection from video hosting sites
   - Incorrect regex patterns for new URL formats
   - Puppeteer interception failures
   - Network timeouts or blocking
2. Need to test each video provider individually
3. May need to update user agents, headers, or request patterns
4. Consider implementing retry logic for failed resolutions