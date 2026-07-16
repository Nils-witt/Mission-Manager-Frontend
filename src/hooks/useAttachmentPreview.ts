import { useCallback, useRef, useState } from 'react'
import type { StoredFileResponse } from '../api/types'

export type AttachmentKind = 'image' | 'pdf' | 'other'

const IMAGE_EXTENSIONS = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp', 'svg']

export function getAttachmentKind(fileName: string): AttachmentKind {
  const extension = fileName.split('.').pop()?.toLowerCase()
  if (extension && IMAGE_EXTENSIONS.includes(extension)) return 'image'
  if (extension === 'pdf') return 'pdf'
  return 'other'
}

export interface AttachmentPreview {
  url: string
  fileName: string
  kind: AttachmentKind
  revokeOnClose: boolean
}

export function useAttachmentPreview(downloadAttachment: (fileId: string) => Promise<Blob>) {
  const [preview, setPreview] = useState<AttachmentPreview | null>(null)
  const [previewLoading, setPreviewLoading] = useState(false)
  const [thumbnails, setThumbnails] = useState<Record<string, string>>({})
  const requestedThumbnailIds = useRef<Set<string>>(new Set())

  const loadThumbnails = useCallback(
    (attachments: StoredFileResponse[]) => {
      const imageAttachments = attachments.filter(
        (attachment) => getAttachmentKind(attachment.originalFileName) === 'image',
      )
      for (const attachment of imageAttachments) {
        if (requestedThumbnailIds.current.has(attachment.id)) continue
        requestedThumbnailIds.current.add(attachment.id)
        downloadAttachment(attachment.id)
          .then((blob) => {
            const url = URL.createObjectURL(blob)
            setThumbnails((prev) => ({ ...prev, [attachment.id]: url }))
          })
          .catch(() => {
            requestedThumbnailIds.current.delete(attachment.id)
          })
      }
    },
    [downloadAttachment],
  )

  const openAttachment = useCallback(
    async (fileId: string, originalFileName: string) => {
      const cachedUrl = thumbnails[fileId]
      if (cachedUrl) {
        setPreview({
          url: cachedUrl,
          fileName: originalFileName,
          kind: 'image',
          revokeOnClose: false,
        })
        return
      }
      setPreviewLoading(true)
      try {
        const blob = await downloadAttachment(fileId)
        const url = URL.createObjectURL(blob)
        setPreview({
          url,
          fileName: originalFileName,
          kind: getAttachmentKind(originalFileName),
          revokeOnClose: true,
        })
      } finally {
        setPreviewLoading(false)
      }
    },
    [downloadAttachment, thumbnails],
  )

  const closePreview = useCallback(() => {
    setPreview((current) => {
      if (current?.revokeOnClose) URL.revokeObjectURL(current.url)
      return null
    })
  }, [])

  const downloadPreview = useCallback(() => {
    if (!preview) return
    const link = document.createElement('a')
    link.href = preview.url
    link.download = preview.fileName
    link.click()
  }, [preview])

  return {
    preview,
    previewLoading,
    thumbnails,
    loadThumbnails,
    openAttachment,
    closePreview,
    downloadPreview,
  }
}
