import { AppBar, Container, Toolbar, Typography } from '@mui/material'

/**
 * The wizard: stepper, four steps, draft save/restore, publish.
 *
 * TODO(fatih): yours, on top of src/wizard/state.ts.
 *
 *   Step 1  Property     — debounced search against GET /properties?search=
 *   Step 2  Inclusions    — category filter, toggle selection
 *   Step 3  Details       — title, description, price, date range + inline errors
 *   Step 4  Review        — read-only summary, Publish / Save as draft
 *
 * Draft flow: first save POSTs and keeps the returned id, later saves PATCH it.
 * Opening /packages/:id GETs the package and restores state from it; a published
 * one renders read-only instead of the wizard.
 *
 * Publish flow: save, then POST /packages/{id}/publish. On 422, map
 * ApiError.fieldErrors onto steps and send the user to the first one that failed.
 */
export function WizardPage() {
  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6">Package Builder</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="text.secondary">Wizard goes here.</Typography>
      </Container>
    </>
  )
}
