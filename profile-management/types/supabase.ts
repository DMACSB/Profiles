export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          name: string
          gender: string
          age: number
          date_of_birth: string
          photo_url: string | null
          language_spoken: string | null
          physical_identifiers: string | null
          mode_of_entry: string | null
          entry_point: string | null
          date_of_entry: string | null
          assisting_network: string | null
          last_known_address: string | null
          current_location: string | null
          migration_pattern: string | null
          associated_locations: string | null
          current_occupation: string | null
          cover_identity: string | null
          support_network: string | null
          criminal_background: string | null
          case_registered: string | null
          detained_by: string | null
          court_proceedings_status: string | null
          embassy_contacted: boolean
          seized_ids: string | null
          intelligence_dossier: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          gender: string
          age: number
          date_of_birth: string
          photo_url?: string | null
          language_spoken?: string | null
          physical_identifiers?: string | null
          mode_of_entry?: string | null
          entry_point?: string | null
          date_of_entry?: string | null
          assisting_network?: string | null
          last_known_address?: string | null
          current_location?: string | null
          migration_pattern?: string | null
          associated_locations?: string | null
          current_occupation?: string | null
          cover_identity?: string | null
          support_network?: string | null
          criminal_background?: string | null
          case_registered?: string | null
          detained_by?: string | null
          court_proceedings_status?: string | null
          embassy_contacted?: boolean
          seized_ids?: string | null
          intelligence_dossier?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          gender?: string
          age?: number
          date_of_birth?: string
          photo_url?: string | null
          language_spoken?: string | null
          physical_identifiers?: string | null
          mode_of_entry?: string | null
          entry_point?: string | null
          date_of_entry?: string | null
          assisting_network?: string | null
          last_known_address?: string | null
          current_location?: string | null
          migration_pattern?: string | null
          associated_locations?: string | null
          current_occupation?: string | null
          cover_identity?: string | null
          support_network?: string | null
          criminal_background?: string | null
          case_registered?: string | null
          detained_by?: string | null
          court_proceedings_status?: string | null
          embassy_contacted?: boolean
          seized_ids?: string | null
          intelligence_dossier?: string | null
        }
      }
    }
  }
}
