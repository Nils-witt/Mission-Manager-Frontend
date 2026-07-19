import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Alert from '@mui/material/Alert'
import Avatar from '@mui/material/Avatar'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Container from '@mui/material/Container'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import Divider from '@mui/material/Divider'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Snackbar from '@mui/material/Snackbar'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import AddIcon from '@mui/icons-material/Add'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import PeopleIcon from '@mui/icons-material/People'
import BadgeIcon from '@mui/icons-material/Badge'
import BusinessIcon from '@mui/icons-material/Business'
import EventIcon from '@mui/icons-material/Event'
import PlaceIcon from '@mui/icons-material/Place'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import { AttachmentList } from '../../components/AttachmentList'
import { AttachmentPreviewDialog } from '../../components/AttachmentPreviewDialog'
import { LogBookEntryForm } from '../../components/LogBookEntryForm'
import type { LogBookEntryInput } from '../../components/LogBookEntryForm'
import { formatLocation, toEmbeddableLocation } from '../../api/location'
import { useAttachmentPreview } from '../../hooks/useAttachmentPreview'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { hasPermission } from '../../api/permissions'
import { getMission, listMissionPositions, listMissionUsers } from '../../api/missions'
import {
  addLogBookEntry,
  downloadLogBookAttachment,
  listLogBookEntries,
  uploadLogBookAttachment,
} from '../../api/missionLogBook'
import { listTenants } from '../../api/tenants'
import type {
  LogBookEntryResponse,
  MissionPositionResponse,
  MissionResponse,
  TenantResponse,
  UserMissionAssignmentResponse,
} from '../../api/types'

export function MissionDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [mission, setMission] = useState<MissionResponse | null>(null)
  const [tenant, setTenant] = useState<TenantResponse | null>(null)
  const [assignedUsers, setAssignedUsers] = useState<UserMissionAssignmentResponse[]>([])
  const [positions, setPositions] = useState<MissionPositionResponse[]>([])
  const [logEntries, setLogEntries] = useState<LogBookEntryResponse[]>([])
  const [addEntryOpen, setAddEntryOpen] = useState(false)

  const downloadAttachment = useCallback(
    (fileId: string) => {
      if (!id) return Promise.reject(new Error('Missing mission id'))
      return downloadLogBookAttachment(id, fileId)
    },
    [id],
  )
  const {
    preview,
    previewLoading,
    thumbnails,
    loadThumbnails,
    openAttachment,
    closePreview,
    downloadPreview,
  } = useAttachmentPreview(downloadAttachment)

  const loadData = useCallback(async () => {
    if (!id) {
      setNotFound(true)
      setLoading(false)
      return
    }
    try {
      const [missionData, tenantsData, usersData, positionsData, logEntriesData] =
        await Promise.all([
          getMission(id),
          listTenants(),
          listMissionUsers(id),
          listMissionPositions(id),
          listLogBookEntries(id, { sort: ['createdAt,desc'] }),
        ])
      setMission(missionData)
      setTenant(tenantsData.find((t) => t.id === missionData.tenantId) ?? null)
      setAssignedUsers(usersData)
      setPositions(positionsData)
      setLogEntries(logEntriesData)
      setError(null)
    } catch (err) {
      setError(describeError(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData()
  }, [loadData])

  const logEntryAttachments = useMemo(
    () => logEntries.flatMap((entry) => entry.attachments),
    [logEntries],
  )

  useEffect(() => {
    loadThumbnails(logEntryAttachments)
  }, [logEntryAttachments, loadThumbnails])

  const handleOpenAttachment = async (fileId: string, originalFileName: string) => {
    setError(null)
    try {
      await openAttachment(fileId, originalFileName)
    } catch (err) {
      setError(describeError(err))
    }
  }

  const handleSubmitEntry = async ({
    text,
    sender,
    recipient,
    location,
    attachments,
  }: LogBookEntryInput) => {
    if (!id) return
    const uploaded = await Promise.all(
      attachments.map(({ file, location: attachmentLocation }) =>
        uploadLogBookAttachment(id, file, file.name, toEmbeddableLocation(attachmentLocation) ?? undefined),
      ),
    )
    await addLogBookEntry(id, {
      text,
      sender,
      recipient,
      attachmentIds: uploaded.map((file) => file.id),
      location: toEmbeddableLocation(location),
    })
    await loadData()
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

  if (notFound || !mission) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error">Mission not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/missions')}>
          Back to missions
        </Button>
      </Container>
    )
  }

  const status = getMissionStatus(mission)

  return (
    <Container sx={{ py: 4 }} maxWidth="md">
      <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
        <IconButton aria-label="back" onClick={() => navigate('/missions')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          {mission.name}
        </Typography>
        {hasPermission(mission.permissions, 'EDIT') && (
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              startIcon={<BadgeIcon />}
              onClick={() => navigate(`/missions/${mission.id}/positions`)}
            >
              Manage positions
            </Button>
            <Button
              variant="outlined"
              startIcon={<PeopleIcon />}
              onClick={() => navigate(`/missions/${mission.id}/users`)}
            >
              Manage users
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => navigate(`/missions/${mission.id}/edit`)}
            >
              Edit
            </Button>
          </Stack>
        )}
      </Stack>

      <Paper sx={{ p: 3 }}>
        <Stack direction="row" spacing={1} sx={{ mb: 3, flexWrap: 'wrap', gap: 1 }}>
          <Chip label={status.label} color={status.color} />
          {tenant && <Chip variant="outlined" icon={<BusinessIcon />} label={tenant.name} />}
        </Stack>

        <Stack spacing={2.5}>
          <InfoRow icon={<EventIcon fontSize="small" />} label="Start">
            {formatDateTime(mission.startTime)}
          </InfoRow>
          <InfoRow icon={<EventIcon fontSize="small" />} label="End">
            {formatDateTime(mission.endTime)}
          </InfoRow>
          <InfoRow icon={<PlaceIcon fontSize="small" />} label="Address">
            {mission.streetAddress || '—'}
          </InfoRow>
          <InfoRow icon={<MyLocationIcon fontSize="small" />} label="Coordinates">
            {mission.latitude != null && mission.longitude != null
              ? `${mission.latitude.toFixed(5)}, ${mission.longitude.toFixed(5)}`
              : '—'}
          </InfoRow>
        </Stack>

        <Divider sx={{ my: 3 }} />

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Assigned users ({assignedUsers.length})
          </Typography>
          <Button size="small" onClick={() => navigate(`/missions/${mission.id}/users`)}>
            Manage
          </Button>
        </Stack>
        {assignedUsers.length === 0 ? (
          <Typography color="text.secondary">No users assigned to this mission.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {assignedUsers.map((assignment) => (
              <Chip
                key={assignment.id}
                label={assignment.username}
                avatar={<Avatar>{assignment.username.charAt(0).toUpperCase()}</Avatar>}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Positions ({positions.length})
          </Typography>
          <Button size="small" onClick={() => navigate(`/missions/${mission.id}/positions`)}>
            Manage
          </Button>
        </Stack>
        {positions.length === 0 ? (
          <Typography color="text.secondary">No positions defined for this mission.</Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {positions.map((position) => (
              <Chip
                key={position.id}
                icon={<BadgeIcon />}
                label={
                  position.assignedUsername
                    ? `${position.name}: ${position.assignedUsername}`
                    : `${position.name}: Unassigned`
                }
                variant={position.assignedUsername ? 'filled' : 'outlined'}
              />
            ))}
          </Box>
        )}

        <Divider sx={{ my: 3 }} />

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Log book
          </Typography>
          <Button size="small" startIcon={<AddIcon />} onClick={() => setAddEntryOpen(true)}>
            Add entry
          </Button>
        </Stack>
        {logEntries.length === 0 ? (
          <Typography color="text.secondary">No log book entries yet.</Typography>
        ) : (
          <Stack spacing={1}>
            {logEntries.map((entry) => (
              <Box key={entry.id}>
                <Typography variant="body2" noWrap>
                  <strong>
                    {entry.sender || '—'} → {entry.recipient || '—'}:
                  </strong>{' '}
                  {entry.text}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {formatDateTime(entry.createdAt)}
                  {formatLocation(entry.location) && ` · ${formatLocation(entry.location)}`}
                </Typography>
                {entry.attachments.length > 0 && (
                  <Box sx={{ mt: 1 }}>
                    <AttachmentList
                      attachments={entry.attachments}
                      thumbnails={thumbnails}
                      onOpen={handleOpenAttachment}
                      disabled={previewLoading}
                    />
                  </Box>
                )}
              </Box>
            ))}
          </Stack>
        )}
      </Paper>

      <AttachmentPreviewDialog
        preview={preview}
        onClose={closePreview}
        onDownload={downloadPreview}
      />

      <Dialog open={addEntryOpen} onClose={() => setAddEntryOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New log book entry</DialogTitle>
        <DialogContent>
          <LogBookEntryForm
            onSubmit={handleSubmitEntry}
            onError={(err) => setError(describeError(err))}
            onSuccess={() => setAddEntryOpen(false)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddEntryOpen(false)}>Cancel</Button>
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

interface InfoRowProps {
  icon: ReactNode
  label: string
  children: ReactNode
}

function InfoRow({ icon, label, children }: InfoRowProps) {
  return (
    <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start' }}>
      <Box sx={{ color: 'text.secondary', mt: '2px' }}>{icon}</Box>
      <Box>
        <Typography variant="body2" color="text.secondary">
          {label}
        </Typography>
        <Typography variant="body1">{children}</Typography>
      </Box>
    </Stack>
  )
}

function getMissionStatus(mission: MissionResponse): {
  label: string
  color: 'default' | 'info' | 'success' | 'warning'
} {
  const now = Date.now()
  const start = mission.startTime ? new Date(mission.startTime).getTime() : null
  const end = mission.endTime ? new Date(mission.endTime).getTime() : null

  if (start && now < start) return { label: 'Upcoming', color: 'info' }
  if (end && now > end) return { label: 'Completed', color: 'default' }
  if (start || end) return { label: 'Ongoing', color: 'success' }
  return { label: 'Unscheduled', color: 'warning' }
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
