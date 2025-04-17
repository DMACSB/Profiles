"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, Upload } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { useSupabase } from "@/lib/supabase-provider"
import { useToast } from "@/components/ui/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  gender: z.string({
    required_error: "Please select a gender.",
  }),
  date_of_birth: z.date({
    required_error: "Date of birth is required.",
  }),
  language_spoken: z.string().optional(),
  physical_identifiers: z.string().optional(),
  mode_of_entry: z.string().optional(),
  entry_point: z.string().optional(),
  date_of_entry: z.date().optional(),
  assisting_network: z.string().optional(),
  last_known_address: z.string().optional(),
  current_location: z.string().optional(),
  migration_pattern: z.string().optional(),
  associated_locations: z.string().optional(),
  current_occupation: z.string().optional(),
  cover_identity: z.string().optional(),
  support_network: z.string().optional(),
  criminal_background: z.string().optional(),
  case_registered: z.string().optional(),
  detained_by: z.string().optional(),
  court_proceedings_status: z.string().optional(),
  embassy_contacted: z.boolean().default(false),
  seized_ids: z.string().optional(),
  intelligence_dossier: z.string().optional(),
})

type ProfileFormValues = z.infer<typeof formSchema>

export function ProfileForm({ defaultValues }: { defaultValues?: Partial<ProfileFormValues> }) {
  const { supabase } = useSupabase()
  const router = useRouter()
  const { toast } = useToast()
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      gender: "",
      embassy_contacted: false,
    },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setPhotoFile(file)

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const onSubmit = async (data: ProfileFormValues) => {
    setIsSubmitting(true)
    try {
      // Calculate age from date of birth
      const today = new Date()
      const birthDate = new Date(data.date_of_birth)
      let age = today.getFullYear() - birthDate.getFullYear()
      const m = today.getMonth() - birthDate.getMonth()
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      // Upload photo if provided
      let photoUrl = null
      if (photoFile) {
        const fileExt = photoFile.name.split(".").pop()
        const fileName = `${Math.random()}.${fileExt}`
        const filePath = `photos/${fileName}`

        const { error: uploadError } = await supabase.storage.from("profile-photos").upload(filePath, photoFile)

        if (uploadError) {
          throw uploadError
        }

        const { data: urlData } = supabase.storage.from("profile-photos").getPublicUrl(filePath)

        photoUrl = urlData.publicUrl
      }

      // Insert profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .insert([
          {
            name: data.name,
            gender: data.gender,
            age,
            date_of_birth: data.date_of_birth.toISOString(),
            photo_url: photoUrl,
            language_spoken: data.language_spoken,
            physical_identifiers: data.physical_identifiers,
            mode_of_entry: data.mode_of_entry,
            entry_point: data.entry_point,
            date_of_entry: data.date_of_entry?.toISOString(),
            assisting_network: data.assisting_network,
            last_known_address: data.last_known_address,
            current_location: data.current_location,
            migration_pattern: data.migration_pattern,
            associated_locations: data.associated_locations,
            current_occupation: data.current_occupation,
            cover_identity: data.cover_identity,
            support_network: data.support_network,
            criminal_background: data.criminal_background,
            case_registered: data.case_registered,
            detained_by: data.detained_by,
            court_proceedings_status: data.court_proceedings_status,
            embassy_contacted: data.embassy_contacted,
            seized_ids: data.seized_ids,
            intelligence_dossier: data.intelligence_dossier,
          },
        ])
        .select()

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile created successfully",
      })

      // Redirect to profile page
      router.push(`/profiles/${profile[0].id}`)
      router.refresh()
    } catch (error) {
      console.error("Error creating profile:", error)
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold">Personal Information</h2>
                <Separator />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name (Declared / Alias)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_birth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="language_spoken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Language Spoken</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter languages" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <div>
                  <FormLabel>Photograph</FormLabel>
                  <div className="mt-2 flex items-center gap-4">
                    <div className="h-32 w-32 rounded-md border flex items-center justify-center overflow-hidden">
                      {photoPreview ? (
                        <img
                          src={photoPreview || "/placeholder.svg"}
                          alt="Preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-muted-foreground text-sm">No photo</span>
                      )}
                    </div>
                    <div>
                      <label htmlFor="photo-upload">
                        <Button type="button" variant="outline" asChild>
                          <div className="cursor-pointer">
                            <Upload className="mr-2 h-4 w-4" />
                            Upload Photo
                          </div>
                        </Button>
                      </label>
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                      <p className="text-xs text-muted-foreground mt-2">JPG, PNG or GIF. Max 5MB.</p>
                    </div>
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="physical_identifiers"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Physical Identifiers</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter physical identifiers" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Entry Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold">Entry Information</h2>
                <Separator />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="mode_of_entry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mode of Entry</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter mode of entry" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="entry_point"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Entry Point (Location / Sector)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter entry point" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="date_of_entry"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Entry</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="assisting_network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assisting Network (Name / Org)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter assisting network" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="migration_pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Migration Pattern</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter migration pattern" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold">Location Information</h2>
                <Separator />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="last_known_address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Known Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter last known address" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="current_location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Location (GPS / Locality)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter current location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="associated_locations"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Associated Locations (States / Districts)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter associated locations" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Identity Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold">Identity Information</h2>
                <Separator />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="current_occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter current occupation" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="cover_identity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cover Identity (Fake Docs / IDs)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter cover identity details" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="support_network"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Support Network (Political / NGO / Others)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter support network details" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="seized_ids"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seized IDs</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter seized IDs details" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Legal Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold">Legal Information</h2>
                <Separator />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="criminal_background"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Criminal Background</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter criminal background details" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="case_registered"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Case Registered (Details)</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter case registered details" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="detained_by"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Detained By (Agency / Police Station)</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter detaining agency" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="court_proceedings_status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Court Proceedings Status</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Enter court proceedings status" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="embassy_contacted"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Embassy Contacted</FormLabel>
                        <FormDescription>Check if embassy has been contacted</FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {/* Additional Information Section */}
              <div className="space-y-4 md:col-span-2">
                <h2 className="text-xl font-semibold">Additional Information</h2>
                <Separator />
              </div>

              <div className="space-y-4 md:col-span-2">
                <FormField
                  control={form.control}
                  name="intelligence_dossier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Intelligence Dossier / Interrogation Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Enter intelligence dossier or interrogation summary"
                          className="resize-none min-h-[150px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Saving..." : "Save Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
