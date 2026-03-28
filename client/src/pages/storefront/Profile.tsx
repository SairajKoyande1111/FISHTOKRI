import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Header } from "@/components/storefront/Header";
import { CartDrawer } from "@/components/storefront/CartDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  User, Phone, Mail, Calendar, MapPin, Plus, Pencil, Trash2,
  CheckCircle2, ChevronLeft, Home, Briefcase, Star
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfileData {
  name: string;
  phone: string;
  email: string;
  dob: string;
}

interface Address {
  id: string;
  name: string;
  phone: string;
  address: string;
  area: string;
  type: "home" | "work" | "other";
}

const DELIVERY_AREAS = [
  "Thane", "Mulund", "Airoli", "Bhandup",
  "Vikhroli", "Powai", "Vashi", "Nerul"
];

const addressTypeIcons = {
  home: <Home className="w-3.5 h-3.5" />,
  work: <Briefcase className="w-3.5 h-3.5" />,
  other: <Star className="w-3.5 h-3.5" />,
};

const addressTypeColors = {
  home: "bg-blue-100 text-blue-700",
  work: "bg-purple-100 text-purple-700",
  other: "bg-amber-100 text-amber-700",
};

const emptyAddress: Omit<Address, "id"> = {
  name: "", phone: "", address: "", area: "", type: "home",
};

export default function Profile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const [profile, setProfile] = useState<ProfileData>({
    name: "", phone: "", email: "", dob: "",
  });
  const [editingProfile, setEditingProfile] = useState(false);
  const [draftProfile, setDraftProfile] = useState<ProfileData>(profile);

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [addressDialog, setAddressDialog] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [addressForm, setAddressForm] = useState<Omit<Address, "id">>(emptyAddress);

  useEffect(() => {
    const saved = localStorage.getItem("fishtokri_profile");
    if (saved) setProfile(JSON.parse(saved));
    const savedAddr = localStorage.getItem("fishtokri_addresses");
    if (savedAddr) setAddresses(JSON.parse(savedAddr));
  }, []);

  const saveProfile = () => {
    setProfile(draftProfile);
    localStorage.setItem("fishtokri_profile", JSON.stringify(draftProfile));
    setEditingProfile(false);
    toast({ title: "Profile updated", description: "Your details have been saved." });
  };

  const openAddAddress = () => {
    setEditingAddress(null);
    setAddressForm(emptyAddress);
    setAddressDialog(true);
  };

  const openEditAddress = (addr: Address) => {
    setEditingAddress(addr);
    setAddressForm({ name: addr.name, phone: addr.phone, address: addr.address, area: addr.area, type: addr.type });
    setAddressDialog(true);
  };

  const saveAddress = () => {
    if (!addressForm.name || !addressForm.phone || !addressForm.address || !addressForm.area) {
      toast({ title: "Please fill all fields", variant: "destructive" });
      return;
    }
    let updated: Address[];
    if (editingAddress) {
      updated = addresses.map(a => a.id === editingAddress.id ? { ...addressForm, id: editingAddress.id } : a);
    } else {
      updated = [...addresses, { ...addressForm, id: Date.now().toString() }];
    }
    setAddresses(updated);
    localStorage.setItem("fishtokri_addresses", JSON.stringify(updated));
    setAddressDialog(false);
    toast({ title: editingAddress ? "Address updated" : "Address added" });
  };

  const deleteAddress = (id: string) => {
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem("fishtokri_addresses", JSON.stringify(updated));
    toast({ title: "Address removed" });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")} className="rounded-full border border-border/50">
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">My Profile</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Details Card */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-4.5 h-4.5 text-primary" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Profile Details</h2>
              </div>
              {!editingProfile && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => { setDraftProfile(profile); setEditingProfile(true); }}
                  className="rounded-full text-muted-foreground hover:text-primary hover:bg-primary/5"
                  data-testid="button-edit-profile"
                >
                  <Pencil className="w-4 h-4" />
                </Button>
              )}
            </div>

            {editingProfile ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
                  <Input
                    value={draftProfile.name}
                    onChange={e => setDraftProfile(p => ({ ...p, name: e.target.value }))}
                    placeholder="Your name"
                    className="rounded-xl bg-slate-50 border-slate-200"
                    data-testid="input-profile-name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</Label>
                  <Input
                    value={draftProfile.phone}
                    onChange={e => setDraftProfile(p => ({ ...p, phone: e.target.value }))}
                    placeholder="+91 00000 00000"
                    className="rounded-xl bg-slate-50 border-slate-200"
                    data-testid="input-profile-phone"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</Label>
                  <Input
                    value={draftProfile.email}
                    onChange={e => setDraftProfile(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="rounded-xl bg-slate-50 border-slate-200"
                    data-testid="input-profile-email"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Date of Birth</Label>
                  <Input
                    type="date"
                    value={draftProfile.dob}
                    onChange={e => setDraftProfile(p => ({ ...p, dob: e.target.value }))}
                    className="rounded-xl bg-slate-50 border-slate-200"
                    data-testid="input-profile-dob"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditingProfile(false)}>Cancel</Button>
                  <Button className="flex-1 rounded-xl bg-primary text-white" onClick={saveProfile} data-testid="button-save-profile">Save</Button>
                </div>
              </div>
            ) : (
              <div className="space-y-0">
                {profile.phone ? (
                  <div className="py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <Phone className="w-3.5 h-3.5" /> Phone
                    </div>
                    <p className="font-semibold text-foreground">{profile.phone}</p>
                    <p className="text-xs text-emerald-600 flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3 h-3" /> Verified
                    </p>
                  </div>
                ) : null}

                <div className="py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <User className="w-3.5 h-3.5" /> Name
                  </div>
                  <p className="font-semibold text-foreground">{profile.name || <span className="text-muted-foreground italic font-normal">Not set</span>}</p>
                </div>

                <div className="py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </div>
                  <p className="font-semibold text-foreground">{profile.email || <span className="text-muted-foreground italic font-normal">Not set</span>}</p>
                </div>

                <div className="py-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Calendar className="w-3.5 h-3.5" /> Date of Birth
                  </div>
                  <p className="font-semibold text-foreground">
                    {profile.dob ? new Date(profile.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" }) : <span className="text-muted-foreground italic font-normal">Not set</span>}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Saved Addresses Card */}
          <div className="bg-white rounded-2xl border border-border/50 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 bg-accent/10 rounded-full flex items-center justify-center">
                  <MapPin className="w-4.5 h-4.5 text-accent" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">Saved Addresses</h2>
              </div>
              <Button
                onClick={openAddAddress}
                size="sm"
                className="rounded-full bg-primary text-white text-xs px-4 gap-1.5 h-8"
                data-testid="button-add-address"
              >
                <Plus className="w-3.5 h-3.5" /> Add New
              </Button>
            </div>

            {addresses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <MapPin className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm">No saved addresses yet</p>
                <Button variant="link" onClick={openAddAddress} className="mt-1 text-primary text-sm">
                  + Add your first address
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {addresses.map(addr => (
                  <div key={addr.id} className="bg-slate-50 border border-slate-100 rounded-xl p-4" data-testid={`card-address-${addr.id}`}>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-foreground text-sm">{addr.name}</span>
                          <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${addressTypeColors[addr.type]}`}>
                            {addressTypeIcons[addr.type]} {addr.type}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">{addr.phone}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{addr.address}, {addr.area}</p>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg border-slate-200 text-muted-foreground hover:text-primary hover:border-primary/30"
                          onClick={() => openEditAddress(addr)}
                          data-testid={`button-edit-address-${addr.id}`}
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 rounded-lg border-slate-200 text-muted-foreground hover:text-red-500 hover:border-red-200"
                          onClick={() => deleteAddress(addr.id)}
                          data-testid={`button-delete-address-${addr.id}`}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Dialog */}
      <Dialog open={addressDialog} onOpenChange={setAddressDialog}>
        <DialogContent className="sm:max-w-md rounded-2xl">
          <DialogHeader>
            <DialogTitle>{editingAddress ? "Edit Address" : "Add New Address"}</DialogTitle>
            <DialogDescription>Fill in the delivery address details below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Full Name</Label>
              <Input
                value={addressForm.name}
                onChange={e => setAddressForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Recipient name"
                className="rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone Number</Label>
              <Input
                value={addressForm.phone}
                onChange={e => setAddressForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="10-digit mobile"
                className="rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address</Label>
              <Input
                value={addressForm.address}
                onChange={e => setAddressForm(f => ({ ...f, address: e.target.value }))}
                placeholder="House/Flat, Street, Landmark"
                className="rounded-xl bg-slate-50 border-slate-200"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Delivery Area</Label>
              <Select value={addressForm.area} onValueChange={val => setAddressForm(f => ({ ...f, area: val }))}>
                <SelectTrigger className="rounded-xl bg-slate-50 border-slate-200">
                  <SelectValue placeholder="Select area" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_AREAS.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Address Type</Label>
              <div className="flex gap-2">
                {(["home", "work", "other"] as const).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setAddressForm(f => ({ ...f, type: t }))}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-sm font-medium border transition-all ${
                      addressForm.type === t
                        ? "bg-primary text-white border-primary"
                        : "bg-slate-50 text-muted-foreground border-slate-200 hover:border-primary/30"
                    }`}
                  >
                    {addressTypeIcons[t]} {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setAddressDialog(false)}>Cancel</Button>
              <Button className="flex-1 rounded-xl bg-primary text-white" onClick={saveAddress}>
                {editingAddress ? "Update" : "Save Address"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <CartDrawer />
    </div>
  );
}
