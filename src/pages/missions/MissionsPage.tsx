import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import PeopleIcon from '@mui/icons-material/People'
import BadgeIcon from '@mui/icons-material/Badge'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { canCreateAny, hasPermission } from '../../api/permissions'
import { deleteMission, listMissions } from '../../api/missions'
import { listTenants } from '../../api/tenants'
import type { MissionResponse, TenantResponse } from '../../api/types'

function MissionsPage() {
  const navigate = useNavigate()
  const [missions, setMissions] = useState<MissionResponse[]>([])
  const [tenants, setTenants] = useState<TenantResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deletingMission, setDeletingMission] = useState<MissionResponse | null>(null)

  const loadData = useCallback(async () => {
    try {
      const [missionsData, tenantsData] = await Promise.all([listMissions(), listTenants()])
      setMissions(missionsData)
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

  const tenantName = (tenantId: string) =>
    tenants.find((tenant) => tenant.id === tenantId)?.name ?? '—'

  const handleDelete = async () => {
    if (!deletingMission) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteMission(deletingMission.id)
      setDeletingMission(null)
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
          Missions
        </Typography>
        {canCreateAny(missions) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/missions/new')}
          >
            Add Mission
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
                <TableCell>Tenant</TableCell>
                <TableCell>Start</TableCell>
                <TableCell>End</TableCell>
                <TableCell>Address</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {missions
                .sort((a, b) => b.name.localeCompare(a.name))
                .map((mission) => (
                  <TableRow key={mission.id} hover>
                    <TableCell>
                      <Button
                        size="small"
                        onClick={() => navigate(`/missions/${mission.id}`)}
                        sx={{ textTransform: 'none', p: 0, minWidth: 0 }}
                      >
                        {mission.name}
                      </Button>
                    </TableCell>
                    <TableCell>{tenantName(mission.tenantId)}</TableCell>
                    <TableCell>{formatDateTime(mission.startTime)}</TableCell>
                    <TableCell>{formatDateTime(mission.endTime)}</TableCell>
                    <TableCell>{mission.streetAddress || '—'}</TableCell>
                    <TableCell align="right">
                      {hasPermission(mission.permissions, 'EDIT') && (
                        <IconButton
                          aria-label="manage positions"
                          onClick={() => navigate(`/missions/${mission.id}/positions`)}
                        >
                          <BadgeIcon fontSize="small" />
                        </IconButton>
                      )}
                      {hasPermission(mission.permissions, 'EDIT') && (
                        <IconButton
                          aria-label="manage users"
                          onClick={() => navigate(`/missions/${mission.id}/users`)}
                        >
                          <PeopleIcon fontSize="small" />
                        </IconButton>
                      )}
                      {hasPermission(mission.permissions, 'EDIT') && (
                        <IconButton
                          aria-label="edit"
                          onClick={() => navigate(`/missions/${mission.id}/edit`)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      )}
                      {hasPermission(mission.permissions, 'DELETE') && (
                        <IconButton aria-label="delete" onClick={() => setDeletingMission(mission)}>
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              {missions.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    No missions found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deletingMission !== null} onClose={() => setDeletingMission(null)}>
        <DialogTitle>Delete mission</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingMission?.name}</strong>? This cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingMission(null)} disabled={submitting}>
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

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  return new Date(value).toLocaleString()
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

export default MissionsPage
