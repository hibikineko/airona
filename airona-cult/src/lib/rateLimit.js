// Rate limiting middleware to prevent spam and DDoS attacks
const rateLimit = new Map();

export function rateLimiter(options = {}) {
  const {
    windowMs = 15 * 60 * 1000, // 15 minutes default
    maxRequests = 100, // 100 requests per window default
    message = "Too many requests, please try again later.",
    skipSuccessfulRequests = false,
  } = options;

  return {
    check: (request) => {
      const ip = getClientIP(request);
      const now = Date.now();
      const windowStart = now - windowMs;
      
      // Clean up old entries
      if (rateLimit.has(ip)) {
        const requests = rateLimit.get(ip).filter(time => time > windowStart);
        rateLimit.set(ip, requests);
      }
      
      // Get current requests for this IP
      const requests = rateLimit.get(ip) || [];
      
      // Check if limit exceeded
      if (requests.length >= maxRequests) {
        return {
          success: false,
          error: message,
          retryAfter: Math.ceil((requests[0] + windowMs - now) / 1000)
        };
      }
      
      // Add current request
      requests.push(now);
      rateLimit.set(ip, requests);
      
      return { success: true };
    }
  };
}

function getClientIP(request) {
  // Get client IP from various headers
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");
  const cfConnectingIP = request.headers.get("cf-connecting-ip");
  
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  
  return realIP || cfConnectingIP || "unknown";
}

// Pre-configured rate limiters for different endpoints
export const strictRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 50, // 50 requests per 15 minutes
  message: "Rate limit exceeded. Please wait before making more requests."
});

export const moderateRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes  
  maxRequests: 100, // 100 requests per 15 minutes
  message: "Too many requests. Please slow down."
});

export const lenientRateLimit = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 200, // 200 requests per 15 minutes
  message: "Rate limit exceeded."
});