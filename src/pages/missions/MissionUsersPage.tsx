import { useCallback, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ApiError, ApiUnavailableError } from '../../api/client'
import {
  assignMissionUser,
  listMissionUsers,
  listMissions,
  unassignMissionUser,
} from '../../api/missions'
import { listUsers } from '../../api/users'
import type { MissionResponse, UserMissionAssignmentResponse, UserResponse } from '../../api/types'

function MissionUsersPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [mission, setMission] = useState<MissionResponse | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<UserMissionAssignmentResponse[]>([])
  const [allUsers, setAllUsers] = useState<UserResponse[]>([])
  const [selectedUserId, setSelectedUserId] = useState('')
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    try {
      const [missions, assigned, users] = await Promise.all([
        listMissions(),
        listMissionUsers(id),
        listUsers(),
      ])
      const found = missions.find((m) => m.id === id)
      if (!found) {
        setNotFound(true)
      } else {
        setMission(found)
      }
      setAssignedUsers(assigned)
      setAllUsers(users)
      setError(null)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // Mount-time fetch; loadData is also reused to refresh after mutations.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const unassignedUsers = allUsers.filter(
    (user) => !assignedUsers.some((assigned) => assigned.userId === user.id),
  )

  const handleAssign = async () => {
    if (!id || !selectedUserId) return
    setSubmitting(true)
    setError(null)
    try {
      await assignMissionUser(id, {
        userId: selectedUserId,
        startTime: new Date().toISOString(),
        endTime: null,
      })
      setSelectedUserId('')
      await loadData()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  const handleUnassign = async (assignmentId: string) => {
    if (!id) return
    setSubmitting(true)
    setError(null)
    try {
      await unassignMissionUser(id, assignmentId)
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
    <Container sx={{ py: 4 }} maxWidth="sm">
      <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
        <IconButton aria-label="back" onClick={() => navigate('/missions')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1">
          {mission?.name} — Assigned Users
        </Typography>
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="assign-user-label">Add user</InputLabel>
            <Select
              labelId="assign-user-label"
              label="Add user"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={unassignedUsers.length === 0}
            >
              {unassignedUsers.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.username} ({user.firstName} {user.lastName})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAssign}
            disabled={submitting || !selectedUserId}
          >
            Assign
          </Button>
        </Stack>

        <List>
          {assignedUsers.map((assignment) => {
            const user = allUsers.find((u) => u.id === assignment.userId)
            return (
              <ListItem
                key={assignment.id}
                secondaryAction={
                  <IconButton
                    aria-label="unassign"
                    onClick={() => handleUnassign(assignment.id)}
                    disabled={submitting}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={assignment.username}
                  secondary={user ? `${user.firstName} ${user.lastName}`.trim() : undefined}
                />
              </ListItem>
            )
          })}
          {assignedUsers.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center' }}>
              No users assigned to this mission.
            </Typography>
          )}
        </List>
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

export default MissionUsersPage
