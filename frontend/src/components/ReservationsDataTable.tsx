import { useNavigate } from 'react-router-dom'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Reservation } from '@/lib/mockReservations'

interface ReservationsDataTableProps {
  reservations: Reservation[]
}

export function ReservationsDataTable({ reservations }: ReservationsDataTableProps) {
  const navigate = useNavigate()

  const getStatusColor = (status: Reservation['status']) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'Succeeded':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'Failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
    }
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatTime = (timeStr: string) => {
    const [hours, minutes] = timeStr.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  if (reservations.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No reservations found
      </div>
    )
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">Restaurant</TableHead>
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead className="w-[100px]">Time</TableHead>
            <TableHead className="w-[100px] text-center">Party Size</TableHead>
            <TableHead className="w-[120px]">Status</TableHead>
            <TableHead>Notes</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow
              key={reservation.id}
              className="cursor-pointer"
              onClick={() => navigate(`/venue?id=${reservation.venueId}`)}
            >
              <TableCell className="font-medium">
                {reservation.venueName}
              </TableCell>
              <TableCell>{formatDate(reservation.date)}</TableCell>
              <TableCell>{formatTime(reservation.time)}</TableCell>
              <TableCell className="text-center">{reservation.partySize}</TableCell>
              <TableCell>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(reservation.status)}`}>
                  {reservation.status}
                </span>
              </TableCell>
              <TableCell className="text-muted-foreground text-sm">
                {reservation.note || '-'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
