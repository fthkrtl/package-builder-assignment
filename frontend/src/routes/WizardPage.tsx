import { useCallback, useEffect, useReducer, useState } from 'react'
import { useBlocker, useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  AppBar,
  Box,
  Button,
  CircularProgress,
  Container,
  Link,
  Paper,
  Stack,
  Step,
  StepButton,
  Stepper,
  Toolbar,
  Typography,
} from '@mui/material'
import { ApiError, api } from '../api/client'
import type { Inclusion, Property } from '../api/types'
import {
  STEP_LABELS,
  canGoTo,
  initialState,
  isStepValid,
  reducer,
  toPayload,
} from '../wizard/state'
import type { WizardStep } from '../wizard/state'
import { PropertyStep } from '../wizard/steps/PropertyStep'
import { InclusionsStep } from '../wizard/steps/InclusionsStep'
import { DetailsStep } from '../wizard/steps/DetailsStep'
import { ReviewStep } from '../wizard/steps/ReviewStep'

/**
 * Which step owns which server-side error. A failed publish sends the user to
 * the first step that has something wrong rather than showing one flat list.
 */
const STEP_OF_FIELD: Record<string, WizardStep> = {
  property_id: 0,
  inclusions: 1,
  title: 2,
  subtitle: 2,
  description: 2,
  price: 2,
  start_date: 2,
  end_date: 2,
}

export function WizardPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [state, dispatch] = useReducer(reducer, initialState)
  const [loading, setLoading] = useState(Boolean(id))
  const [saving, setSaving] = useState(false)
  // A package that will not load is fatal for this screen; a failed save is not.
  const [loadError, setLoadError] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [publishErrors, setPublishErrors] = useState<Record<string, string>>({})

  // Only needed to name things on the review step; the steps fetch their own lists.
  const [properties, setProperties] = useState<Property[]>([])
  const [inclusions, setInclusions] = useState<Inclusion[]>([])

  // Route changes inside the app stop here while the draft has unsaved edits.
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      state.dirty && currentLocation.pathname !== nextLocation.pathname,
  )

  useEffect(() => {
    if (blocker.state !== 'blocked') return

    if (window.confirm('You have unsaved changes. Leave without saving?')) {
      blocker.proceed()
    } else {
      blocker.reset()
    }
  }, [blocker])

  useEffect(() => {
    Promise.all([api.properties(), api.inclusions()])
      .then(([p, i]) => {
        setProperties(p)
        setInclusions(i)
      })
      .catch(() => undefined)
  }, [])

  useEffect(() => {
    if (!id) return

    let active = true
    api
      .package(Number(id))
      .then((pkg) => active && dispatch({ type: 'LOAD_DRAFT', payload: pkg }))
      .catch((e: Error) => {
        if (!active) return
        // Laravel's 404 body names the model class; the operator does not need that.
        const missing = e instanceof ApiError && e.status === 404
        setLoadError(missing ? 'That package no longer exists.' : e.message)
      })
      .finally(() => active && setLoading(false))

    return () => {
      active = false
    }
  }, [id])

  // The tab-close half of the unsaved-changes warning; leaving the wizard is handled on Close.
  useEffect(() => {
    if (!state.dirty) return

    const warn = (event: BeforeUnloadEvent) => event.preventDefault()
    window.addEventListener('beforeunload', warn)

    return () => window.removeEventListener('beforeunload', warn)
  }, [state.dirty])

  const save = useCallback(async () => {
    const payload = toPayload(state)
    const saved = state.packageId
      ? await api.updatePackage(state.packageId, payload)
      : await api.createPackage(payload)

    dispatch({ type: 'MARK_SAVED', packageId: saved.id })

    return saved.id
  }, [state])

  const handleSave = async () => {
    setSaving(true)
    setActionError(null)
    try {
      await save()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : 'Could not save the draft.')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    setSaving(true)
    setActionError(null)
    setPublishErrors({})
    try {
      // Save first: publish carries no payload, so the server publishes what it holds.
      const packageId = await save()
      await api.publishPackage(packageId)
      navigate('/')
    } catch (e) {
      if (e instanceof ApiError && e.isValidation) {
        const flat = Object.fromEntries(
          Object.entries(e.fieldErrors).map(([field, messages]) => [field, messages[0]]),
        )
        setPublishErrors(flat)

        const firstBadStep = Object.keys(flat)
          .map((field) => STEP_OF_FIELD[field])
          .filter((step): step is WizardStep => step !== undefined)
          .sort()[0]

        if (firstBadStep !== undefined) dispatch({ type: 'GOTO_STEP', payload: firstBadStep })
      } else {
        setActionError(e instanceof Error ? e.message : 'Could not publish the package.')
      }
    } finally {
      setSaving(false)
    }
  }

  // No confirm here: the blocker above catches this navigation too.
  const close = () => navigate('/')

  const goTo = (step: WizardStep) => dispatch({ type: 'GOTO_STEP', payload: step })

  const published = state.status === 'published'
  const property = properties.find((item) => item.id === state.propertyId) ?? null

  if (loading) {
    return (
      <Box sx={{ display: 'grid', placeItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Box>
    )
  }

  // Nothing to edit: showing an empty wizard here would imply the package exists.
  if (loadError) {
    return (
      <Container maxWidth="sm" sx={{ py: 8 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => navigate('/')}>
              Back to packages
            </Button>
          }
        >
          {loadError}
        </Alert>
      </Container>
    )
  }

  return (
    <>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            {state.packageId ? state.title || 'Untitled package' : 'New package'}
          </Typography>
          <Button size="small" onClick={close}>
            Close
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {actionError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {actionError}
          </Alert>
        )}

        {published ? (
          <Stack spacing={2}>
            <Alert severity="info">This package is published and can no longer be edited.</Alert>
            <ReviewStep state={state} property={property} inclusions={inclusions} />
          </Stack>
        ) : (
          <Paper variant="outlined">
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stepper nonLinear activeStep={state.step}>
                {STEP_LABELS.map((label, index) => {
                  const step = index as WizardStep
                  return (
                    <Step key={label} completed={isStepValid(state, step) && state.step !== step}>
                      <StepButton disabled={!canGoTo(state, step)} onClick={() => goTo(step)}>
                        {label}
                      </StepButton>
                    </Step>
                  )
                })}
              </Stepper>
            </Box>

            <Box sx={{ p: 3 }}>
              {Object.keys(publishErrors).length > 0 && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500, mb: 0.5 }}>
                    The package could not be published.
                  </Typography>
                  <Stack component="ul" sx={{ m: 0, pl: 2 }}>
                    {Object.entries(publishErrors).map(([field, message]) => (
                      <li key={field}>
                        <Link
                          component="button"
                          type="button"
                          color="inherit"
                          onClick={() => {
                            const step = STEP_OF_FIELD[field]
                            if (step !== undefined) goTo(step)
                          }}
                        >
                          {message}
                        </Link>
                      </li>
                    ))}
                  </Stack>
                </Alert>
              )}

              {state.step === 0 && (
                <PropertyStep
                  selectedId={state.propertyId}
                  onSelect={(propertyId) =>
                    dispatch({ type: 'SELECT_PROPERTY', payload: propertyId })
                  }
                />
              )}
              {state.step === 1 && (
                <InclusionsStep
                  selectedIds={state.inclusionIds}
                  onToggle={(inclusionId) =>
                    dispatch({ type: 'TOGGLE_INCLUSION', payload: inclusionId })
                  }
                />
              )}
              {state.step === 2 && (
                <DetailsStep
                  state={state}
                  serverErrors={publishErrors}
                  onChange={(patch) => dispatch({ type: 'SET_DETAILS', payload: patch })}
                />
              )}
              {state.step === 3 && (
                <ReviewStep state={state} property={property} inclusions={inclusions} />
              )}
            </Box>

            <Stack
              direction="row"
              spacing={1}
              sx={{ p: 2, borderTop: 1, borderColor: 'divider', alignItems: 'center' }}
            >
              <Button
                disabled={state.step === 0}
                onClick={() => goTo((state.step - 1) as WizardStep)}
              >
                Back
              </Button>
              <Box sx={{ flexGrow: 1 }} />
              {state.dirty && (
                <Typography variant="caption" color="text.secondary">
                  Unsaved changes
                </Typography>
              )}
              <Button variant="outlined" onClick={handleSave} disabled={saving}>
                Save draft
              </Button>
              {state.step === 3 ? (
                <Button
                  variant="contained"
                  onClick={handlePublish}
                  disabled={saving || !isStepValid(state, 3)}
                >
                  Publish
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={() => goTo((state.step + 1) as WizardStep)}
                  disabled={!isStepValid(state, state.step)}
                >
                  Next
                </Button>
              )}
            </Stack>
          </Paper>
        )}
      </Container>
    </>
  )
}
