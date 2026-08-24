import { useState } from 'react'
import { Box, InputAdornment, Stack, TextField, Typography } from '@mui/material'
import { detailErrors, todayIso } from '../state'
import type { WizardState } from '../state'

type DetailField = 'title' | 'description' | 'price' | 'startDate' | 'endDate'

type Props = {
  state: WizardState
  onChange: (patch: Partial<Pick<WizardState, DetailField>>) => void
  /** Field errors the API returned on a failed publish, keyed by its own names. */
  serverErrors?: Record<string, string>
}

const SERVER_FIELD: Record<string, DetailField> = {
  title: 'title',
  description: 'description',
  price: 'price',
  start_date: 'startDate',
  end_date: 'endDate',
}

/** Step 3 — the commercial details. The same rules run again on the server. */
export function DetailsStep({ state, onChange, serverErrors = {} }: Props) {
  // Errors stay quiet until a field has been visited, so an untouched form is not a wall of red.
  const [touched, setTouched] = useState<Set<DetailField>>(new Set())
  const errors = detailErrors(state)

  const fromServer = Object.entries(serverErrors).reduce<Partial<Record<DetailField, string>>>(
    (acc, [key, message]) => {
      const field = SERVER_FIELD[key]
      if (field) acc[field] = message
      return acc
    },
    {},
  )

  const errorFor = (field: DetailField) =>
    fromServer[field] ?? (touched.has(field) ? errors[field] : undefined)

  const bind = (field: DetailField) => ({
    value: state[field],
    onChange: (event: { target: { value: string } }) => onChange({ [field]: event.target.value }),
    onBlur: () => setTouched((current) => new Set(current).add(field)),
    error: Boolean(errorFor(field)),
    helperText: errorFor(field),
  })

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Commercial details</Typography>
        <Typography variant="body2" color="text.secondary">
          These rules are enforced again by the API when you publish.
        </Typography>
      </Box>

      <TextField label="Title" fullWidth {...bind('title')} />

      <TextField label="Description" fullWidth multiline minRows={3} {...bind('description')} />

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Price"
          type="number"
          fullWidth
          {...bind('price')}
          slotProps={{
            input: { startAdornment: <InputAdornment position="start">€</InputAdornment> },
            inputLabel: { shrink: true },
          }}
        />
        <TextField
          label="Start date"
          type="date"
          fullWidth
          {...bind('startDate')}
          slotProps={{
            inputLabel: { shrink: true },
            // The browser refuses past dates outright; the schema still checks it.
            htmlInput: { min: todayIso() },
          }}
        />
        <TextField
          label="End date"
          type="date"
          fullWidth
          {...bind('endDate')}
          slotProps={{
            inputLabel: { shrink: true },
            htmlInput: { min: state.startDate || todayIso() },
          }}
        />
      </Stack>
    </Stack>
  )
}
