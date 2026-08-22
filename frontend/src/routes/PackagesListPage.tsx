import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Alert, AppBar, Box, Button, Chip, CircularProgress, Container, Paper, Stack, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Toolbar, Typography,
} from '@mui/material'
import { api } from '../api/client'
import type { PackageListItem } from '../api/types'

const formatPrice = (price: string | null) =>
  price === null ? '—' : `€${Number(price).toLocaleString('en-GB')}`

const formatRange = (start: string | null, end: string | null) => {
  if (!start || !end) return '—'
  const opts: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' }
  return `${new Date(start).toLocaleDateString('en-GB', opts)} – ${new Date(end).toLocaleDateString('en-GB', { ...opts, year: 'numeric' })}`
}

export function PackagesListPage() {
  const navigate = useNavigate()
  const [packages, setPackages] = useState<PackageListItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(() => {
    setError(null)
    api.packages().then(setPackages).catch((e: Error) => setError(e.message))
  }, [])

  useEffect(load, [load])

  const reset = async () => {
    setPackages(null)
    await api.reset().catch(() => undefined)
    load()
  }

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>Package Builder</Typography>
          <Button size="small" onClick={reset}>Reset demo data</Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Stack direction="row" sx={{ alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ flexGrow: 1 }}>Packages</Typography>
          <Button variant="contained" onClick={() => navigate('/packages/new')}>
            New package
          </Button>
        </Stack>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {packages === null ? (
          <Box sx={{ display: 'grid', placeItems: 'center', py: 8 }}><CircularProgress /></Box>
        ) : packages.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 6, textAlign: 'center' }}>
            <Typography color="text.secondary">No packages yet.</Typography>
          </Paper>
        ) : (
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Package</TableCell>
                  <TableCell>Property</TableCell>
                  <TableCell>Travel dates</TableCell>
                  <TableCell align="right">Price</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg.id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {pkg.title || 'Untitled draft'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {pkg.inclusions_count} inclusion{pkg.inclusions_count === 1 ? '' : 's'}
                      </Typography>
                    </TableCell>
                    <TableCell>{pkg.property?.name ?? '—'}</TableCell>
                    <TableCell>{formatRange(pkg.start_date, pkg.end_date)}</TableCell>
                    <TableCell align="right">{formatPrice(pkg.price)}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={pkg.status}
                        color={pkg.status === 'published' ? 'success' : 'default'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      {/* Published packages are read-only: the API refuses edits, so the UI does not offer them. */}
                      <Button size="small" onClick={() => navigate(`/packages/${pkg.id}`)}>
                        {pkg.status === 'published' ? 'View' : 'Continue'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Container>
    </>
  )
}
