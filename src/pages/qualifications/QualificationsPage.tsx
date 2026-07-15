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
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
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
import CategoryIcon from '@mui/icons-material/Category'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { canCreateAny, hasPermission } from '../../api/permissions'
import { deleteQualification, listQualifications } from '../../api/qualifications'
import type { QualificationResponse } from '../../api/types'

function QualificationsPage() {
  const navigate = useNavigate()
  const [qualifications, setQualifications] = useState<QualificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deletingQualification, setDeletingQualification] = useState<QualificationResponse | null>(
    null,
  )

  const loadData = useCallback(async () => {
    try {
      const qualificationsData = await listQualifications()
      setQualifications(qualificationsData)
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

  const qualificationName = (qualificationId: string) =>
    qualifications.find((q) => q.id === qualificationId)?.name ?? qualificationId

  const handleDelete = async () => {
    if (!deletingQualification) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteQualification(deletingQualification.id)
      setDeletingQualification(null)
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
          Qualifications
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => navigate('/qualification-types')}
          >
            Manage Types
          </Button>
          {canCreateAny(qualifications) && (
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/qualifications/new')}
            >
              Add Qualification
            </Button>
          )}
        </Stack>
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
                <TableCell>Type</TableCell>
                <TableCell>Includes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {qualifications.map((qualification) => (
                <TableRow key={qualification.id} hover>
                  <TableCell>{qualification.name}</TableCell>
                  <TableCell>{qualification.typeName || '—'}</TableCell>
                  <TableCell>
                    {qualification.includedQualificationIds.length === 0 ? (
                      '—'
                    ) : (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {qualification.includedQualificationIds.map((includedId) => (
                          <Chip key={includedId} label={qualificationName(includedId)} size="small" />
                        ))}
                      </Box>
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {hasPermission(qualification.permissions, 'EDIT') && (
                      <IconButton
                        aria-label="edit"
                        onClick={() => navigate(`/qualifications/${qualification.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {hasPermission(qualification.permissions, 'DELETE') && (
                      <IconButton
                        aria-label="delete"
                        onClick={() => setDeletingQualification(qualification)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {qualifications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No qualifications found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deletingQualification !== null} onClose={() => setDeletingQualification(null)}>
        <DialogTitle>Delete qualification</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingQualification?.name}</strong>? This
            cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingQualification(null)} disabled={submitting}>
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

export default QualificationsPage
