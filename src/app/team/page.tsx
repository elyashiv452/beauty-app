'use client'
import { useEffect, useState } from 'react'
import { Plus, Phone, Percent, CheckCircle2, X, Users, TrendingUp, Calendar, CreditCard } from 'lucide-react'
import { Card, Badge, Button, Modal, Input, Select, StatCard } from '@/components/ui'
import { EVENT_LABELS, CLIENT_TYPE_LABELS, formatDate, formatCurrency } from '@/lib/utils'

interface Member {
  id: string; name: string; phone: string; email: string
  commission_percent: number; active: boolean; created_at: string
}
interface Job {
  id: string; member_id: string; client_name: string; event_type: string
  client_type: string; event_date: string; location: string
  companions: number; total_amount: number; commission_amount: number
  paid_to_member: boolean; created_at: string
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [jobs, setJobs] = useState<Job[]>([])
  const [selected, setSelected] = useState<Member | null>(null)
  const [showAddMember, setShowAddMember] = useState(false)
  const [showAddJob, setShowAddJob] = useState(false)
  const [loading, setLoading] = useState(true)

  const [memberForm, setMemberForm] = useState({ name: '', phone: '', email: '', commission_percent: 20 })
  const [jobForm, setJobForm] = useState({ member_id: '', client_name: '', event_type: 'wedding', client_type: 'bride', event_date: '', location: '', companions: 0, total_amount: 0 })

  useEffect(() => { refresh() }, [])

  async function refresh() {
    const data = await fetch('/api/team').then(r => r.json())
    setMembers(data.members || [])
    setJobs(data.jobs || [])
    setLoading(false)
  }

  async function addMember() {
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_member', ...memberForm }) })
    setShowAddMember(false)
    setMemberForm({ name: '', phone: '', email: '', commission_percent: 20 })
    refresh()
  }

  async function addJob() {
    const member = members.find(m => m.id === jobForm.member_id)
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'add_job', ...jobForm, commission_percent: member?.commission_percent || 20 }) })
    setShowAddJob(false)
    refresh()
  }

  async function markPaid(jobId: string) {
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'mark_paid', job_id: jobId }) })
    refresh()
  }

  async function updateCommission(memberId: string, percent: number) {
    await fetch('/api/team', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update_commission', member_id: memberId, commission_percent: percent }) })
    refresh()
  }

  const thisMonth = new Date().toISOString().substring(0, 7)
  const monthJobs = jobs.filter(j => j.event_date.startsWith(thisMonth))
  const totalEarned = jobs.reduce((s, j) => s + j.total_amount, 0)
  const totalCommission = jobs.reduce((s, j) => s + j.commission_amount, 0)
  const unpaidCommission = jobs.filter(j => !j.paid_to_member).reduce((s, j) => s + j.commission_amount, 0)

  const memberJobs = (memberId: string) => jobs.filter(j => j.member_id === memberId)
  const memberMonthJobs = (memberId: string) => monthJobs.filter(j => j.member_id === memberId)
  const memberUnpaid = (memberId: string) => jobs.filter(j => j.member_id === memberId && !j.paid_to_member).reduce((s, j) => s + j.commission_amount, 0)

  if (loading) return <div className="flex items-center justify-center h-64"><div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">ניהול צוות</h1>
          <p className="text-gray-500 text-sm">{members.length} מאפרות בצוות</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowAddJob(true)}>
            <Plus size={15} /> הוסף עבודה
          </Button>
          <Button variant="primary" onClick={() => setShowAddMember(true)}>
            <Plus size={15} /> הוסף מאפרת
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="עבודות החודש" value={monthJobs.length} color="teal" />
        <StatCard label="הכנסה פסיבית סה״כ" value={formatCurrency(totalCommission)} color="teal" />
        <StatCard label="לתשלום לצוות" value={formatCurrency(unpaidCommission)} color={unpaidCommission > 0 ? 'red' : 'gray'} />
        <StatCard label="סה״כ הכנסה מצוות" value={formatCurrency(totalEarned)} />
      </div>

      {/* Members */}
      {members.length === 0 ? (
        <Card className="py-16 text-center">
          <div className="text-gray-400 text-sm">אין מאפרות בצוות עדיין</div>
          <Button variant="primary" onClick={() => setShowAddMember(true)} className="mt-4 mx-auto">
            <Plus size={14} /> הוסף מאפרת ראשונה
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {members.map(member => {
            const mJobs = memberJobs(member.id)
            const mMonthJobs = memberMonthJobs(member.id)
            const mUnpaid = memberUnpaid(member.id)
            return (
              <Card key={member.id} className="cursor-pointer hover:border-teal-200 transition-colors" >
                <div className="p-5" onClick={() => setSelected(selected?.id === member.id ? null : member)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold">
                        {member.name[0]}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{member.name}</div>
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                          <Phone size={11} />{member.phone}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-xs text-gray-400">עמלה</div>
                        <div className="font-medium text-purple-600">{member.commission_percent}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400">החודש</div>
                        <div className="font-medium text-gray-900">{mMonthJobs.length} עבודות</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs text-gray-400">לתשלום</div>
                        <div className={`font-medium ${mUnpaid > 0 ? 'text-red-500' : 'text-green-600'}`}>{formatCurrency(mUnpaid)}</div>
                      </div>
                    </div>
                  </div>

                  {selected?.id === member.id && (
                    <div className="border-t border-gray-100 pt-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">עדכון עמלה</span>
                        <div className="flex items-center gap-2">
                          <input type="number" min="0" max="100"
                            defaultValue={member.commission_percent}
                            className="w-16 px-2 py-1 text-sm border border-gray-200 rounded-lg text-center"
                            onBlur={e => updateCommission(member.id, parseInt(e.target.value))}
                          />
                          <span className="text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="text-sm font-medium text-gray-700">עבודות — {mJobs.length} סה״כ</div>
                        {mJobs.slice(0, 5).map(job => (
                          <div key={job.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{job.client_name}</div>
                              <div className="text-xs text-gray-500">{formatDate(job.event_date)} · {job.location}</div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-left">
                                <div className="text-xs text-gray-400">עמלה</div>
                                <div className="text-sm font-medium text-purple-600">{formatCurrency(job.commission_amount)}</div>
                              </div>
                              {job.paid_to_member
                                ? <Badge variant="green">שולם ✓</Badge>
                                : <button onClick={() => markPaid(job.id)} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded-lg px-2 py-1 hover:bg-teal-100">סמן שולם</button>
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Add Member Modal */}
      <Modal open={showAddMember} onClose={() => setShowAddMember(false)} title="הוסף מאפרת לצוות">
        <div className="space-y-4">
          <Input label="שם מלא *" value={memberForm.name} onChange={e => setMemberForm(p => ({...p, name: e.target.value}))} placeholder="שם המאפרת" />
          <Input label="טלפון" value={memberForm.phone} onChange={e => setMemberForm(p => ({...p, phone: e.target.value}))} placeholder="050-0000000" />
          <Input label="אימייל" value={memberForm.email} onChange={e => setMemberForm(p => ({...p, email: e.target.value}))} placeholder="email@example.com" />
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">עמלה (%)</label>
            <input type="number" min="0" max="100" value={memberForm.commission_percent}
              onChange={e => setMemberForm(p => ({...p, commission_percent: parseInt(e.target.value)}))}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={addMember} disabled={!memberForm.name} className="flex-1">
              <Plus size={14} /> הוסף לצוות
            </Button>
            <Button variant="secondary" onClick={() => setShowAddMember(false)}>ביטול</Button>
          </div>
        </div>
      </Modal>

      {/* Add Job Modal */}
      <Modal open={showAddJob} onClose={() => setShowAddJob(false)} title="הוסף עבודה לצוות">
        <div className="space-y-4">
          <Select label="מאפרת *" value={jobForm.member_id} onChange={e => setJobForm(p => ({...p, member_id: e.target.value}))}>
            <option value="">בחרי מאפרת...</option>
            {members.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </Select>
          <Input label="שם לקוחה *" value={jobForm.client_name} onChange={e => setJobForm(p => ({...p, client_name: e.target.value}))} />
          <div className="grid grid-cols-2 gap-3">
            <Select label="סוג" value={jobForm.client_type} onChange={e => setJobForm(p => ({...p, client_type: e.target.value}))}>
              <option value="bride">כלה</option>
              <option value="companion">מלווה</option>
            </Select>
            <Select label="אירוע" value={jobForm.event_type} onChange={e => setJobForm(p => ({...p, event_type: e.target.value}))}>
              <option value="wedding">חתונה</option>
              <option value="bat_mitzva">בת מצווה</option>
              <option value="event">אירוע</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="תאריך" type="date" value={jobForm.event_date} onChange={e => setJobForm(p => ({...p, event_date: e.target.value}))} />
            <Input label="מיקום" value={jobForm.location} onChange={e => setJobForm(p => ({...p, location: e.target.value}))} />
          </div>
          <Input label="סכום כולל (₪)" type="number" value={jobForm.total_amount} onChange={e => setJobForm(p => ({...p, total_amount: parseInt(e.target.value)}))} />
          {jobForm.member_id && jobForm.total_amount > 0 && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 text-sm">
              <span className="text-purple-700">עמלה: </span>
              <span className="font-semibold text-purple-800">
                {formatCurrency(Math.round(jobForm.total_amount * (members.find(m => m.id === jobForm.member_id)?.commission_percent || 20) / 100))}
              </span>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <Button variant="primary" onClick={addJob} disabled={!jobForm.member_id || !jobForm.client_name || !jobForm.event_date} className="flex-1">
              <Plus size={14} /> הוסף עבודה
            </Button>
            <Button variant="secondary" onClick={() => setShowAddJob(false)}>ביטול</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
