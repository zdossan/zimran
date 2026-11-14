# Student Loan Guardian

See your cheapest legal federal student-loan repayment plan in 60 seconds — then let us check your servicer's statements for errors. No login. Built for Business Cup 2.0.

## Run locally
```bash
npm ci
cp .env.example .env.local   # optional — fill with the team's private values; mocks work without them
npm run dev                  # http://localhost:3000
npm test                     # vitest
npm run build
```

## Docs
- Team rules: `CLAUDE.md` · How we work: `docs/TEAM-WORKFLOW.md`
- Spec: `docs/superpowers/specs/2026-11-14-student-loan-guardian-design.md`
- Plans: `docs/superpowers/plans/`
- Research: `docs/research/`

Not affiliated with the U.S. Department of Education. Applying for any repayment plan is free at StudentAid.gov.
