import { useEffect, useState } from 'react'
import {
  Alert, Box, CircularProgress, List, ListItemButton, ListItemText, Stack, TextField, Typography,
} from '@mui/material'
import { api } from '../../api/client'
import type { Property } from '../../api/types'

type Props = {
  selectedId: number | null
  onSelect: (id: number) => void
}

/** Step 1 — pick exactly one property. The search runs on the server. */
export function PropertyStep({ selectedId, onSelect }: Props) {
  const [search, setSearch] = useState('')
  const [properties, setProperties] = useState<Property[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    const timer = setTimeout(() => {
      api
        .properties(search)
        .then((result) => active && setProperties(result))
        .catch((e: Error) => active && setError(e.message))
    }, 250)

    // Cancel both the pending request window and the stale response it would set.
    return () => {
      active = false
      clearTimeout(timer)
    }
  }, [search])

  return (
    <Stack spacing={2}>
      <Box>
        <Typography variant="h6">Choose a property</Typography>
        <Typography variant="body2" color="text.secondary">
          Search by name or location. Exactly one property per package.
        </Typography>
      </Box>

      <TextField
        label="Search properties"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        size="small"
        fullWidth
      />

      {error && <Alert severity="error">{error}</Alert>}

      {properties === null ? (
        <Box sx={{ display: 'grid', placeItems: 'center', py: 4 }}><CircularProgress size={28} /></Box>
      ) : properties.length === 0 ? (
        <Typography variant="body2" color="text.secondary">No property matches that search.</Typography>
      ) : (
        <List disablePadding>
          {properties.map((property) => (
            <ListItemButton
              key={property.id}
              selected={property.id === selectedId}
              onClick={() => onSelect(property.id)}
              sx={{ borderRadius: 1 }}
            >
              <ListItemText primary={property.name} secondary={property.location} />
              <Typography variant="body2" color="text.secondary">
                €{property.nightly_rate} / night
              </Typography>
            </ListItemButton>
          ))}
        </List>
      )}
    </Stack>
  )
}
