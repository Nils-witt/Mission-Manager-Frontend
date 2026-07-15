import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Tooltip from '@mui/material/Tooltip'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { canCreateAny, hasPermission } from '../../api/permissions'
import { deleteSecurityGroup, listSecurityGroups } from '../../api/securityGroups'
import { listTenants } from '../../api/tenants'
import type { SecurityGroupResponse, TenantResponse } from '../../api/types'
import { formatSecurityRole } from './securityRoles'

function SecurityGroupsPage() {
  const { tenantId } = useParams<{ tenantId: string }>()
  const navigate = useNavigate()
  const [tenant, setTenant] = useState<TenantResponse | null>(null)
  const [groups, setGroups] = useState<SecurityGroupResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deletingGroup, setDeletingGroup] = useState<SecurityGroupResponse | null>(null)

  const loadData = useCallback(async () => {
    if (!tenantId) return
    try {
      const [tenantsData, groupsData] = await Promise.all([
        listTenants(),
        listSecurityGroups(tenantId),
      ])
      const foundTenant = tenantsData.find((t) => t.id === tenantId)
      if (!foundTenant) {
        setNotFound(true)
      } else {
        setTenant(foundTenant)
      }
      setGroups(groupsData)
      setError(null)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [tenantId])

  useEffect(() => {
    // Mount-time fetch; loadData is also reused to refresh after mutations.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const handleDelete = async () => {
    if (!deletingGroup || !tenantId) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteSecurityGroup(tenantId, deletingGroup.id)
      setDeletingGroup(null)
      await loadData()
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
    <Container sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          <IconButton aria-label="back" onClick={() => navigate('/tenants')}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {tenant?.name} — Security Groups
          </Typography>
        </Stack>
        {canCreateAny(groups) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/tenants/${tenantId}/security-groups/new`)}
          >
            Add Security Group
          </Button>
        )}
      </Stack>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>SSO group</TableCell>
              <TableCell>Roles</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group.id} hover>
                <TableCell>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    <span>{group.name}</span>
                    {group.builtIn && <Chip label="Built-in" size="small" />}
                  </Stack>
                </TableCell>
                <TableCell>{group.ssoGroupName || '—'}</TableCell>
                <TableCell>
                  {group.roles.length === 0 ? (
                    '—'
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {group.roles.slice(0, 3).map((role) => (
                        <Chip
                          key={formatSecurityRole(role)}
                          label={formatSecurityRole(role)}
                          size="small"
                        />
                      ))}
                      {group.roles.length > 3 && (
                        <Chip label={`+${group.roles.length - 3} more`} size="small" />
                      )}
                    </Box>
                  )}
                </TableCell>
                <TableCell align="right">
                  {hasPermission(group.permissions, 'EDIT') && (
                    <IconButton
                      aria-label="edit"
                      onClick={() => navigate(`/tenants/${tenantId}/security-groups/${group.id}/edit`)}
                    >
                      <EditIcon fontSize="small" />
                    </IconButton>
                  )}
                  {hasPermission(group.permissions, 'DELETE') && (
                    <Tooltip title={group.builtIn ? 'Built-in groups cannot be deleted' : ''}>
                      <span>
                        <IconButton
                          aria-label="delete"
                          disabled={group.builtIn}
                          onClick={() => setDeletingGroup(group)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </span>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {groups.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No security groups found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deletingGroup !== null} onClose={() => setDeletingGroup(null)}>
        <DialogTitle>Delete security group</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingGroup?.name}</strong>? This cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingGroup(null)} disabled={submitting}>
            Cancel
          </Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={submitting}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

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

export default SecurityGroupsPage
