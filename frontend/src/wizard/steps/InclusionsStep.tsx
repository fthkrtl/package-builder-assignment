import { useEffect, useMemo, useState } from 'react'
import {
  Alert, Box, Checkbox, CircularProgress, List, ListItemButton, ListItemText, Stack, ToggleButton,
  ToggleButtonGroup, Typography,
} from '@mui/material'
import { api } from '../../api/client'
import type { Inclusion } from '../../api/types'

type Props = {
  selectedIds: number[]
  onToggle: (id: number) => void
}

const ALL = 'all'

/** Step 2 — add and remove what the stay includes, filtered by category. */
export function InclusionsStep({ selectedIds, onToggle }: Props) {
  const [inclusions, setInclusions] = useState<Inclusion[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [category, setCategory] = useState<string>(ALL)

  useEffect(() => {
    api.inclusions().then(setInclusions).catch((e: Error) => setError(e.message))
  }, [])

  const categories = useMemo(
    () => [ALL, ...new Set((inclusions ?? []).map((inclusion) => inclusion.category))],
    [inclusions],
  )

  const visible = (inclusions ?? []).filter(
    (inclusion) => category === ALL || inclusion.category === category,
  )

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">What&apos;s included</Typography>
        <Typography variant="body2" color="text.secondary">
          {selectedIds.length} selected — at least one is required to publish.
        </Typography>
      </Box>

      {error && <Alert severity="error">{error}</Alert>}

      {inclusions === null ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}><CircularProgress size={28} /></Box>
      ) : (
        <>
          <ToggleButtonGroup
            size="small"
            exclusive
            value={category}
            onChange={(_, next) => next && setCategory(next)}
          >
            {categories.map((name) => (
              <ToggleButton key={name} value={name} sx={{ textTransform: 'capitalize' }}>
                {name}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>

          <List disablePadding>
            {visible.map((inclusion) => (
              <ListItemButton
                key={inclusion.id}
                onClick={() => onToggle(inclusion.id)}
                sx={{ borderRadius: 1 }}
              >
                <Checkbox
                  edge="start"
                  tabIndex={-1}
                  disableRipple
                  checked={selectedIds.includes(inclusion.id)}
                />
                <ListItemText primary={inclusion.name} secondary={inclusion.category} />
                <Typography variant="body2" color="text.secondary">€{inclusion.price}</Typography>
              </ListItemButton>
            ))}
          </List>
        </>
      )}
    </Stack>
  )
}
