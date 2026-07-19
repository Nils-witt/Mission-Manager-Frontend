import { useState } from 'react'
import CircularProgress from '@mui/material/CircularProgress'
import IconButton from '@mui/material/IconButton'
import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Typography from '@mui/material/Typography'
import MyLocationIcon from '@mui/icons-material/MyLocation'
import type { LocationValue } from '../api/location'

interface LocationFieldsProps {
  value: LocationValue
  onChange: (value: LocationValue) => void
  compact?: boolean
}

export function LocationFields({ value, onChange, compact }: LocationFieldsProps) {
  const [locating, setLocating] = useState(false)
  const [geoError, setGeoError] = useState<string | null>(null)

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser.')
      return
    }
    setLocating(true)
    setGeoError(null)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        onChange({
          ...value,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          height: position.coords.altitude ?? value.height,
        })
        setLocating(false)
      },
      (err) => {
        setGeoError(err.message || 'Unable to determine your location.')
        setLocating(false)
      },
      { enableHighAccuracy: true },
    )
  }

  const numberField = (label: string, field: 'latitude' | 'longitude', val: number | null) => (
    <TextField
      label={label}
      type="number"
      size="small"
      value={val ?? ''}
      onChange={(e) =>
        onChange({ ...value, [field]: e.target.value === '' ? null : Number(e.target.value) })
      }
      sx={{ width: 130 }}
    />
  )

  return (
    <Stack spacing={0.5}>
      <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
        {numberField('Latitude', 'latitude', value.latitude)}
        {numberField('Longitude', 'longitude', value.longitude)}
        {!compact && (
          <TextField
            label="Place name"
            size="small"
            value={value.locationName}
            onChange={(e) => onChange({ ...value, locationName: e.target.value })}
            sx={{ flexGrow: 1, minWidth: 140 }}
          />
        )}
        <Tooltip title="Use my current location">
          <IconButton size="small" onClick={useCurrentLocation} disabled={locating}>
            {locating ? <CircularProgress size={18} /> : <MyLocationIcon fontSize="small" />}
          </IconButton>
        </Tooltip>
      </Stack>
      {geoError && (
        <Typography variant="caption" color="error">
          {geoError}
        </Typography>
      )}
    </Stack>
  )
}
