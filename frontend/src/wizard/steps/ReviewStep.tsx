import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material'
import type { Inclusion, Property } from '../../api/types'
import type { WizardState } from '../state'

type Props = {
  state: WizardState
  property: Property | null
  inclusions: Inclusion[]
}

const formatRange = (start: string, end: string) => {
  if (!start || !end) return '—'
  const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${new Date(start).toLocaleDateString('en-GB', options)} – ${new Date(end).toLocaleDateString('en-GB', { ...options, year: 'numeric' })}`
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={{ xs: 0, sm: 2 }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2">{children}</Typography>
    </Stack>
  )
}

/** Step 4 — a read-only summary of everything chosen. */
export function ReviewStep({ state, property, inclusions }: Props) {
  const selected = inclusions.filter((inclusion) => state.inclusionIds.includes(inclusion.id))

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Review</Typography>
        <Typography variant="body2" color="text.secondary">
          Publishing is final — a published package can no longer be edited.
        </Typography>
      </Box>

      <Paper variant="outlined" sx={{ p: 2 }}>
        <Stack spacing={1.5}>
          <Row label="Property">
            {property ? `${property.name} · ${property.location}` : '—'}
          </Row>
          <Divider />
          <Row label={`Inclusions (${selected.length})`}>
            <Box component="span" sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
              {selected.length === 0
                ? '—'
                : selected.map((inclusion) => (
                    <Chip key={inclusion.id} size="small" label={inclusion.name} />
                  ))}
            </Box>
          </Row>
          <Divider />
          <Row label="Title">{state.title || '—'}</Row>
          <Row label="Subtitle">{state.subtitle || '—'}</Row>
          <Row label="Description">{state.description || '—'}</Row>
          <Row label="Price">{state.price ? `€${state.price}` : '—'}</Row>
          <Row label="Travel dates">{formatRange(state.startDate, state.endDate)}</Row>
        </Stack>
      </Paper>
    </Stack>
  )
}
