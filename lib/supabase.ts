import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface BuildingOccupancy {
  id?: string
  building_id: string
  building_name: string
  short_name: string
  current_occupancy: number
  max_capacity: number
  occupancy_percentage: number
  coordinates: [number, number]
  created_at?: string
  updated_at?: string
}

export interface BuildingInfo {
  id: string
  name: string
  short_name: string
  max_capacity: number
  coordinates: [number, number]
  created_at?: string
  updated_at?: string
}
