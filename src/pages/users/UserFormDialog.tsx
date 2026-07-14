import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Chip from '@mui/material/Chip'
import Box from '@mui/material/Box'
import type { SelectChangeEvent } from '@mui/material/Select'
import type {
  SecurityGroupResponse,
  TenantResponse,
  UserRequest,
  UserResponse,
} from '../../api/types'

interface UserFormDialogProps {
  open: boolean
  user: UserResponse | null
  tenants: TenantResponse[]
  securityGroups: SecurityGroupResponse[]
  submitting: boolean
  onClose: () => void
  onSubmit: (values: UserRequest) => void
}

const emptyForm: UserRequest = {
  username: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  enabled: true,
  locked: false,
  primaryTenantId: null,
  securityGroupIds: [],
}

function UserFormDialog({
  open,
  user,
  tenants,
  securityGroups,
  submitting,
  onClose,
  onSubmit,
}: UserFormDialogProps) {
  const [form, setForm] = useState<UserRequest>(() =>
    user
      ? {
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          password: '',
          enabled: user.enabled,
          locked: user.locked,
          primaryTenantId: user.primaryTenantId,
          securityGroupIds: user.securityGroupIds,
        }
      : emptyForm,
  )

  const handleSecurityGroupChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value
    setForm((prev) => ({
      ...prev,
      securityGroupIds: typeof value === 'string' ? value.split(',') : value,
    }))
  }

  const handleSubmit = () => {
    const payload: UserRequest = { ...form }
    if (!payload.password) {
      delete payload.password
    }
    onSubmit(payload)
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{user ? 'Edit User' : 'Add User'}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
            fullWidth
            required
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="First name"
              value={form.firstName}
              onChange={(e) => setForm((prev) => ({ ...prev, firstName: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Last name"
              value={form.lastName}
              onChange={(e) => setForm((prev) => ({ ...prev, lastName: e.target.value }))}
              fullWidth
            />
          </Stack>
          <TextField
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
            fullWidth
            required
          />
          <TextField
            label={user ? 'Password (leave blank to keep current)' : 'Password'}
            type="password"
            value={form.password ?? ''}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            fullWidth
            required={!user}
          />
          <FormControl fullWidth>
            <InputLabel id="primary-tenant-label">Primary tenant</InputLabel>
            <Select
              labelId="primary-tenant-label"
              label="Primary tenant"
              value={form.primaryTenantId ?? ''}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, primaryTenantId: e.target.value || null }))
              }
            >
              <MenuItem value="">
                <em>None</em>
              </MenuItem>
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel id="security-groups-label">Security groups</InputLabel>
            <Select
              labelId="security-groups-label"
              label="Security groups"
              multiple
              value={form.securityGroupIds}
              onChange={handleSecurityGroupChange}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((id) => (
                    <Chip
                      key={id}
                      label={securityGroups.find((group) => group.id === id)?.name ?? id}
                      size="small"
                    />
                  ))}
                </Box>
              )}
            >
              {securityGroups.map((group) => (
                <MenuItem key={group.id} value={group.id}>
                  {group.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={form.enabled}
                  onChange={(e) => setForm((prev) => ({ ...prev, enabled: e.target.checked }))}
                />
              }
              label="Enabled"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={form.locked}
                  onChange={(e) => setForm((prev) => ({ ...prev, locked: e.target.checked }))}
                />
              }
              label="Locked"
            />
          </Stack>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={submitting || !form.username || !form.email}
        >
          {user ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default UserFormDialog
