import { useRef, useState } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import CloseIcon from '@mui/icons-material/Close'
import SendIcon from '@mui/icons-material/Send'

export interface LogBookEntryInput {
  text: string
  sender: string
  recipient: string
  files: File[]
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
  const [pendingFiles, setPendingFiles] = useState<File[]>([])
  const [submitting, setSubmitting] = useState(false)

  const handleFilesSelected = (files: FileList | null) => {
    if (!files) return
    setPendingFiles((prev) => [...prev, ...Array.from(files)])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleRemovePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSubmitting(true)
    try {
      await onSubmit({
        text: text.trim(),
        sender: sender.trim(),
        recipient: recipient.trim(),
        files: pendingFiles,
      })
      setSender('')
      setRecipient('')
      setText('')
      setPendingFiles([])
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
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
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
        {pendingFiles.map((file, index) => (
          <Chip
            key={`${file.name}-${index}`}
            label={file.name}
            onDelete={() => handleRemovePendingFile(index)}
            deleteIcon={<CloseIcon />}
          />
        ))}
      </Stack>
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
