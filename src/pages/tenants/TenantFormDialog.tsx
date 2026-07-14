import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import type { TenantRequest, TenantResponse } from '../../api/types'

interface TenantFormDialogProps {
  open: boolean
  tenant: TenantResponse | null
  submitting: boolean
  onClose: () => void
  onSubmit: (values: TenantRequest) => void
}

function TenantFormDialog({ open, tenant, submitting, onClose, onSubmit }: TenantFormDialogProps) {
  const [name, setName] = useState(() => tenant?.name ?? '')

  const handleSubmit = () => {
    onSubmit({ name })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{tenant ? 'Edit Tenant' : 'Add Tenant'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            fullWidth
            required
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting || !name}>
          {tenant ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default TenantFormDialog
