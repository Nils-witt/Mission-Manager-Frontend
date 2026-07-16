import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import type { SelectChangeEvent } from '@mui/material/Select'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { createUser, getUser, updateUser } from '../../api/users'
import { listTenants } from '../../api/tenants'
import { listSecurityGroups } from '../../api/securityGroups'
import type { SecurityGroupResponse, TenantResponse, UserRequest } from '../../api/types'

const emptyForm: UserRequest = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  enabled: true,
  locked: false,
  primaryTenantId: null,
  securityGroupIds: [],
}

function UserFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [form, setForm] = useState<UserRequest>(emptyForm)
  const [tenants, setTenants] = useState<TenantResponse[]>([])
  const [securityGroups, setSecurityGroups] = useState<SecurityGroupResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [user, tenantsData] = await Promise.all([
          isEditing && id ? getUser(id) : Promise.resolve(null),
          listTenants(),
        ])
        if (!active) return
        setTenants(tenantsData)
        if (isEditing) {
          if (!user) {
            setNotFound(true)
          } else {
            setForm({
              username: user.username,
              firstName: user.firstName,
              lastName: user.lastName,
              email: user.email,
              password: '',
              enabled: user.enabled,
              locked: user.locked,
              primaryTenantId: user.primaryTenantId,
              securityGroupIds: user.securityGroupIds,
            })
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

  useEffect(() => {
    let active = true

    async function loadSecurityGroups() {
      if (!form.primaryTenantId) {
        setSecurityGroups([])
        return
      }
      try {
        const groups = await listSecurityGroups(form.primaryTenantId)
        if (!active) return
        setSecurityGroups(groups)
        const groupIds = new Set(groups.map((group) => group.id))
        setForm((prev) => ({
          ...prev,
          securityGroupIds: prev.securityGroupIds.filter((groupId) => groupIds.has(groupId)),
        }))
      } catch (err) {
        if (active) setError(describeError(err))
      }
    }

    loadSecurityGroups()
    return () => {
      active = false
    }
  }, [form.primaryTenantId])

  const handleSecurityGroupChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setForm((prev) => ({
      ...prev,
      securityGroupIds: typeof value === 'string' ? value.split(',') : value,
    }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const payload: UserRequest = { ...form }
    if (!payload.password) {
      delete payload.password
    }
    try {
      if (isEditing && id) {
        await updateUser(id, payload)
      } else {
        await createUser(payload)
      }
      navigate('/users')
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
        <Alert severity="error">User not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/users')}>
          Back to users
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="sm">
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Edit User' : 'Add User'}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            fullWidth
            required
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              fullWidth
            />
          </Stack>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            fullWidth
            required={!isEditing}
            helperText={isEditing ? 'Leave blank to keep the current password.' : undefined}
          />
          <FormControl fullWidth>
            <InputLabel id="primary-tenant-label">Primary tenant</InputLabel>
            <Select
              labelId="primary-tenant-label"
              label="Primary tenant"
              value={form.primaryTenantId ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, primaryTenantId: e.target.value || null }))
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="security-groups-label">Security groups</InputLabel>
            <Select
              labelId="security-groups-label"
              label="Security groups"
              multiple
              value={form.securityGroupIds}
              onChange={handleSecurityGroupChange}
              disabled={!form.primaryTenantId}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((groupId) => (
                    <Chip
                      key={groupId}
                      label={securityGroups.find((group) => group.id === groupId)?.name ?? groupId}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {securityGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enabled"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.locked}
                  onChange={(e) => setForm((prev) => ({ ...prev, locked: e.target.checked }))}
                />
              }
              label="Locked"
            />
          </Stack>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/users')} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={
              submitting ||
              !form.username ||
              !form.email ||
              (!isEditing && !form.password)
            }
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

export default UserFormPage
