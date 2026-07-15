import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { createTenant, listTenants, updateTenant } from '../../api/tenants'
import type { TenantRequest } from '../../api/types'

function TenantFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      if (!isEditing) {
        setLoading(false)
        return
      }
      try {
        const tenants = await listTenants()
        if (!active) return
        const tenant = tenants.find((t) => t.id === id)
        if (!tenant) {
          setNotFound(true)
        } else {
          setName(tenant.name)
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
    const payload: TenantRequest = { name }
    try {
      if (isEditing && id) {
        await updateTenant(id, payload)
      } else {
        await createTenant(payload)
      }
      navigate('/tenants')
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
        <Alert severity="error">Tenant not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/tenants')}>
          Back to tenants
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="sm">
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Edit Tenant' : 'Add Tenant'}
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
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/tenants')} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" disabled={submitting || !name}>
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

export default TenantFormPage
