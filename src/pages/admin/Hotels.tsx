import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getSafeErrorMessage } from "@/lib/errorUtils";
import { Plus, Pencil, Trash2, X, ImagePlus, Package } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Hotel {
  id: string;
  name: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  images: string[] | null;
  amenities: string[] | null;
}

const Hotels = () => {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState<Hotel | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    images: [] as string[],
    amenities: [] as string[],
  });
  const [newImage, setNewImage] = useState("");
  const [newAmenity, setNewAmenity] = useState("");
  const { toast } = useToast();

  const fetchHotels = async () => {
    const { data, error } = await supabase.from('hotels').select('*').order('name');
    if (error) {
      toast({ title: "Error loading hotels", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      setHotels(data || []);
    }
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingHotel) {
      const { error } = await supabase
        .from('hotels')
        .update(formData)
        .eq('id', editingHotel.id);
      
      if (error) {
        toast({ title: "Error updating hotel", description: getSafeErrorMessage(error), variant: "destructive" });
      } else {
        toast({ title: "Hotel updated successfully" });
        fetchHotels();
        resetForm();
      }
    } else {
      const { error } = await supabase.from('hotels').insert(formData);
      
      if (error) {
        toast({ title: "Error creating hotel", description: getSafeErrorMessage(error), variant: "destructive" });
      } else {
        toast({ title: "Hotel created successfully" });
        fetchHotels();
        resetForm();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;
    
    const { error } = await supabase.from('hotels').delete().eq('id', id);
    
    if (error) {
      toast({ title: "Error deleting hotel", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Hotel deleted successfully" });
      fetchHotels();
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", address: "", phone: "", email: "", images: [], amenities: [] });
    setNewImage("");
    setNewAmenity("");
    setEditingHotel(null);
    setIsDialogOpen(false);
  };

  const openEditDialog = (hotel: Hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name,
      description: hotel.description || "",
      address: hotel.address || "",
      phone: hotel.phone || "",
      email: hotel.email || "",
      images: hotel.images || [],
      amenities: hotel.amenities || [],
    });
    setIsDialogOpen(true);
  };

  const addImage = () => {
    if (newImage.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImage.trim()] });
      setNewImage("");
    }
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Hotels</h2>
          <p className="text-muted-foreground">Manage your hotel properties</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Add Hotel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingHotel ? 'Edit Hotel' : 'Add New Hotel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg">Basic Information</h3>
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
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={2}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 mb-2">
                      <ImagePlus className="h-5 w-5" />
                      <h3 className="font-semibold text-lg">Images</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">Add image URLs for hotel photos</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Image URL"
                        value={newImage}
                        onChange={(e) => setNewImage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                      />
                      <Button type="button" onClick={addImage} size="sm">
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
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
                    <p className="text-sm text-muted-foreground mb-3">Add hotel amenities</p>
                    <div className="flex gap-2">
                      <Input
                        placeholder="e.g., Free WiFi, Pool, Gym"
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
                <Button type="submit">{editingHotel ? 'Update' : 'Create'}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Hotels</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Images</TableHead>
                <TableHead>Amenities</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {hotels.map((hotel) => (
                <TableRow key={hotel.id}>
                  <TableCell className="font-medium">{hotel.name}</TableCell>
                  <TableCell>{hotel.address || '-'}</TableCell>
                  <TableCell>{hotel.phone || '-'}</TableCell>
                  <TableCell>{hotel.email || '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      {hotel.images?.slice(0, 2).map((img: string, idx: number) => (
                        <img key={idx} src={img} alt="" className="w-8 h-8 object-cover rounded" />
                      ))}
                      {(hotel.images?.length || 0) > 2 && (
                        <span className="text-xs text-muted-foreground">+{hotel.images.length - 2}</span>
                      )}
                      {(!hotel.images || hotel.images.length === 0) && '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {hotel.amenities?.slice(0, 2).map((amenity: string, idx: number) => (
                        <span key={idx} className="text-xs bg-muted px-2 py-1 rounded">{amenity}</span>
                      ))}
                      {(hotel.amenities?.length || 0) > 2 && (
                        <span className="text-xs text-muted-foreground">+{hotel.amenities.length - 2}</span>
                      )}
                      {(!hotel.amenities || hotel.amenities.length === 0) && '-'}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => openEditDialog(hotel)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(hotel.id)}>
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

export default Hotels;
