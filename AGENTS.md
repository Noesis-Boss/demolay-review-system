# Arizona DeMolay 360° Review System

## IMPORTANT COLOR CONSTANTS - DO NOT MODIFY

The following color scheme is **LOCKED** and must not be changed unless explicitly requested by the user:

```javascript
const AZ_BLUE = "#002868";   // Old Glory Red (Arizona flag)
const AZ_RED = "#BF0A30";     // Old Glory Blue (Arizona flag)
const AZ_GOLD = "#FFD700";    // Arizona Yellow (Arizona flag)
const AZ_COPPER = "#C47A6B";  // Arizona copper
```

**Background gradient:** `linear-gradient(135deg, ${AZ_BLUE} 0%, ${AZ_RED} 100%)`

## Email Associations (LOCKED)

| Member | Email |
|--------|-------|
| Dad Steve Johnston | steve@azdemolay.org |
| Dad Don Lowery | state.officer.director@azdemolay.org |
| Dad Bill Enloe | membership@azdemolay.org |
| SMC Seth Baldwin | smc@azdemolay.org |
| DSMC Kaden Hartley | dsmc@azdemolay.org |
| SSC Cooper Pitman | ssc@azdemolay.org |
| SJC John Enloe | sjc@azdemolay.org |
| Scribe James Hendrickson | scribe@azdemolay.org |

## Dad Accounts (for view permissions)

- steve@azdemolay.org
- state.officer.director@azdemolay.org
- membership@azdemolay.org

## Routes

- Landing page: `/demolay-review`
- Review form: `/review/:memberId`
- Results: `/demolay-review/results`

## Features

- Self-review blocking (users cannot review themselves)
- Dad accounts see all reviews; youth officers see only reviews about themselves
