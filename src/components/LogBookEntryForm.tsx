import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Collapse from '@mui/material/Collapse'
import IconButton from '@mui/material/IconButton'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import PlaceIcon from '@mui/icons-material/Place'
import SendIcon from '@mui/icons-material/Send'
import { emptyLocation, locationHasValue, type LocationValue } from '../api/location'
import { LocationFields } from './LocationFields'

export interface LogBookAttachmentInput {
  file: File
  location: LocationValue
}

export interface LogBookEntryInput {
  text: string
  sender: string
  recipient: string
  location: LocationValue
  attachments: LogBookAttachmentInput[]
}

interface LogBookEntryFormProps {
  onSubmit: (entry: LogBookEntryInput) => Promise<void>
  onError: (err: unknown) => void
  onSuccess?: () => void
}

export function LogBookEntryForm({ onSubmit, onError, onSuccess }: LogBookEntryFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [sender, setSender] = useState('')
  const [recipient, setRecipient] = useState('')
  const [text, setText] = useState('')
  const [location, setLocation] = useState<LocationValue>(emptyLocation)
  const [pendingAttachments, setPendingAttachments] = useState<LogBookAttachmentInput[]>([])
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    setPendingAttachments((prev) => [
      ...prev,
      ...Array.from(files).map((file) => ({ file, location: emptyLocation })),
    ])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemovePendingFile = (index: number) => {
    setPendingAttachments((prev) => prev.filter((_, i) => i !== index))
    setExpandedIndex((prev) => (prev === index ? null : prev))
  }

  const handleAttachmentLocationChange = (index: number, value: LocationValue) => {
    setPendingAttachments((prev) =>
      prev.map((attachment, i) => (i === index ? { ...attachment, location: value } : attachment)),
    )
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        text: text.trim(),
        sender: sender.trim(),
        recipient: recipient.trim(),
        location,
        attachments: pendingAttachments,
      })
      setSender('')
      setRecipient('')
      setText('')
      setLocation(emptyLocation)
      setPendingAttachments([])
      setExpandedIndex(null)
      onSuccess?.()
    } catch (err) {
      onError(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <TextField
          label="Sender"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          fullWidth
        />
        <TextField
          label="Recipient"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          fullWidth
        />
      </Stack>
      <TextField
        label="Message"
        value={text}
        onChange={(e) => setText(e.target.value)}
        multiline
        minRows={3}
        fullWidth
      />

      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 0.5 }}>
          Location
        </Typography>
        <LocationFields value={location} onChange={setLocation} />
      </Box>

      <Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center', mb: 1 }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            hidden
            onChange={(e) => handleFilesSelected(e.target.files)}
          />
          <Button
            variant="outlined"
            startIcon={<AttachFileIcon />}
            onClick={() => fileInputRef.current?.click()}
          >
            Attach files
          </Button>
        </Stack>
        {pendingAttachments.length > 0 && (
          <Stack spacing={1}>
            {pendingAttachments.map((attachment, index) => (
              <Paper key={`${attachment.file.name}-${index}`} variant="outlined" sx={{ p: 1 }}>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <AttachFileIcon fontSize="small" color="action" />
                  <Typography variant="body2" sx={{ flexGrow: 1 }} noWrap>
                    {attachment.file.name}
                  </Typography>
                  <Tooltip title="Set attachment location">
                    <IconButton
                      size="small"
                      onClick={() => setExpandedIndex((prev) => (prev === index ? null : index))}
                    >
                      <PlaceIcon
                        fontSize="small"
                        color={locationHasValue(attachment.location) ? 'primary' : 'inherit'}
                      />
                    </IconButton>
                  </Tooltip>
                  <IconButton size="small" onClick={() => handleRemovePendingFile(index)}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Stack>
                <Collapse in={expandedIndex === index}>
                  <Box sx={{ mt: 1, pl: 4 }}>
                    <LocationFields
                      value={attachment.location}
                      onChange={(value) => handleAttachmentLocationChange(index, value)}
                      compact
                    />
                  </Box>
                </Collapse>
              </Paper>
            ))}
          </Stack>
        )}
      </Box>

      <Box>
        <Button
          variant="contained"
          startIcon={<SendIcon />}
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
        >
          Add entry
        </Button>
      </Box>
    </Stack>
  )
}
