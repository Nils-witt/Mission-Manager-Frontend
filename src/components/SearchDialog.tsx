import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import SearchIcon from '@mui/icons-material/Search'
import List from '@mui/material/List'
import ListSubheader from '@mui/material/ListSubheader'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Typography from '@mui/material/Typography'
import Stack from '@mui/material/Stack'
import { ApiError, ApiUnavailableError } from '../api/client'
import { listUsers } from '../api/users'
import { listMissions } from '../api/missions'
import { listTenants } from '../api/tenants'
import type { MissionResponse, TenantResponse, UserResponse } from '../api/types'

interface SearchDialogProps {
  open: boolean
  onClose: () => void
}

function SearchDialog({ open, onClose }: SearchDialogProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UserResponse[]>([])
  const [missions, setMissions] = useState<MissionResponse[]>([])
  const [tenants, setTenants] = useState<TenantResponse[]>([])

  useEffect(() => {
    if (!open || loaded) return
    let active = true

    async function loadData() {
      setLoading(true)
      try {
        const [usersData, missionsData, tenantsData] = await Promise.all([
          listUsers(),
          listMissions(),
          listTenants(),
        ])
        if (!active) return
        setUsers(usersData)
        setMissions(missionsData)
        setTenants(tenantsData)
        setLoaded(true)
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
  }, [open, loaded])

  const normalizedQuery = query.trim().toLowerCase()

  const matchedUsers = useMemo(() => {
    if (!normalizedQuery) return []
    return users.filter((user) =>
      [user.username, user.firstName, user.lastName, user.email]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [users, normalizedQuery])

  const matchedMissions = useMemo(() => {
    if (!normalizedQuery) return []
    return missions.filter((mission) =>
      [mission.name, mission.streetAddress ?? '']
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery),
    )
  }, [missions, normalizedQuery])

  const matchedTenants = useMemo(() => {
    if (!normalizedQuery) return []
    return tenants.filter((tenant) => tenant.name.toLowerCase().includes(normalizedQuery))
  }, [tenants, normalizedQuery])

  const hasResults =
    matchedUsers.length > 0 || matchedMissions.length > 0 || matchedTenants.length > 0

  const handleClose = () => {
    setQuery('')
    onClose()
  }

  const goTo = (path: string) => {
    navigate(path)
    handleClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogContent>
        <TextField
          autoFocus
          fullWidth
          placeholder="Search users, missions, tenants…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            },
          }}
        />

        {loading && (
          <Stack sx={{ py: 4, alignItems: 'center' }}>
            <CircularProgress size={28} />
          </Stack>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && normalizedQuery !== '' && !hasResults && (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center' }}>
            No results found.
          </Typography>
        )}

        {!loading && !error && hasResults && (
          <List sx={{ maxHeight: 400, overflowY: 'auto' }}>
            {matchedUsers.length > 0 && (
              <>
                <ListSubheader>Users</ListSubheader>
                {matchedUsers.map((user) => (
                  <ListItemButton key={user.id} onClick={() => goTo(`/users/${user.id}/edit`)}>
                    <ListItemText
                      primary={user.username}
                      secondary={`${user.firstName} ${user.lastName} — ${user.email}`}
                    />
                  </ListItemButton>
                ))}
              </>
            )}
            {matchedMissions.length > 0 && (
              <>
                <ListSubheader>Missions</ListSubheader>
                {matchedMissions.map((mission) => (
                  <ListItemButton
                    key={mission.id}
                    onClick={() => goTo(`/missions/${mission.id}/edit`)}
                  >
                    <ListItemText
                      primary={mission.name}
                      secondary={mission.streetAddress || undefined}
                    />
                  </ListItemButton>
                ))}
              </>
            )}
            {matchedTenants.length > 0 && (
              <>
                <ListSubheader>Tenants</ListSubheader>
                {matchedTenants.map((tenant) => (
                  <ListItemButton
                    key={tenant.id}
                    onClick={() => goTo(`/tenants/${tenant.id}/edit`)}
                  >
                    <ListItemText primary={tenant.name} />
                  </ListItemButton>
                ))}
              </>
            )}
          </List>
        )}
      </DialogContent>
    </Dialog>
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

export default SearchDialog
