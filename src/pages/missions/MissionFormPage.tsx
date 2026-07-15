import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { createMission, listMissions, updateMission } from '../../api/missions'
import { listTenants } from '../../api/tenants'
import type { MissionRequest, MissionResponse, TenantResponse } from '../../api/types'

function MissionFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [name, setName] = useState('')
  const [tenantId, setTenantId] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [streetAddress, setStreetAddress] = useState('')
  const [tenants, setTenants] = useState<TenantResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [missionsData, tenantsData] = await Promise.all([
          isEditing ? listMissions() : Promise.resolve<MissionResponse[]>([]),
          listTenants(),
        ])
        if (!active) return
        setTenants(tenantsData)
        if (isEditing) {
          const mission = missionsData.find((m) => m.id === id)
          if (!mission) {
            setNotFound(true)
          } else {
            setName(mission.name)
            setTenantId(mission.tenantId)
            setStartTime(toDatetimeLocalValue(mission.startTime))
            setEndTime(toDatetimeLocalValue(mission.endTime))
            setLatitude(mission.latitude?.toString() ?? '')
            setLongitude(mission.longitude?.toString() ?? '')
            setStreetAddress(mission.streetAddress ?? '')
          }
        }
        setError(null)
      } catch (err) {
        if (active) setError(describeError(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadData()
    return () => {
      active = false
    }
  }, [id, isEditing])

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const payload: MissionRequest = {
      name,
      tenantId,
      startTime: startTime || null,
      endTime: endTime || null,
      latitude: latitude === '' ? null : Number(latitude),
      longitude: longitude === '' ? null : Number(longitude),
      streetAddress: streetAddress || null,
    }
    try {
      if (isEditing && id) {
        await updateMission(id, payload)
      } else {
        await createMission(payload)
      }
      navigate('/missions')
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <Container sx={{ py: 4 }}>
        <Stack sx={{ py: 6, alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      </Container>
    )
  }

  if (notFound) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Mission not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/missions')}>
          Back to missions
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="sm">
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Edit Mission' : 'Add Mission'}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel id="mission-tenant-label">Tenant</InputLabel>
            <Select
              labelId="mission-tenant-label"
              label="Tenant"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="End time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
          <TextField
            label="Street address"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { step: 'any' } }}
            />
            <TextField
              label="Longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { step: 'any' } }}
            />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/missions')} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !name || !tenantId}
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </Stack>
      </Paper>

      <Snackbar open={error !== null} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" onClose={() => setError(null)} sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Container>
  )
}

function toDatetimeLocalValue(value: string | null): string {
  return value ? value.slice(0, 16) : ''
}

function describeError(err: unknown): string {
  if (err instanceof ApiUnavailableError) {
    return err.message
  }
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Your session expired. Redirecting to sign in…'
    }
    if (err.status === 403) {
      return 'You do not have permission to do that.'
    }
    return `Request failed (${err.status}): ${err.message}`
  }
  return 'Something went wrong.'
}

export default MissionFormPage
