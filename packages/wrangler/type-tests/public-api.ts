/**
 * Compile against Wrangler's built package entry point so this test exercises
 * the declaration surface that package consumers receive.
 */
import type { GetPlatformProxyOptions } from "wrangler";

export const platformProxyOptions: GetPlatformProxyOptions = {};
