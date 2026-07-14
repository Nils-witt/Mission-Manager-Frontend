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
import { ApiError, ApiUnavailableError } from '../../api/client'
import { canCreateAny, hasPermission } from '../../api/permissions'
import { createTenant, deleteTenant, listTenants, updateTenant } from '../../api/tenants'
import type { TenantRequest, TenantResponse } from '../../api/types'
import TenantFormDialog from './TenantFormDialog'

function TenantsPage() {
  const [tenants, setTenants] = useState<TenantResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [formOpen, setFormOpen] = useState(false)
  const [formKey, setFormKey] = useState(0)
  const [editingTenant, setEditingTenant] = useState<TenantResponse | null>(null)
  const [deletingTenant, setDeletingTenant] = useState<TenantResponse | null>(null)

  const loadData = useCallback(async () => {
    try {
      const tenantsData = await listTenants()
      setTenants(tenantsData)
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

  const openCreateForm = () => {
    setEditingTenant(null)
    setFormKey((key) => key + 1)
    setFormOpen(true)
  }

  const openEditForm = (tenant: TenantResponse) => {
    setEditingTenant(tenant)
    setFormKey((key) => key + 1)
    setFormOpen(true)
  }

  const handleSubmit = async (values: TenantRequest) => {
    setSubmitting(true)
    setError(null)
    try {
      if (editingTenant) {
        await updateTenant(editingTenant.id, values)
      } else {
        await createTenant(values)
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
    if (!deletingTenant) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteTenant(deletingTenant.id)
      setDeletingTenant(null)
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
          Tenants
        </Typography>
        {canCreateAny(tenants) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
            Add Tenant
          </Button>
        )}
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
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tenants.map((tenant) => (
                <TableRow key={tenant.id} hover>
                  <TableCell>{tenant.name}</TableCell>
                  <TableCell align="right">
                    {hasPermission(tenant.permissions, 'EDIT') && (
                      <IconButton aria-label="edit" onClick={() => openEditForm(tenant)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {hasPermission(tenant.permissions, 'DELETE') && (
                      <IconButton aria-label="delete" onClick={() => setDeletingTenant(tenant)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {tenants.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No tenants found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <TenantFormDialog
        key={formKey}
        open={formOpen}
        tenant={editingTenant}
        submitting={submitting}
        onClose={() => setFormOpen(false)}
        onSubmit={handleSubmit}
      />

      <Dialog open={deletingTenant !== null} onClose={() => setDeletingTenant(null)}>
        <DialogTitle>Delete tenant</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingTenant?.name}</strong>? This cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingTenant(null)} disabled={submitting}>
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

export default TenantsPage
