# Arizona DeMolay 360° Review System

A comprehensive 360-degree feedback system for evaluating members of the Arizona DeMolay State Association.

## Features

- **Google OAuth Authentication** - Secure login via Google accounts
- **Self-Review Prevention** - Users cannot review themselves (based on email matching)
- **Multi-Attribute Evaluation** - 8 Likert-scale attributes:
  - Leadership
  - Teamwork
  - Attendance
  - Punctuality
  - Motivation
  - Ritual Work
  - Initiative
  - Planning
- **Role-Based Views**:
  - Dad accounts see all reviews + individual submissions + CSV export
  - Youth Officer accounts see combined averages for each member
- **Email-to-Member Mapping**:
  - executive.officer@azdemolay.org = Dad Steve Johnston (Executive Officer)
  - state.dad@azdemolay.org = Dad Don Lowery (State Dad)
  - membership.advisor@azdemolay.org = Dad Bill Enloe (State Membership Advisor)
  - smc@azdemolay.org = SMC Seth Baldwin (State Master Councilor)
  - dsmc@azdemolay.org = DSMC Kaden Hartley (Deputy State Master Councilor)
  - ssc@azdemolay.org = SSC Cooper Pitman (State Senior Councilor)
  - sjc@azdemolay.org = SJC John Enloe (State Junior Councilor)
  - scribe@azdemolay.org = Scribe James Hendrickson (State Scribe)

## Arizona Flag Colors

- **Blue**: #002868 (Old Glory Blue)
- **Red**: #BF0A30 (Old Glory Red)
- **Gold**: #FFD700 (Arizona Yellow)
- **Copper**: #C47A6B (Arizona Copper)

## URLs

- Landing/Members Page: https://jaknyfe.zo.space/demolay-review
- Review Form: https://jaknyfe.zo.space/review/{memberId}
- Results Page: https://jaknyfe.zo.space/demolay-review/results

## Tech Stack

- Zo Space (React + TypeScript)
- Google OAuth for authentication
- Local JSON file storage for reviews

## File Structure

```
├── demolay-review.tsx          # Landing page with member listing
├── review-:memberId.tsx        # Individual member review form
├── demolay-review-results.tsx  # Results page (Dad vs Youth Officer views)
├── api-auth-*.ts              # Authentication API routes
├── api-reviews-*.ts           # Review submission/export API routes
└── README.md                   # This file
```
