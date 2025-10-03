import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorUtils";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface Room {
  id: string;
  room_type_id: string;
  room_number: string;
  floor: number | null;
  status: string;
}

interface RoomType {
  id: string;
  name: string;
  hotel_id: string;
}

interface Hotel {
  id: string;
  name: string;
}

const Rooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState({
    room_type_id: "",
    room_number: "",
    floor: "",
    status: "available",
  });
  const { toast } = useToast();

  const fetchData = async () => {
    const [roomsRes, roomTypesRes, hotelsRes] = await Promise.all([
      supabase.from('rooms').select('*').order('room_number'),
      supabase.from('room_types').select('id, name, hotel_id').order('name'),
      supabase.from('hotels').select('id, name').order('name'),
    ]);

    if (roomsRes.error) {
      toast({ title: "Error loading rooms", description: getSafeErrorMessage(roomsRes.error), variant: "destructive" });
    } else {
      setRooms(roomsRes.data || []);
    }

    if (roomTypesRes.error) {
      toast({ title: "Error loading room types", description: getSafeErrorMessage(roomTypesRes.error), variant: "destructive" });
    } else {
      setRoomTypes(roomTypesRes.data || []);
    }

    if (hotelsRes.error) {
      toast({ title: "Error loading hotels", description: getSafeErrorMessage(hotelsRes.error), variant: "destructive" });
    } else {
      setHotels(hotelsRes.data || []);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      room_type_id: formData.room_type_id,
      room_number: formData.room_number,
      floor: formData.floor ? parseInt(formData.floor) : null,
      status: formData.status,
    };

    if (editingRoom) {
      const { error } = await supabase
        .from('rooms')
        .update(submitData)
        .eq('id', editingRoom.id);
      
      if (error) {
        toast({ title: "Error updating room", description: getSafeErrorMessage(error), variant: "destructive" });
      } else {
        toast({ title: "Room updated successfully" });
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('rooms').insert(submitData);
      
      if (error) {
        toast({ title: "Error creating room", description: getSafeErrorMessage(error), variant: "destructive" });
      } else {
        toast({ title: "Room created successfully" });
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room?')) return;
    
    const { error } = await supabase.from('rooms').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Error deleting room", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Room deleted successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({ room_type_id: "", room_number: "", floor: "", status: "available" });
    setEditingRoom(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      room_type_id: room.room_type_id,
      room_number: room.room_number,
      floor: room.floor?.toString() || "",
      status: room.status,
    });
    setIsDialogOpen(true);
  };

  const getRoomTypeName = (roomTypeId: string) => {
    return roomTypes.find(rt => rt.id === roomTypeId)?.name || 'Unknown';
  };

  const getHotelName = (roomTypeId: string) => {
    const roomType = roomTypes.find(rt => rt.id === roomTypeId);
    if (!roomType) return 'Unknown';
    return hotels.find(h => h.id === roomType.hotel_id)?.name || 'Unknown';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      available: "default",
      occupied: "secondary",
      maintenance: "destructive",
      reserved: "outline",
    };
    return <Badge variant={variants[status] || "default"}>{status}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rooms</h2>
          <p className="text-muted-foreground">Manage individual room inventory</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="room_type_id">Room Type *</Label>
                <Select value={formData.room_type_id} onValueChange={(value) => setFormData({ ...formData, room_type_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a room type" />
                  </SelectTrigger>
                  <SelectContent>
                    {roomTypes.map((roomType) => {
                      const hotel = hotels.find(h => h.id === roomType.hotel_id);
                      return (
                        <SelectItem key={roomType.id} value={roomType.id}>
                          {hotel?.name} - {roomType.name}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="room_number">Room Number *</Label>
                  <Input
                    id="room_number"
                    value={formData.room_number}
                    onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                    required
                    placeholder="e.g., 101, 202"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="floor">Floor</Label>
                  <Input
                    id="floor"
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({ ...formData, floor: e.target.value })}
                    placeholder="e.g., 1, 2"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })} required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="occupied">Occupied</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="reserved">Reserved</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit">{editingRoom ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Rooms</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room Number</TableHead>
                <TableHead>Floor</TableHead>
                <TableHead>Room Type</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rooms.map((room) => (
                <TableRow key={room.id}>
                  <TableCell className="font-medium">{room.room_number}</TableCell>
                  <TableCell>{room.floor || '-'}</TableCell>
                  <TableCell>{getRoomTypeName(room.room_type_id)}</TableCell>
                  <TableCell>{getHotelName(room.room_type_id)}</TableCell>
                  <TableCell>{getStatusBadge(room.status)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(room)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(room.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Rooms;