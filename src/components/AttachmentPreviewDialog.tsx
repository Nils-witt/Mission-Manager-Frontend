import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CloseIcon from '@mui/icons-material/Close'
import DownloadIcon from '@mui/icons-material/Download'
import type { AttachmentPreview } from '../hooks/useAttachmentPreview'

interface AttachmentPreviewDialogProps {
  preview: AttachmentPreview | null
  onClose: () => void
  onDownload: () => void
}

export function AttachmentPreviewDialog({
  preview,
  onClose,
  onDownload,
}: AttachmentPreviewDialogProps) {
  return (
    <Dialog open={preview !== null} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}
      >
        <Typography variant="subtitle1" component="span" noWrap>
          {preview?.fileName}
        </Typography>
        <IconButton aria-label="close preview" size="small" onClick={onClose}>
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 240 }}
      >
        {preview?.kind === 'image' && (
          <Box
            component="img"
            src={preview.url}
            alt={preview.fileName}
            sx={{ maxWidth: '100%', maxHeight: '70vh' }}
          />
        )}
        {preview?.kind === 'pdf' && (
          <Box
            component="iframe"
            src={preview.url}
            title={preview.fileName}
            sx={{ width: '100%', height: '70vh', border: 'none' }}
          />
        )}
        {preview?.kind === 'other' && (
          <Typography color="text.secondary">No preview available for this file type.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button startIcon={<DownloadIcon />} onClick={onDownload}>
          Download
        </Button>
      </DialogActions>
    </Dialog>
  )
}
