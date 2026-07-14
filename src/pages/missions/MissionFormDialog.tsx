import { useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import type { MissionRequest, MissionResponse, TenantResponse } from '../../api/types'

interface MissionFormDialogProps {
  open: boolean
  mission: MissionResponse | null
  tenants: TenantResponse[]
  submitting: boolean
  onClose: () => void
  onSubmit: (values: MissionRequest) => void
}

function MissionFormDialog({
  open,
  mission,
  tenants,
  submitting,
  onClose,
  onSubmit,
}: MissionFormDialogProps) {
  const [name, setName] = useState(() => mission?.name ?? '')
  const [tenantId, setTenantId] = useState(() => mission?.tenantId ?? '')
  const [startTime, setStartTime] = useState(() => toDatetimeLocalValue(mission?.startTime ?? null))
  const [endTime, setEndTime] = useState(() => toDatetimeLocalValue(mission?.endTime ?? null))
  const [latitude, setLatitude] = useState(() => mission?.latitude?.toString() ?? '')
  const [longitude, setLongitude] = useState(() => mission?.longitude?.toString() ?? '')
  const [streetAddress, setStreetAddress] = useState(() => mission?.streetAddress ?? '')

  const handleSubmit = () => {
    onSubmit({
      name,
      tenantId,
      startTime: startTime || null,
      endTime: endTime || null,
      latitude: latitude === '' ? null : Number(latitude),
      longitude: longitude === '' ? null : Number(longitude),
      streetAddress: streetAddress || null,
    })
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{mission ? 'Edit Mission' : 'Add Mission'}</DialogTitle>
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
          <FormControl fullWidth required>
            <InputLabel id="mission-tenant-label">Tenant</InputLabel>
            <Select
              labelId="mission-tenant-label"
              label="Tenant"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
            >
              {tenants.map((tenant) => (
                <MenuItem key={tenant.id} value={tenant.id}>
                  {tenant.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Stack direction="row" spacing={2}>
            <TextField
              label="Start time"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
            <TextField
              label="End time"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              slotProps={{ inputLabel: { shrink: true } }}
              fullWidth
            />
          </Stack>
          <TextField
            label="Street address"
            value={streetAddress}
            onChange={(e) => setStreetAddress(e.target.value)}
            fullWidth
          />
          <Stack direction="row" spacing={2}>
            <TextField
              label="Latitude"
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { step: 'any' } }}
            />
            <TextField
              label="Longitude"
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              fullWidth
              slotProps={{ htmlInput: { step: 'any' } }}
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
          disabled={submitting || !name || !tenantId}
        >
          {mission ? 'Save' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

function toDatetimeLocalValue(value: string | null): string {
  return value ? value.slice(0, 16) : ''
}

export default MissionFormDialog
