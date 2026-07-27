# Design: Video Loading Fix

## Overview
This document outlines the approach to fix the video loading issue where anime videos don't load and instead show "watch on YouTube" messages. The problem appears to be in the video URL resolution system.

## Root Cause Analysis

### Suspected Root Causes
Based on the problem description and code inspection:

1. **Video Resolution Failure**: The `resolveEmbedUrl()` function in `/src/utils/resolvers.js` may be failing to extract direct streaming URLs from video hosting sites.

2. **Provider Pattern Changes**: Video hosting providers may have changed their website structure, making existing regex patterns ineffective.

3. **Anti-Bot Measures**: Sites may be detecting and blocking Puppeteer-based scraping attempts.

4. **Network Issues**: Timeouts, blocked requests, or network connectivity problems.

5. **Incorrect URL Formats**: The system may be receiving or expecting different URL formats than what video providers currently use.

## Investigation Plan

### Phase 1: Diagnostic Testing
1. **Test Current Resolution System**
   - Create test cases for each video provider (StreamWish, VOE, StreamTape, etc.)
   - Run the existing resolution functions with known working URLs
   - Document success/failure rates and error messages

2. **Analyze Error Patterns**
   - Check console logs for resolution failures
   - Identify which providers are failing consistently
   - Look for pattern changes in provider websites

3. **Inspect Frontend Behavior**
   - Determine what data the frontend is receiving
   - Identify where YouTube fallback logic is triggered

### Phase 2: Resolution Approach

#### Option A: Fix Existing Resolution System
1. **Update Regex Patterns**: Update patterns to match current provider website structures
2. **Enhance Puppeteer Detection Evasion**: Improve anti-bot evasion techniques
3. **Add Retry Logic**: Implement exponential backoff for failed resolutions
4. **Update User Agents**: Use more current and diverse user agents

#### Option B: Enhanced Resolution Architecture
1. **Modular Provider System**: Create separate modules for each video provider
2. **Multiple Resolution Strategies**: Implement fallback strategies (Puppeteer, regex, API calls)
3. **Caching System**: Cache resolved URLs to reduce repeated resolution attempts
4. **Health Monitoring**: Monitor provider health and automatically switch strategies

#### Option C: Alternative Resolution Methods
1. **External Libraries**: Use libraries like yt-dlp for video extraction
2. **Third-Party APIs**: Use video resolution services
3. **Direct Streaming Proxies**: Implement proxy-based streaming

## Recommended Approach: Option A + Option B Hybrid

### Phase 1: Immediate Fixes
1. **Update Critical Patterns**: Focus on StreamWish, VOE, and StreamTape patterns
2. **Improve Puppeteer Configuration**: Add better evasion techniques and timeouts
3. **Add Detailed Logging**: Log resolution attempts with success/failure details

### Phase 2: Architectural Improvements
1. **Refactor Resolvers**: Move to modular provider-specific resolvers
2. **Implement Retry Logic**: Add intelligent retry with exponential backoff
3. **Add Health Checks**: Monitor provider availability and performance

## Technical Design

### Current Architecture
```
Client → API Endpoint → animeService → resolvers → Video Hosting Sites
        (resolve)       (getEpisodeLinks)  (resolveEmbedUrl)
```

### Proposed Improvements

#### 1. Enhanced Resolver Module (`/src/utils/resolvers.js`)
- Add provider-specific retry logic
- Implement better error handling and fallback
- Add detailed logging with timestamps and success rates
- Update regex patterns based on current website analysis

#### 2. Provider Health Monitoring
- Track success/failure rates per provider
- Automatic provider rotation on high failure rates
- Alerting for persistent failures

#### 3. Client Response Format
- Ensure consistent response format for frontend
- Include error codes and messages for resolution failures
- Provide alternative providers when primary fails

### Specific Changes Needed

#### A. Update `/src/utils/resolvers.js`
1. Add comprehensive logging to `debugLog()` function
2. Update regex patterns for major providers
3. Implement retry logic in `resolveEmbedUrl()`
4. Add timeout handling for Puppeteer operations
5. Update user agents and headers for better compatibility

#### B. Update `/src/routes/anime.routes.js`
1. Add error response formatting for resolution failures
2. Implement provider fallback in `/resolve` endpoint
3. Add rate limiting and request tracking

#### C. Update `/src/services/anime.service.js`
1. Add video resolution success tracking
2. Implement provider preference based on success rates
3. Add cache for frequently requested videos

## Implementation Plan

### Step 1: Create Diagnostic Tests
- Write test cases for each video provider
- Create mock server responses for testing
- Document current failure patterns

### Step 2: Update Critical Providers
- Start with StreamWish (most common)
- Then VOE and StreamTape
- Update patterns and test thoroughly

### Step 3: Implement Retry Logic
- Add exponential backoff
- Implement provider fallback
- Add detailed error logging

### Step 4: Deploy and Monitor
- Deploy incremental fixes
- Monitor success rates
- Gather user feedback

## Risk Assessment

### High Risk
- Breaking existing functionality with pattern changes
- Performance degradation with additional retry logic
- Provider detection and blocking of enhanced scraping

### Mitigation Strategies
- A/B testing of new patterns
- Gradual rollout with monitoring
- Fallback to existing patterns on failure

## Testing Strategy

### Unit Tests
- Test each resolver function independently
- Mock network requests and responses
- Test error handling and edge cases

### Integration Tests
- Test full resolution flow
- Use test video URLs from each provider
- Verify response formats match frontend expectations

### End-to-End Tests
- Test video loading in the web application
- Verify YouTube fallbacks are not triggered
- Test across different browsers and devices

## Success Criteria
1. Video loading success rate increases from current baseline
2. YouTube fallback messages are eliminated
3. Average resolution time remains under acceptable limits
4. All major video providers show improved reliability

## Deployment Plan
1. Deploy enhanced logging to understand current failure patterns
2. Deploy pattern updates for highest-failure providers
3. Deploy retry logic and improved error handling
4. Monitor metrics and gather user feedback
5. Iterate based on results