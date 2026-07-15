import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import type { SelectChangeEvent } from '@mui/material/Select'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ApiError, ApiUnavailableError } from '../../api/client'
import {
  assignMissionPositionUser,
  createMissionPosition,
  deleteMissionPosition,
  getMission,
  listMissionPositions,
} from '../../api/missions'
import { listQualifications } from '../../api/qualifications'
import { listUsers } from '../../api/users'
import type { MissionPositionResponse, MissionResponse, QualificationResponse, UserResponse } from '../../api/types'

function MissionPositionsPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [mission, setMission] = useState<MissionResponse | null>(null)
  const [positions, setPositions] = useState<MissionPositionResponse[]>([])
  const [qualifications, setQualifications] = useState<QualificationResponse[]>([])
  const [users, setUsers] = useState<UserResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [newName, setNewName] = useState('')
  const [newQualificationIds, setNewQualificationIds] = useState<string[]>([])
  const [deletingPosition, setDeletingPosition] = useState<MissionPositionResponse | null>(null)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [missionData, positionsData, qualificationsData, usersData] = await Promise.all([
        getMission(id),
        listMissionPositions(id),
        listQualifications(),
        listUsers(),
      ])
      setMission(missionData)
      setPositions(positionsData)
      setQualifications(qualificationsData)
      setUsers(usersData)
      setError(null)
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) {
        setNotFound(true)
      } else {
        setError(describeError(err))
      }
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // Mount-time fetch; loadData is also reused to refresh after mutations.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const handleQualificationIdsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setNewQualificationIds(typeof value === 'string' ? value.split(',') : value)
  }

  const handleAddPosition = async () => {
    if (!id || !newName.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await createMissionPosition(id, {
        name: newName.trim(),
        qualificationIds: newQualificationIds,
        assignedUserId: null,
      })
      setNewName('')
      setNewQualificationIds([])
      await loadData()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleAssignedUserChange = async (positionId: string, userId: string) => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await assignMissionPositionUser(id, positionId, userId || null)
      await loadData()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!id || !deletingPosition) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteMissionPosition(id, deletingPosition.id)
      setDeletingPosition(null)
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
        <Alert severity="error">Mission not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/missions')}>
          Back to missions
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
        <IconButton aria-label="back" onClick={() => navigate(`/missions/${id}`)}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {mission?.name} — Positions
        </Typography>
      </Stack>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
          Add position
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: 'flex-start' }}>
          <TextField
            label="Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            fullWidth
          />
          <FormControl fullWidth>
            <InputLabel id="new-position-qualifications-label">Required qualifications</InputLabel>
            <Select
              labelId="new-position-qualifications-label"
              label="Required qualifications"
              multiple
              value={newQualificationIds}
              onChange={handleQualificationIdsChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((qualificationId) => (
                    <Chip
                      key={qualificationId}
                      label={
                        qualifications.find((q) => q.id === qualificationId)?.name ??
                        qualificationId
                      }
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {qualifications.map((qualification) => (
                <MenuItem key={qualification.id} value={qualification.id}>
                  {qualification.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddPosition}
            disabled={submitting || !newName.trim()}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Position
          </Button>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Required qualifications</TableCell>
              <TableCell>Assigned user</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {positions.map((position) => (
              <TableRow key={position.id} hover>
                <TableCell>{position.name}</TableCell>
                <TableCell>
                  {position.qualificationIds.length === 0 ? (
                    '—'
                  ) : (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                      {position.qualificationIds.map((qualificationId) => (
                        <Chip
                          key={qualificationId}
                          label={
                            qualifications.find((q) => q.id === qualificationId)?.name ??
                            qualificationId
                          }
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </TableCell>
                <TableCell>
                  <FormControl size="small" sx={{ minWidth: 180 }}>
                    <Select
                      displayEmpty
                      value={position.assignedUserId ?? ''}
                      onChange={(e) => handleAssignedUserChange(position.id, e.target.value)}
                    >
                      <MenuItem value="">
                        <em>Unassigned</em>
                      </MenuItem>
                      {users.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </TableCell>
                <TableCell align="right">
                  <IconButton aria-label="delete" onClick={() => setDeletingPosition(position)}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {positions.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No positions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={deletingPosition !== null} onClose={() => setDeletingPosition(null)}>
        <DialogTitle>Delete position</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingPosition?.name}</strong>? This cannot
            be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingPosition(null)} disabled={submitting}>
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

export default MissionPositionsPage
