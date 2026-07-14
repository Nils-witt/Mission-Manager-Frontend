import { useMemo, useState } from 'react'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableHead from '@mui/material/TableHead'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import Paper from '@mui/material/Paper'
import type {
  SecurityGroupRequest,
  SecurityGroupResponse,
  SecurityRole,
  SecurityRoleScope,
  SecurityRoleType,
} from '../../api/types'
import { securityRolesEqual } from './securityRoles'

interface SecurityGroupFormDialogProps {
  open: boolean
  group: SecurityGroupResponse | null
  availableRoles: SecurityRole[]
  submitting: boolean
  onClose: () => void
  onSubmit: (values: SecurityGroupRequest) => void
}

function SecurityGroupFormDialog({
  open,
  group,
  availableRoles,
  submitting,
  onClose,
  onSubmit,
}: SecurityGroupFormDialogProps) {
  const [name, setName] = useState(() => group?.name ?? '')
  const [ssoGroupName, setSsoGroupName] = useState(() => group?.ssoGroupName ?? '')
  const [roles, setRoles] = useState<SecurityRole[]>(() => group?.roles ?? [])

  const roleTypes = useMemo(() => dedupeInOrder(availableRoles.map((role) => role.type)), [availableRoles])
  const roleScopes = useMemo(
    () => dedupeInOrder(availableRoles.map((role) => role.scope)),
    [availableRoles],
  )

  const handleSubmit = () => {
    onSubmit({ name, ssoGroupName, roles })
  }

  const toggleRole = (type: SecurityRoleType, scope: SecurityRoleScope) => {
    setRoles((prev) =>
      prev.some((role) => role.type === type && role.scope === scope)
        ? prev.filter((role) => !(role.type === type && role.scope === scope))
        : [...prev, { type, scope }],
    )
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
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
          <div>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Roles
            </Typography>
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: 400 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Role</TableCell>
                    {roleScopes.map((scope) => (
                      <TableCell key={scope} align="center">
                        {scope}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {roleTypes.map((type) => (
                    <TableRow key={type} hover>
                      <TableCell>{type}</TableCell>
                      {roleScopes.map((scope) => (
                        <TableCell key={scope} align="center" sx={{ p: 0 }}>
                          <Checkbox
                            size="small"
                            checked={roles.some((role) => securityRolesEqual(role, { type, scope }))}
                            onChange={() => toggleRole(type, scope)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
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

function dedupeInOrder<T>(values: T[]): T[] {
  return Array.from(new Set(values))
}

export default SecurityGroupFormDialog
