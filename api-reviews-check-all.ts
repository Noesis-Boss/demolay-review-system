import type { Context } from "hono";
import { readFileSync } from "node:fs";

const DATA_FILE = "/tmp/demolay-reviews.json";

export default async (c: Context) => {
  const authHeader = c.req.header("X-Review-Token");
  if (!authHeader) {
    return c.json({ error: "Authentication required" }, 401);
  }

  try {
    // Decode token to get reviewer email
    const tokenData = JSON.parse(Buffer.from(authHeader, "base64url").toString());
    const reviewerEmail = tokenData.email;

    // Read all reviews
    let reviews: any[] = [];
    try {
      const data = readFileSync(DATA_FILE, "utf-8");
      reviews = JSON.parse(data);
    } catch {
      reviews = [];
    }

    // Find all members this reviewer has reviewed
    const reviewedMembers = reviews
      .filter((r: any) => r.reviewerEmail === reviewerEmail)
      .map((r: any) => r.memberId);

    return c.json({
      authenticated: true,
      reviewedMembers: [...new Set(reviewedMembers)], // Remove duplicates
      count: reviewedMembers.length
    });
  } catch {
    return c.json({ error: "Invalid token" }, 401);
  }
};
