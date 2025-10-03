import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorUtils";
import { Plus, Pencil, Trash2, X, ImagePlus, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ImageUploadInput } from "@/components/ImageUploadInput";

interface RoomType {
  id: string;
  hotel_id: string;
  name: string;
  description: string | null;
  base_price_per_night: number;
  max_guests: number;
  images: string[] | null;
  amenities: string[] | null;
}

interface Hotel {
  id: string;
  name: string;
}

const RoomTypes = () => {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoomType, setEditingRoomType] = useState<RoomType | null>(null);
  const [formData, setFormData] = useState({
    hotel_id: "",
    name: "",
    description: "",
    base_price_per_night: "",
    max_guests: "2",
    images: [] as string[],
    amenities: [] as string[],
  });
  const [newAmenity, setNewAmenity] = useState("");
  const { toast } = useToast();

  const fetchData = async () => {
    const [roomTypesRes, hotelsRes] = await Promise.all([
      supabase.from('room_types').select('*').order('name'),
      supabase.from('hotels').select('id, name').order('name'),
    ]);

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
      hotel_id: formData.hotel_id,
      name: formData.name,
      description: formData.description || null,
      base_price_per_night: parseFloat(formData.base_price_per_night),
      max_guests: parseInt(formData.max_guests),
      images: formData.images,
      amenities: formData.amenities,
    };

    if (editingRoomType) {
      const { error } = await supabase
        .from('room_types')
        .update(submitData)
        .eq('id', editingRoomType.id);
      
      if (error) {
        toast({ title: "Error updating room type", description: getSafeErrorMessage(error), variant: "destructive" });
      } else {
        toast({ title: "Room type updated successfully" });
        fetchData();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('room_types').insert(submitData);
      
      if (error) {
        toast({ title: "Error creating room type", description: getSafeErrorMessage(error), variant: "destructive" });
      } else {
        toast({ title: "Room type created successfully" });
        fetchData();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this room type?')) return;
    
    const { error } = await supabase.from('room_types').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Error deleting room type", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Room type deleted successfully" });
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({ hotel_id: "", name: "", description: "", base_price_per_night: "", max_guests: "2", images: [], amenities: [] });
    setNewAmenity("");
    setEditingRoomType(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (roomType: RoomType) => {
    setEditingRoomType(roomType);
    setFormData({
      hotel_id: roomType.hotel_id,
      name: roomType.name,
      description: roomType.description || "",
      base_price_per_night: roomType.base_price_per_night.toString(),
      max_guests: roomType.max_guests.toString(),
      images: roomType.images || [],
      amenities: roomType.amenities || [],
    });
    setIsDialogOpen(true);
  };

  const addImage = (imageUrl: string) => {
    setFormData({ ...formData, images: [...formData.images, imageUrl] });
  };

  const removeImage = (index: number) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const addAmenity = () => {
    if (newAmenity.trim()) {
      setFormData({ ...formData, amenities: [...formData.amenities, newAmenity.trim()] });
      setNewAmenity("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({ ...formData, amenities: formData.amenities.filter((_, i) => i !== index) });
  };

  const getHotelName = (hotelId: string) => {
    return hotels.find(h => h.id === hotelId)?.name || 'Unknown';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Room Types</h2>
          <p className="text-muted-foreground">Manage room categories and pricing</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Room Type
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingRoomType ? 'Edit Room Type' : 'Add New Room Type'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
                  <div className="space-y-2">
                    <Label htmlFor="hotel_id">Hotel *</Label>
                    <Select value={formData.hotel_id} onValueChange={(value) => setFormData({ ...formData, hotel_id: value })} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a hotel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hotels.map((hotel) => (
                          <SelectItem key={hotel.id} value={hotel.id}>{hotel.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="base_price_per_night">Base Price/Night *</Label>
                      <Input
                        id="base_price_per_night"
                        type="number"
                        step="0.01"
                        value={formData.base_price_per_night}
                        onChange={(e) => setFormData({ ...formData, base_price_per_night: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="max_guests">Max Guests *</Label>
                      <Input
                        id="max_guests"
                        type="number"
                        min="1"
                        value={formData.max_guests}
                        onChange={(e) => setFormData({ ...formData, max_guests: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <ImagePlus className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">Images</h3>
                    </div>
                    <ImageUploadInput onImageAdded={addImage} label="Add room images" />
                    <div className="space-y-2 mt-3 max-h-[200px] overflow-y-auto">
                      {formData.images.map((img, idx) => (
                        <div key={idx} className="flex items-start gap-2 p-2 border rounded">
                          <img src={img} alt="" className="w-16 h-16 object-cover rounded" />
                          <p className="flex-1 text-sm break-all">{img}</p>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeImage(idx)}>
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">Amenities</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Add room amenities</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., WiFi, AC, TV"
                        value={newAmenity}
                        onChange={(e) => setNewAmenity(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAmenity())}
                      />
                      <Button type="button" onClick={addAmenity} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {formData.amenities.map((amenity, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-muted px-3 py-1 rounded-full">
                          <span className="text-sm">{amenity}</span>
                          <Button type="button" variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => removeAmenity(idx)}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t">
                <Button type="button" variant="outline" onClick={resetForm}>Cancel</Button>
                <Button type="submit">{editingRoomType ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Room Types</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Hotel</TableHead>
                <TableHead>Price/Night</TableHead>
                <TableHead>Max Guests</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roomTypes.map((roomType) => (
                <TableRow key={roomType.id}>
                  <TableCell className="font-medium">{roomType.name}</TableCell>
                  <TableCell>{getHotelName(roomType.hotel_id)}</TableCell>
                  <TableCell>₹{roomType.base_price_per_night}</TableCell>
                  <TableCell>{roomType.max_guests}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {roomType.images?.slice(0, 2).map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="" className="w-8 h-8 object-cover rounded" />
                      ))}
                      {(roomType.images?.length || 0) > 2 && (
                        <span className="text-xs text-muted-foreground">+{roomType.images.length - 2}</span>
                      )}
                      {(!roomType.images || roomType.images.length === 0) && '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {roomType.amenities?.slice(0, 2).map((amenity: string, idx: number) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">{amenity}</span>
                      ))}
                      {(roomType.amenities?.length || 0) > 2 && (
                        <span className="text-xs text-muted-foreground">+{roomType.amenities.length - 2}</span>
                      )}
                      {(!roomType.amenities || roomType.amenities.length === 0) && '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(roomType)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(roomType.id)}>
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

export default RoomTypes;
