'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { useStore } from '@/lib/store-context'
import { getStoreStaff, inviteStaffMember, deactivateStaff, StaffMember } from '@/lib/admin'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Loader2, Plus, Mail, AlertCircle, Trash2, Mail as MailIcon } from 'lucide-react'
import Link from 'next/link'

export default function StaffPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { currentStore } = useStore()

  const [staff, setStaff] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('delivery_personnel')
  const [inviting, setInviting] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null)

  useEffect(() => {
    if (!user || !['super_admin', 'store_admin'].includes(user.role)) {
      router.push('/dashboard')
      return
    }

    if (currentStore) loadStaff()
  }, [user, currentStore, router])

  const loadStaff = async () => {
    try {
      setLoading(true)
      if (!currentStore) return
      const data = await getStoreStaff(currentStore.id)
      setStaff(data)
    } catch (err) {
      setError('Failed to load staff')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !currentStore) return

    try {
      setInviting(true)
      const success = await inviteStaffMember(currentStore.id, inviteEmail, inviteRole)
      if (success) {
        setSuccess(`Invitation sent to ${inviteEmail}`)
        setInviteEmail('')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError('Failed to send invitation')
      }
    } finally {
      setInviting(false)
    }
  }

  const handleDeactivate = async (memberId: string) => {
    if (!confirm('Are you sure you want to deactivate this staff member?')) return

    try {
      setDeactivatingId(memberId)
      const success = await deactivateStaff(memberId)
      if (success) {
        setStaff(prev => prev.map(s =>
          s.id === memberId ? { ...s, is_active: false } : s
        ))
        setSuccess('Staff member deactivated')
        setTimeout(() => setSuccess(''), 3000)
      }
    } finally {
      setDeactivatingId(null)
    }
  }

  const roleColors: Record<string, string> = {
    store_admin: 'bg-purple-100 text-purple-800',
    delivery_personnel: 'bg-blue-100 text-blue-800',
    accountant: 'bg-green-100 text-green-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Staff Management</h1>
            <p className="text-xs sm:text-sm text-slate-600">Invite and manage your team</p>
          </div>
          <Link href="/admin" className="self-start sm:self-auto">
            <Button size="sm">Back to Admin</Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4">
        {/* Alerts */}
        {error && (
          <Card className="mb-4 p-4 bg-red-50 border-red-200">
            <div className="flex items-center gap-3 text-red-800">
              <AlertCircle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          </Card>
        )}

        {success && (
          <Card className="mb-4 p-4 bg-green-50 border-green-200">
            <p className="text-green-800">{success}</p>
          </Card>
        )}

        {/* Invite Form */}
        <Card className="p-4 sm:p-6 mb-6">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 mb-4">Invite New Staff Member</h2>
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <Input
              type="email"
              placeholder="Email address"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              required
              className="flex-1"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-slate-900 text-sm"
            >
              <option value="delivery_personnel">Delivery Personnel</option>
              <option value="accountant">Accountant</option>
              <option value="store_admin">Store Admin</option>
            </select>
            <Button
              type="submit"
              disabled={inviting || !inviteEmail}
              className="flex items-center justify-center gap-2"
            >
              {inviting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <MailIcon className="w-4 h-4" />
                  Send Invitation
                </>
              )}
            </Button>
          </form>
        </Card>

        {/* Staff List */}
        {staff.length > 0 ? (
          <div className="space-y-4">
            {staff.map(member => (
              <Card key={member.id} className="p-4 hover:shadow transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-900 text-sm sm:text-base">
                      {member.first_name} {member.last_name}
                    </h3>
                    <p className="text-slate-600 flex items-center gap-2 text-xs sm:text-sm">
                      <Mail className="w-3.5 h-3.5" />
                      {member.email}
                    </p>
                    {member.phone && (
                      <p className="text-slate-600 text-xs">{member.phone}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 sm:gap-4 self-start sm:self-auto flex-wrap">
                    <Badge className={`${roleColors[member.role]}`}>
                      {member.role.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <Badge className={member.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'}>
                      {member.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    {member.is_active && (
                      <button
                        onClick={() => handleDeactivate(member.id)}
                        disabled={deactivatingId === member.id}
                        className="p-2 hover:bg-slate-100 rounded transition disabled:opacity-50"
                      >
                        {deactivatingId === member.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="w-4 h-4 text-red-600" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-600">No staff members yet. Invite your first team member above.</p>
          </Card>
        )}
      </div>
    </div>
  )
}
