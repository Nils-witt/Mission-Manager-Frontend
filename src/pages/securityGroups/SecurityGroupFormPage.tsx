import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import { ApiError, ApiUnavailableError } from '../../api/client'
import {
  createSecurityGroup,
  listAvailableSecurityRoles,
  listSecurityGroups,
  updateSecurityGroup,
} from '../../api/securityGroups'
import type {
  SecurityGroupRequest,
  SecurityRole,
  SecurityRoleScope,
  SecurityRoleType,
} from '../../api/types'
import { securityRolesEqual } from './securityRoles'

function SecurityGroupFormPage() {
  const { tenantId, id } = useParams<{ tenantId: string; id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [name, setName] = useState('')
  const [ssoGroupName, setSsoGroupName] = useState('')
  const [roles, setRoles] = useState<SecurityRole[]>([])
  const [availableRoles, setAvailableRoles] = useState<SecurityRole[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const roleTypes = useMemo(() => dedupeInOrder(availableRoles.map((role) => role.type)), [availableRoles])
  const roleScopes = useMemo(
    () => dedupeInOrder(availableRoles.map((role) => role.scope)),
    [availableRoles],
  )

  useEffect(() => {
    let active = true

    async function loadData() {
      if (!tenantId) return
      try {
        const [groups, availableRolesData] = await Promise.all([
          isEditing ? listSecurityGroups(tenantId) : Promise.resolve([]),
          listAvailableSecurityRoles(),
        ])
        if (!active) return
        setAvailableRoles(availableRolesData)
        if (isEditing) {
          const group = groups.find((g) => g.id === id)
          if (!group) {
            setNotFound(true)
          } else {
            setName(group.name)
            setSsoGroupName(group.ssoGroupName ?? '')
            setRoles(group.roles)
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
  }, [tenantId, id, isEditing])

  const toggleRole = (type: SecurityRoleType, scope: SecurityRoleScope) => {
    setRoles((prev) =>
      prev.some((role) => role.type === type && role.scope === scope)
        ? prev.filter((role) => !(role.type === type && role.scope === scope))
        : [...prev, { type, scope }],
    )
  }

  const handleSubmit = async () => {
    if (!tenantId) return
    setSubmitting(true)
    setError(null)
    const payload: SecurityGroupRequest = { name, ssoGroupName, roles }
    try {
      if (isEditing && id) {
        await updateSecurityGroup(tenantId, id, payload)
      } else {
        await createSecurityGroup(tenantId, payload)
      }
      navigate(`/tenants/${tenantId}/security-groups`)
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
        <Alert severity="error">Security group not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate(`/tenants/${tenantId}/security-groups`)}>
          Back to security groups
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Edit Security Group' : 'Add Security Group'}
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
          <TextField
            label="SSO group name"
            value={ssoGroupName}
            onChange={(e) => setSsoGroupName(e.target.value)}
            fullWidth
            helperText="Optional. Maps this group to an identity provider group."
          />
          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Roles
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    {roleScopes.map((scope) => (
                      <TableCell key={scope} align="center">
                        {scope}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roleTypes.map((type) => (
                    <TableRow key={type} hover>
                      <TableCell>{type}</TableCell>
                      {roleScopes.map((scope) => (
                        <TableCell key={scope} align="center" sx={{ p: 0 }}>
                          <Checkbox
                            size="small"
                            checked={roles.some((role) => securityRolesEqual(role, { type, scope }))}
                            onChange={() => toggleRole(type, scope)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate(`/tenants/${tenantId}/security-groups`)} disabled={submitting}>
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

function dedupeInOrder<T>(values: T[]): T[] {
  return Array.from(new Set(values))
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

export default SecurityGroupFormPage
