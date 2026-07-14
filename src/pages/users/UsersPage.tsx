import { useCallback, useEffect, useState } from 'react'
import Container from '@mui/material/Container'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import Paper from '@mui/material/Paper'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
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
import { ApiError } from '../../api/client'
import { createUser, deleteUser, listUsers, updateUser } from '../../api/users'
import { listTenants } from '../../api/tenants'
import { listSecurityGroups } from '../../api/securityGroups'
import type {
  SecurityGroupResponse,
  TenantResponse,
  UserRequest,
  UserResponse,
} from '../../api/types'
import UserFormDialog from './UserFormDialog'

function UsersPage() {
  const [users, setUsers] = useState<UserResponse[]>([])
  const [tenants, setTenants] = useState<TenantResponse[]>([])
  const [securityGroups, setSecurityGroups] = useState<SecurityGroupResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editingUser, setEditingUser] = useState<UserResponse | null>(null)
  const [deletingUser, setDeletingUser] = useState<UserResponse | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [usersData, tenantsData, securityGroupsData] = await Promise.all([
        listUsers(),
        listTenants(),
        listSecurityGroups(),
      ])
      setUsers(usersData)
      setTenants(tenantsData)
      setSecurityGroups(securityGroupsData)
      setError(null)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Mount-time fetch; loadData is also reused to refresh after mutations.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const tenantName = (id: string | null) => tenants.find((t) => t.id === id)?.name ?? '—'

  const openCreateForm = () => {
    setEditingUser(null)
    setFormKey((key) => key + 1)
    setFormOpen(true)
  }

  const openEditForm = (user: UserResponse) => {
    setEditingUser(user)
    setFormKey((key) => key + 1)
    setFormOpen(true)
  }

  const handleSubmit = async (values: UserRequest) => {
    setSubmitting(true)
    setError(null)
    try {
      if (editingUser) {
        await updateUser(editingUser.id, values)
      } else {
        await createUser(values)
      }
      setFormOpen(false)
      await loadData()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingUser) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteUser(deletingUser.id)
      setDeletingUser(null)
      await loadData()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" sx={{ mb: 3, justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Users
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
          Add User
        </Button>
      </Stack>

      {loading ? (
        <Stack sx={{ py: 6, alignItems: 'center' }}>
          <CircularProgress />
        </Stack>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Username</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Primary tenant</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} hover>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>
                    {user.firstName} {user.lastName}
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{tenantName(user.primaryTenantId)}</TableCell>
                  <TableCell>
                    <Stack direction="row" spacing={1}>
                      <Chip
                        label={user.enabled ? 'Enabled' : 'Disabled'}
                        color={user.enabled ? 'success' : 'default'}
                        size="small"
                      />
                      {user.locked && <Chip label="Locked" color="warning" size="small" />}
                    </Stack>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton aria-label="edit" onClick={() => openEditForm(user)}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton aria-label="delete" onClick={() => setDeletingUser(user)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No users found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <UserFormDialog
        key={formKey}
        open={formOpen}
        user={editingUser}
        tenants={tenants}
        securityGroups={securityGroups}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={deletingUser !== null} onClose={() => setDeletingUser(null)}>
        <DialogTitle>Delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingUser?.username}</strong>? This cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingUser(null)} disabled={submitting}>
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
  if (err instanceof ApiError) {
    if (err.status === 401) {
      return 'Your session expired. Redirecting to sign in…'
    }
    if (err.status === 403) {
      return 'You do not have permission to do that.'
    }
    return `Request failed (${err.status}): ${err.message}`
  }
  return 'Something went wrong. Is the API running at http://localhost:8080?'
}

export default UsersPage
