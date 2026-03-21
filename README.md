# Arizona DeMolay 360° Review System

A comprehensive peer review system for the Arizona DeMolay State Association.

## Features

- **Google OAuth Authentication** - Secure login with @azdemolay.org domain restriction
- **Self-Review Prevention** - Members cannot review themselves
- **Role-Based Views**:
  - **Dad Accounts**: See all reviews and export data
  - **Youth Officers**: See only reviews about themselves
- **Test Mode**: Dad accounts can simulate youth officer view
- **Real-time Tracking**: Visual indicators show completed reviews

## Technology Stack

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Hono API routes
- **Auth**: Google OAuth 2.0
- **Storage**: File-based JSON persistence

## Routes

| Route | Description |
|-------|-------------|
| `/demolay-review` | Landing page - member selection |
| `/review/:memberId` | Individual review form |
| `/demolay-review/results` | Results dashboard |
| `/api/auth/*` | Authentication endpoints |
| `/api/reviews/*` | Review data API |

## Members

| Name | Title | Email |
|------|-------|-------|
| Dad Steve Johnston | Executive Officer | executive.officer@azdemolay.org |
| Dad Don Lowery | State Dad | state.dad@azdemolay.org |
| Dad Bill Enloe | State Membership Advisor | membership.advisor@azdemolay.org |
| SMC Seth Baldwin | State Master Councilor | smc@azdemolay.org |
| DSMC Kaden Hartley | Deputy State Master Councilor | dsmc@azdemolay.org |
| SSC Cooper Pitman | State Senior Councilor | ssc@azdemolay.org |
| SJC John Enloe | State Junior Councilor | sjc@azdemolay.org |
| Scribe James Hendrickson | State Scribe | scribe@azdemolay.org |

## Development

All changes are tracked in this GitHub repository for version control and audit purposes.
