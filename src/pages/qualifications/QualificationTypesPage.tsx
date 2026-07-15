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
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import { ApiError, ApiUnavailableError } from '../../api/client'
import { canCreateAny, hasPermission } from '../../api/permissions'
import { deleteQualificationType, listQualificationTypes } from '../../api/qualificationTypes'
import type { QualificationTypeResponse } from '../../api/types'

function QualificationTypesPage() {
  const navigate = useNavigate()
  const [types, setTypes] = useState<QualificationTypeResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [deletingType, setDeletingType] = useState<QualificationTypeResponse | null>(null)

  const loadData = useCallback(async () => {
    try {
      const typesData = await listQualificationTypes()
      setTypes(typesData)
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

  const handleDelete = async () => {
    if (!deletingType) return
    setSubmitting(true)
    setError(null)
    try {
      await deleteQualificationType(deletingType.id)
      setDeletingType(null)
      await loadData()
    } catch (err) {
      setError(describeError(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Container sx={{ py: 4 }}>
      <Stack direction="row" spacing={1} sx={{ mb: 3, alignItems: 'center' }}>
        <IconButton aria-label="back" onClick={() => navigate('/qualifications')}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Qualification Types
        </Typography>
        {canCreateAny(types) && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate('/qualification-types/new')}
          >
            Add Type
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
              {types.map((type) => (
                <TableRow key={type.id} hover>
                  <TableCell>{type.name}</TableCell>
                  <TableCell align="right">
                    {hasPermission(type.permissions, 'EDIT') && (
                      <IconButton
                        aria-label="edit"
                        onClick={() => navigate(`/qualification-types/${type.id}/edit`)}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                    )}
                    {hasPermission(type.permissions, 'DELETE') && (
                      <IconButton aria-label="delete" onClick={() => setDeletingType(type)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {types.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No qualification types found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      <Dialog open={deletingType !== null} onClose={() => setDeletingType(null)}>
        <DialogTitle>Delete qualification type</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete <strong>{deletingType?.name}</strong>? This cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingType(null)} disabled={submitting}>
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

export default QualificationTypesPage
