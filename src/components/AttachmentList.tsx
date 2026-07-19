import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Tooltip from '@mui/material/Tooltip'
import AttachFileIcon from '@mui/icons-material/AttachFile'
import PlaceIcon from '@mui/icons-material/Place'
import { getAttachmentKind } from '../hooks/useAttachmentPreview'
import { formatLocation } from '../api/location'
import type { StoredFileResponse } from '../api/types'

function attachmentTooltip(attachment: StoredFileResponse): string {
  const location = formatLocation(attachment.location)
  return location ? `${attachment.originalFileName} · ${location}` : attachment.originalFileName
}

interface AttachmentListProps {
  attachments: StoredFileResponse[]
  thumbnails: Record<string, string>
  onOpen: (fileId: string, originalFileName: string) => void
  disabled?: boolean
}

export function AttachmentList({ attachments, thumbnails, onOpen, disabled }: AttachmentListProps) {
  if (attachments.length === 0) return null

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      {attachments.map((attachment) => {
        const hasLocation = formatLocation(attachment.location) !== null
        if (getAttachmentKind(attachment.originalFileName) === 'image') {
          const thumbnailUrl = thumbnails[attachment.id]
          return (
            <Tooltip key={attachment.id} title={attachmentTooltip(attachment)}>
              <Box
                onClick={() => onOpen(attachment.id, attachment.originalFileName)}
                sx={{
                  position: 'relative',
                  width: 56,
                  height: 56,
                  borderRadius: 1,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'action.hover',
                  flexShrink: 0,
                }}
              >
                {thumbnailUrl ? (
                  <Box
                    component="img"
                    src={thumbnailUrl}
                    alt={attachment.originalFileName}
                    sx={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <CircularProgress size={20} />
                )}
                {hasLocation && (
                  <PlaceIcon
                    fontSize="small"
                    sx={{
                      position: 'absolute',
                      bottom: 2,
                      right: 2,
                      color: 'common.white',
                      filter: 'drop-shadow(0 0 2px rgba(0,0,0,0.8))',
                    }}
                  />
                )}
              </Box>
            </Tooltip>
          )
        }
        return (
          <Tooltip key={attachment.id} title={attachmentTooltip(attachment)}>
            <Chip
              icon={hasLocation ? <PlaceIcon /> : <AttachFileIcon />}
              label={attachment.originalFileName}
              variant="outlined"
              onClick={() => onOpen(attachment.id, attachment.originalFileName)}
              disabled={disabled}
            />
          </Tooltip>
        )
      })}
    </Box>
  )
}
