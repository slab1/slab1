
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Settings, Users, Calendar as CalendarIcon2, Clock, X, Check, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { recurringReservationApi, RecurringReservation, RecurringReservationInput } from "@/api/recurringReservation";
import { useAuth } from "@/hooks/use-auth";
import { isApiError } from "@/api/utils";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface RecurringReservationsProps {
  restaurantId: string;
}

export function RecurringReservations({ restaurantId }: RecurringReservationsProps) {
  const { user } = useAuth();
  const [recurringReservations, setRecurringReservations] = useState<RecurringReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewReservationDialog, setShowNewReservationDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [currentReservation, setCurrentReservation] = useState<RecurringReservation | null>(null);
  
  const [newReservation, setNewReservation] = useState<Partial<RecurringReservation>>({
    partySize: 2,
    dayOfWeek: 'Friday',
    time: '19:00',
    restaurantId
  });
  
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const fetchRecurringReservations = React.useCallback(async () => {
    try {
      setLoading(true);
      const data = await recurringReservationApi.getByRestaurantId(restaurantId);
      if (isApiError(data)) {
        console.error("Error fetching recurring reservations:", data.error);
        toast.error(data.error || "Failed to load recurring reservations");
      } else if (Array.isArray(data)) {
        setRecurringReservations(data);
      }
    } catch (error) {
      console.error("Error fetching recurring reservations:", error);
      toast.error("Failed to load recurring reservations");
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (restaurantId) {
      fetchRecurringReservations();
    }
  }, [restaurantId, fetchRecurringReservations]);
  
  const handleAddRecurringReservation = async () => {
    if (!user) {
      toast.error("You must be logged in to create reservations");
      return;
    }
    
    if (!newReservation.name || !newReservation.email || !newReservation.phone_number || 
        !newReservation.partySize || !newReservation.dayOfWeek || !newReservation.time || !startDate) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    try {
      setIsSubmitting(true);

      const reservationData: RecurringReservationInput = {
        name: newReservation.name || '',
        email: newReservation.email || '',
        phone_number: newReservation.phone_number || '',
        partySize: newReservation.partySize || 2,
        dayOfWeek: newReservation.dayOfWeek || 'Friday',
        time: newReservation.time || '19:00',
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
        restaurantId,
        userId: user.id
      };
      
      const result = await recurringReservationApi.create(reservationData);
      
      if (isApiError(result)) {
        console.error("Error creating recurring reservation:", result.error);
        toast.error(result.error || "Failed to create recurring reservation");
      } else {
        toast.success("Recurring reservation created successfully");
        fetchRecurringReservations();
        setShowNewReservationDialog(false);
        
        // Reset form
        setNewReservation({
          partySize: 2,
          dayOfWeek: 'Friday',
          time: '19:00',
          restaurantId
        });
        setStartDate(new Date());
        setEndDate(undefined);
      }
    } catch (error) {
      console.error("Error creating recurring reservation:", error);
      toast.error("Failed to create recurring reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditReservation = (reservation: RecurringReservation) => {
    setCurrentReservation(reservation);
    
    // Format dates for the date picker
    const formattedStartDate = typeof reservation.startDate === 'string' ? new Date(reservation.startDate) : reservation.startDate;
    const formattedEndDate = reservation.endDate ? (typeof reservation.endDate === 'string' ? new Date(reservation.endDate) : reservation.endDate) : undefined;
    
    setNewReservation({
      ...reservation,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    });
    
    setStartDate(formattedStartDate);
    setEndDate(formattedEndDate);
    
    setShowEditDialog(true);
  };
  
  const handleUpdateReservation = async () => {
    if (!currentReservation || !user) return;
    
    try {
      setIsSubmitting(true);
      
      const updateData: Partial<RecurringReservationInput> = {
        ...newReservation as RecurringReservationInput,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate ? endDate.toISOString().split('T')[0] : undefined,
      };
      
      const result = await recurringReservationApi.update(currentReservation.id, updateData);
      
      if (isApiError(result)) {
        console.error("Error updating recurring reservation:", result.error);
        toast.error(result.error || "Failed to update recurring reservation");
      } else {
        toast.success("Recurring reservation updated successfully");
        fetchRecurringReservations();
        setShowEditDialog(false);
      }
    } catch (error) {
      console.error("Error updating recurring reservation:", error);
      toast.error("Failed to update recurring reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const confirmDeleteReservation = (reservation: RecurringReservation) => {
    setCurrentReservation(reservation);
    setShowDeleteConfirmation(true);
  };
  
  const handleDeleteReservation = async () => {
    if (!currentReservation) return;
    
    try {
      setIsSubmitting(true);
      const result = await recurringReservationApi.delete(currentReservation.id);

      if (isApiError(result)) {
        console.error("Error deleting reservation:", result.error);
        toast.error(result.error || "Failed to delete recurring reservation");
      } else if (result && result.success) {
        toast.success("Recurring reservation removed");
        setRecurringReservations(recurringReservations.filter(r => r.id !== currentReservation.id));
        setShowDeleteConfirmation(false);
      }
    } catch (error) {
      console.error("Error deleting reservation:", error);
      toast.error("Failed to delete reservation");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleGenerateReservations = async (recurringId: string) => {
    try {
      const result = await recurringReservationApi.generateUpcomingReservations(recurringId);
      
      if (isApiError(result)) {
        console.error("Error generating reservations:", result.error);
        toast.error(result.error || "Failed to generate upcoming reservations");
      } else if (result && result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      console.error("Error generating reservations:", error);
      toast.error("Failed to generate upcoming reservations");
    }
  };
  
  const renderReservationDialog = (isEdit = false) => {
    const dialogOpen = isEdit ? showEditDialog : showNewReservationDialog;
    const setDialogOpen = isEdit ? setShowEditDialog : setShowNewReservationDialog;
    const onSubmit = isEdit ? handleUpdateReservation : handleAddRecurringReservation;
    const title = isEdit ? "Edit Recurring Reservation" : "Create Recurring Reservation";
    const description = isEdit ? "Update reservation details" : "Set up a regular booking for loyal customers";
    const buttonText = isEdit ? "Update Reservation" : "Save Recurring Reservation";
    
    return (
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {!isEdit && (
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Recurring Reservation
            </Button>
          </DialogTrigger>
        )}
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {description}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="name">Reservation Name/Group</Label>
                <Input 
                  id="name" 
                  placeholder="Business Lunch - Acme Inc" 
                  value={newReservation.name || ''}
                  onChange={(e) => setNewReservation({...newReservation, name: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="email">Contact Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="contact@example.com" 
                  value={newReservation.email || ''}
                  onChange={(e) => setNewReservation({...newReservation, email: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="phone">Contact Phone</Label>
                <Input 
                  id="phone" 
                  placeholder="555-123-4567" 
                  value={newReservation.phone_number || ''}
                  onChange={(e) => setNewReservation({...newReservation, phone_number: e.target.value})}
                />
              </div>
              
              <div>
                <Label htmlFor="dayOfWeek">Day of Week</Label>
                <Select 
                  value={newReservation.dayOfWeek} 
                  onValueChange={(value) => setNewReservation({...newReservation, dayOfWeek: value})}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {daysOfWeek.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="time">Time</Label>
                <Select 
                  value={newReservation.time} 
                  onValueChange={(value) => setNewReservation({...newReservation, time: value})}
                >
                  <SelectTrigger id="time">
                    <SelectValue placeholder="Select time" />
                  </SelectTrigger>
                  <SelectContent>
                    {['17:00', '17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'].map(time => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="partySize">Party Size</Label>
                <Select 
                  value={String(newReservation.partySize)} 
                  onValueChange={(value) => setNewReservation({...newReservation, partySize: Number(value)})}
                >
                  <SelectTrigger id="partySize">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map(size => (
                      <SelectItem key={size} value={String(size)}>{size} {size === 1 ? 'person' : 'people'}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={(date) => date && setStartDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div>
                <Label>End Date (Optional)</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal mt-2"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      initialFocus
                      disabled={(date) => !startDate || date < startDate}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="col-span-2">
                <Label htmlFor="notes">Special Notes</Label>
                <Input 
                  id="notes" 
                  placeholder="Any special requests or notes" 
                  value={newReservation.notes || ''}
                  onChange={(e) => setNewReservation({...newReservation, notes: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button 
              onClick={onSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : buttonText}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Recurring Reservations</CardTitle>
            <CardDescription>Manage regular bookings for your loyal customers</CardDescription>
          </div>
          {renderReservationDialog(false)}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="border-t">
          {loading ? (
            <div className="py-12 text-center">
              <Loader2 className="mx-auto h-8 w-8 animate-spin text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">Loading reservations...</p>
            </div>
          ) : recurringReservations.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground">
              <CalendarIcon2 className="mx-auto h-12 w-12 mb-3 text-muted-foreground/50" />
              <p>No recurring reservations yet</p>
              <p className="text-sm mt-2">Create your first recurring reservation to get started</p>
            </div>
          ) : (
            <div className="divide-y">
              {recurringReservations.map((reservation) => (
                <div key={reservation.id} className="grid md:grid-cols-4 gap-4 p-6 hover:bg-muted/30 transition-colors">
                  <div className="space-y-1">
                    <h3 className="font-medium">{reservation.name}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Party of {reservation.partySize}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {reservation.email} • {reservation.phone}
                    </p>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Schedule</div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarIcon2 className="h-4 w-4 mr-1" />
                      <span>Every {reservation.dayOfWeek}</span>
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{reservation.time}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="text-sm font-medium">Duration</div>
                    <p className="text-sm text-muted-foreground">
                      From {format(new Date(reservation.startDate), "PPP")}
                    </p>
                    {reservation.endDate ? (
                      <p className="text-sm text-muted-foreground">
                        Until {format(new Date(reservation.endDate), "PPP")}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        Ongoing (no end date)
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center justify-end space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleGenerateReservations(reservation.id)}
                    >
                      <Check className="h-4 w-4 mr-1" />
                      Generate
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditReservation(reservation)}
                    >
                      <Settings className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-500 hover:text-red-700"
                      onClick={() => confirmDeleteReservation(reservation)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
      
      {/* Edit Dialog */}
      {renderReservationDialog(true)}
      
      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this recurring reservation.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReservation}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Yes, delete reservation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
