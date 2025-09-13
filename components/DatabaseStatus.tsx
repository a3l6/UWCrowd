"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, AlertCircle } from "lucide-react"

export function DatabaseStatus() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'no-table'>('checking')
  const [message, setMessage] = useState('')
  const [recordCount, setRecordCount] = useState(0)

  const checkDatabaseStatus = async () => {
    setStatus('checking')
    try {
      // Test connection by trying to select from the table
      const { data, error } = await supabase
        .from('building_occupancy')
        .select('id')
        .limit(1)

      if (error) {
        if (error.code === 'PGRST116' || error.message.includes('does not exist') || error.message.includes('schema cache')) {
          setStatus('no-table')
          setMessage('Database table not found. Please run the setup SQL.')
        } else {
          setStatus('error')
          setMessage(`Database error: ${error.message}`)
        }
      } else {
        setStatus('connected')
        setMessage('Database connected successfully!')
        
        // Get record count
        const { count } = await supabase
          .from('building_occupancy')
          .select('*', { count: 'exact', head: true })
        
        setRecordCount(count || 0)
      }
    } catch (error) {
      setStatus('error')
      setMessage(`Connection error: ${error}`)
    }
  }

  const testInsert = async () => {
    try {
      const testRecord = {
        building_id: 'test',
        building_name: 'Test Building',
        short_name: 'TEST',
        current_occupancy: 100,
        max_capacity: 200,
        occupancy_percentage: 50,
        coordinates: [43.4723, -80.5449]
      }

      const { error } = await supabase
        .from('building_occupancy')
        .insert([testRecord])

      if (error) {
        setMessage(`Insert test failed: ${error.message}`)
      } else {
        setMessage('Test insert successful!')
        checkDatabaseStatus() // Refresh status
      }
    } catch (error) {
      setMessage(`Insert test error: ${error}`)
    }
  }

  useEffect(() => {
    checkDatabaseStatus()
  }, [])

  const getStatusIcon = () => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'no-table':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = () => {
    switch (status) {
      case 'connected':
        return <Badge variant="default" className="bg-green-500">Connected</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'no-table':
        return <Badge variant="secondary">Setup Required</Badge>
      default:
        return <Badge variant="outline">Checking...</Badge>
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getStatusIcon()}
          Database Status
          {getStatusBadge()}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">{message}</p>
        
        {status === 'connected' && (
          <div className="text-sm">
            <p><strong>Records:</strong> {recordCount}</p>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={checkDatabaseStatus} variant="outline" size="sm">
            Refresh
          </Button>
          
          {status === 'connected' && (
            <Button onClick={testInsert} variant="outline" size="sm">
              Test Insert
            </Button>
          )}
        </div>

        {status === 'no-table' && (
          <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <p className="text-sm text-yellow-800">
              <strong>Setup Required:</strong> Please run the SQL setup script in your Supabase dashboard.
              See SUPABASE_SETUP.md for instructions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
