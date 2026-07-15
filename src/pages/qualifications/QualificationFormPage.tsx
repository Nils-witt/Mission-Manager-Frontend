import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Container from '@mui/material/Container'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Alert from '@mui/material/Alert'
import Snackbar from '@mui/material/Snackbar'
import type { SelectChangeEvent } from '@mui/material/Select'
import { ApiError, ApiUnavailableError } from '../../api/client'
import {
  createQualification,
  listQualifications,
  updateQualification,
} from '../../api/qualifications'
import { listQualificationTypes } from '../../api/qualificationTypes'
import type { QualificationRequest, QualificationResponse, QualificationTypeResponse } from '../../api/types'

function QualificationFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [name, setName] = useState('')
  const [typeId, setTypeId] = useState('')
  const [includedQualificationIds, setIncludedQualificationIds] = useState<string[]>([])
  const [types, setTypes] = useState<QualificationTypeResponse[]>([])
  const [qualifications, setQualifications] = useState<QualificationResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let active = true

    async function loadData() {
      try {
        const [typesData, qualificationsData] = await Promise.all([
          listQualificationTypes(),
          listQualifications(),
        ])
        if (!active) return
        setTypes(typesData)
        setQualifications(qualificationsData.filter((q) => q.id !== id))
        if (isEditing) {
          const qualification = qualificationsData.find((q) => q.id === id)
          if (!qualification) {
            setNotFound(true)
          } else {
            setName(qualification.name)
            setTypeId(qualification.typeId)
            setIncludedQualificationIds(qualification.includedQualificationIds)
          }
        }
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
  }, [id, isEditing])

  const handleIncludedQualificationsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setIncludedQualificationIds(typeof value === 'string' ? value.split(',') : value)
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setError(null)
    const payload: QualificationRequest = { name, typeId, includedQualificationIds }
    try {
      if (isEditing && id) {
        await updateQualification(id, payload)
      } else {
        await createQualification(payload)
      }
      navigate('/qualifications')
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
        <Alert severity="error">Qualification not found.</Alert>
        <Button sx={{ mt: 2 }} onClick={() => navigate('/qualifications')}>
          Back to qualifications
        </Button>
      </Container>
    )
  }

  return (
    <Container sx={{ py: 4 }} maxWidth="sm">
      <Typography variant="h4" component="h1" sx={{ mb: 3 }}>
        {isEditing ? 'Edit Qualification' : 'Add Qualification'}
      </Typography>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
            required
          />
          <FormControl fullWidth required>
            <InputLabel id="qualification-type-label">Type</InputLabel>
            <Select
              labelId="qualification-type-label"
              label="Type"
              value={typeId}
              onChange={(e) => setTypeId(e.target.value)}
            >
              {types.map((type) => (
                <MenuItem key={type.id} value={type.id}>
                  {type.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="included-qualifications-label">Includes</InputLabel>
            <Select
              labelId="included-qualifications-label"
              label="Includes"
              multiple
              value={includedQualificationIds}
              onChange={handleIncludedQualificationsChange}
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
        </Stack>
        <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'flex-end' }}>
          <Button onClick={() => navigate('/qualifications')} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={submitting || !name || !typeId}
          >
            {isEditing ? 'Save' : 'Create'}
          </Button>
        </Stack>
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

export default QualificationFormPage
