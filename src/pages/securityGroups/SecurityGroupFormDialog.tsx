import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Autocomplete from '@mui/material/Autocomplete'
import type { SecurityGroupRequest, SecurityGroupResponse } from '../../api/types'

interface SecurityGroupFormDialogProps {
  open: boolean
  group: SecurityGroupResponse | null
  submitting: boolean
  onClose: () => void
  onSubmit: (values: SecurityGroupRequest) => void
}

function SecurityGroupFormDialog({
  open,
  group,
  submitting,
  onClose,
  onSubmit,
}: SecurityGroupFormDialogProps) {
  const [name, setName] = useState(() => group?.name ?? '')
  const [ssoGroupName, setSsoGroupName] = useState(() => group?.ssoGroupName ?? '')
  const [roles, setRoles] = useState<string[]>(() => group?.roles ?? [])

  const handleSubmit = () => {
    onSubmit({ name, ssoGroupName, roles })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{group ? 'Edit Security Group' : 'Add Security Group'}</DialogTitle>
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
          <TextField
            label="SSO group name"
            value={ssoGroupName}
            onChange={(e) => setSsoGroupName(e.target.value)}
            fullWidth
            helperText="Optional. Maps this group to an identity provider group."
          />
          <Autocomplete
            multiple
            freeSolo
            options={[]}
            value={roles}
            onChange={(_event, value) => setRoles(value)}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Roles"
                helperText="Type a role and press Enter to add it, e.g. USER_VIEW"
              />
            )}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" disabled={submitting || !name}>
          {group ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SecurityGroupFormDialog
