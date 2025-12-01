import { useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ReservationsDataTable } from '@/components/ReservationsDataTable'
import { mockReservations } from '@/lib/mockReservations'

export function ReservationsPage() {
  const scheduledReservations = useMemo(
    () => mockReservations.filter((r) => r.status === 'Scheduled'),
    []
  )

  const succeededReservations = useMemo(
    () => mockReservations.filter((r) => r.status === 'Succeeded'),
    []
  )

  const failedReservations = useMemo(
    () => mockReservations.filter((r) => r.status === 'Failed'),
    []
  )

  return (
    <div className="min-h-screen bg-background pt-24">
      <main className="container mx-auto px-4 py-8 max-w-240">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Reservations</h1>
          <p className="text-muted-foreground">
            Manage your restaurant booking attempts and reservations
          </p>
        </div>

        <Tabs defaultValue="scheduled" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="scheduled" className="w-max">
              Upcoming Attempts
              <span className="ml-2 px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-xs font-medium">
                {scheduledReservations.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="succeeded" className="w-max">
              Succeeded
              <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900 text-xs font-medium">
                {succeededReservations.length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="failed" className="w-max">
              Failed
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900 text-xs font-medium">
                {failedReservations.length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scheduled">
            <ReservationsDataTable reservations={scheduledReservations} />
          </TabsContent>

          <TabsContent value="succeeded">
            <ReservationsDataTable reservations={succeededReservations} />
          </TabsContent>

          <TabsContent value="failed">
            <ReservationsDataTable reservations={failedReservations} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
